from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
B2B_ROOT = ROOT / "b2b"

TARGETS = sorted(B2B_ROOT.glob("*.html")) + sorted((B2B_ROOT / "blog").glob("*.html"))

BEGIN_MARKER = "  <!-- BEGIN B2B_SHARED_HEAD -->"
END_MARKER = "  <!-- END B2B_SHARED_HEAD -->"


def shared_block(path: Path) -> str:
    prefix = "../" if path.parent.name == "blog" else ""
    return "\n".join(
        [
            BEGIN_MARKER,
            "  <meta property=\"og:locale\" content=\"ja_JP\">",
            "  <meta property=\"og:site_name\" content=\"Ezlize\">",
            "  <meta property=\"og:image\" content=\"https://ezlize.com/og-image.png\">",
            "  <meta name=\"twitter:card\" content=\"summary_large_image\">",
            "  <meta name=\"twitter:image\" content=\"https://ezlize.com/og-image.png\">",
            f"  <link rel=\"icon\" type=\"image/x-icon\" href=\"{prefix}favicon.ico?v=b2b-k-20260426\">",
            f"  <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"{prefix}favicon-32x32.png?v=b2b-k-20260426\">",
            f"  <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"{prefix}favicon-16x16.png?v=b2b-k-20260426\">",
            f"  <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"{prefix}favicon-180x180.png?v=b2b-k-20260426\">",
            END_MARKER,
        ]
    )


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


def remove_existing_shared_tags(text: str) -> str:
    text = re.sub(
        rf"\n?{re.escape(BEGIN_MARKER)}.*?{re.escape(END_MARKER)}\n?",
        "\n",
        text,
        flags=re.DOTALL,
    )
    lines = text.splitlines()
    kept: list[str] = []
    for line in lines:
        if any(re.match(pattern, line) for pattern in SHARED_PATTERNS):
            continue
        kept.append(line)
    return "\n".join(kept) + ("\n" if text.endswith("\n") else "")


def sync_file(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = remove_existing_shared_tags(text)
    block = shared_block(path)

    insert_before_patterns = [
        '  <link rel="canonical"',
        '  <script type="application/ld+json">',
        "</head>",
    ]
    for anchor in insert_before_patterns:
        if anchor in text:
            text = text.replace(anchor, block + "\n" + anchor, 1)
            break
    else:
        raise RuntimeError(f"insert anchor not found: {path}")

    text = re.sub(r"\n{3,}", "\n\n", text)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    for path in TARGETS:
        sync_file(path)
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    main()
