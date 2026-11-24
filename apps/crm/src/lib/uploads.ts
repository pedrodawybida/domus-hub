import path from "node:path";

export const uploadsRoot = path.resolve(process.env.CRM_UPLOAD_DIR || "storage/uploads");
