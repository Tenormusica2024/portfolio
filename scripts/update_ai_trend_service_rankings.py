#!/usr/bin/env python3
"""Build source-backed AI generation service rankings.

This replaces the previous Hugging Face-only model ranking.  HF downloads are a
useful open-model signal, but they miss closed consumer/API services such as
GPT Image 2 and Seedance 2.0.  The dashboard is therefore service-oriented and
uses independent benchmark/leaderboard evidence plus official product sources.
"""
from __future__ import annotations

import argparse
import json
import statistics
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote

import requests


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


SOURCES = {
    "aa_image": {
        "name": "Artificial Analysis Text to Image Leaderboard",
        "url": "https://artificialanalysis.ai/image/leaderboard/text-to-image/",
        "usage": "Blind human-preference Elo ranking for image generation services/models.",
    },
    "aa_video_t2v": {
        "name": "Artificial Analysis Text to Video Leaderboard",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "usage": "Blind human-preference Elo ranking for text-to-video generation.",
    },
    "aa_video_i2v": {
        "name": "Artificial Analysis Image to Video Leaderboard",
        "url": "https://artificialanalysis.ai/video/leaderboard/image-to-video",
        "usage": "Blind human-preference Elo ranking for image-to-video generation, including with-audio FAQ rankings.",
    },
    "openai_gpt_image_2": {
        "name": "OpenAI GPT Image 2 model docs",
        "url": "https://developers.openai.com/api/docs/models/gpt-image-2",
        "usage": "Official model availability and capability reference for GPT Image 2.",
    },
    "bytedance_seedance_2": {
        "name": "ByteDance Seedance 2.0 official page",
        "url": "https://seed.bytedance.com/en/seedance2_0",
        "usage": "Official model capability and multimodal service reference for Seedance 2.0.",
    },
    "npm_downloads_api": {
        "name": "npm Downloads API",
        "url": "https://api.npmjs.org/downloads/range/",
        "usage": "Objective package downloads for CLI coding agents. The dashboard uses 30 complete days of daily downloads and ranks by median daily share to reduce release/automation spike distortion. This is a momentum/share proxy, not exact active users.",
    },
}


IMAGE_SERVICES = [
    {
        "rank": 1,
        "name": "GPT Image 2 / ChatGPT Images 2.0",
        "provider": "OpenAI",
        "service_family": "ChatGPT / OpenAI Images API",
        "url": "https://openai.com/index/introducing-chatgpt-images-2-0/",
        "metric_label": "Artificial Analysis Elo",
        "metric_value": 1337,
        "metric_detail": "GPT Image 2 (high) leads the Text to Image Arena; OpenAI docs list gpt-image-2 as state-of-the-art image generation/editing.",
        "availability": "ChatGPT / OpenAI API",
        "source_refs": ["aa_image", "openai_gpt_image_2"],
        "tags": ["image generation", "image editing", "text rendering", "closed service", "API"],
    },
    {
        "rank": 2,
        "name": "GPT Image 1.5 (high)",
        "provider": "OpenAI",
        "service_family": "ChatGPT / OpenAI Images API",
        "url": "https://developers.openai.com/api/docs/models/gpt-image-2",
        "metric_label": "Artificial Analysis Elo",
        "metric_value": 1268,
        "metric_detail": "Second in the Artificial Analysis Text to Image FAQ at time of check; kept for continuity but superseded by GPT Image 2.",
        "availability": "ChatGPT / OpenAI API",
        "source_refs": ["aa_image", "openai_gpt_image_2"],
        "tags": ["image generation", "closed service", "API"],
    },
    {
        "rank": 3,
        "name": "Nano Banana 2 / Gemini 3.1 Flash Image Preview",
        "provider": "Google",
        "service_family": "Gemini Image",
        "url": "https://artificialanalysis.ai/image/leaderboard/text-to-image/",
        "metric_label": "Artificial Analysis Elo",
        "metric_value": 1263,
        "metric_detail": "Listed as a top Text to Image model by Artificial Analysis blind votes.",
        "availability": "Gemini / Google AI ecosystem",
        "source_refs": ["aa_image"],
        "tags": ["image generation", "closed service", "Gemini"],
    },
    {
        "rank": 4,
        "name": "Nano Banana Pro / Gemini 3 Pro Image",
        "provider": "Google",
        "service_family": "Gemini Image",
        "url": "https://artificialanalysis.ai/image/leaderboard/text-to-image/",
        "metric_label": "Artificial Analysis Elo",
        "metric_value": 1220,
        "metric_detail": "Listed in the Artificial Analysis top Text to Image models by Elo.",
        "availability": "Gemini / Google AI ecosystem",
        "source_refs": ["aa_image"],
        "tags": ["image generation", "closed service", "Gemini"],
    },
    {
        "rank": 5,
        "name": "Seedream 4.0",
        "provider": "ByteDance Seed",
        "service_family": "Seedream",
        "url": "https://seed.bytedance.com/",
        "metric_label": "Artificial Analysis Elo",
        "metric_value": 1198,
        "metric_detail": "Listed in the Artificial Analysis top Text to Image models by Elo.",
        "availability": "ByteDance / partner access",
        "source_refs": ["aa_image"],
        "tags": ["image generation", "closed service", "ByteDance"],
    },
]


