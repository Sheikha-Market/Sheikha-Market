"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const express = require("express");

const routesIndex = require("../routes/index.js");

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
    "routes/index.js does not export a mountable router"
  );
}

async function withServer(callback) {
  const app = express();
  const exportType = mountRoutes(app);
  const server = http.createServer(app);
  const address = await listen(server);

  try {
    await callback({
      exportType,
      baseUrl:
        `http://127.0.0.1:${address.port}`
    });
  } finally {
    await close(server);
  }
}

async function jsonRequest(
  baseUrl,
  path,
  options = {}
) {
  const response = await fetch(
    baseUrl + path,
    options
  );

  const contentType =
    response.headers.get("content-type") || "";

  assert.match(
    contentType,
    /application\/json/
  );

  return {
    response,
    body: await response.json()
  };
}

test(
  "routes index exports a mountable router",
  async () => {
    await withServer(async ({
      exportType
    }) => {
      assert.ok([
        "EXPRESS_ROUTER",
        "REGISTRATION_FUNCTION",
        "ROUTER_PROPERTY"
      ].includes(exportType));
    });
  }
);

test(
  "wires the ownership status endpoint",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } =
        await jsonRequest(
          baseUrl,
          `${BASE_PATH}/status`
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
    });
  }
);

test(
  "wires assets, licenses, integrations and verify",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const paths = [
        "/assets",
        "/licenses",
        "/integrations",
        "/verify"
      ];

      for (const path of paths) {
        const { response } =
          await jsonRequest(
            baseUrl,
            BASE_PATH + path
          );

        assert.equal(
          response.status,
          200,
          path
        );
      }
    });
  }
);

test(
  "does not expose mutation endpoints",
  async () => {
    await withServer(async ({ baseUrl }) => {
      const { response, body } =
        await jsonRequest(
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

      assert.equal(response.status, 404);

      assert.equal(
        body.mutationCapabilitiesExposed,
        false
      );
    });
  }
);
