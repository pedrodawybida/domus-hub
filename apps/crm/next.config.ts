import type { NextConfig } from "next";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const publicRoot = path.resolve("public");
const legacyUploads = path.join(publicRoot, "uploads");
if (existsSync(legacyUploads) && readdirSync(legacyUploads).length > 0) {
  throw new Error("Há anexos em public/uploads. Verifique o backup e transfira a pasta para o armazenamento privado antes de iniciar.");
}
const uploadPath = path.relative(publicRoot, path.resolve(process.env.CRM_UPLOAD_DIR || "storage/uploads"));
if (!(uploadPath === ".." || uploadPath.startsWith(".." + path.sep) || path.isAbsolute(uploadPath))) {
  throw new Error("Configure CRM_UPLOAD_DIR fora da pasta public.");
}

const nextConfig: NextConfig = {
  outputFileTracingExcludes: { "/*": ["./storage/uploads/**/*", "./public/uploads/**/*"] },
  async rewrites() {
    return { beforeFiles: [{ source: "/uploads/:parts*", destination: "/api/attachments/:parts*" }], afterFiles: [], fallback: [] };
  },
  basePath: process.env.NEXT_PUBLIC_CRM_BASE_PATH || "",
};

export default nextConfig;
