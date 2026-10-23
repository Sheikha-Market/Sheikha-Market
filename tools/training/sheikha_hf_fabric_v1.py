#!/usr/bin/env python3
"""Sheikha local HF inventory, feasibility planner, and opt-in public metadata reader.

No login, downloads of weights/data, uploads, cloud execution, or billing actions.
"""

import argparse
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_CEILING, ROUND_HALF_UP
import importlib.metadata
import importlib.util
import json
import os
from pathlib import Path
import re
import sys
from urllib import request, error, parse

SPEC = importlib.util.spec_from_file_location(
    "sheikha_hf_private_io", Path(__file__).with_name("train-sheikha-foundation-scratch-v1.py"))
private_io = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(private_io)
PACKAGES = ("huggingface_hub", "transformers", "tokenizers", "datasets", "accelerate",
            "peft", "trl", "safetensors", "evaluate", "optimum", "diffusers", "gradio")
PRICING_SOURCE = "https://huggingface.co/docs/hub/en/jobs-pricing"
PRICE_DATE = "2026-09-14"
JOB_PRICES = {"cpu-basic": "0.01", "t4-small": "0.40", "l4": "0.80", "l40s": "1.80",
              "a100-large": "2.50", "h200": "5.00", "rtx-pro-6000": "2.75"}
CAPABILITIES = (
    ("Sheikha Model Registry", "LOCAL_EXPORT_IMPLEMENTED", "Models, model cards, Safetensors, revision hashes"),
    ("Sheikha Data Registry", "LOCAL_SYNTHETIC_EXPORT_IMPLEMENTED", "Dataset splits, JSONL, cards, provenance"),
    ("Sheikha Model Discovery", "OPT_IN_PUBLIC_METADATA_IMPLEMENTED", "Public model and dataset metadata; no weight downloads"),
    ("Sheikha Cost Planner", "OFFLINE_ESTIMATOR_IMPLEMENTED", "Jobs snapshots, storage, support, margin, break-even"),
    ("Sheikha Training", "LOCAL_SMALL_SCRATCH_TRAINER_EXISTS", "Transformers; PEFT, TRL and Accelerate require workload validation"),
    ("Sheikha Evaluation", "LOCAL_PARITY_TESTS_IMPLEMENTED", "Real task benchmarks and release approval remain required"),
    ("Sheikha Private Hub", "NOT_ACTIVATED", "Private repositories, organizations, gating, access tokens"),
    ("Sheikha Cloud Training", "NOT_ACTIVATED", "HF Jobs, scheduling, cancellation, secrets, credit budget"),
    ("Sheikha Inference Gateway", "NOT_ACTIVATED", "Inference Providers and dedicated Endpoints"),
    ("Sheikha Demonstrations", "NOT_ACTIVATED", "Spaces, Gradio, Docker, Static, ZeroGPU"),
    ("Sheikha Weight Storage", "NOT_ACTIVATED", "Private Hub, Xet, Buckets, access/retention/export contracts"),
    ("Sheikha Agent Integration", "NOT_ACTIVATED", "MCP and agents with per-tool authorization; no automatic data egress"),
    ("Sheikha Organization Governance", "NOT_ACTIVATED", "SSO, resource groups, regions, audit logs, service accounts"),
    ("Sheikha Community Publishing", "DISABLED_CONFIDENTIALITY", "Collections, discussions, public cards, papers and leaderboards"),
)


def now():
    return datetime.now(timezone.utc).isoformat()


