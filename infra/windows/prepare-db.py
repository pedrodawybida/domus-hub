"""Prepare a new Domus database from an existing SQLite database."""
import argparse
import os
import sqlite3
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("source", type=Path)
parser.add_argument("destination", type=Path)
args = parser.parse_args()
source = sqlite3.connect(args.source.resolve().as_uri() + "?mode=ro", uri=True)
if source.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
    raise SystemExit("Falha na integridade da origem.")
fd = os.open(args.destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
os.close(fd)
try:
    target = sqlite3.connect(args.destination)
    try:
        source.backup(target)
        target.execute("BEGIN IMMEDIATE")
        for table, column, definition in [
            ("academy_progressos", "pagina_atual", "INTEGER DEFAULT 1"),
            ("users", "pode_apresentar", "BOOLEAN NOT NULL DEFAULT false"),
        ]:
            columns = {row[1] for row in target.execute(f"PRAGMA table_info({table})")}
            if column not in columns:
                target.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
        if target.execute("PRAGMA foreign_key_check").fetchone() or target.execute("PRAGMA integrity_check").fetchall() != [("ok",)]:
            raise ValueError("Falha na validação da cópia.")
        target.commit()
    finally:
        target.close()
except BaseException:
    args.destination.unlink()
    raise
finally:
    source.close()
