"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const express = require("express");

const {
  DEFAULT_BASE_PATH,
  createVerificationResult,
  registerSheikhaOwnershipLicensingHttpAdapter
} = require(
  "../runtime/ownership-licensing/" +
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

async function withServer(callback) {
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

  try {
    await callback({
      registration,
      baseUrl:
        `http://127.0.0.1:${address.port}`
    });
  } finally {
    await close(server);
  }
}

async function json(baseUrl, path, options = {}) {
  const response = await fetch(
    baseUrl + path,
    options
  );

  return {
    response,
    body: await response.json()
  };
}

test(
  "registers a read-only adapter",
  async () => {
    await withServer(async ({
      registration,
      baseUrl
    }) => {
      assert.equal(
        registration.registered,
        true
      );

      assert.equal(
        registration
          .mutationCapabilitiesExposed,
        false
      );

      const { response, body } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/status`
      );

      assert.equal(response.status, 200);
      assert.equal(
        body.activation.ACTIVATION_EXECUTED,
        true
      );

      assert.equal(
        body.httpAdapter.state,
        "ACTIVE"
      );

      assert.equal(
        body.httpAdapter
          .productionWiringClaimed,
        false
      );
    });
  }
);

test(
  "exposes six verified owned assets",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/assets`
      );

      assert.equal(response.status, 200);
      assert.ok(body.count >= 6);

      assert.equal(
        body.items.every(
          (asset) =>
            asset.ownershipClass ===
            "OWNED"
        ),
        true
      );
    });
  }
);

test(
  "exposes an active internal license",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/licenses`
      );

      assert.equal(response.status, 200);

      assert.equal(
        body.items.some(
          (license) =>
            license.state === "ACTIVE"
        ),
        true
      );
    });
  }
);

test(
  "exposes an authorized local integration",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/integrations`
      );

      assert.equal(response.status, 200);

      assert.equal(
        body.items.some(
          (integration) =>
            integration.scope === "LOCAL" &&
            integration.states.includes(
              "AUTHORIZED"
            )
        ),
        true
      );
    });
  }
);

test(
  "verification endpoint passes",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/verify`
      );

      assert.equal(response.status, 200);
      assert.equal(body.passed, true);

      assert.equal(
        createVerificationResult().passed,
        true
      );
    });
  }
);

test(
  "mutation methods are not exposed",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/assets`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: "{}"
        }
      );

      assert.equal(response.status, 404);
      assert.equal(
        body.mutationCapabilitiesExposed,
        false
      );
    });
  }
);

test(
  "sets contract and no-store headers",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response } = await json(
        baseUrl,
        `${DEFAULT_BASE_PATH}/status`
      );

      assert.equal(
        response.headers.get(
          "x-sheikha-contract"
        ),
        "SHEIKHA_OWNERSHIP_LICENSING_HTTP_ADAPTER_V1"
      );

      assert.match(
        response.headers.get(
          "cache-control"
        ),
        /no-store/
      );
    });
  }
);