def inventory():
    installed = {}
    for name in PACKAGES:
        try:
            installed[name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            installed[name] = None
    return {"system": "SHEIKHA_HF_FABRIC_V1", "checkedAt": now(), "packages": installed,
            "capabilities": [{"name": n, "status": s, "scope": d} for n, s, d in CAPABILITIES],
            "installationIsNotWorkloadCertification": True,
            "credentialsInspected": False, "networkUsed": False, "externalSpendAuthorizedUsd": 0,
            "commercialProductionApproved": False, "thirdPartyLicensesRetained": True}


def number(value, name, *, maximum="1000000000"):
    if isinstance(value, bool) or not isinstance(value, (str, int, float, Decimal)):
        raise ValueError(f"INVALID_{name}")
    try:
        result = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError(f"INVALID_{name}") from exc
    if not result.is_finite() or result < 0 or result > Decimal(maximum):
        raise ValueError(f"INVALID_{name}")
    return result


def usd(value):
    return str(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def feasibility(spec):
    fields = {"channel", "dataClass", "hardware", "hours", "localHourlyUsd", "storageGb",
              "storageMonths", "supportUsd", "setupUsd", "contingencyPercent", "targetMarginPercent",
              "expectedMonthlyJobs", "fixedMonthlyUsd", "baseOrigin", "service"}
    if not isinstance(spec, dict) or set(spec) - fields:
        raise ValueError("UNKNOWN_FIELDS_OR_INVALID_PLAN")
    channel = spec.get("channel", "local")
    data_class = spec.get("dataClass", "restricted")
    hardware = spec.get("hardware", "local")
    origin = spec.get("baseOrigin", "sheikha-scratch")
    service = spec.get("service", "training")
    if (channel not in {"local", "client-vpc", "hf-private-job", "hf-shared-inference"}
            or data_class not in {"public", "confidential", "restricted"}
            or origin not in {"sheikha-scratch", "licensed-open-weights", "api-only"}
            or service not in {"training", "inference"}
            or hardware not in {*JOB_PRICES, "local"}):
        raise ValueError("UNSUPPORTED_PLAN_CHOICE")
    # HF job prices cannot stand in for VPC or per-token inference-provider quotes.
    if channel in {"client-vpc", "hf-shared-inference"}:
        raise ValueError("PROVIDER_SPECIFIC_QUOTE_REQUIRED_NOT_A_JOB_PRICE")
    if (channel == "local") != (hardware == "local"):
        raise ValueError("HARDWARE_CHANNEL_MISMATCH")
    if channel != "local" and "localHourlyUsd" in spec:
        raise ValueError("LOCAL_RATE_NOT_APPLICABLE")
    hours = number(spec.get("hours", 0), "HOURS", maximum="10000")
    if hours <= 0:
        raise ValueError("POSITIVE_WORKLOAD_HOURS_REQUIRED")
    if hardware == "local" and "localHourlyUsd" not in spec:
        raise ValueError("LOCAL_ELECTRICITY_AND_DEPRECIATION_RATE_REQUIRED")
    hourly = number(spec.get("localHourlyUsd") if hardware == "local" else JOB_PRICES[hardware], "RATE")
    storage = number(spec.get("storageGb", 0), "STORAGE_GB")
    months = number(spec.get("storageMonths", 1), "MONTHS", maximum="120")
    support = number(spec.get("supportUsd", 0), "SUPPORT")
    setup = number(spec.get("setupUsd", 0), "SETUP")
    contingency = number(spec.get("contingencyPercent", 20), "CONTINGENCY", maximum="100") / 100
    margin = number(spec.get("targetMarginPercent", 40), "MARGIN", maximum="99") / 100
    jobs = number(spec.get("expectedMonthlyJobs", 0), "JOBS")
    if jobs != jobs.to_integral_value():
        raise ValueError("INTEGER_JOB_COUNT_REQUIRED")
    fixed = number(spec.get("fixedMonthlyUsd", 0), "FIXED_COST")
    if hardware == "local" and storage:
        raise ValueError("LOCAL_STORAGE_COST_REQUIRES_SEPARATE_QUOTE")
    minutes = (hours * 60).to_integral_value(rounding=ROUND_CEILING)
    compute = minutes / 60 * hourly
    # Un-discounted private storage planning assumption, not a billing quote.
    storage_cost = storage / 1000 * Decimal("18") * months
    base_cost = compute + storage_cost + support + setup
    cost = base_cost * (1 + contingency)
    price = (cost / (1 - margin)).quantize(Decimal("0.01"), rounding=ROUND_CEILING)
    contribution = price - cost
    break_even = int((fixed / contribution).to_integral_value(rounding=ROUND_CEILING)) if contribution else None
    blockers = ["WORKLOAD_QUALITY_AND_SECURITY_EVIDENCE_REQUIRED", "PARTIES_RIGHTS_PRICE_DELIVERY_AND_SLA_REVIEW_REQUIRED",
                "HUMAN_RELEASE_APPROVAL_REQUIRED"]
    if channel != "local":
        blockers += ["SCOPED_ACCOUNT_AND_CREDENTIAL_REQUIRED", "WRITTEN_DATA_EGRESS_CONSENT_REQUIRED",
                     "PROVIDER_TERMS_REGION_AND_RETENTION_REVIEW_REQUIRED", "SPEND_CAP_APPROVAL_REQUIRED"]
    if data_class == "restricted" and channel != "local":
        blockers.append("RESTRICTED_DATA_LOCAL_ONLY")
    if origin == "licensed-open-weights":
        blockers.append("BASE_AND_DERIVATIVE_LICENSE_REVIEW_NO_AUTOMATIC_OWNERSHIP_TRANSFER")
    if origin == "api-only" and service == "training":
        blockers.append("API_ACCESS_DOES_NOT_PROVIDE_EXPORTABLE_BASE_WEIGHTS")
    return {"system": "SHEIKHA_HF_FEASIBILITY_V1", "evaluatedAt": now(), "assumptions": spec,
            "pricingDate": PRICE_DATE, "pricingSources": [PRICING_SOURCE, "https://huggingface.co/pricing"],
            "currency": "USD", "billingMinutesAssumed": int(minutes), "hourlyUsd": str(hourly),
            "computeUsd": usd(compute), "privateStorageUsd": usd(storage_cost), "directCostUsd": usd(base_cost),
            "costWithContingencyUsd": usd(cost), "suggestedPriceBeforeTaxUsd": str(price),
            "contributionPerJobUsd": usd(contribution), "breakEvenJobsPerMonth": break_even,
            "projectedMonthlyOperatingBalanceUsd": usd(contribution * jobs - fixed),
            "excluded": ["tax", "network-egress", "payment-fees", "unquoted-licenses", "unquoted-regional-charges"],
            "actualQualityOrThroughputMeasured": False, "salesGuaranteed": False,
            "snapshotRefreshRequiredBeforePurchase": True, "priceIsNotBindingQuote": True,
            "executionAuthorized": False, "customerWeightsMayBeReused": False,
            "commercialReleaseApproved": False, "blockers": blockers}


class NoRedirect(request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("PUBLIC_METADATA_REDIRECT_DENIED")


def fetch_public_json(url):
    if not url.startswith("https://huggingface.co/api/"):
        raise ValueError("PUBLIC_HF_API_ONLY")
    # No cached HF token, cookies, user-agent secrets, environment proxy credentials or redirects.
    opener = request.build_opener(request.ProxyHandler({}), NoRedirect())
    req = request.Request(url, headers={"Accept": "application/json", "User-Agent": "Sheikha-Public-Metadata/1.0"}, method="GET")
    try:
        with opener.open(req, timeout=20) as response:
            if response.status != 200 or "application/json" not in response.headers.get("Content-Type", ""):
                raise ValueError("PUBLIC_METADATA_RESPONSE_INVALID")
            body = response.read(2 * 1024 * 1024 + 1)
    except (error.URLError, TimeoutError) as exc:
        raise ValueError("PUBLIC_METADATA_UNAVAILABLE_NO_AUTH_RETRY") from exc
    if len(body) > 2 * 1024 * 1024:
        raise ValueError("PUBLIC_METADATA_TOO_LARGE")
    return json.loads(body)


def public_metadata(repo_id, kind="model", *, allow_network=False, fetch=None):
    if not allow_network:
        raise ValueError("EXPLICIT_PUBLIC_METADATA_NETWORK_OPT_IN_REQUIRED")
    if (kind not in {"model", "dataset"} or not isinstance(repo_id, str) or len(repo_id) > 160
            or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*/[A-Za-z0-9][A-Za-z0-9_.-]*", repo_id)
            or ".." in repo_id or "--" in repo_id):
        raise ValueError("PUBLIC_REPO_ID_INVALID")
    fetch = fetch or fetch_public_json
    endpoint = f"https://huggingface.co/api/{kind}s/{parse.quote(repo_id, safe='/')}"
    head = fetch(endpoint)
    sha = head.get("sha") if isinstance(head, dict) else None
    if not isinstance(sha, str) or not re.fullmatch(r"[a-f0-9]{40}", sha):
        raise ValueError("IMMUTABLE_REVISION_MISSING")
    pinned = fetch(f"{endpoint}/revision/{sha}")
    identity = pinned.get("id") if isinstance(pinned, dict) else None
    if (not isinstance(identity, str) or identity.lower() != repo_id.lower()
            or pinned.get("sha") != sha or pinned.get("private") is not False):
        raise ValueError("PINNED_PUBLIC_IDENTITY_MISMATCH")
    card = pinned.get("cardData") or {}
    tags = pinned.get("tags") or []
    card = card if isinstance(card, dict) else {}
    tags = tags if isinstance(tags, list) else []
    declared_license = card.get("license")
    if not isinstance(declared_license, str):
        declared_license = None
    pipeline = pinned.get("pipeline_tag")
    pipeline = pipeline[:100] if isinstance(pipeline, str) else None
    return {"system": "SHEIKHA_HF_PUBLIC_METADATA_V1", "checkedAt": now(), "kind": kind,
            "repoId": repo_id, "revision": sha, "source": f"{endpoint}/revision/{sha}",
            "declaredLicense": declared_license[:160] if declared_license else None,
            "declaredPipeline": pipeline,
            "declaredTags": [t[:100] for t in tags[:40] if isinstance(t, str)],
            "metadataTrustedForExecution": False, "licenseTextReviewed": False,
            "weightsDownloaded": False, "datasetDownloaded": False, "credentialsSent": False,
            "customerDataSent": False, "commercialReleaseApproved": False,
            "publicRepoNameDisclosedToHf": True, "automaticTrainingUseAuthorized": False}


def write_report(destination, report):
    path = Path(os.path.abspath(destination))
    private_io.private_path(path.parent, existing=True)
    private_io.write_new(path, private_io.json_bytes(report))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    inv = sub.add_parser("inventory")
    inv.add_argument("--out", required=True)
    plan = sub.add_parser("plan")
    plan.add_argument("--input", required=True)
    plan.add_argument("--out", required=True)
    metadata = sub.add_parser("public-metadata")
    metadata.add_argument("--repo", required=True)
    metadata.add_argument("--kind", choices=["model", "dataset"], default="model")
    metadata.add_argument("--allow-public-network", action="store_true")
    metadata.add_argument("--out", required=True)
    args = parser.parse_args()
    try:
        private_io.private_path(Path(os.path.abspath(args.out)).parent, existing=True)
        if Path(args.out).exists():
            raise ValueError("OUTPUT_ALREADY_EXISTS")
        if args.command == "inventory":
            report = inventory()
        elif args.command == "plan":
            source = Path(os.path.abspath(args.input))
            private_io.private_path(source.parent, existing=True)
            report = feasibility(json.loads(private_io.read_private(source)))
        else:
            report = public_metadata(args.repo, args.kind, allow_network=args.allow_public_network)
        write_report(args.out, report)
        print(json.dumps({"status": "PRIVATE_REPORT_WRITTEN", "command": args.command,
                          "reportSha256": private_io.digest(private_io.json_bytes(report)),
                          "commercialProductionApproved": False}))
        return 0
    except (ValueError, OSError, TypeError) as exc:
        print(json.dumps({"status": "FAILED_NOT_ACTIVATED", "errorType": type(exc).__name__,
                          "reason": str(exc) if isinstance(exc, ValueError) and re.fullmatch(r"[A-Z_]+", str(exc)) else "CHECK_LOCAL_INPUT_OR_CONNECTIVITY"}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
