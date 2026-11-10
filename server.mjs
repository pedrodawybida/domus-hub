import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".css": "text/css",
  ".js": "application/javascript",
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  if (urlPath.startsWith("/Domus/") || urlPath.startsWith("/img-prezi/")) {
    const assetPath = path.join(__dirname, decodeURIComponent(urlPath));
    if (fs.existsSync(assetPath) && fs.statSync(assetPath).isFile()) {
      const ext = path.extname(assetPath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      res.end(fs.readFileSync(assetPath));
      return;
    }
  }

  const htmlPath = path.join(__dirname, "apresentacao-interativa.html");
  const content = fs.readFileSync(htmlPath, "utf-8");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`\n✅ Plataforma Consultiva DOMUS rodando em: http://localhost:${PORT}\n`);
});
