#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const express = require("express");

const ROOT = path.resolve(
  __dirname,
  "../.."
);

const routesIndex = require(
  path.join(ROOT, "routes", "index.js")
);

const BASE_PATH =
  "/api/sheikha/ownership-licensing/v1";

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

function mountRoutes(app) {
  if (
    typeof routesIndex === "function" &&
    typeof routesIndex.use === "function"
  ) {
    app.use(routesIndex);
    return "EXPRESS_ROUTER";
  }

  if (typeof routesIndex === "function") {
    routesIndex(app);
    return "REGISTRATION_FUNCTION";
  }

  if (
    routesIndex &&
    typeof routesIndex.router === "function"
  ) {
    app.use(routesIndex.router);
    return "ROUTER_PROPERTY";
  }

  throw new TypeError(
    "routes/index.js is not mountable"
  );
}

async function request(baseUrl, endpoint, options) {
  const response = await fetch(
    baseUrl + endpoint,
    options
  );

  const body = await response.json();

  return {
    status: response.status,
    contract:
      response.headers.get(
        "x-sheikha-contract"
      ),
    body
  };
}

async function main() {
  const routesSource = fs.readFileSync(
    path.join(ROOT, "routes", "index.js"),
    "utf8"
  );

  const app = express();
  const exportType = mountRoutes(app);
  const server = http.createServer(app);
  const address = await listen(server);
  const baseUrl =
    `http://127.0.0.1:${address.port}`;

  try {
    const status = await request(
      baseUrl,
      `${BASE_PATH}/status`
    );

    const assets = await request(
      baseUrl,
      `${BASE_PATH}/assets`
    );

    const licenses = await request(
      baseUrl,
      `${BASE_PATH}/licenses`
    );

    const integrations = await request(
      baseUrl,
      `${BASE_PATH}/integrations`
    );

    const verify = await request(
      baseUrl,
      `${BASE_PATH}/verify`
    );

    const postDenied = await request(
      baseUrl,
      `${BASE_PATH}/assets`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: "{}"
      }
    );

    const checks = {
      requireMarkerPresent:
        routesSource.includes(
          "SHEIKHA_OWNERSHIP_LICENSING_ROUTE_MODULE_V1"
        ),

      mountMarkerPresent:
        routesSource.includes(
          "SHEIKHA_OWNERSHIP_LICENSING_ROUTE_MOUNT_V1"
        ),

      mountPathPresent:
        routesSource.includes(BASE_PATH),

      exportMountable:
        [
          "EXPRESS_ROUTER",
          "REGISTRATION_FUNCTION",
          "ROUTER_PROPERTY"
        ].includes(exportType),

      status200:
        status.status === 200,

      assets200:
        assets.status === 200,

      licenses200:
        licenses.status === 200,

      integrations200:
        integrations.status === 200,

      verify200:
        verify.status === 200,

      verificationPassed:
        verify.body.passed === true,

      sixAssetsPresent:
        assets.body.count >= 6,

      activeLicensePresent:
        licenses.body.items.some(
          (item) => item.state === "ACTIVE"
        ),

      authorizedIntegrationPresent:
        integrations.body.items.some(
          (item) =>
            item.states.includes(
              "AUTHORIZED"
            )
        ),

      mutationDenied:
        postDenied.status === 404,

      contractHeaderPresent:
        status.contract ===
        "SHEIKHA_OWNERSHIP_LICENSING_HTTP_ADAPTER_V1"
    };

    const result = {
      schemaVersion: "1.0.0",
      system:
        "SHEIKHA_VERIFY_OWNERSHIP_LICENSING_ROUTE_WIRING_V1",
      exportType,
      basePath: BASE_PATH,
      checks,
      passed: Object.values(checks).every(Boolean),
      activation: {
        RUNTIME_WIRING_EXECUTED: true,
        RUNTIME_WIRING_TESTED: true,
        RUNTIME_WIRING_VERIFIED:
          Object.values(checks).every(Boolean),
        MAIN_PORTAL_MUTATION_PERFORMED: false,
        REMOTE_MUTATION_PERFORMED: false,
        PRODUCTION_DEPLOYMENT_EXECUTED: false,
        CLEANUP_AUTHORIZED: false,
        RETENTION_MODE:
          "DENY_BY_DEFAULT"
      }
    };

    process.stdout.write(
      JSON.stringify(result, null, 2) + "\n"
    );

    process.exitCode =
      result.passed ? 0 : 1;
  } finally {
    await close(server);
  }
}

main()
  .then(() => {
    const code = process.exitCode || 0;

    process.stdout.write("", () => {
      process.exit(code);
    });
  })
  .catch((error) => {
    const message =
      String(
        error && error.stack
          ? error.stack
          : error
      ) + "\n";

    process.stderr.write(message, () => {
      process.exit(1);
    });
  });