VIDEO_SERVICES = [
    {
        "rank": 1,
        "name": "Dreamina Seedance 2.0 720p",
        "provider": "ByteDance Seed",
        "service_family": "Seedance / Dreamina / CapCut ecosystem",
        "url": "https://seed.bytedance.com/en/seedance2_0",
        "metric_label": "Artificial Analysis I2V with audio Elo",
        "metric_value": 1180,
        "metric_detail": "Artificial Analysis says Seedance 2.0 leads Image-to-Video with audio; the no-audio Image-to-Video table also places it at #2 with Elo 1347, and Text-to-Video at #2 with Elo 1273. Official material confirms text/image/audio/video multimodal inputs.",
        "availability": "Dreamina / ByteDance ecosystem / partner APIs vary by region",
        "source_refs": ["aa_video_i2v", "bytedance_seedance_2"],
        "tags": ["video generation", "image-to-video", "text-to-video", "audio", "multimodal"],
    },
    {
        "rank": 2,
        "name": "HappyHorse-1.0",
        "provider": "Alibaba-ATH",
        "service_family": "HappyHorse",
        "url": "https://artificialanalysis.ai/video/leaderboard/image-to-video",
        "metric_label": "Artificial Analysis I2V no-audio Elo",
        "metric_value": 1395,
        "metric_detail": "Leads Artificial Analysis Image-to-Video without audio and Text-to-Video, but availability was listed as coming soon / limited at time of check.",
        "availability": "Coming soon / limited",
        "source_refs": ["aa_video_i2v"],
        "tags": ["video generation", "image-to-video", "benchmark leader", "limited availability"],
    },
    {
        "rank": 3,
        "name": "Kling 3.0 1080p Pro",
        "provider": "KlingAI / Kuaishou",
        "service_family": "Kling AI",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis T2V Elo",
        "metric_value": 1250,
        "metric_detail": "Top-tier text-to-video service on Artificial Analysis, with API pricing listed.",
        "availability": "Kling AI / API",
        "source_refs": ["aa_video_t2v"],
        "tags": ["video generation", "text-to-video", "API"],
    },
    {
        "rank": 4,
        "name": "grok-imagine-video",
        "provider": "xAI",
        "service_family": "Grok Imagine",
        "url": "https://artificialanalysis.ai/video/leaderboard/image-to-video",
        "metric_label": "Artificial Analysis I2V no-audio Elo",
        "metric_value": 1326,
        "metric_detail": "Top 5 in Artificial Analysis Image-to-Video without audio and also appears high in Text-to-Video.",
        "availability": "xAI / Grok ecosystem",
        "source_refs": ["aa_video_i2v", "aa_video_t2v"],
        "tags": ["video generation", "image-to-video", "closed service"],
    },
    {
        "rank": 5,
        "name": "PixVerse V6",
        "provider": "PixVerse",
        "service_family": "PixVerse",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis T2V Elo",
        "metric_value": 1322,
        "metric_detail": "Top 5 in Artificial Analysis Image-to-Video without audio and top 10 in Text-to-Video.",
        "availability": "PixVerse / API",
        "source_refs": ["aa_video_t2v", "aa_video_i2v"],
        "tags": ["video generation", "text-to-video", "image-to-video"],
    },
    {
        "rank": 6,
        "name": "Vidu Q3 Pro",
        "provider": "Vidu",
        "service_family": "Vidu",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis I2V no-audio Elo",
        "metric_value": 1286,
        "metric_detail": "Top 5 in Artificial Analysis Image-to-Video without audio and high-ranked in Text-to-Video.",
        "availability": "Vidu / API",
        "source_refs": ["aa_video_t2v", "aa_video_i2v"],
        "tags": ["video generation", "text-to-video", "image-to-video"],
    },
    {
        "rank": 7,
        "name": "Bach-1.0 Preview",
        "provider": "Video Rebirth",
        "service_family": "Bach",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis T2V Elo",
        "metric_value": 1224,
        "metric_detail": "Top 10 in Artificial Analysis Text-to-Video; preview status.",
        "availability": "Preview / API pricing listed",
        "source_refs": ["aa_video_t2v"],
        "tags": ["video generation", "text-to-video", "preview"],
    },
    {
        "rank": 8,
        "name": "Runway Gen-4.5",
        "provider": "Runway",
        "service_family": "Runway",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis T2V Elo",
        "metric_value": 1220,
        "metric_detail": "High-ranked in Artificial Analysis Text-to-Video; no API availability shown at time of check.",
        "availability": "Runway app / no API listed",
        "source_refs": ["aa_video_t2v"],
        "tags": ["video generation", "text-to-video", "creator service"],
    },
    {
        "rank": 9,
        "name": "Veo 3 / Veo 3.1 family",
        "provider": "Google",
        "service_family": "Veo",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis T2V Elo",
        "metric_value": 1218,
        "metric_detail": "Veo 3 and Veo 3.1 variants remain competitive in Artificial Analysis video rankings.",
        "availability": "Google AI / API variants",
        "source_refs": ["aa_video_t2v", "aa_video_i2v"],
        "tags": ["video generation", "text-to-video", "Google"],
    },
    {
        "rank": 10,
        "name": "Sora 2 Pro / Sora 2",
        "provider": "OpenAI",
        "service_family": "Sora",
        "url": "https://artificialanalysis.ai/video/leaderboard/text-to-video",
        "metric_label": "Artificial Analysis T2V Elo",
        "metric_value": 1185,
        "metric_detail": "Sora 2 Pro appears below the current top tier on Artificial Analysis Text-to-Video, but remains an important closed service to track.",
        "availability": "OpenAI / Sora ecosystem",
        "source_refs": ["aa_video_t2v"],
        "tags": ["video generation", "text-to-video", "closed service"],
    },
]


