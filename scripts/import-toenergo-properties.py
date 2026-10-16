"""Import named technical fields from cached Toenergo product pages."""

import hashlib
import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
products = json.loads((ROOT / "src/data/products.json").read_text(encoding="utf-8"))
verified_path = ROOT / "src/data/verified-products.json"
verified = json.loads(verified_path.read_text(encoding="utf-8"))
count = 0


def clean(value):
    return " ".join(unescape(re.sub(r"<[^>]+>", " ", value)).split())


for product in products:
    url = product.get("sourceUrl", "")
    if "toenergo.ru" not in url:
        continue
    cache = ROOT / "research/source-cache" / (hashlib.sha256(url.encode()).hexdigest()[:16] + ".html")
    if not cache.exists():
        continue
    source = cache.read_text(encoding="utf-8")
    pairs = re.findall(r'<div\b[^>]*class="[^"]*props__name[^"]*"[^>]*>(.*?)</div>.*?<div\b[^>]*class="[^"]*props__value[^"]*"[^>]*>(.*?)</div>', source, re.S | re.I)
    specifications = [{"label": clean(label), "value": clean(value)} for label, value in pairs if clean(label) and clean(value)]
    specifications = list({item["label"]: item for item in specifications}.values())
    if not specifications:
        continue
    verified[product["slug"]] = {
        **verified.get(product["slug"], {}),
        "sourceUrl": url,
        "specificationTitle": "Характеристики",
        "specifications": specifications,
    }
    count += 1
    print(f"{product['slug']}: {len(specifications)} fields")

verified_path.write_text(json.dumps(verified, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Imported technical fields for {count} products.")
