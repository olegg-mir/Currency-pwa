import assert from "node:assert/strict";
import test from "node:test";
import { translations } from "../lib/translations.ts";

test("English and Russian dictionaries expose the same keys", () => {
  assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.ru).sort());
});
