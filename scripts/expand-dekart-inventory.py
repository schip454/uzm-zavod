"""Build supplementary catalog models from the checked Dekart URL inventory.

The handwritten list identifies priority series. This file keeps the remaining
named models discoverable without inventing technical dimensions or stock.
"""
import csv
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
existing = json.loads((ROOT / "src/data/products.json").read_text(encoding="utf-8"))
known_urls = {item.get("sourceUrl", "").rstrip("/") for item in existing}
known_names = {(item["categorySlug"], item["name"].casefold()) for item in existing}


def classify(path, name):
    parts = path.strip("/").split("/")
    if len(parts) == 4 and parts[0] == "opory-osvescheniya":
        _, duty, shape, _ = parts
        if duty in ("silovye", "nesilovye", "skladyvayuschiesya"):
            category = {"silovye": "silovye-opory", "nesilovye": "nesilovye-opory", "skladyvayuschiesya": "skladyvayushchiesya-opory"}[duty]
            form = {"granenye": "Гранёная", "kruglokonicheskie": "Круглоконическая", "trubchatye": "Трубчатая"}.get(shape)
            if form:
                purpose = {"silovye": "Силовая", "nesilovye": "Несиловая", "skladyvayuschiesya": "Складывающаяся"}[duty]
                return category, f"{purpose} — {form.lower()}", form, purpose, "pole"
    if len(parts) != 2:
        return None
    group = parts[0]
    if group == "machty-osvescheniya" and name not in ("Со стационарной короной", "С мобильной короной"):
        return "machty-osveshcheniya", "Мачты освещения", "Мачта", "Освещение", "mast"
    if group == "zhd-opory-kontaktnoy-seti" and name not in ("Из гнутого швеллера", "Консольные", "Поперечные"):
        return "zhd-opory", "Опоры контактной сети железных дорог", "По серии", "Контактная сеть", "pole"
    if group == "machty-sotovoy-svyazi" and name not in ("Опора двойного назначения", "Радиорелейной связи"):
        return "machty-svyazi", "Мачты и опоры связи", "По серии", "Связь", "mast"
    if group == "svetofornye-opory":
        return "svetofornye-opory", "Светофорные опоры", "По серии", "Дорожная инфраструктура", "pole"
    if group == "prozhektornye-machty":
        return "prozhektornye-machty", "Прожекторные мачты", "Мачта", "Освещение", "mast"
    if group == "molnieotvody":
        return "molnieotvody", "Молниеотводы", "По серии", "Молниезащита", "mast"
    if group == "kronshteyny":
        return "kronshteyny", "Кронштейны", "По серии", "Крепление светильников", "bracket"
    if group == "opory-kontaktnoy-seti":
        return "opory-kontaktnoy-seti", "Опоры контактной сети", "По серии", "Контактная сеть", "pole"
    if group == "svai":
        return "vintovye-svai", "Сваи и элементы свай", "По серии", "Свайные фундаменты", "pile"
    return None


descriptions = {
    "silovye-opory": "Силовая опора освещения серии {name}. При подборе учитываются схема подвеса, ветровой район, высота и способ установки.",
    "nesilovye-opory": "Несиловая опора освещения серии {name}. Высота, кронштейн и монтажное исполнение определяются проектом освещения.",
    "skladyvayushchiesya-opory": "Складывающаяся опора {name}. Механизм опускания и параметры светильника уточняются по проекту площадки.",
    "machty-osveshcheniya": "Осветительная мачта {name}. Для расчёта нужны высота, состав светильников, данные о нагрузках и фундаменте.",
    "zhd-opory": "Опора контактной сети {name}. Конструкция и узлы крепления выбираются по рабочей документации железнодорожного объекта.",
    "machty-svyazi": "Конструкция связи {name}. При расчёте учитываются высота, оборудование и ветровые нагрузки.",
    "svetofornye-opory": "Светофорная опора {name}. Для подбора укажите вылет, состав оборудования и схему перекрёстка.",
    "prozhektornye-machty": "Прожекторная мачта {name}. Высоту и размещение приборов определяет светотехнический расчёт.",
    "molnieotvody": "Молниеотвод {name}. Высота и зона защиты рассчитываются по проекту молниезащиты.",
    "kronshteyny": "{name}. Подбор зависит от посадочного размера, вылета и количества светильников.",
    "opory-kontaktnoy-seti": "Опора контактной сети {name}. Габариты и нагрузки уточняются по проекту линии.",
    "vintovye-svai": "{name}. Длина и исполнение подбираются по нагрузке и инженерно-геологическим данным.",
}

rows = []
with (ROOT / "research/dekart-url-inventory.csv").open(encoding="utf-8-sig", newline="") as stream:
    for record in csv.DictReader(stream):
        url = record["source_url"].rstrip("/")
        name = record["name"].strip()
        path = urlparse(url).path.removeprefix("/shop/")
        data = classify(path, name)
        if not data or url in known_urls or (data[0], name.casefold()) in known_names:
            continue
        category, family, form, purpose, visual = data
        slug = "dekart-" + category + "-" + path.rstrip("/").split("/")[-1].replace("_", "-")
        rows.append({
            "slug": slug,
            "name": name,
            "categorySlug": category,
            "family": family,
            "form": form,
            "purpose": purpose,
            "description": descriptions[category].format(name=name),
            "visual": visual,
            "sourceUrl": url + "/",
        })
        known_urls.add(url)
        known_names.add((category, name.casefold()))

target = ROOT / "src/data/dekart-full.json"
target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Added {len(rows)} models to {target}")
