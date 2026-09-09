import assert from "node:assert/strict";
import test from "node:test";
import { editAmount } from "../lib/input.ts";

test("edits numeric input predictably", () => {
  assert.equal(editAmount("0", "7"), "7");
  assert.equal(editAmount("7", "."), "7.");
  assert.equal(editAmount("7.", "."), "7.");
  assert.equal(editAmount("7.5", "backspace"), "7.");
  assert.equal(editAmount("7", "clear"), "0");
});

test("limits input to eighteen significant digits", () => {
  const value = "123456789012345678";
  assert.equal(editAmount(value, "9"), value);
});
