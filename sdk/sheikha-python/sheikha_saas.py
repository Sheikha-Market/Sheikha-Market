"""Dependency-free Sheikha Enterprise SaaS V2 client."""

import json
from urllib import error, parse, request


class SheikhaAPIError(RuntimeError):
    """Raised when the Sheikha API rejects a request."""

    def __init__(self, message, code="SHEIKHA_API_ERROR", status_code=None):
        super().__init__(message)
        self.code = code
        self.status_code = status_code


class SheikhaSaaSClient:
    def __init__(
        self,
        base_url="http://localhost:8080",
        api_key=None,
        actor_id=None,
        role=None,
        tenant_id=None,
        human_approved=False,
        timeout=15,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.actor_id = actor_id
        self.role = role
        self.tenant_id = tenant_id
        self.human_approved = human_approved
        self.timeout = timeout

    def _headers(self):
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Sheikha {self.api_key}"
        if self.actor_id:
            headers["x-sheikha-actor-id"] = self.actor_id
        if self.role:
            headers["x-sheikha-role"] = self.role
        if self.tenant_id:
            headers["x-sheikha-tenant-id"] = self.tenant_id
        if self.human_approved:
            headers["x-sheikha-human-approved"] = "true"
        return headers

    def _request(self, path, method="GET", payload=None):
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        req = request.Request(
            f"{self.base_url}{path}", data=body, method=method, headers=self._headers()
        )
        try:
            with request.urlopen(req, timeout=self.timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            result = json.loads(exc.read().decode("utf-8"))
            raise SheikhaAPIError(
                result.get("message", str(exc)), result.get("error"), exc.code
            ) from exc
        if result.get("success") is False:
            raise SheikhaAPIError(result.get("message", "Request rejected"), result.get("error"))
        return result

    def status(self):
        return self._request("/api/saas/v2/status")

    def tenant_snapshot(self):
        return self._request("/api/tenancy/snapshot")

    def create_organization(self, payload):
        return self._request("/api/tenancy/organizations", "POST", payload)

    def create_workspace(self, payload):
        return self._request("/api/tenancy/workspaces", "POST", payload)

    def create_subscription(self, payload):
        return self._request("/api/subscriptions", "POST", payload)

    def record_usage(self, metric, quantity, idempotency_key=None):
        payload = {"metric": metric, "quantity": quantity}
        if idempotency_key:
            payload["idempotencyKey"] = idempotency_key
        return self._request("/api/subscriptions/usage", "POST", payload)

    def billing_preview(self):
        return self._request("/api/subscriptions/billing-preview")

    def audit(self, limit=100):
        return self._request(f"/api/saas/v2/audit?limit={parse.quote(str(limit))}")
