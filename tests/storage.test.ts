import assert from "node:assert/strict";
import test from "node:test";
import { defaultPreferences, normalizePreferences } from "../lib/storage.ts";

test("migrates saved preferences to the default decimal precision", () => {
  const migrated = normalizePreferences({ ...defaultPreferences, decimalPlaces: undefined });
  assert.equal(migrated?.decimalPlaces, 2);
});

test("accepts precision from zero through ten and rejects invalid values", () => {
  assert.equal(normalizePreferences({ decimalPlaces: 0 })?.decimalPlaces, 0);
  assert.equal(normalizePreferences({ decimalPlaces: 10 })?.decimalPlaces, 10);
  assert.equal(normalizePreferences({ decimalPlaces: 11 })?.decimalPlaces, 2);
});
