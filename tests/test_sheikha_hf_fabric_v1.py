import importlib.util
import json
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("hf_fabric", ROOT / "tools/training/sheikha_hf_fabric_v1.py")
fabric = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(fabric)


class HfFabricTests(unittest.TestCase):
    def test_inventory_does_not_inspect_credentials_or_connect(self):
        with patch.object(fabric.request, "build_opener", side_effect=AssertionError("network")):
            result = fabric.inventory()
        self.assertFalse(result["networkUsed"])
        self.assertFalse(result["credentialsInspected"])
        self.assertFalse(result["commercialProductionApproved"])
        self.assertEqual(len(result["capabilities"]), 14)
        self.assertIn("huggingface_hub", result["packages"])

    def test_costs_include_support_contingency_and_margin_not_markup(self):
        result = fabric.feasibility({"channel": "hf-private-job", "dataClass": "public", "hardware": "a100-large",
                                     "hours": 10, "storageGb": 100, "supportUsd": 30, "setupUsd": 10,
                                     "fixedMonthlyUsd": 300, "expectedMonthlyJobs": 10})
        self.assertEqual(result["computeUsd"], "25.00")
        self.assertEqual(result["privateStorageUsd"], "1.80")
        self.assertEqual(result["directCostUsd"], "66.80")
        self.assertEqual(result["costWithContingencyUsd"], "80.16")
        self.assertEqual(result["suggestedPriceBeforeTaxUsd"], "133.60")
        self.assertEqual(result["breakEvenJobsPerMonth"], 6)
        self.assertEqual(result["projectedMonthlyOperatingBalanceUsd"], "234.40")
        self.assertFalse(result["executionAuthorized"])
        self.assertFalse(result["salesGuaranteed"])

    def test_bad_values_and_unknown_fields_fail_closed(self):
        for value in [-1, float("nan"), float("inf"), True, [], "1e1000", 0]:
            with self.assertRaises(ValueError):
                fabric.feasibility({"hours": value, "localHourlyUsd": 1})
        for spec in [{"hours": 1}, {"hours": 1, "localHourlyUsd": 1, "token": "secret"},
                     {"hours": 1, "localHourlyUsd": 1, "targetMarginPercent": 100},
                     {"hours": 1, "localHourlyUsd": 1, "expectedMonthlyJobs": 1.5}]:
            with self.assertRaises(ValueError):
                fabric.feasibility(spec)

    def test_channel_and_price_must_match(self):
        for spec in [{"channel": "local", "hardware": "a100-large", "hours": 1},
                     {"channel": "hf-shared-inference", "hardware": "a100-large", "hours": 1},
                     {"channel": "client-vpc", "hardware": "a100-large", "hours": 1},
                     {"hours": 1, "localHourlyUsd": 1, "storageGb": 100}]:
            with self.assertRaises(ValueError):
                fabric.feasibility(spec)

    def test_cloud_and_external_rights_still_blocked(self):
        result = fabric.feasibility({"channel": "hf-private-job", "hardware": "l4", "hours": 1,
                                     "baseOrigin": "api-only"})
        self.assertIn("RESTRICTED_DATA_LOCAL_ONLY", result["blockers"])
        self.assertIn("API_ACCESS_DOES_NOT_PROVIDE_EXPORTABLE_BASE_WEIGHTS", result["blockers"])
        self.assertFalse(result["customerWeightsMayBeReused"])
        self.assertFalse(result["commercialReleaseApproved"])
        opened = fabric.feasibility({"hours": 1, "localHourlyUsd": 1, "baseOrigin": "licensed-open-weights"})
        self.assertIn("BASE_AND_DERIVATIVE_LICENSE_REVIEW_NO_AUTOMATIC_OWNERSHIP_TRANSFER", opened["blockers"])

    def test_local_cost_is_explicit_and_non_zero_not_assumed_free(self):
        result = fabric.feasibility({"hours": 2, "localHourlyUsd": "0.25"})
        self.assertEqual(result["computeUsd"], "0.50")
        self.assertIn("HUMAN_RELEASE_APPROVAL_REQUIRED", result["blockers"])

    def test_network_opt_in_and_id_validation_happen_before_requests(self):
        def forbidden(_url):
            self.fail("must not connect")
        with self.assertRaisesRegex(ValueError, "OPT_IN"):
            fabric.public_metadata("org/model", fetch=forbidden)
        for name in ["https://evil.test/x", "org/../model", "org/model?token=a", "org/model#x", "org/model/extra"]:
            with self.assertRaises(ValueError):
                fabric.public_metadata(name, allow_network=True, fetch=forbidden)

    def test_pinned_metadata_is_not_a_license_grant_or_weight_download(self):
        calls = []
        def fetch(url):
            calls.append(url)
            return {"id": "org/model", "private": False, "sha": "a" * 40,
                    "cardData": {"license": "apache-2.0", "privatePrompt": "DO_NOT_COPY"},
                    "pipeline_tag": "text-generation", "tags": ["transformers"]}
        result = fabric.public_metadata("org/model", allow_network=True, fetch=fetch)
        self.assertEqual(calls, ["https://huggingface.co/api/models/org/model",
                                 "https://huggingface.co/api/models/org/model/revision/" + "a" * 40])
        self.assertEqual(result["declaredLicense"], "apache-2.0")
        self.assertNotIn("DO_NOT_COPY", json.dumps(result))
        for key in ["weightsDownloaded", "credentialsSent", "licenseTextReviewed", "commercialReleaseApproved"]:
            self.assertFalse(result[key])

    def test_private_metadata_revision_drift_or_malformed_response_denied(self):
        for response in [{"sha": "main"}, [], {"id": "org/model", "sha": "a" * 40, "private": True},
                         {"id": "other/model", "sha": "a" * 40, "private": False}]:
            with self.assertRaises(ValueError):
                fabric.public_metadata("org/model", allow_network=True, fetch=lambda _url: response)
        values = iter([{"sha": "a" * 40}, {"id": "org/model", "sha": "b" * 40, "private": False}])
        with self.assertRaises(ValueError):
            fabric.public_metadata("org/model", allow_network=True, fetch=lambda _url: next(values))

    def test_redirects_and_non_hf_urls_rejected(self):
        with self.assertRaisesRegex(ValueError, "REDIRECT"):
            fabric.NoRedirect().redirect_request(None, None, 302, None, None, "https://example.com")
        with self.assertRaisesRegex(ValueError, "HF_API_ONLY"):
            fabric.fetch_public_json("https://huggingface.co.evil.test/api/models/a")

    def test_private_reports_are_exclusive_and_not_public(self):
        temporary = Path(tempfile.mkdtemp(prefix="sheikha-hf-policy-test-"))
        old = fabric.private_io.PRIVATE
        fabric.private_io.PRIVATE = temporary
        try:
            destination = temporary / "session"
            destination.mkdir(mode=0o700)
            output = destination / "report.json"
            fabric.write_report(output, {"ok": True})
            self.assertEqual(output.stat().st_mode & 0o777, 0o600)
            with self.assertRaises(FileExistsError):
                fabric.write_report(output, {})
            with self.assertRaises(ValueError):
                fabric.write_report(ROOT / "public/hf-report.json", {})
        finally:
            fabric.private_io.PRIVATE = old
            shutil.rmtree(temporary)


if __name__ == "__main__":
    unittest.main()
