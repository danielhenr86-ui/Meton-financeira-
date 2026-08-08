import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/cfo.js";

function mockResponse() {
  return {
    headers: {},
    statusCode: null,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("endpoint CFO rejeita metodos diferentes de POST", async () => {
  const response = mockResponse();
  await handler({ method: "GET" }, response);
  assert.equal(response.statusCode, 405);
  assert.equal(response.headers.Allow, "POST");
});

test("endpoint CFO rejeita payload incompleto antes de chamar o modelo", async () => {
  const response = mockResponse();
  await handler({ method: "POST", body: {} }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "invalid_request");
  assert.equal(response.headers["Cache-Control"], "no-store");
});

