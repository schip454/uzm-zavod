"""Cache the customer-selected public catalogs for an auditable content import.
No prices, stock claims or supplier marketing claims are imported as UZM facts.
"""
import concurrent.futures
import hashlib
import json
import re
import urllib.request
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "research" / "source-cache"
CACHE.mkdir(parents=True, exist_ok=True)

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.images, self.meta = [], [], {}
        self.anchor = None
        self.after_heading = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a": self.anchor = {"url": a.get("href", ""), "text": ""}
        if tag == "h1": self.after_heading = True
        if tag == "img": self.images.append({**a, "afterHeading": self.after_heading, "linkedTo": self.anchor['url'] if self.anchor else ''})
        if tag == "meta": self.meta[a.get("property", a.get("name", ""))] = a.get("content", "")
    def handle_data(self, value):
        if self.anchor is not None: self.anchor["text"] += value
    def handle_endtag(self, tag):
        if tag == "a" and self.anchor is not None:
            self.anchor["text"] = " ".join(self.anchor["text"].split())
            self.links.append(self.anchor)
            self.anchor = None

def collect(url):
    name = hashlib.sha256(url.encode()).hexdigest()[:16]
    path = CACHE / (name + ".html")
    try:
        if path.exists(): html = path.read_text(encoding="utf-8")
        else:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=30) as response:
                html = response.read().decode("utf-8", errors="replace")
            path.write_text(html, encoding="utf-8")
        page = Page(); page.feed(html)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
        return {"url": url, "cache": path.name, "title": unescape(re.sub('<[^>]+>', '', h1[1])).strip() if h1 else "", "links": [{"url": urljoin(url, x["url"]), "text": x["text"]} for x in page.links if x["text"]], "images": [{**x, "src": urljoin(url, x.get('data-src') or x.get('src', ''))} for x in page.images], "meta": page.meta}
    except Exception as error: return {"url":url, "error": str(error)}

if __name__ == "__main__":
    import sys
    urls = sys.argv[1:] or [
        "https://klassik-elektro.ru/svetilniki/parkovye/",
        "https://toenergo.ru/catalog/opory-lep-metallicheskie/",
        "https://toenergo.ru/catalog/zakladnie-detali-fundamenta/",
        "https://toenergo.ru/catalog/kronsteiny/",
        "https://krasznam.ru/catalog/opory-truboprovodov/",
        "https://svai-omk.ru/",
        "https://svetplast.ru/catalog/tsokolya/",
        "https://dekart.tech/shop/dekorativnye-opory/",
        "https://batissur.ru/catalog/metallokonstrukcii/tekhnologicheskie-metallokonstrukcii/",
    ]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results = list(pool.map(collect, urls))
    (ROOT / "research" / "customer-sources.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    for row in results: print(row["url"], row.get("title", row.get("error")))
