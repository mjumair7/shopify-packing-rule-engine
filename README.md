# Shopify Packing Rule Engine

[![CI](https://github.com/mjumair7/shopify-packing-rule-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/mjumair7/shopify-packing-rule-engine/actions/workflows/ci.yml)

This repo is a small packing-rules experiment. Give it one of the sample order numbers and it returns a package code plus a short packing checklist.

The rules stay in JSON instead of being buried in the command-line code. “Shopify-style” only describes the fixture shape: this does not connect to a store or call Shopify's API.

## Run it

Node.js 20 or newer is required.

```sh
npm test
npm run analyze -- 1048
npm run analyze -- 1052
npm run analyze -- 1061
```

Example:

```text
ORDER #1048
PACKAGE Mailer M2
Wrap books · Add bookmark · Print label
ITEMS 2 / VOLUME 1188 cm³
```

## Three fixtures, three paths

- `1048` is a normal two-book order and uses the standard mailer.
- `1052` is marked as a gift, so the gift rule wins even though the item count is small.
- `1061` contains five hardcovers and uses the bulk-book carton.

These cases make rule order visible without needing an external service or a large test dataset.

## Data flow

1. Load order JSON and a product CSV.
2. Join order lines to products by SKU.
3. Validate quantities and dimensions.
4. Calculate item count, total volume, and longest side.
5. Evaluate the ordered rules in `fixtures/packing-rules.json`.
6. Return one package code and a short list of packing steps.

The engine fails closed when a SKU is missing, a quantity is invalid, product dimensions are unusable, or no rule matches. Rule order is intentional: a specific gift or oversize rule should appear before a general fallback.

## Repository map

```text
fixtures/                 sample orders, products, and packing rules
src/data-loader.js        JSON/CSV loading and catalog validation
src/rule-engine.js        fact calculation and ordered rule matching
src/packing-console.js    command-line interface
tests/                    decision and failure-path tests
```

## Where I stopped

This is not a Shopify app and it does not call the Shopify API. The fixtures stand in for exported data so the decision logic stays easy to run and test. A real integration would add authenticated API ingestion, order-status updates, audit logging, and a review path for orders that match no rule.

## Next steps

- validate the rule file against a schema before processing orders;
- support weight limits and incompatible-item rules;
- return a manual-review result instead of only throwing on unmatched orders;
- add an adapter for real Shopify exports without coupling it to the engine.

MIT licensed.
