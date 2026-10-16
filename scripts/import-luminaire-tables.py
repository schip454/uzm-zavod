"""Import factual variant tables from cached, customer-approved supplier pages."""

import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.depth = 0
        self.section = ""
        self.table = None
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "table":
            self.depth += 1
            if self.depth == 1:
                self.table = {"rows": [], "headerRows": 0}
        if self.depth != 1:
            return
        if tag in ("thead", "tbody"):
            self.section = tag
        if tag == "tr":
            self.row = []
        if tag in ("td", "th"):
            self.cell = {"text": "", "rowspan": int(attrs.get("rowspan", 1)), "colspan": int(attrs.get("colspan", 1))}
        if tag == "br" and self.cell is not None:
            self.cell["text"] += " "

    def handle_data(self, data):
        if self.cell is not None:
            self.cell["text"] += data

    def handle_endtag(self, tag):
        if self.depth == 1:
            if tag in ("td", "th") and self.cell is not None:
                self.cell["text"] = " ".join(self.cell["text"].split())
                if self.row is not None:
                    self.row.append(self.cell)
                self.cell = None
            if tag == "tr" and self.row:
                self.table["rows"].append(self.row)
                if self.section == "thead":
                    self.table["headerRows"] += 1
                self.row = None
            if tag in ("thead", "tbody"):
                self.section = ""
            if tag == "table":
                self.tables.append(self.table)
                self.table = None
        if tag == "table":
            self.depth -= 1


def expand(table):
    grid = {}
    for row_index, row in enumerate(table["rows"]):
        column = 0
        for cell in row:
            while (row_index, column) in grid:
                column += 1
            for down in range(cell["rowspan"]):
                for across in range(cell["colspan"]):
                    grid[(row_index + down, column + across)] = cell["text"]
            column += cell["colspan"]
    width = max(column for _, column in grid) + 1
    height = max(row for row, _ in grid) + 1
    matrix = [[grid.get((row, column), "") for column in range(width)] for row in range(height)]
    header_count = table["headerRows"] or 1
    headers = []
    for column in range(width):
        parts = list(dict.fromkeys(matrix[row][column] for row in range(header_count) if matrix[row][column]))
        headers.append(" — ".join(parts))
    retained = [index for index, header in enumerate(headers) if header]
    headers = [headers[index] for index in retained]
    rows = [[row[index] for index in retained] for row in matrix[header_count:] if any(row)]
    for column, header in enumerate(headers):
        if header == "Степень защиты":
            for row in rows:
                if re.fullmatch(r"\d{2}", row[column]):
                    row[column] = "IP" + row[column]
    return {"headers": headers, "rows": rows}


products = json.loads((ROOT / "src/data/products.json").read_text(encoding="utf-8"))
verified_path = ROOT / "src/data/verified-products.json"
verified = json.loads(verified_path.read_text(encoding="utf-8"))
series_count = 0
variant_count = 0

for product in products:
    url = product.get("sourceUrl", "")
    if "klassik-elektro.ru/svetilniki/parkovye/" not in url:
        continue
    cache = ROOT / "research/source-cache" / (hashlib.sha256(url.encode()).hexdigest()[:16] + ".html")
    if not cache.exists():
        continue
    parser = TableParser()
    parser.feed(cache.read_text(encoding="utf-8"))
    table = next((table for table in parser.tables if table["rows"] and table["rows"][0][0]["text"] == "Наименование"), None)
    if table is None:
        continue
    data = expand(table)
    assert data["rows"] and all(len(row) == len(data["headers"]) for row in data["rows"])
    specifications = []
    for column, header in enumerate(data["headers"]):
        if column == 0 or "Мощность" in header:
            continue
        values = list(dict.fromkeys(row[column] for row in data["rows"] if row[column]))
        if 0 < len(values) <= 3:
            specifications.append({"label": header, "value": ", ".join(values)})
    verified[product["slug"]] = {
        "sourceUrl": url,
        "specifications": specifications[:5],
        "variantTable": data,
    }
    series_count += 1
    variant_count += len(data["rows"])

verified_path.write_text(json.dumps(verified, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Imported {variant_count} variants in {series_count} luminaire series.")