CODING_AGENT_PACKAGES = [
    {
        "name": "Codex CLI",
        "provider": "OpenAI",
        "package": "@openai/codex",
        "url": "https://www.npmjs.com/package/@openai/codex",
        "service_family": "CLI coding agent",
        "tags": ["coding agent", "CLI", "OpenAI", "agentic coding"],
    },
    {
        "name": "Claude Code",
        "provider": "Anthropic",
        "package": "@anthropic-ai/claude-code",
        "url": "https://www.npmjs.com/package/@anthropic-ai/claude-code",
        "service_family": "CLI coding agent",
        "tags": ["coding agent", "CLI", "Anthropic", "agentic coding"],
    },
    {
        "name": "OpenCode",
        "provider": "SST / OpenCode",
        "package": "opencode-ai",
        "url": "https://www.npmjs.com/package/opencode-ai",
        "service_family": "CLI coding agent",
        "tags": ["coding agent", "CLI", "terminal"],
    },
    {
        "name": "Gemini CLI",
        "provider": "Google",
        "package": "@google/gemini-cli",
        "url": "https://www.npmjs.com/package/@google/gemini-cli",
        "service_family": "CLI coding agent",
        "tags": ["coding agent", "CLI", "Google", "Gemini"],
    },
    {
        "name": "Qwen Code",
        "provider": "Alibaba / Qwen",
        "package": "@qwen-code/qwen-code",
        "url": "https://www.npmjs.com/package/@qwen-code/qwen-code",
        "service_family": "CLI coding agent",
        "tags": ["coding agent", "CLI", "Qwen"],
    },
    {
        "name": "Crush",
        "provider": "Charm",
        "package": "@charmland/crush",
        "url": "https://www.npmjs.com/package/@charmland/crush",
        "service_family": "CLI coding agent",
        "tags": ["coding agent", "CLI", "terminal"],
    },
]


def fetch_npm_last_month(package_name: str, timeout: int = 20) -> dict[str, Any]:
    url = f"https://api.npmjs.org/downloads/point/last-month/{quote(package_name, safe='')}"
    response = requests.get(url, timeout=timeout, headers={"User-Agent": "ai-trend-daily/2026-service-rankings"})
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict) or "downloads" not in data:
        raise ValueError(f"Unexpected npm response for {package_name}: {data!r}")
    return data


