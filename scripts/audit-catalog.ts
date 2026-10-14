import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { categories, products } from "../src/data/catalog";

const csv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
const headers = ["Раздел", "Модель", "Источник", "Фото", "Характеристики", "Статус фото"];
const rows = products.map((product) => {
  const imagePath = product.image ? resolve("public", product.image.slice(1)) : "";
  const exists = Boolean(imagePath && existsSync(imagePath));
  return [
    categories.find((category) => category.slug === product.categorySlug)?.title ?? product.categorySlug,
    product.name,
    product.sourceUrl ?? "",
    product.image ?? "",
    product.specifications?.length ?? 0,
    exists ? "Готово" : "Нужен снимок",
  ];
});
writeFileSync("research/catalog-audit.csv", [headers, ...rows].map((row) => row.map(csv).join(",")).join("\n") + "\n", "utf8");
console.log(`${products.length} моделей; фото: ${rows.filter((row) => row[5] === "Готово").length}; характеристики: ${rows.filter((row) => Number(row[4]) > 0).length}`);
