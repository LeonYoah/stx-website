#!/usr/bin/env node
/**
 * 把渲染好的成片转成官网用的网页版：AV1 WebM（优先）+ H.264 MP4（兜底）+ 海报图，写入 static/video/。
 * Turns a rendered cut into website files: AV1 WebM (preferred) + H.264 MP4 (fallback) + poster, written to static/video/.
 *
 * 优先读 4K 母版，用 lanczos 缩到 1080p 再压缩，界面小字比二次压缩 1080p 成片更清楚。
 * Reads the 4K master when present and downsamples with lanczos before encoding, keeping small UI text sharper than re-encoding the 1080p cut.
 *
 * 用法 / Usage:
 *   node promo/export-web.mjs stx-45s                  # 海报默认取第 19.9 秒 / poster defaults to 19.9s
 *   node promo/export-web.mjs stx-45s --poster 9.1
 *   node promo/export-web.mjs stx-45s --out /tmp/video
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

function parseArgs(argv) {
  const cut = argv[0];
  if (!cut || cut.startsWith('--')) throw new Error('用法 / usage: node promo/export-web.mjs <cut> [--poster 秒/seconds] [--out 目录/dir]');
  const name = cut.replace(/^stx-/, '');
  const outDir = path.join(HERE, cut, 'out');
  const master = path.join(outDir, `stx-promo-${name}-4k.mp4`);
  const hd = path.join(outDir, `stx-promo-${name}.mp4`);
  const opts = {
    input: existsSync(master) ? master : hd,
    base: `stx-promo-${name}`,
    out: path.join(ROOT, 'static', 'video'),
    poster: 19.9,
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const val = argv[i + 1];
    if (key === '--poster') { opts.poster = Number(val); i += 1; }
    else if (key === '--out') { opts.out = path.resolve(val); i += 1; }
    else throw new Error(`未知参数 / Unknown argument: ${key}`);
  }
  if (!existsSync(opts.input)) throw new Error(`找不到成片，请先运行 pnpm promo:${name} / cut not found, run pnpm promo:${name} first: ${opts.input}`);
  return opts;
}

// 与 render.mjs 一致：BT.709 限定范围，并写入色彩标记。/ Same as render.mjs: BT.709 limited range with matching colour tags.
const SCALE = 'scale=1920:1080:flags=lanczos+accurate_rnd+full_chroma_int:out_color_matrix=bt709:out_range=tv,format=yuv420p';
const COLOR = ['-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv'];
// 每 3 秒一个关键帧：官网章节按钮跳转时只需多拉很少的数据。/ A keyframe every 3s so chapter jumps on the site fetch little extra data.
const GOP = ['-g', '90'];

function ffmpeg(args, label) {
  const res = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
    // SVT-AV1 不受 -loglevel 控制，只留错误输出。/ SVT-AV1 ignores -loglevel; keep only its errors.
    env: { ...process.env, SVT_LOG: '1' },
  });
  if (res.status !== 0) throw new Error(`${label} 失败 / failed`);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  mkdirSync(opts.out, { recursive: true });
  const file = (ext) => path.join(opts.out, `${opts.base}${ext}`);

  // 界面画面以静态文字为主：tune animation 少抹平细节，crf 23 在约 9 MB 内保持小字可读。
  // UI footage is mostly static text: tune animation preserves detail, crf 23 keeps small text legible at about 9 MB.
  ffmpeg(['-i', opts.input, '-vf', SCALE,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-tune', 'animation', '-profile:v', 'high', '-level', '4.1', ...GOP,
    '-pix_fmt', 'yuv420p', ...COLOR, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', file('.mp4')], 'MP4');

  // AV1 同等清晰度体积约为 H.264 的六成，支持的浏览器优先使用。/ AV1 is about 60% of the H.264 size at equal quality; supporting browsers use it first.
  ffmpeg(['-i', opts.input, '-vf', SCALE,
    '-c:v', 'libsvtav1', '-preset', '6', '-crf', '34', '-svtav1-params', 'tune=0', ...GOP,
    '-pix_fmt', 'yuv420p', ...COLOR, '-c:a', 'libopus', '-b:a', '112k', file('.webm')], 'WebM');

  ffmpeg(['-ss', String(opts.poster), '-i', opts.input, '-frames:v', '1', '-update', '1',
    '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libwebp', '-quality', '82', file('-poster.webp')], 'poster');

  for (const ext of ['.webm', '.mp4', '-poster.webp']) {
    const f = file(ext);
    console.log(`${path.relative(ROOT, f)}  ${(statSync(f).size / 1048576).toFixed(2)} MB`);
  }
}

main();
