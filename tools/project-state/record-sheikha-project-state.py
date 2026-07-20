#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any


def atomic_write(path: Path, content: str, mode: int) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    temporary = path.with_name(f"{path.name}.tmp-{os.getpid()}")
    temporary.write_text(content, encoding="utf-8")
    os.chmod(temporary, mode)
    temporary.replace(path)
    os.chmod(path, mode)


def render_markdown(state: dict[str, Any]) -> str:
    source = state.get("sourceControl", {})
    activation = state.get("activation", {})
    completion = state.get("completion", {})
    runtime = state.get("runtime", {})
    lines = [
        "# حالة استكمال شيخة",
        "",
        f"- النطاق: {state['scope']}",
        f"- آخر تحديث: {state['updatedAt']}",
        f"- علامة الاستكمال: `{state['continuationMarker']}`",
        "",
        "## المستودع الحالي",
        "",
        f"- المسار: `{state['repositoryPath']}`",
        f"- الفرع: `{source.get('branch', 'main')}`",
        f"- HEAD: `{source.get('head', 'UNKNOWN')}`",
        "",
        "## الحالة التنفيذية",
        "",
    ]
    lines.extend(
        f"- `{key}={str(value).lower()}`"
        for key, value in activation.items()
    )
    lines.extend(["", "## حدود الاكتمال", ""])
    lines.extend(
        f"- `{key}={str(value).lower()}`"
        for key, value in completion.items()
    )
    lines.extend(["", "## Runtime المحلي", ""])
    lines.extend(
        f"- `{key}={value}`"
        for key, value in runtime.items()
    )
    lines.extend([
        "",
        "## الخطوة التالية",
        "",
        state.get("nextStep", "غير محددة"),
        "",
        "## قاعدة الصدق",
        "",
        "لا تتحول راية اكتمال إلى true إلا بدليل تقني قابل للتحقق.",
        "",
    ])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--repo-root")
    parser.add_argument("--outer-only", action="store_true")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    state = json.loads(input_path.read_text(encoding="utf-8"))
    required = (
        "scope",
        "projectsRoot",
        "repositoryPath",
        "continuationMarker",
        "updatedAt",
    )
    for key in required:
        if not state.get(key):
            raise SystemExit(f"الحقل المطلوب مفقود: {key}")

    projects_root = Path(state["projectsRoot"]).resolve()
    state_root = projects_root / "project-state"
    history_root = state_root / "history"
    latest_json = state_root / "SHEIKHA-LATEST-CONTINUATION.json"
    latest_md = state_root / "SHEIKHA-LATEST-CONTINUATION.md"
    latest_env = state_root / "SHEIKHA-LATEST.env"
    safe_marker = "".join(
        char if char.isalnum() or char in "._-" else "_"
        for char in state["continuationMarker"]
    )
    timestamp = state["updatedAt"].replace(":", "-").replace(".", "-").replace("+", "_")
    history_json = history_root / f"{timestamp}-{safe_marker}.json"
    history_md = history_root / f"{timestamp}-{safe_marker}.md"
    json_text = json.dumps(state, ensure_ascii=False, indent=2) + "\n"
    md_text = render_markdown(state)

    atomic_write(latest_json, json_text, 0o600)
    atomic_write(latest_md, md_text, 0o600)
    atomic_write(history_json, json_text, 0o600)
    atomic_write(history_md, md_text, 0o600)
    atomic_write(
        latest_env,
        "\n".join([
            f"SHEIKHA_CONTINUATION_MARKER={state['continuationMarker']}",
            f"SHEIKHA_PROJECT_STATE_JSON={latest_json}",
            f"SHEIKHA_PROJECT_STATE_MD={latest_md}",
            f"SHEIKHA_REPOSITORY={state['repositoryPath']}",
            f"SHEIKHA_REPOSITORY_HEAD={state.get('sourceControl', {}).get('head', 'UNKNOWN')}",
            "",
        ]),
        0o600,
    )

    if not args.outer_only:
        if not args.repo_root:
            raise SystemExit("--repo-root مطلوب عند كتابة النسخة المتتبعة.")
        repo_root = Path(args.repo_root).resolve()
        atomic_write(
            repo_root / "runtime/project-state/v1/sheikha-project-state-latest.json",
            json_text,
            0o644,
        )
        atomic_write(
            repo_root / "docs/project/SHEIKHA-PROJECT-CONTINUATION.md",
            md_text,
            0o644,
        )

    print("SHEIKHA_PROJECT_STATE_RECORDED=true")
    print(f"SHEIKHA_PROJECT_STATE_JSON={latest_json}")
    print(f"SHEIKHA_PROJECT_STATE_MD={latest_md}")
    print(f"SHEIKHA_CONTINUATION_MARKER={state['continuationMarker']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
