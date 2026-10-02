import { readFile } from "node:fs/promises";

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && quoted && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  values.push(value.trim());
  return values;
}

export function parseCsv(source) {
  if (typeof source !== "string" || !source.trim()) {
    throw new Error("Product CSV is empty");
  }
  const lines = source.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift());
  return lines.map((line) => Object.fromEntries(headers.map((header, index) => [header, parseCsvLine(line)[index]])));
}

export async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function loadProducts(path) {
  const rows = parseCsv(await readFile(path, "utf8"));
  return rows.map((row, index) => {
    const product = {
      sku: row.sku,
      title: row.title,
      lengthCm: Number(row.length_cm),
      widthCm: Number(row.width_cm),
      heightCm: Number(row.height_cm),
    };
    const dimensions = [product.lengthCm, product.widthCm, product.heightCm];
    if (!product.sku || dimensions.some((value) => !Number.isFinite(value) || value <= 0)) {
      throw new Error(`Invalid product data on CSV row ${index + 2}`);
    }
    return product;
  });
}
