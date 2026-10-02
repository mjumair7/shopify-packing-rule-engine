function orderFacts(order, products) {
  const catalog = new Map(products.map((product) => [product.sku, product]));
  let itemCount = 0;
  let volumeCm3 = 0;
  let longestSideCm = 0;

  for (const line of order.items) {
    const product = catalog.get(line.sku);
    if (!product) throw new Error(`Missing dimensions for SKU ${line.sku}`);
    const quantity = Number(line.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity for SKU ${line.sku}`);
    itemCount += quantity;
    volumeCm3 += product.lengthCm * product.widthCm * product.heightCm * quantity;
    longestSideCm = Math.max(longestSideCm, product.lengthCm, product.widthCm, product.heightCm);
  }

  return { itemCount, volumeCm3, longestSideCm, isGift: Boolean(order.gift) };
}

function matches(rule, facts) {
  const when = rule.when || {};
  if (when.gift !== undefined && facts.isGift !== when.gift) return false;
  if (when.min_items !== undefined && facts.itemCount < when.min_items) return false;
  if (when.max_items !== undefined && facts.itemCount > when.max_items) return false;
  if (when.min_volume_cm3 !== undefined && facts.volumeCm3 < when.min_volume_cm3) return false;
  if (when.max_volume_cm3 !== undefined && facts.volumeCm3 > when.max_volume_cm3) return false;
  if (when.max_longest_side_cm !== undefined && facts.longestSideCm > when.max_longest_side_cm) return false;
  return true;
}

export function analyzeOrder(order, products, rules) {
  if (!order?.id || !Array.isArray(order.items) || order.items.length === 0) {
    throw new Error("Order must include an id and at least one item");
  }
  if (!Array.isArray(products) || !Array.isArray(rules)) {
    throw new Error("Products and rules must be arrays");
  }
  const facts = orderFacts(order, products);
  const rule = rules.find((candidate) => matches(candidate, facts));
  if (!rule) throw new Error(`No packaging rule matched order ${order.id}`);
  if (!rule.package || !Array.isArray(rule.steps)) {
    throw new Error(`Packaging rule for order ${order.id} is incomplete`);
  }

  const steps = [...rule.steps];
  if (order.gift_message) steps.splice(Math.max(0, steps.length - 1), 0, "Add greeting card");
  return {
    orderId: String(order.id),
    packageCode: rule.package,
    steps,
    facts: {
      ...facts,
      volumeCm3: Math.round(facts.volumeCm3),
    },
  };
}
