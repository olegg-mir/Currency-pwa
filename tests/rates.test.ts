import assert from "node:assert/strict";
import test from "node:test";
import { RATE_TTL_MS, isSnapshot, isSnapshotStale, shouldRefresh, type RateSnapshot } from "../lib/rates.ts";
import { normalizeRates } from "../lib/normalize-rates.ts";

const updatedAt = "2026-09-09T10:00:00.000Z";
const snapshot: RateSnapshot = { base: "USD", updatedAt, currencies: [], rates: { USD: "1" } };

test("enforces a six-hour freshness window and offline guard", () => {
  const updated = Date.parse(updatedAt);
  assert.equal(isSnapshotStale(snapshot, updated + RATE_TTL_MS - 1), false);
  assert.equal(isSnapshotStale(snapshot, updated + RATE_TTL_MS), true);
  assert.equal(shouldRefresh(snapshot, true, true, updated + RATE_TTL_MS), false);
  assert.equal(shouldRefresh(snapshot, false, false, updated + RATE_TTL_MS), false);
  assert.equal(shouldRefresh(snapshot, false, true, updated + RATE_TTL_MS), true);
});

test("normalizes fiat and crypto catalogs and removes invalid rates", () => {
  const normalized = normalizeRates(
    { data: { currency: "USD", rates: { EUR: "0.9", BTC: "0.00001", BAD: "0" } } },
    { data: [{ id: "EUR", name: "Euro" }] },
    { data: [{ code: "BTC", name: "Bitcoin", sort_index: 1 }] },
    updatedAt,
  );
  assert.deepEqual(normalized.currencies, [
    { code: "EUR", name: "Euro", type: "fiat" },
    { code: "BTC", name: "Bitcoin", type: "crypto" },
  ]);
  assert.equal(normalized.rates.BAD, undefined);
  assert.equal(isSnapshot(normalized), true);
});
