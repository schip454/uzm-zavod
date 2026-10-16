"""Import the complete visible OMK pile nomenclature into family tables."""

import concurrent.futures
import hashlib
import json
import re
import runpy
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
collect = runpy.run_path(str(ROOT / "scripts/collect-catalog-sources.py"))["collect"]
products = json.loads((ROOT / "src/data/products.json").read_text(encoding="utf-8"))
families = [product for product in products if product["slug"].startswith("pile-")]


def cached_html(url):
    result = collect(url)
    if result.get("error"):
        raise RuntimeError(f"{url}: {result['error']}")
    return (ROOT / "research/source-cache" / result["cache"]).read_text(encoding="utf-8")


def clean(value):
    return " ".join(unescape(re.sub(r"<[^>]+>", " ", value)).split())


all_urls = set()
family_urls = {}
for family in families:
    url = family["sourceUrl"]
    source = cached_html(url)
    pages = {unescape(match) for match in re.findall(r'href=["\']([^"\']+/page/\d+/)["\']', source)}
    pages = {page for page in pages if page.startswith(url) and not page.endswith("/page/1/")}
    family_urls[family["slug"]] = [url, *sorted(pages)]
    all_urls.update(pages)

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    fetched = dict(zip(sorted(all_urls), pool.map(cached_html, sorted(all_urls))))

verified_path = ROOT / "src/data/verified-products.json"
verified = json.loads(verified_path.read_text(encoding="utf-8"))
provenance = []

for family in families:
    variants = {}
    first_page = cached_html(family["sourceUrl"])
    expected_match = re.search(r"Отображение.{0,30}?из\s+(\d+)", clean(first_page))
    for url in family_urls[family["slug"]]:
        source = fetched.get(url) or cached_html(url)
        articles = re.findall(r'<article\b[^>]*\btype-product\b[^>]*>.*?</article>', source, re.S | re.I)
        if not articles:
            raise RuntimeError(f"No product articles at {url}")
        for article in articles:
            title = re.search(r'<h4\b[^>]*class="entry-title"[^>]*>(.*?)</h4>', article, re.S)
            description = re.search(r'<div\b[^>]*class="woocommerce-product-details__short-description"[^>]*>(.*?)</div>', article, re.S)
            if not title or not description:
                raise RuntimeError(f"Incomplete product at {url}")
            href = re.search(r'href="([^"]+)"', title[1])
            name, details = clean(title[1]), clean(description[1])
            variants.setdefault(name, [name, details])
            provenance.append({"family": family["slug"], "name": name, "url": unescape(href[1]) if href else url, "listing": url})
    if expected_match and len(variants) != int(expected_match[1]):
        raise RuntimeError(f"Incomplete family {family['slug']}: {len(variants)} of {expected_match[1]}")
    verified[family["slug"]] = {
        **verified.get(family["slug"], {}),
        "sourceUrl": family["sourceUrl"],
        "variantTable": {"headers": ["Обозначение", "Параметры исполнения"], "rows": list(variants.values())},
    }
    print(f"{family['slug']}: {len(variants)} variants")

verified_path.write_text(json.dumps(verified, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / "research/pile-variant-sources.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Total: {sum(len(verified[family['slug']]['variantTable']['rows']) for family in families)} variants.")
