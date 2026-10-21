import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.json':'application/json' };
http.createServer(async (req,res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    let pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (pathname.includes('\0') || pathname.startsWith('/api/') || pathname.startsWith('/.')) { res.writeHead(404).end(); return; }
    if (pathname === '/') pathname = '/index.html';
    if (!extname(pathname)) pathname += '.html';
    const path = resolve(root, '.' + pathname);
    if (!path.startsWith(root.endsWith(sep) ? root : root+sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    res.writeHead(200,{'Content-Type':types[extname(path)] || 'application/octet-stream'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(4173,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:4173 (no backend actions)'));