def fetch_npm_download_range(package_name: str, start: str, end: str, timeout: int = 20) -> dict[str, Any]:
    url = f"https://api.npmjs.org/downloads/range/{start}:{end}/{quote(package_name, safe='')}"
    response = requests.get(url, timeout=timeout, headers={"User-Agent": "ai-trend-daily/2026-service-rankings"})
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict) or "downloads" not in data:
        raise ValueError(f"Unexpected npm range response for {package_name}: {data!r}")
    return data


def build_coding_agent_cli_category() -> dict[str, Any]:
    fetched: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    # Use complete UTC days instead of npm's point last-month sum as the primary
    # ranking signal.  Package-download sums can be heavily distorted by short
    # release/update bursts, so median daily downloads are a more stable public
    # proxy for ongoing CLI usage momentum.
    end_date = datetime.now(timezone.utc).date() - timedelta(days=1)
    start_date = end_date - timedelta(days=29)
    start = start_date.isoformat()
    end = end_date.isoformat()
    for agent in CODING_AGENT_PACKAGES:
        try:
            range_stats = fetch_npm_download_range(agent["package"], start, end)
            daily_downloads = [
                int(row.get("downloads") or 0)
                for row in range_stats.get("downloads", [])
                if isinstance(row, dict)
            ]
            if not daily_downloads:
                raise ValueError(f"No daily downloads returned for {agent['package']}")
            point_stats = fetch_npm_last_month(agent["package"])
            raw_last_month = int(point_stats.get("downloads") or 0)
            median_daily = float(statistics.median(daily_downloads))
            average_daily = float(statistics.mean(daily_downloads))
            max_daily = max(daily_downloads)
            fetched.append({
                **agent,
                "downloads_last_month": raw_last_month,
                "median_daily_downloads": median_daily,
                "average_daily_downloads": average_daily,
                "max_daily_downloads": max_daily,
                "npm_period_start": start,
                "npm_period_end": end,
                "npm_point_period_start": point_stats.get("start"),
                "npm_point_period_end": point_stats.get("end"),
            })
        except Exception as exc:  # Keep the rest of the dashboard available if one package fails.
            errors.append({"package": agent["package"], "error": str(exc)})

    total_median_daily = sum(item["median_daily_downloads"] for item in fetched) or 1
    total_raw_last_month = sum(item["downloads_last_month"] for item in fetched)
    ranked = sorted(fetched, key=lambda item: item["median_daily_downloads"], reverse=True)
    items: list[dict[str, Any]] = []
    for rank, item in enumerate(ranked, start=1):
        share_pct = round(item["median_daily_downloads"] / total_median_daily * 100, 1)
        median_daily_display = int(round(item["median_daily_downloads"]))
        average_daily_display = int(round(item["average_daily_downloads"]))
        raw_share_pct = round(item["downloads_last_month"] / total_raw_last_month * 100, 1) if total_raw_last_month else 0.0
        items.append({
            "rank": rank,
            "name": item["name"],
            "provider": item["provider"],
            "service_family": item["service_family"],
            "url": item["url"],
            "package": item["package"],
            "metric_label": "% of tracked median daily npm downloads",
            "metric_value": share_pct,
            "metric_value_display": f"{share_pct:.1f}%",
            "median_daily_downloads": median_daily_display,
            "average_daily_downloads": average_daily_display,
            "max_daily_downloads": item["max_daily_downloads"],
            "downloads_last_month": item["downloads_last_month"],
            "raw_last_month_share_pct": raw_share_pct,
            "secondary_metric_label": "median daily npm downloads",
            "secondary_metric_display": f"{median_daily_display:,}",
            "metric_detail": (
                f"{median_daily_display:,} median daily npm downloads from {item.get('npm_period_start')} to {item.get('npm_period_end')}. "
                f"Raw npm last-month total was {item['downloads_last_month']:,} ({raw_share_pct:.1f}% of tracked raw total), "
                "but raw totals can be distorted by release/update automation spikes, so median daily share is used for ranking."
            ),
            "availability": "npm CLI package",
            "source_refs": ["npm_downloads_api"],
            "tags": item["tags"],
        })

    return {
        "key": "ai_coding_agent_cli_share",
        "title_ja": "AIコーディングエージェントCLIシェア",
        "title_en": "AI Coding Agent CLI Share",
        "summary_ja": "Codex、Claude Code、Gemini CLIなどnpm配布CLIの直近30完了日の日次downloads中央値から、対象パッケージ内シェアを算出。月間合計はリリース/自動更新スパイクで歪みやすいため、実ユーザー数ではなく利用モメンタムに近い安定寄りの客観API指標として扱います。",
        "summary_en": "Tracked share of median daily npm downloads across the last 30 complete days for CLI coding agents such as Codex, Claude Code, and Gemini CLI. This is an objective momentum proxy, not active-user market share; median daily ranking reduces raw monthly spike distortion.",
        "metric": "npm_30_complete_day_median_daily_download_share_within_tracked_cli_agents",
        "period_start": start,
        "period_end": end,
        "total_median_daily_downloads": int(round(total_median_daily)),
        "total_downloads_last_month_raw": total_raw_last_month,
        "query_errors": errors,
        "items": items,
    }


