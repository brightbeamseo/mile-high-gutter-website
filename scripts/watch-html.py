#!/usr/bin/env python3
"""Rebuild index.html when src/ or shared/site.json changes."""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "scripts" / "build-html.py"


def run_build() -> None:
    subprocess.run([sys.executable, str(BUILD)], cwd=ROOT, check=True)


def main() -> None:
    print("Watching src/ and shared/site.json — Ctrl+C to stop.\n")
    run_build()
    # Simple polling (portable; no extra deps)
    mtimes: dict[Path, float | None] = {}
    paths = [ROOT / "shared" / "site.json"]
    for p in (ROOT / "src").rglob("*"):
        if p.is_file():
            paths.append(p)

    for p in paths:
        mtimes[p] = p.stat().st_mtime if p.exists() else None

    try:
        while True:
            time.sleep(0.6)
            for p in list(mtimes.keys()):
                if not p.exists():
                    continue
                cur = p.stat().st_mtime
                if mtimes.get(p) != cur:
                    mtimes[p] = cur
                    run_build()
                    break
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
