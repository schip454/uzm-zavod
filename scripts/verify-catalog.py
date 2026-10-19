"""Check source links, reviewed media and generated product routes."""
import collections
import csv
import json
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
audit = runpy.run_path(str(ROOT / 'scripts/audit-catalog.py'))
products = audit['unique']
rows = audit['rows']
errors = []
duplicates = [slug for slug, count in collections.Counter(p['slug'] for p in rows).items() if count > 1]
if duplicates:
    errors.append(f'Duplicate slugs: {duplicates}')
decisions = json.loads((ROOT / 'research/image-review-decisions.json').read_text(encoding='utf8'))
ledger = json.loads((ROOT / 'research/published-product-images.json').read_text(encoding='utf8'))
for item in ledger:
    path = ROOT / 'public' / item['file'].lstrip('/')
    if not path.is_file() or not decisions.get(path.name, {}).get('approved'):
        errors.append(f'Unreviewed or missing media: {item["file"]}')
for slug, product in products.items():
    if product.get('seriesSlug') and product['seriesSlug'] not in products:
        errors.append(f'Missing series: {slug}')
    for image in product.get('gallery', []):
        if not (ROOT / 'public' / image['src'].lstrip('/')).is_file():
            errors.append(f'Missing gallery file: {slug}: {image["src"]}')
    for url in (product.get('variantTable') or {}).get('urls', []):
        if url.strip('/').split('/')[-1] not in products:
            errors.append(f'Missing variant route: {url}')
    if (ROOT / 'out/product').exists() and not (ROOT / 'out/product' / slug / 'index.html').is_file():
        errors.append(f'Missing exported card: {slug}')

with (ROOT / 'research/Недостающие_фотографии.csv').open('w', encoding='utf-8-sig', newline='') as file:
    writer = csv.writer(file, delimiter=';')
    writer.writerow(['Изделие', 'Раздел', 'Источник', 'Карточка УЗМ', 'Что нужно'])
    for slug, item in products.items():
        if not item.get('image') and not item.get('gallery'):
            writer.writerow([item['name'], item['categorySlug'], item.get('sourceUrl', ''), f'/product/{slug}/', 'Фотография или чертёж именно этого изделия без водяного знака'])
with (ROOT / 'research/Уточнить_характеристики.csv').open('w', encoding='utf-8-sig', newline='') as file:
    writer = csv.writer(file, delimiter=';')
    writer.writerow(['Изделие', 'Раздел', 'Источник', 'Карточка УЗМ', 'Что нужно'])
    for slug, item in products.items():
        if not item.get('specifications') and not item.get('variantTable'):
            writer.writerow([item['name'], item['categorySlug'], item.get('sourceUrl', ''), f'/product/{slug}/', 'Подтверждённые характеристики или чертёж; для изделий по проекту — рабочая документация'])

summary = {
    'cards': len(products),
    'withSpecifications': sum(bool(p.get('specifications')) for p in products.values()),
    'withDescription': sum(bool(p.get('description') or p.get('descriptionBlocks')) for p in products.values()),
    'withImage': sum(bool(p.get('image') or p.get('gallery')) for p in products.values()),
    'withMultipleImages': sum(len(p.get('gallery', [])) > 1 for p in products.values()),
    'uniqueReviewedImages': len({r['file'] for r in ledger}),
    'withVariantTable': sum(bool(p.get('variantTable')) for p in products.values()),
    'withoutSpecificationsOrTable': sum(not p.get('specifications') and not p.get('variantTable') for p in products.values()),
    'errors': sorted(set(errors)),
}
(ROOT / 'research/catalog-verification.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(json.dumps(summary, ensure_ascii=False, indent=2))
if errors:
    raise SystemExit(1)