BASE_CATEGORIES = [
    {
        "key": "image_generation_services",
        "title_ja": "画像生成AIサービス",
        "title_en": "Image Generation AI Services",
        "summary_ja": "Hugging Face公開モデルdownloadsではなく、GPT Image 2などのクローズドサービスも含めた画像生成サービスランキング。主指標はArtificial Analysisの盲検ユーザー投票Elo。",
        "summary_en": "Image-generation service ranking that includes closed services such as GPT Image 2. Primary metric: Artificial Analysis blind user-preference Elo.",
        "metric": "artificial_analysis_text_to_image_elo",
        "items": IMAGE_SERVICES,
    },
    {
        "key": "video_generation_services",
        "title_ja": "動画生成AIサービス",
        "title_en": "Video Generation AI Services",
        "summary_ja": "Seedance 2.0などのクローズド/商用サービスを含めた動画生成サービスランキング。T2V/I2V/音声対応を横断して、公開リーダーボードと公式情報で補正。",
        "summary_en": "Video-generation service ranking including closed/commercial services such as Seedance 2.0, using public leaderboards and official sources across T2V/I2V/audio-capable workflows.",
        "metric": "artificial_analysis_video_elo_plus_service_context",
        "items": VIDEO_SERVICES,
    },
]


def build_rankings() -> dict[str, Any]:
    generated_at = now_iso()
    return {
        "schema_version": "2026-05-13.service-rankings.v2",
        "generated_at": generated_at,
        "project": "AI Tool Trend Analysis",
        "ranking_policy": {
            "primary_scope": "AI generation services plus AI coding agent CLI momentum/share proxy",
            "reason_for_change": "HF downloads miss closed services such as GPT Image 2 and Seedance 2.0, so service ranking needs benchmark/official-source evidence.",
            "primary_metric": "Artificial Analysis blind user-preference Elo where available",
            "caveats": [
                "Unified real user counts are not publicly available across OpenAI, Google, ByteDance, Runway, Kling, and other closed services.",
                "Elo is a user-preference quality signal, not a user-count metric. It is used because it covers closed services more fairly than HF downloads.",
                "For service-level ranking, multimodal availability, official launch status, and leaderboard category coverage are used as tie-break context.",
                "AI coding agent CLI share uses median daily npm downloads across 30 complete days within tracked packages; this is not exact active-user market share.",
                "Raw npm monthly totals are retained as context but not used as the primary CLI ranking because release/update automation can create short-lived spikes.",
            ],
        },
        "sources": [{"key": key, **value, "checked_at": generated_at} for key, value in SOURCES.items()],
        "categories": [*BASE_CATEGORIES, build_coding_agent_cli_category()],
    }


def write_json(data: dict[str, Any], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build AI generation service rankings")
    parser.add_argument("--output", default="public/service_rankings.json", help="Primary output JSON path")
    parser.add_argument("--legacy-output", default="public/hf_rankings.json", help="Legacy output path kept for existing links")
    args = parser.parse_args()

    data = build_rankings()
    write_json(data, Path(args.output))
    if args.legacy_output:
        write_json(data, Path(args.legacy_output))

    print(f"OK wrote {args.output}")
    if args.legacy_output:
        print(f"OK wrote legacy alias {args.legacy_output}")
    for category in data["categories"]:
        leader = category["items"][0]
        print(f"- {category['key']}: {len(category['items'])} items, #1 {leader['name']} ({leader['metric_value']} {leader['metric_label']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
