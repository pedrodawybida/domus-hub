"""Run from the CRM root with DATABASE_URL loaded from the service environment."""
import os
import shutil
import sqlite3
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
url = os.environ["DATABASE_URL"]
if not url.startswith("file:") or "?" in url:
    raise ValueError("Expected file:<sqlite path> in DATABASE_URL")
source = (root / "prisma" / url[5:]).resolve(strict=True)
base = Path(os.environ.get("CRM_BACKUP_DIR", Path.home() / "domus-backups"))
base.mkdir(mode=0o700, parents=True, exist_ok=True)
destination = Path(tempfile.mkdtemp(prefix="crm-", dir=base))
os.umask(0o077)
with sqlite3.connect(source.as_uri() + "?mode=ro", uri=True) as db:
    with sqlite3.connect(destination / "database.db") as backup:
        db.backup(backup)
        if backup.execute("PRAGMA integrity_check").fetchone() != ("ok",):
            raise RuntimeError("SQLite integrity check failed")
if (root / ".env").exists():
    shutil.copy2(root / ".env", destination / ".env")
private_uploads = root / os.environ.get("CRM_UPLOAD_DIR", "storage/uploads")
legacy_uploads = root / "public/uploads"
if private_uploads.exists():
    shutil.copytree(private_uploads, destination / "uploads")
if legacy_uploads.exists():
    target = "legacy-public-uploads" if private_uploads.exists() else "uploads"
    shutil.copytree(legacy_uploads, destination / target)
print(destination)
