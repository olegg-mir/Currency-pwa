import assert from "node:assert/strict";
import test from "node:test";
import { convertAmount, formatConverted } from "../lib/conversion.ts";

test("converts through a shared USD base", () => {
  const rates = { USD: "1", EUR: "0.8", JPY: "160" };
  assert.equal(convertAmount("10", "EUR", "JPY", rates)?.toString(), "2000");
  assert.equal(convertAmount("10", "JPY", "EUR", rates)?.toString(), "0.05");
});

test("returns undefined when a rate is unavailable", () => {
  assert.equal(convertAmount("10", "EUR", "BTC", { EUR: "0.8" }), undefined);
});

test("formats values for the selected locale", () => {
  const converted = convertAmount("1000", "USD", "EUR", { USD: "1", EUR: "0.9" });
  assert.ok(converted);
  assert.equal(formatConverted(converted, "en"), "900");
  assert.equal(formatConverted(converted, "ru").replace(/\s/g, " "), "900");
});
