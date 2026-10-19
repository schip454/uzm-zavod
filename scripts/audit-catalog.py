"""Build a factual content checklist from the product data used by the site."""

import csv
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
sys.stdout.reconfigure(encoding="utf-8")


def original_products():
    source = (DATA / "catalog.ts").read_text(encoding="utf-8")
    block = source.split("const originalProducts: Product[] = [", 1)[1].split("];", 1)[0]
    for line in block.splitlines():
        if not line.strip().startswith("{ slug:"):
            continue
        item = {}
        for key in ("slug", "name", "categorySlug", "family", "form", "purpose", "image", "sourceUrl", "description"):
            match = re.search(rf'{key}: "([^"]*)"', line)
            if match:
                item[key] = match.group(1)
        if item.get("slug"):
            if item.get("categorySlug") == "opory-osveshcheniya":
                item["categorySlug"] = {
                    "Силовая": "silovye-opory",
                    "Несиловая": "nesilovye-opory",
                }.get(item.get("purpose"), "skladyvayushchiesya-opory")
            yield item


imported = json.loads((DATA / "products.json").read_text(encoding="utf-8"))
dekart = json.loads((DATA / "dekart-full.json").read_text(encoding="utf-8"))
imported_slugs = {item["slug"] for item in imported}
rows = [item for item in original_products() if item["slug"] not in imported_slugs]
rows.extend(imported)
rows.extend(dekart)
for filename in ['supplier-products.json','additional-supplier-products.json','krasznam-products.json']:
    path=DATA/filename
    if path.exists():rows.extend(json.loads(path.read_text(encoding='utf-8')))

unique = {}
for item in rows:
    unique.setdefault(item["slug"], item)

verified = json.loads((DATA / "verified-products.json").read_text(encoding="utf-8"))
for slug, content in verified.items():
    if slug in unique:
        unique[slug] = {**unique[slug], **content}
for filename in ['supplier-content.json','krasznam-content.json','project-content.json']:
    path=DATA/filename
    if path.exists():
        for slug,content in json.loads(path.read_text(encoding='utf-8')).items():
            if slug in unique:unique[slug]={**unique[slug],**content}

approved_images = {"ogk", "ukrytie-antidron", "light-lira-ntu-10-rtu-10-zhtu-10-gtu-10", "light-legenda-ntu-10-rtu-10-zhtu-10-gtu-10"}
image_ledger = ROOT / "research/pile-image-sources.json"
if image_ledger.exists():
    approved_images.update(item["slug"] for item in json.loads(image_ledger.read_text(encoding="utf-8")))
ledger=ROOT/'research/published-product-images.json'
if ledger.exists():
    published=json.loads(ledger.read_text(encoding='utf-8'))
    approved_images.update(x['productSlug'] for x in published)
    approved_paths={x['file'] for x in published}
    approved_images.update(slug for slug,item in unique.items() if item.get('image') in approved_paths)

output = ROOT / "research" / "catalog-audit.csv"
output.parent.mkdir(parents=True, exist_ok=True)

with output.open("w", encoding="utf-8-sig", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Раздел", "Модель", "URL карточки", "Источник", "Характеристик", "Исполнений в таблице", "Фото", "Статус фото", "Следующее действие"])
    for item in sorted(unique.values(), key=lambda value: (value.get("categorySlug", ""), value.get("name", ""))):
        slug = item["slug"]
        image = "/images/sources/dekart-ogk.webp" if slug == "ogk" else item.get("image", "")
        if image.startswith("/images/generated/"):
            image = ""
        image_exists = bool(image) and (ROOT / "public" / image.lstrip("/")).is_file()
        if slug in approved_images and image_exists:
            status = "Сверено с источником"
        elif image_exists:
            status = "Сверить с источником"
        else:
            status = "Нужен снимок изделия"
        specifications = item.get("specifications") or []
        variants = (item.get("variantTable") or {}).get("rows", [])
        tasks = []
        if not item.get("sourceUrl"):
            tasks.append("Уточнить источник и наличие у УЗМ")
        if not specifications and not variants:
            tasks.append("Проверить параметры по чертежу или каталогу")
        if status != "Сверено с источником":
            tasks.append("Сопоставить фото с моделью")
        writer.writerow([
            item.get("categorySlug", ""),
            item.get("name", ""),
            f"/product/{slug}/",
            item.get("sourceUrl", ""),
            len(specifications),
            len(variants),
            image if image_exists else "",
            status,
            "; ".join(tasks),
        ])

print(f"{len(unique)} изделий; аудит: {output}")
print(f"Изображений: {sum(bool(item.get('image')) and not item['image'].startswith('/images/generated/') for item in unique.values()) + int('ogk' in unique and not unique['ogk'].get('image'))}; параметры серий: {sum(bool(item.get('specifications')) for item in unique.values())}; таблиц: {sum(bool(item.get('variantTable')) for item in unique.values())}; исполнений: {sum(len((item.get('variantTable') or {}).get('rows', [])) for item in unique.values())}")
