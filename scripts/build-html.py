#!/usr/bin/env python3
"""
Assembles src/index.html + shared/site.json + src/partials + src/sections
into the root index.html.

Usage: python3 scripts/build-html.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
TEMPLATE = SRC / "index.html"
SITE_PATH = ROOT / "shared" / "site.json"
OUT = ROOT / "index.html"

INCLUDE_RE = re.compile(r"<!--\s*@include\s+([^\s]+)\s*-->")
VAR_RE = re.compile(r"\{\{(\w+)\}\}")


def load_site() -> dict:
    return json.loads(SITE_PATH.read_text(encoding="utf-8"))


def apply_vars(text: str, site: dict) -> str:
    def repl(m: re.Match[str]) -> str:
        key = m.group(1)
        if key in site:
            return str(site[key])
        print(f"[build-html] Unknown placeholder: {{{{{key}}}}}", file=sys.stderr)
        return m.group(0)

    return VAR_RE.sub(repl, text)


def process_includes(text: str, stack: list[Path] | None = None) -> str:
    if stack is None:
        stack = []

    def repl(m: re.Match[str]) -> str:
        rel = m.group(1)
        full = (SRC / rel).resolve()
        if full in stack:
            raise SystemExit(f"Circular include: {rel}")
        if not full.exists():
            raise SystemExit(f"Missing include file: {rel} (looked at {full})")
        stack.append(full)
        inner = full.read_text(encoding="utf-8")
        inner = process_includes(inner, stack)
        stack.pop()
        return inner

    return INCLUDE_RE.sub(repl, text)


def main() -> None:
    site = load_site()
    html = TEMPLATE.read_text(encoding="utf-8")
    html = process_includes(html)
    html = apply_vars(html, site)
    OUT.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
