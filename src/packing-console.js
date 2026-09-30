import { fileURLToPath } from "node:url";
import { loadJson, loadProducts } from "./data-loader.js";
import { analyzeOrder } from "./rule-engine.js";

const fixture = (name) => fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url));
const orderId = process.argv[2];
if (!orderId) {
  console.error("Usage: npm run analyze -- <order-id>");
  process.exit(64);
}

const [orders, products, rules] = await Promise.all([
  loadJson(fixture("orders.json")),
  loadProducts(fixture("products.csv")),
  loadJson(fixture("packing-rules.json")),
]);
const order = orders.find((candidate) => String(candidate.id) === String(orderId));
if (!order) {
  console.error(`Order ${orderId} was not found`);
  process.exit(2);
}

try {
  const result = analyzeOrder(order, products, rules);
  console.log(`ORDER #${result.orderId}`);
  console.log(`PACKAGE ${result.packageCode}`);
  console.log(result.steps.join(" · "));
  console.log(`ITEMS ${result.facts.itemCount} / VOLUME ${result.facts.volumeCm3} cm³`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
