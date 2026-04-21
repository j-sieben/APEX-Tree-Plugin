const test = require("node:test");
const assert = require("node:assert/strict");

const valueCodec = require("../js/valueCodec");

test("parse returns an empty list for empty values", () => {
  assert.deepEqual(valueCodec.parse(""), []);
  assert.deepEqual(valueCodec.parse(null), []);
  assert.deepEqual(valueCodec.parse(undefined), []);
});

test("parse splits colon separated values", () => {
  assert.deepEqual(valueCodec.parse("A:B:C"), ["A", "B", "C"]);
});

test("parse removes empty and duplicate values", () => {
  assert.deepEqual(valueCodec.parse("A::B:A:"), ["A", "B"]);
});

test("format returns a stable colon separated value", () => {
  assert.equal(valueCodec.format(["A", "", "B", "A"]), "A:B");
});
