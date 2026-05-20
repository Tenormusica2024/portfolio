#!/usr/bin/env python3
"""Generate raw vs adjusted C2C/B2B portfolio access report.

The adjusted values are a conservative operational estimate for owner / AI-agent
self-access days identified during the 2026-05-20 analytics cleanup session.
GA4 aggregate exports do not expose identity or IP, so this report does not
claim forensic removal of historical traffic.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List

DEFAULT_INPUT = Path("analytics/data/latest.json")
DEFAULT_OUTPUT_DIR = Path("analytics/reports")

SELF_ACCESS_RULES = {
    "c2c": {
        "label": "C2C / Urayaha Days",
        "dates": {
            "2026-05-12": "projects.html centered direct/GitHub verification spike",
            "2026-05-13": "largest projects.html verification spike",
            "2026-05-18": "post-change verification traffic",
        },
    },
    "b2b": {
        "label": "B2B / Ezlize",
        "dates": {
            "2026-04-26": "pre-guard owner/agent production verification spike",
            "2026-04-28": "pre-guard owner/agent production verification spike",
            "2026-04-29": "pre-guard owner/agent production verification spike",
            "2026-05-12": "post-change small GitHub/direct verification traffic",
            "2026-05-13": "post-change small GitHub/direct verification traffic",
            "2026-05-14": "post-change small GitHub/direct verification traffic",
        },
    },
}

METRICS = ("page_views", "sessions", "users")


@dataclass(frozen=True)
class SiteTotals:
    page_views: int
    sessions: int
    users: int

    def as_dict(self) -> Dict[str, int]:
        return {"page_views": self.page_views, "sessions": self.sessions, "users": self.users}


def normalize_daily(row: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(row)
    date = str(result["date"])
    if len(date) == 8 and date.isdigit():
        result["date"] = f"{date[:4]}-{date[4:6]}-{date[6:]}"
    return result


def totals_from_summary(summary: Dict[str, Any], site: str) -> SiteTotals:
    return SiteTotals(
        page_views=int(summary[f"{site}_total_page_views"]),
        sessions=int(summary[f"{site}_total_sessions"]),
        users=int(summary[f"{site}_total_users"]),
    )


def sum_rows(rows: Iterable[Dict[str, Any]], site: str) -> SiteTotals:
    totals = {metric: 0 for metric in METRICS}
    for row in rows:
        for metric in METRICS:
            totals[metric] += int(row.get(f"{site}_{metric}", 0) or 0)
    return SiteTotals(**totals)


def subtract(raw: SiteTotals, excluded: SiteTotals) -> SiteTotals:
    return SiteTotals(
        page_views=max(0, raw.page_views - excluded.page_views),
        sessions=max(0, raw.sessions - excluded.sessions),
        users=max(0, raw.users - excluded.users),
    )


def pct(part: int, total: int) -> str:
    if total <= 0:
        return "0.0%"
    return f"{part / total * 100:.1f}%"


def table(headers: List[str], rows: List[List[Any]]) -> str:
    lines = ["| " + " | ".join(headers) + " |", "| " + " | ".join(["---"] * len(headers)) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(cell) for cell in row) + " |")
    return "\n".join(lines)


def build_report(data: Dict[str, Any]) -> Dict[str, Any]:
    comparison = data["site_comparison_daily"]
    daily = [normalize_daily(row) for row in comparison["daily"]]
    summary = comparison["summary"]

    sites: Dict[str, Dict[str, Any]] = {}
    for site, rule in SELF_ACCESS_RULES.items():
        raw = totals_from_summary(summary, site)
        excluded_dates = set(rule["dates"].keys())
        excluded_rows = [row for row in daily if row["date"] in excluded_dates]
        excluded = sum_rows(excluded_rows, site)
        adjusted = subtract(raw, excluded)
        sites[site] = {
            "label": rule["label"],
            "raw": raw.as_dict(),
            "excluded_estimate": excluded.as_dict(),
            "adjusted_estimate": adjusted.as_dict(),
            "excluded_share": {metric: pct(excluded.as_dict()[metric], raw.as_dict()[metric]) for metric in METRICS},
            "excluded_dates": [
                {
                    "date": row["date"],
                    "reason": rule["dates"][row["date"]],
                    "page_views": int(row.get(f"{site}_page_views", 0) or 0),
                    "sessions": int(row.get(f"{site}_sessions", 0) or 0),
                    "users": int(row.get(f"{site}_users", 0) or 0),
                }
                for row in sorted(excluded_rows, key=lambda item: item["date"])
            ],
        }

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_collected_at": data.get("collected_at"),
        "period": data.get("period", {}),
        "method": "date-level conservative self-access exclusion estimate from GA4 aggregate export",
        "sites": sites,
    }


def render_markdown(report: Dict[str, Any]) -> str:
    period = report["period"]
    lines = [
        "# Portfolio access raw vs adjusted estimate",
        "",
        f"Generated at: `{report['generated_at']}`",
        f"Source collected at: `{report['source_collected_at']}`",
        f"Period: `{period.get('start_date')}` to `{period.get('end_date')}`",
        "",
        "## Important caveat",
        "",
        "This is an operational estimate. GA4 aggregate exports do not expose owner identity or IP, so historical self-access cannot be removed with forensic certainty. The adjusted values below subtract date-level traffic that was identified during the 2026-05-20 cleanup session as owner / AI-agent verification traffic.",
        "",
        "## Summary",
        "",
    ]

    summary_rows: List[List[Any]] = []
    for site_key, site in report["sites"].items():
        raw = site["raw"]
        excluded = site["excluded_estimate"]
        adjusted = site["adjusted_estimate"]
        summary_rows.append([
            site["label"],
            raw["page_views"], raw["sessions"], raw["users"],
            excluded["page_views"], excluded["sessions"], excluded["users"],
            adjusted["page_views"], adjusted["sessions"], adjusted["users"],
        ])
    lines.append(table(
        ["site", "raw PV", "raw sessions", "raw users", "excluded PV", "excluded sessions", "excluded users", "adjusted PV", "adjusted sessions", "adjusted users"],
        summary_rows,
    ))
    lines.append("")

    for site_key, site in report["sites"].items():
        lines.extend([f"## {site['label']} excluded dates", ""])
        rows = [
            [row["date"], row["page_views"], row["sessions"], row["users"], row["reason"]]
            for row in site["excluded_dates"]
        ]
        lines.append(table(["date", "PV", "sessions", "users", "reason"], rows))
        lines.append("")

    lines.extend([
        "## Current guard status",
        "",
        "- Future owner/agent verification traffic should use `?ga_status=1` or `?ga_off=1` before normal browsing.",
        "- `?ga_status=1` is itself an opt-out trigger and shows an in-page diagnostic panel.",
        "- B2B OK markers: `GA_OPT_OUT_STATUS=OK`, `B2B_OPT_OUT=true`, `B2B_SUPPRESSED=true`, `B2B_GTAG_FUNCTION=false`, `B2B_GTAG_SCRIPT_PRESENT=false`.",
        "- C2C OK markers: `GA_OPT_OUT_STATUS=OK`, `C2C_OPT_OUT=true`, `C2C_SUPPRESSED=true`, `C2C_GA_DISABLE=true`.",
    ])
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    data = json.loads(args.input.read_text(encoding="utf-8"))
    report = build_report(data)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d")
    json_path = args.output_dir / f"portfolio_adjusted_access_{stamp}.json"
    md_path = args.output_dir / f"portfolio_adjusted_access_{stamp}.md"
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "report": report}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
