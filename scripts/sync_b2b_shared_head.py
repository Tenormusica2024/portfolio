from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
B2B_ROOT = ROOT / "b2b"
CONFIG_PATH = ROOT / "scripts" / "b2b_head_config.json"

TARGETS = sorted(B2B_ROOT.glob("*.html")) + sorted((B2B_ROOT / "blog").glob("*.html"))

PAGE_BEGIN = "  <!-- BEGIN B2B_PAGE_HEAD -->"
PAGE_END = "  <!-- END B2B_PAGE_HEAD -->"
SHARED_BEGIN = "  <!-- BEGIN B2B_SHARED_HEAD -->"
SHARED_END = "  <!-- END B2B_SHARED_HEAD -->"


def load_config() -> dict[str, dict[str, str | None]]:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def page_block(meta: dict[str, str | None]) -> str:
    lines = [
        PAGE_BEGIN,
        f"  <title>{meta['title']}</title>",
        f"  <meta name=\"robots\" content=\"{meta['robots']}\">",
        f"  <meta name=\"description\" content=\"{meta['description']}\">",
        f"  <meta property=\"og:type\" content=\"{meta['og_type']}\">",
        f"  <meta property=\"og:url\" content=\"{meta['og_url']}\">",
        f"  <meta property=\"og:title\" content=\"{meta['og_title']}\">",
        f"  <meta property=\"og:description\" content=\"{meta['og_description']}\">",
        f"  <meta name=\"twitter:title\" content=\"{meta['twitter_title']}\">",
        f"  <meta name=\"twitter:description\" content=\"{meta['twitter_description']}\">",
    ]
    if meta.get("canonical"):
        lines.append(f"  <link rel=\"canonical\" href=\"{meta['canonical']}\">")
    if meta.get("hreflang_ja"):
        lines.append(f"  <link rel=\"alternate\" hreflang=\"ja-JP\" href=\"{meta['hreflang_ja']}\">")
    if meta.get("hreflang_default"):
        lines.append(f"  <link rel=\"alternate\" hreflang=\"x-default\" href=\"{meta['hreflang_default']}\">")
    lines.append(PAGE_END)
    return "\n".join(lines)


def shared_block(path: Path) -> str:
    prefix = "../" if path.parent.name == "blog" else ""
    return "\n".join(
        [
            SHARED_BEGIN,
            "  <meta property=\"og:locale\" content=\"ja_JP\">",
            "  <meta property=\"og:site_name\" content=\"Ezlize\">",
            "  <meta property=\"og:image\" content=\"https://ezlize.com/og-image.png\">",
            "  <meta name=\"twitter:card\" content=\"summary_large_image\">",
            "  <meta name=\"twitter:image\" content=\"https://ezlize.com/og-image.png\">",
            f"  <link rel=\"icon\" type=\"image/x-icon\" href=\"{prefix}favicon.ico?v=b2b-k-20260426\">",
            f"  <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"{prefix}favicon-32x32.png?v=b2b-k-20260426\">",
            f"  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"{prefix}favicon-16x16.png?v=b2b-k-20260426\">",
            f"  <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"{prefix}favicon-180x180.png?v=b2b-k-20260426\">",
            SHARED_END,
        ]
    )


PAGE_PATTERNS = [
    r"^\s*<title>.*?</title>\s*$",
    r'^\s*<meta name="robots" content=".*?">\s*$',
    r'^\s*<meta name="description" content=".*?">\s*$',
    r'^\s*<meta property="og:type" content=".*?">\s*$',
    r'^\s*<meta property="og:url" content=".*?">\s*$',
    r'^\s*<meta property="og:title" content=".*?">\s*$',
    r'^\s*<meta property="og:description" content=".*?">\s*$',
    r'^\s*<meta name="twitter:title" content=".*?">\s*$',
    r'^\s*<meta name="twitter:description" content=".*?">\s*$',
    r'^\s*<link rel="canonical" href=".*?">\s*$',
    r'^\s*<link rel="alternate" hreflang="ja-JP" href=".*?">\s*$',
    r'^\s*<link rel="alternate" hreflang="x-default" href=".*?">\s*$',
]

SHARED_PATTERNS = [
    r'^\s*<meta property="og:locale" content="ja_JP">\s*$',
    r'^\s*<meta property="og:site_name" content="Ezlize">\s*$',
    r'^\s*<meta property="og:image" content="https://ezlize\.com/og-image\.png">\s*$',
    r'^\s*<meta name="twitter:card" content="summary_large_image">\s*$',
    r'^\s*<meta name="twitter:image" content="https://ezlize\.com/og-image\.png">\s*$',
    r'^\s*<link rel="icon" type="image/x-icon" href="(?:\.\./)?favicon\.ico(?:\?v=[^"]+)?">\s*$',
    r'^\s*<link rel="icon" type="image/png" sizes="32x32" href="(?:\.\./)?favicon-32x32\.png(?:\?v=[^"]+)?">\s*$',
    r'^\s*<link rel="icon" type="image/png" sizes="16x16" href="(?:\.\./)?favicon-16x16\.png(?:\?v=[^"]+)?">\s*$',
    r'^\s*<link rel="apple-touch-icon" sizes="180x180" href="(?:\.\./)?favicon-180x180\.png(?:\?v=[^"]+)?">\s*$',
]


def remove_marker_block(text: str, begin: str, end: str) -> str:
    return re.sub(rf"\n?{re.escape(begin)}.*?{re.escape(end)}\n?", "\n", text, flags=re.DOTALL)


def remove_existing_tags(text: str, patterns: list[str]) -> str:
    lines = text.splitlines()
    kept: list[str] = []
    for line in lines:
        if any(re.match(pattern, line) for pattern in patterns):
            continue
        kept.append(line)
    return "\n".join(kept) + ("\n" if text.endswith("\n") else "")


def sync_file(path: Path, config: dict[str, dict[str, str | None]]) -> None:
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    if rel not in config:
        raise RuntimeError(f"config not found for {rel}")

    text = path.read_text(encoding="utf-8")
    text = remove_marker_block(text, PAGE_BEGIN, PAGE_END)
    text = remove_marker_block(text, SHARED_BEGIN, SHARED_END)
    text = remove_existing_tags(text, PAGE_PATTERNS + SHARED_PATTERNS)

    page_head = page_block(config[rel])
    shared_head = shared_block(path)

    viewport_anchor = '  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
    if viewport_anchor in text:
        text = text.replace(viewport_anchor, viewport_anchor + "\n" + page_head + "\n" + shared_head, 1)
    else:
        raise RuntimeError(f"viewport anchor not found: {path}")

    text = re.sub(r"\n{3,}", "\n\n", text)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    config = load_config()
    for path in TARGETS:
        sync_file(path, config)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
