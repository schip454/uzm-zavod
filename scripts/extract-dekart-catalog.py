"""Extract a reviewable URL inventory from the public Dekart catalog page.

The resulting CSV is research material. A name in this file does not confirm
that UZM manufactures the item, and it must be checked before publication.
"""

from collections import Counter
from csv import DictWriter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "research" / "dekart-shop.html"
OUTPUT = ROOT / "research" / "dekart-url-inventory.csv"


class CatalogParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.current_link = None
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        self.stack.append((tag, classes))
        if tag == "a" and attrs.get("href", "").startswith("/shop/"):
            if any("accordionMy2" in item_classes for _, item_classes in self.stack):
                self.current_link = {"href": attrs["href"], "text": []}

    def handle_data(self, data):
        if self.current_link is not None:
            self.current_link["text"].append(data)

    def handle_endtag(self, tag):
        if tag == "a" and self.current_link is not None:
            name = " ".join(" ".join(self.current_link["text"]).split())
            if name:
                self.links.append((name, self.current_link["href"]))
            self.current_link = None
        while self.stack:
            last_tag, _ = self.stack.pop()
            if last_tag == tag:
                break


parser = CatalogParser()
parser.feed(SOURCE.read_text(encoding="utf-8"))
seen = set()
rows = []
for name, href in parser.links:
    url = urljoin("https://dekart.tech", href)
    path = urlparse(url).path.strip("/").split("/")
    if url in seen or len(path) < 2:
        continue
    seen.add(url)
    rows.append({
        "direction_path": path[1],
        "depth": len(path) - 1,
        "name": name,
        "source_url": url,
        "verification": "требует проверки УЗМ",
    })

with OUTPUT.open("w", encoding="utf-8-sig", newline="") as handle:
    writer = DictWriter(handle, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)

print(f"Extracted {len(rows)} unique catalog URLs")
for key, amount in Counter(row["direction_path"] for row in rows).most_common():
    print(f"{key}: {amount}")
