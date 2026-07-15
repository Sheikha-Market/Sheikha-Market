"use strict";

const crypto = require("node:crypto");

const INTEGRATION_SCOPES = Object.freeze([
  "LOCAL",
  "NATIONAL",
  "REGIONAL",
  "INTERNATIONAL",
  "GLOBAL",
  "UNIVERSAL_TECHNICAL_INTEROPERABILITY"
]);

const INTEGRATION_STATES = Object.freeze([
  "REGISTERED",
  "INTEGRATED",
  "FEDERATED",
  "LICENSED",
  "AUTHORIZED",
  "SUSPENDED",
  "REVOKED"
]);

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }

  return value.trim();
}

function digest(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

class SheikhaIntegrationAuthority {
  constructor({
    authorityId,
    authorityNameAr,
    authorityNameEn
  }) {
    this.identity = Object.freeze({
      authorityId: requireString(
        authorityId,
        "authorityId"
      ),
      authorityNameAr: requireString(
        authorityNameAr,
        "authorityNameAr"
      ),
      authorityNameEn: requireString(
        authorityNameEn,
        "authorityNameEn"
      )
    });

    this.integrations = new Map();
  }

  registerIntegration(input) {
    if (!input || typeof input !== "object") {
      throw new TypeError(
        "integration input must be an object"
      );
    }

    const id = requireString(input.id, "id");
    const target = requireString(input.target, "target");
    const scope = requireString(input.scope, "scope");

    if (!INTEGRATION_SCOPES.includes(scope)) {
      throw new RangeError(
        `unsupported integration scope: ${scope}`
      );
    }

    if (this.integrations.has(id)) {
      throw new Error(
        `integration already registered: ${id}`
      );
    }

    const states = Array.isArray(input.states)
      ? [...new Set(input.states)]
      : ["REGISTERED"];

    for (const state of states) {
      if (!INTEGRATION_STATES.includes(state)) {
        throw new RangeError(
          `unsupported integration state: ${state}`
        );
      }
    }

    if (
      states.includes("AUTHORIZED") &&
      !input.authorizationEvidence
    ) {
      throw new Error(
        "AUTHORIZED integration requires authorizationEvidence"
      );
    }

    if (
      states.includes("LICENSED") &&
      !input.licenseReference
    ) {
      throw new Error(
        "LICENSED integration requires licenseReference"
      );
    }

    const record = {
      schemaVersion: "1.0.0",
      id,
      target,
      targetOwner: input.targetOwner || null,
      scope,
      states,
      adapter: input.adapter || null,
      contractReference:
        input.contractReference || null,
      licenseReference:
        input.licenseReference || null,
      authorizationEvidence:
        input.authorizationEvidence || null,
      dataBoundaries:
        Array.isArray(input.dataBoundaries)
          ? [...new Set(input.dataBoundaries)]
          : [],
      allowedCapabilities:
        Array.isArray(input.allowedCapabilities)
          ? [...new Set(input.allowedCapabilities)]
          : [],
      deniedCapabilities:
        Array.isArray(input.deniedCapabilities)
          ? [...new Set(input.deniedCapabilities)]
          : [],
      leastPrivilege: input.leastPrivilege !== false,
      upstreamRightsPreserved:
        input.upstreamRightsPreserved !== false,
      noOwnershipTransfer:
        input.noOwnershipTransfer !== false,
      noSovereigntyClaim:
        input.noSovereigntyClaim !== false,
      registeredAt: new Date().toISOString()
    };

    const signed = Object.freeze({
      ...record,
      authority: this.identity,
      integrity: {
        algorithm: "SHA-256",
        digest: digest(record)
      }
    });

    this.integrations.set(id, signed);
    return signed;
  }

  listIntegrations() {
    return [...this.integrations.values()];
  }

  summary() {
    const integrations = this.listIntegrations();
    const byScope = {};

    for (const integration of integrations) {
      byScope[integration.scope] =
        (byScope[integration.scope] || 0) + 1;
    }

    return {
      authority: this.identity,
      totalIntegrations: integrations.length,
      byScope,
      upstreamRightsPreserved:
        integrations.every(
          (item) => item.upstreamRightsPreserved
        )
    };
  }
}

module.exports = {
  INTEGRATION_SCOPES,
  INTEGRATION_STATES,
  SheikhaIntegrationAuthority
};
