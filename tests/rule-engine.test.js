import test from "node:test";
import assert from "node:assert/strict";
import { analyzeOrder } from "../src/rule-engine.js";

const products = [
  { sku: "POCKET", title: "Pocket", lengthCm: 18, widthCm: 11, heightCm: 2 },
  { sku: "HARD", title: "Hardcover", lengthCm: 24, widthCm: 17, heightCm: 3 },
];
const rules = [
  { when: { gift: true }, package: "Gift Box G1", steps: ["Wrap", "Seal"] },
  { when: { min_items: 5 }, package: "Carton B3", steps: ["Pad", "Seal"] },
  { when: {}, package: "Mailer M2", steps: ["Wrap", "Label"] },
];

test("gift rule wins before generic quantity rules", () => {
  const result = analyzeOrder({ id: 1, gift: true, items: [{ sku: "POCKET", quantity: 1 }] }, products, rules);
  assert.equal(result.packageCode, "Gift Box G1");
});

test("bulk order selects carton", () => {
  const result = analyzeOrder({ id: 2, items: [{ sku: "HARD", quantity: 5 }] }, products, rules);
  assert.equal(result.packageCode, "Carton B3");
  assert.equal(result.facts.itemCount, 5);
});

test("unknown product fails closed", () => {
  assert.throws(
    () => analyzeOrder({ id: 3, items: [{ sku: "UNKNOWN", quantity: 1 }] }, products, rules),
    /Missing dimensions/,
  );
});
