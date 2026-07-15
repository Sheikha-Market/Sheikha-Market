"use strict";

const crypto = require("node:crypto");

const LICENSE_TYPES = Object.freeze([
  "PROPRIETARY_INTERNAL",
  "COMMERCIAL",
  "EVALUATION",
  "SDK",
  "INTEGRATION",
  "FEDERATION",
  "DATA_USE",
  "MODEL_USE",
  "OEM"
]);

const LICENSE_STATES = Object.freeze([
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
  "EXPIRED"
]);

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }

  return value.trim();
}

function hashLicense(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

class SheikhaLicenseAuthority {
  constructor({
    licensorId,
    licensorLegalNameAr,
    licensorLegalNameEn,
    systemNameAr,
    systemNameEn
  }) {
    this.identity = Object.freeze({
      licensorId: requireString(licensorId, "licensorId"),
      licensorLegalNameAr: requireString(
        licensorLegalNameAr,
        "licensorLegalNameAr"
      ),
      licensorLegalNameEn: requireString(
        licensorLegalNameEn,
        "licensorLegalNameEn"
      ),
      systemNameAr: requireString(
        systemNameAr,
        "systemNameAr"
      ),
      systemNameEn: requireString(
        systemNameEn,
        "systemNameEn"
      )
    });

    this.licenses = new Map();
  }

  issueLicense(input) {
    if (!input || typeof input !== "object") {
      throw new TypeError("license input must be an object");
    }

    const id = requireString(input.id, "id");
    const licensee = requireString(
      input.licensee,
      "licensee"
    );
    const licenseType = requireString(
      input.licenseType,
      "licenseType"
    );

    if (!LICENSE_TYPES.includes(licenseType)) {
      throw new RangeError(
        `unsupported licenseType: ${licenseType}`
      );
    }

    if (this.licenses.has(id)) {
      throw new Error(`license already issued: ${id}`);
    }

    const assetIds = Array.isArray(input.assetIds)
      ? input.assetIds.filter(Boolean)
      : [];

    const grants = Array.isArray(input.grants)
      ? input.grants.filter(Boolean)
      : [];

    const restrictions = Array.isArray(input.restrictions)
      ? input.restrictions.filter(Boolean)
      : [];

    if (assetIds.length === 0) {
      throw new Error("license requires at least one assetId");
    }

    if (grants.length === 0) {
      throw new Error("license requires explicit grants");
    }

    const state = input.state || "DRAFT";

    if (!LICENSE_STATES.includes(state)) {
      throw new RangeError(
        `unsupported license state: ${state}`
      );
    }

    const record = {
      schemaVersion: "1.0.0",
      id,
      licensor: {
        id: this.identity.licensorId,
        legalNameAr: this.identity.licensorLegalNameAr,
        legalNameEn: this.identity.licensorLegalNameEn,
        systemNameAr: this.identity.systemNameAr,
        systemNameEn: this.identity.systemNameEn
      },
      licensee,
      licenseType,
      state,
      assetIds: [...new Set(assetIds)],
      grants: [...new Set(grants)],
      restrictions: [...new Set(restrictions)],
      territory: input.territory || "CONTRACT_DEFINED",
      validFrom:
        input.validFrom || new Date().toISOString(),
      validUntil: input.validUntil || null,
      revocable: input.revocable !== false,
      sublicensingAllowed:
        input.sublicensingAllowed === true,
      consideration: input.consideration || {
        type: "CONTRACT_DEFINED"
      },
      complianceRequirements:
        Array.isArray(input.complianceRequirements)
          ? [...new Set(input.complianceRequirements)]
          : [],
      evidence:
        Array.isArray(input.evidence)
          ? input.evidence.filter(Boolean)
          : [],
      legalRegistrationClaimed: false,
      requiresCounterpartyAcceptance:
        input.requiresCounterpartyAcceptance !== false,
      requiresLegalReview:
        input.requiresLegalReview !== false,
      issuedAt: new Date().toISOString()
    };

    const signed = Object.freeze({
      ...record,
      integrity: {
        algorithm: "SHA-256",
        digest: hashLicense(record)
      }
    });

    this.licenses.set(id, signed);
    return signed;
  }

  listLicenses() {
    return [...this.licenses.values()];
  }

  getLicense(id) {
    return this.licenses.get(id) || null;
  }

  activateLicense(id, evidence) {
    const current = this.getLicense(id);

    if (!current) {
      throw new Error(`unknown license: ${id}`);
    }

    if (!evidence) {
      throw new Error(
        "activation requires acceptance or authorization evidence"
      );
    }

    const { integrity, ...unsigned } = current;
    const activated = {
      ...unsigned,
      state: "ACTIVE",
      activationEvidence: evidence,
      activatedAt: new Date().toISOString()
    };

    const signed = Object.freeze({
      ...activated,
      integrity: {
        algorithm: "SHA-256",
        digest: hashLicense(activated)
      }
    });

    this.licenses.set(id, signed);
    return signed;
  }

  summary() {
    const licenses = this.listLicenses();
    const byState = {};

    for (const license of licenses) {
      byState[license.state] =
        (byState[license.state] || 0) + 1;
    }

    return {
      licensor: this.identity,
      totalLicenses: licenses.length,
      byState
    };
  }
}

module.exports = {
  LICENSE_STATES,
  LICENSE_TYPES,
  SheikhaLicenseAuthority
};
