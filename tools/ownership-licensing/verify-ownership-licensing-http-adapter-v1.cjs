#!/usr/bin/env node
"use strict";

const http = require("node:http");
const express = require("express");

const {
  DEFAULT_BASE_PATH,
  createVerificationResult,
  registerSheikhaOwnershipLicensingHttpAdapter
} = require(
  "../../runtime/ownership-licensing/" +
  "sheikha-ownership-licensing-http-adapter.cjs"
);

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);

    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address());
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function getJson(baseUrl, path, options = {}) {
  const response = await fetch(
    baseUrl + path,
    options
  );

  const body = await response.json();

  return {
    status: response.status,
    headers: {
      contract:
        response.headers.get(
          "x-sheikha-contract"
        ),
      cacheControl:
        response.headers.get(
          "cache-control"
        )
    },
    body
  };
}

async function main() {
  const app = express();

  const registration =
    registerSheikhaOwnershipLicensingHttpAdapter(
      app,
      {
        express
      }
    );

  const server = http.createServer(app);
  const address = await listen(server);

  const baseUrl =
    `http://127.0.0.1:${address.port}`;

  try {
    const status = await getJson(
      baseUrl,
      `${DEFAULT_BASE_PATH}/status`
    );

    const assets = await getJson(
      baseUrl,
      `${DEFAULT_BASE_PATH}/assets`
    );

    const licenses = await getJson(
      baseUrl,
      `${DEFAULT_BASE_PATH}/licenses`
    );

    const integrations = await getJson(
      baseUrl,
      `${DEFAULT_BASE_PATH}/integrations`
    );

    const verification = await getJson(
      baseUrl,
      `${DEFAULT_BASE_PATH}/verify`
    );

    const postDenied = await getJson(
      baseUrl,
      `${DEFAULT_BASE_PATH}/assets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: "{}"
      }
    );

    const internalVerification =
      createVerificationResult();

    const checks = {
      registrationActive:
        registration.registered === true,

      registrationReadOnly:
        registration
          .mutationCapabilitiesExposed ===
        false,

      status200:
        status.status === 200,

      statusAdapterActive:
        status.body.httpAdapter.state ===
        "ACTIVE",

      statusNoProductionClaim:
        status.body.httpAdapter
          .productionWiringClaimed === false,

      assets200:
        assets.status === 200,

      sixOwnedAssets:
        assets.body.count >= 6,

      licenses200:
        licenses.status === 200,

      activeLicensePresent:
        licenses.body.items.some(
          (license) =>
            license.state === "ACTIVE"
        ),

      integrations200:
        integrations.status === 200,

      authorizedIntegrationPresent:
        integrations.body.items.some(
          (integration) =>
            integration.states.includes(
              "AUTHORIZED"
            )
        ),

      verification200:
        verification.status === 200,

      verificationPassed:
        verification.body.passed === true,

      internalVerificationPassed:
        internalVerification.passed === true,

      postMutationDenied:
        postDenied.status === 404,

      contractHeaderPresent:
        status.headers.contract ===
        "SHEIKHA_OWNERSHIP_LICENSING_HTTP_ADAPTER_V1",

      noStoreHeaderPresent:
        typeof status.headers.cacheControl ===
          "string" &&
        status.headers.cacheControl.includes(
          "no-store"
        ),

      noRemoteMutation:
        registration
          .remoteMutationPerformed === false,

      cleanupDenied:
        registration.cleanupAuthorized ===
        false,

      retentionSafe:
        registration.retentionMode ===
        "DENY_BY_DEFAULT"
    };

    const result = {
      schemaVersion: "1.0.0",
      system:
        "SHEIKHA_VERIFY_OWNERSHIP_LICENSING_HTTP_ADAPTER_V1",
      checks,
      passed: Object.values(checks).every(Boolean),
      registration
    };

    process.stdout.write(
      JSON.stringify(result, null, 2) + "\n"
    );

    process.exitCode = result.passed ? 0 : 1;
  } finally {
    await close(server);
  }
}

main().catch((error) => {
  process.stderr.write(
    String(error && error.stack
      ? error.stack
      : error) + "\n"
  );

  process.exitCode = 1;
});
