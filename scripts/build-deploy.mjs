import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
const config = JSON.parse(fs.readFileSync(path.join(root, 'deployment.config.json'), 'utf8'));
const args = process.argv.slice(2);
const urlOption = args.indexOf('--url');
if (urlOption >= 0 && !args[urlOption + 1]) throw new Error('--url requires a public site URL.');
const site = new URL(urlOption >= 0 ? args[urlOption + 1] : config.siteUrl);
const domain = config.customDomain ? new URL('https://' + config.customDomain) : null;
if (domain && (domain.pathname !== '/' || domain.port || domain.search || domain.hash || domain.username || domain.password)) {
  throw new Error('customDomain must contain only a domain name, without a scheme or path.');
}
if (!['https:', 'http:'].includes(site.protocol) || site.username || site.password || site.search || site.hash) {
  throw new Error('Use a public HTTP(S) site URL without credentials, query, or hash.');
}
if (!site.pathname.endsWith('/')) site.pathname += '/';
if (site.hostname.includes('xn----3b6ey5ne5e80unza04nk6h4spegdz9h')) throw new Error('The previous project domain is not a valid release destination.');
if (domain && (site.hostname !== domain.hostname || site.pathname !== '/')) {
  throw new Error('customDomain must match the public site URL hostname at /.');
}
const shareImagePath = path.resolve(root, config.shareImage);
if (!shareImagePath.startsWith(root + path.sep)) throw new Error('shareImage must be inside the project.');
const shareImageBytes = fs.readFileSync(shareImagePath);
if (shareImageBytes.length < 24 || shareImageBytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  throw new Error('The configured sharing image must be a PNG.');
}
const shareImageVersion = createHash('sha256').update(shareImageBytes).digest('hex').slice(0, 12);
const shareImageWidth = shareImageBytes.readUInt32BE(16);
const shareImageHeight = shareImageBytes.readUInt32BE(20);

const queued = new Set();
const queue = [];
const generated = new Map();
const missing = [];
const ignored = /^(?:https?:|data:|javascript:|tel:|mailto:|#|\/\/)/i;
function add(relative, from = 'release entry') {
  const normalized = relative.split(path.sep).join('/');
  const absolute = path.resolve(root, normalized);
  if (!absolute.startsWith(root + path.sep)) throw new Error(`Reference escapes the project: ${relative}`);
  if (queued.has(normalized)) return;
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    missing.push({ from, reference: normalized });
    return;
  }
  // Validate exact case, since the source workspace is on Windows and production is Linux.
  let directory = root;
  for (const part of normalized.split('/')) {
    if (!fs.readdirSync(directory).includes(part)) throw new Error(`Case mismatch in ${normalized}: ${part}`);
    directory = path.join(directory, part);
  }
  queued.add(normalized);
  queue.push(normalized);
}
function reference(value, from) {
  if (!value || ignored.test(value) || value.includes('${')) return;
  const cleaned = value.split(/[?#]/)[0];
  if (!cleaned || !/\.[a-z0-9]{2,12}$/i.test(cleaned)) return;
  let decoded;
  try { decoded = decodeURIComponent(cleaned); } catch { throw new Error(`Invalid URL encoding: ${value}`); }
  const target = decoded.startsWith('/') ? path.join(root, decoded) : path.resolve(root, path.dirname(from), decoded);
  add(path.relative(root, target), from);
}
function scan(text, from) {
  for (const match of text.matchAll(/(?:src|href|poster)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^\s)'"\n]+)|["']((?:\.\.?\/)+(?:[^"'\r\n]+?\.(?:png|jpe?g|webp|svg|ico|mp4|css|js|woff2?|ttf))(?:\?[^"'\r\n]*)?)["']/g)) {
    reference(match[1] || match[2] || match[3], from);
  }
  for (const match of text.matchAll(/srcset\s*=\s*["']([^"']+)["']/g)) {
    for (const candidate of match[1].split(',')) reference(candidate.trim().split(/\s+/)[0], from);
  }
}
function transformHtml(text, file) {
  const imageUrl = new URL(config.shareImage, site).href;
  const versionedImageUrl = imageUrl + '?v=' + shareImageVersion;
  text = text.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*("\s*\/?>)/g, `$1${versionedImageUrl}$2`);
  text = text.replace(/(<meta property="og:image:width" content=")[^"]*("\s*\/?>)/g, `$1${shareImageWidth}$2`);
  text = text.replace(/(<meta property="og:image:height" content=")[^"]*("\s*\/?>)/g, `$1${shareImageHeight}$2`);
  text = text.replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/g, `$1${site.href}$2`);
  // Detail menus share the homepage canonical URL; they are presentation pages of the same site.
  text = text.replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/g, `$1${site.href}$2`);
  if (site.protocol === 'https:') text = text.replace(/(<meta property="og:image"[^>]*>)/, `$1\n  <meta property="og:image:secure_url" content="${versionedImageUrl}" />`);
  if (file === 'index.html') {
    const relativeImage = './' + config.shareImage;
    reference(relativeImage, file);
  }
  return text;
}

for (const file of ['index.html', 'robots.txt', 'site.webmanifest', '.nojekyll', 'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png']) add(file);
// The existing video loader uses encoded characters rather than a literal URL.
add('new-assets/paragon/movie.mp4');
for (let index = 0; index < queue.length; index++) {
  const relative = queue[index];
  const absolute = path.join(root, relative);
  if (/\.(?:html|css|js|webmanifest)$/i.test(relative)) {
    let text = fs.readFileSync(absolute, 'utf8');
    if (relative.endsWith('.html')) {
      text = transformHtml(text, relative);
      generated.set(relative, text);
    }
    scan(text, relative);
    if (relative.endsWith('.webmanifest')) {
      const manifest = JSON.parse(text);
      for (const icon of manifest.icons) reference(icon.src, relative);
    }
  }
}
if (missing.length) throw new Error(`Missing release dependencies:\n${JSON.stringify(missing, null, 2)}`);
// Only the fixed workspace dist directory is replaced; source assets are never deleted.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid output directory.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
let bytes = 0;
for (const relative of queued) {
  const target = path.join(output, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (generated.has(relative)) fs.writeFileSync(target, generated.get(relative));
  else fs.copyFileSync(path.join(root, relative), target);
  bytes += fs.statSync(target).size;
}
if (config.customDomain) {
  fs.writeFileSync(path.join(output, 'CNAME'), domain.hostname + '\n');
}
const sitemapUrl = site.href.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${sitemapUrl}</loc></url></urlset>\n`);
fs.appendFileSync(path.join(output, 'robots.txt'), `\nSitemap: ${new URL('sitemap.xml', site).href}\n`);
console.log(`Release prepared: ${queued.size} files, ${(bytes / 1024 / 1024).toFixed(1)} MiB`);
console.log(`Public URL: ${site.href}`);
console.log(`Output: ${output}`);
