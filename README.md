# Shopify Packing Rule Engine

A deterministic order analyzer that joins Shopify-style order data to a product-dimension catalog, applies packaging rules, and returns a concise packing instruction.

## Run it

```sh
npm test
npm run analyze -- 1048
npm run analyze -- 1052
npm run analyze -- 1061
```

Example output:

```text
ORDER #1048
PACKAGE Mailer M2
Wrap books · Add bookmark · Print label
```

## Data flow

1. Load order JSON exported from Shopify or another order source.
2. Load product dimensions from CSV.
3. Compute item count, volume, and gift requirements.
4. Apply ordered rules from `fixtures/packing-rules.json`.
5. Print or serialize the instruction for fulfillment staff.

The fixtures are intentionally small, but the rule engine is separate from file loading so an API client can replace them without changing packaging decisions.

MIT licensed.
