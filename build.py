#!/usr/bin/env python3
"""Inline the modular source in src/ into a single self-contained index.html.

The source (src/index.html + styles.css + app.js + data.json) is a normal static
site you can serve directly for development. This build produces the single-file
index.html that GitHub Pages serves — everything inlined, no external requests.

    python build.py
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"


def main() -> None:
    html = (SRC / "index.html").read_text(encoding="utf-8")
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    js = (SRC / "app.js").read_text(encoding="utf-8")
    data = (SRC / "data.json").read_text(encoding="utf-8")

    assert "</script>" not in js, "app.js must not contain a literal </script>"
    # Escaping '<' keeps a stray '</script>' inside a string value from closing the
    # inlined JSON block early; '<' is valid JSON so the payload is unchanged.
    data_inline = data.replace("<", "\\u003c")

    html = html.replace(
        '<link rel="stylesheet" href="./styles.css">',
        f"<style>\n{css}\n  </style>",
    )
    html = html.replace(
        '<script type="module" src="./app.js"></script>',
        f'<script type="application/json" id="mod-data">{data_inline}</script>\n'
        f"  <script type=\"module\">\n{js}\n  </script>",
    )

    out = ROOT / "index.html"
    out.write_text(html, encoding="utf-8")
    print(f"Built {out.name} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()
