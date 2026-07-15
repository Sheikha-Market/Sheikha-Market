"use strict";

const crypto = require("node:crypto");

const OWNERSHIP_CLASSES = Object.freeze([
  "OWNED",
  "LICENSED",
  "INTEGRATED",
  "FEDERATED",
  "AUTHORIZED",
  "THIRD_PARTY_UNVERIFIED"
]);

const ASSET_STATES = Object.freeze([
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "RETIRED",
  "REVOKED"
]);

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])])
    );
  }

  return value;
}

function digest(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${field} must be a non-empty string`);
  }

  return value.trim();
}

class SheikhaOwnedAssetRegistry {
  constructor({
    ownerId,
    ownerLegalNameAr,
    ownerLegalNameEn,
    systemNameAr,
    systemNameEn
  }) {
    this.identity = Object.freeze({
      ownerId: requireString(ownerId, "ownerId"),
      ownerLegalNameAr: requireString(
        ownerLegalNameAr,
        "ownerLegalNameAr"
      ),
      ownerLegalNameEn: requireString(
        ownerLegalNameEn,
        "ownerLegalNameEn"
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

    this.assets = new Map();
  }

  registerAsset(input) {
    if (!input || typeof input !== "object") {
      throw new TypeError("asset input must be an object");
    }

    const id = requireString(input.id, "id");
    const name = requireString(input.name, "name");
    const ownershipClass = requireString(
      input.ownershipClass,
      "ownershipClass"
    );
    const state = input.state || "ACTIVE";

    if (!OWNERSHIP_CLASSES.includes(ownershipClass)) {
      throw new RangeError(
        `unsupported ownershipClass: ${ownershipClass}`
      );
    }

    if (!ASSET_STATES.includes(state)) {
      throw new RangeError(`unsupported asset state: ${state}`);
    }

    if (this.assets.has(id)) {
      throw new Error(`asset already registered: ${id}`);
    }

    const evidence = Array.isArray(input.evidence)
      ? input.evidence.filter(Boolean)
      : [];

    if (ownershipClass === "OWNED") {
      if (input.ownerId !== this.identity.ownerId) {
        throw new Error(
          "OWNED assets must use the registered Sheikha ownerId"
        );
      }

      if (evidence.length === 0) {
        throw new Error(
          "OWNED assets require explicit provenance evidence"
        );
      }
    }

    if (
      ownershipClass !== "OWNED" &&
      input.ownerId === this.identity.ownerId &&
      input.thirdPartyOwner
    ) {
      throw new Error(
        "third-party assets cannot be represented as Sheikha-owned"
      );
    }

    const record = {
      schemaVersion: "1.0.0",
      id,
      name,
      description: input.description || "",
      ownerId: input.ownerId || null,
      ownerLegalName:
        ownershipClass === "OWNED"
          ? {
              ar: this.identity.ownerLegalNameAr,
              en: this.identity.ownerLegalNameEn
            }
          : null,
      systemIdentity: {
        ar: this.identity.systemNameAr,
        en: this.identity.systemNameEn
      },
      ownershipClass,
      state,
      assetType: input.assetType || "SOFTWARE_COMPONENT",
      rightsBasis: input.rightsBasis || null,
      thirdPartyOwner: input.thirdPartyOwner || null,
      upstreamLicense: input.upstreamLicense || null,
      sublicensingAuthorized:
        input.sublicensingAuthorized === true,
      evidence,
      capabilities: Array.isArray(input.capabilities)
        ? [...new Set(input.capabilities)]
        : [],
      restrictions: Array.isArray(input.restrictions)
        ? [...new Set(input.restrictions)]
        : [],
      createdAt:
        input.createdAt || new Date().toISOString(),
      updatedAt:
        input.updatedAt || new Date().toISOString()
    };

    const signedRecord = Object.freeze({
      ...record,
      integrity: {
        algorithm: "SHA-256",
        digest: digest(record)
      }
    });

    this.assets.set(id, signedRecord);
    return signedRecord;
  }

  getAsset(id) {
    return this.assets.get(id) || null;
  }

  listAssets() {
    return [...this.assets.values()];
  }

  verifyAsset(id) {
    const asset = this.getAsset(id);

    if (!asset) {
      return false;
    }

    const { integrity, ...unsigned } = asset;

    return (
      integrity.algorithm === "SHA-256" &&
      integrity.digest === digest(unsigned)
    );
  }

  summary() {
    const assets = this.listAssets();
    const byOwnershipClass = {};

    for (const asset of assets) {
      byOwnershipClass[asset.ownershipClass] =
        (byOwnershipClass[asset.ownershipClass] || 0) + 1;
    }

    return {
      owner: this.identity,
      totalAssets: assets.length,
      byOwnershipClass,
      allIntegrityChecksPassed: assets.every((asset) =>
        this.verifyAsset(asset.id)
      )
    };
  }
}

module.exports = {
  ASSET_STATES,
  OWNERSHIP_CLASSES,
  SheikhaOwnedAssetRegistry,
  canonicalize,
  digest
};
