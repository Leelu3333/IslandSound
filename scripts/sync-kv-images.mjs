#!/usr/bin/env node
/**
 * sync-kv-images.mjs — 島嶼樂遊主視覺圖片同步腳本
 * ------------------------------------------------------------
 * 把 kv/ 資料夾裡的圖片同步到 Supabase：
 *   1. 依「檔名 = 音樂祭 slug」對應到 festivals 那一筆
 *   2. （可選）用 sharp 壓縮 / 轉 webp，省流量
 *   3. 上傳到 Storage bucket「festival-kv」（upsert，可重複跑）
 *   4. 把 public URL 回填到 festivals.kv_image_url
 *
 * 設計成「未來新增也只要再跑一次」：
 *   - 全程 idempotent，重跑只會更新、不會重複
 *   - 換了圖的格式時，會順手清掉同一場舊副檔名的殘檔
 *   - 會列出「不認得的檔名」與「還沒有圖的音樂祭」方便補齊
 *
 * 用法：
 *   node scripts/sync-kv-images.mjs            # 正式同步（需 .env）
 *   node scripts/sync-kv-images.mjs --dry-run  # 只檢查、不上傳、不寫 DB
 *   node scripts/sync-kv-images.mjs --no-optimize  # 不壓縮，上傳原圖
 *
 * .env 需要：
 *   VITE_SUPABASE_URL=...            （或 SUPABASE_URL）
 *   SUPABASE_SERVICE_ROLE_KEY=...    （server-only，切勿放前端 / 進版控）
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, parse as parsePath } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KV_DIR = join(ROOT, 'kv');
const BUCKET = 'festival-kv';
const MAX_WIDTH = 1600;       // 壓縮時的最大寬度（主視覺夠用）
const WEBP_QUALITY = 82;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const OPTIMIZE = !args.has('--no-optimize');

// ---------- 小工具 ----------
const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', red: '\x1b[31m',
  green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m',
};
const log = (...a) => console.log(...a);

/** 最小 .env 解析（不引入額外套件），不覆蓋既有的 process.env */
function loadDotEnv() {
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

/** 由 magic bytes 判斷圖片格式（不信任副檔名，因為有的檔沒有副檔名） */
function detectImage(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return { ext: 'png', mime: 'image/png' };
  if (buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
    return { ext: 'webp', mime: 'image/webp' };
  if (buf.length >= 12 && buf.toString('ascii', 4, 8) === 'ftyp' &&
      buf.toString('ascii', 8, 12).startsWith('avif'))
    return { ext: 'avif', mime: 'image/avif' };
  if (buf.length >= 4 && buf.toString('ascii', 0, 4) === 'GIF8')
    return { ext: 'gif', mime: 'image/gif' };
  return null; // 非圖片
}

/** 取得音樂祭 slug 白名單：優先用 DB，dry-run / 無連線時改讀 festivals.js */
async function getFestivalIds(supabase) {
  if (supabase) {
    const { data, error } = await supabase.from('festivals').select('id');
    if (!error && data) return new Set(data.map((r) => r.id));
    log(`${c.yellow}⚠ 無法從 DB 讀 festival ids（${error?.message}），改用本機 festivals.js${c.reset}`);
  }
  const src = readFileSync(join(ROOT, 'src/data/festivals.js'), 'utf8');
  const ids = [...src.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  return new Set(ids);
}

/** 動態載入 sharp；沒安裝就回 null（自動 fallback 上傳原圖） */
async function tryLoadSharp() {
  if (!OPTIMIZE) return null;
  try {
    const m = await import('sharp');
    return m.default;
  } catch {
    log(`${c.dim}（未安裝 sharp，將上傳原圖。要自動壓縮可：npm i -D sharp）${c.reset}`);
    return null;
  }
}

async function main() {
  loadDotEnv();

  if (!existsSync(KV_DIR)) {
    log(`${c.red}找不到 kv/ 資料夾：${KV_DIR}${c.reset}`);
    process.exit(1);
  }

  // 連線（dry-run 不需要）
  let supabase = null;
  if (!DRY_RUN) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      log(`${c.red}缺少環境變數。請在 .env 設定：${c.reset}`);
      log('  VITE_SUPABASE_URL=...（或 SUPABASE_URL）');
      log('  SUPABASE_SERVICE_ROLE_KEY=...');
      log(`${c.dim}（只想先檢查可加 --dry-run）${c.reset}`);
      process.exit(1);
    }
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(url, key, { auth: { persistSession: false } });
  }

  const sharp = await tryLoadSharp();
  const festivalIds = await getFestivalIds(supabase);

  log(`${c.bold}島嶼樂遊 · 主視覺圖片同步${c.reset}` +
      `${DRY_RUN ? `  ${c.yellow}[DRY RUN]${c.reset}` : ''}`);
  log(`${c.dim}bucket=${BUCKET}  optimize=${sharp ? 'on' : 'off'}  festivals=${festivalIds.size}${c.reset}\n`);

  const files = readdirSync(KV_DIR).filter((f) => !f.startsWith('.') && !f.startsWith('_'));
  const done = [];        // 成功處理的 slug
  const unknown = [];     // 檔名不在白名單
  const failed = [];      // 上傳/更新失敗

  for (const file of files) {
    const slug = parsePath(file).name; // 去副檔名；無副檔名者整段即 slug
    const buf = readFileSync(join(KV_DIR, file));
    const kind = detectImage(buf);

    if (!kind) { log(`${c.dim}· 跳過非圖片：${file}${c.reset}`); continue; }
    if (!festivalIds.has(slug)) {
      unknown.push(file);
      log(`${c.yellow}? 檔名對不到任何音樂祭：${file}（slug=${slug}）${c.reset}`);
      continue;
    }

    // 壓縮 / 轉檔
    let outBuf = buf, outExt = kind.ext, outMime = kind.mime;
    if (sharp) {
      try {
        const webpBuf = await sharp(buf).rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .webp({ quality: WEBP_QUALITY })
          .toBuffer();
        // 原圖已是 webp/avif 且轉檔沒變小 → 保留原圖（avif 通常比 webp 更省）
        const alreadyModern = kind.ext === 'webp' || kind.ext === 'avif';
        if (!(alreadyModern && webpBuf.length >= buf.length)) {
          outBuf = webpBuf; outExt = 'webp'; outMime = 'image/webp';
        }
      } catch (e) {
        log(`${c.yellow}  ⚠ ${slug} 壓縮失敗，改上傳原圖：${e.message}${c.reset}`);
      }
    }

    const objectPath = `${slug}.${outExt}`;
    const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
    const sizeInfo = sharp ? `${kb(buf.length)}→${kb(outBuf.length)}` : kb(buf.length);

    if (DRY_RUN) {
      log(`${c.green}✓${c.reset} ${slug.padEnd(16)} ${c.dim}${file} → ${objectPath}  ${sizeInfo}${c.reset}`);
      done.push(slug);
      continue;
    }

    // 上傳（upsert）
    const up = await supabase.storage.from(BUCKET)
      .upload(objectPath, outBuf, { contentType: outMime, upsert: true, cacheControl: '31536000' });
    if (up.error) { failed.push(slug); log(`${c.red}✗ ${slug} 上傳失敗：${up.error.message}${c.reset}`); continue; }

    // 清掉同一場的舊副檔名殘檔（格式換過時）
    const stale = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif']
      .filter((e) => e !== outExt).map((e) => `${slug}.${e}`);
    await supabase.storage.from(BUCKET).remove(stale).catch(() => {});

    const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl;
    const upd = await supabase.from('festivals').update({ kv_image_url: publicUrl }).eq('id', slug);
    if (upd.error) { failed.push(slug); log(`${c.red}✗ ${slug} 回填 DB 失敗：${upd.error.message}${c.reset}`); continue; }

    log(`${c.green}✓${c.reset} ${slug.padEnd(16)} ${c.dim}${sizeInfo}  ${publicUrl}${c.reset}`);
    done.push(slug);
  }

  // 報表
  const missing = [...festivalIds].filter((id) => !done.includes(id)).sort();
  log(`\n${c.bold}結果${c.reset}`);
  log(`  ${c.green}已同步${c.reset}：${done.length} 場`);
  if (unknown.length) log(`  ${c.yellow}對不到音樂祭的檔案${c.reset}：${unknown.join(', ')}`);
  if (failed.length)  log(`  ${c.red}失敗${c.reset}：${failed.join(', ')}`);
  if (missing.length) log(`  ${c.dim}還沒有圖的音樂祭（${missing.length}）：${missing.join(', ')}${c.reset}`);
  if (DRY_RUN) log(`\n${c.yellow}這是 dry-run，未實際上傳或寫入。確認無誤後拿掉 --dry-run 再跑一次。${c.reset}`);

  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
