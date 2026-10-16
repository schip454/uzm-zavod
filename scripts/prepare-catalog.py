"""Build the first content registry from customer-confirmed families and sources.
Run explicitly to refresh research data. Website builds never fetch suppliers.
"""
import concurrent.futures
import csv
import hashlib
import json
import re
import runpy
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
collect = runpy.run_path(str(ROOT / "scripts/collect-catalog-sources.py"))["collect"]
sources = json.loads((ROOT / "research/customer-sources.json").read_text(encoding="utf-8"))
registry = list(csv.DictReader((ROOT / "research/dekart-url-inventory.csv").open(encoding="utf-8-sig")))
rows = []

def add(slug, name, category, family, form, purpose, description, visual, url=""):
    rows.append(dict(slug=slug, name=name, categorySlug=category, family=family, form=form, purpose=purpose, description=description, visual=visual, sourceUrl=url))

def series(names, category, family, form, purpose, path):
    for name in names:
        found = next((r for r in registry if r["name"].casefold() == name.casefold() and path in r["source_url"]), None)
        if not found:
            nav = sources[1]['links']
            other = next((l for l in nav if l['text'].endswith(' ' + name)), None)
            slug = {'СП':'sp','ОС':'os','ОСф':'osf','ОТ':'ot','ОТф':'otf','ОП':'op','ОКС':'oks','НП':'np','ТП':'tp','ТФ':'tf','РМГ':'rmg','РМП':'rmp','РМТ':'rmt','МС':'molnieotvod-ms'}.get(name)
            if slug:
                add(slug, name, category, family, form, purpose, f"Серия {name}. Исполнение и монтажные размеры выбираются по спецификации проекта.", 'frame' if form == 'Рама' else 'pole', other['url'] if other else '')
            else: print("REVIEW missing source", name, path)
            continue
        slug = found["source_url"].rstrip('/').split('/')[-1]
        slug = {'СФ':'sf','НФ':'nf'}.get(name, slug)
        if any(r["slug"] == slug for r in rows): slug = category + "-" + slug
        add(slug, name, category, family, form, purpose, f"{family}: серия {name}. Исполнение, высота и монтажные размеры выбираются по спецификации проекта.", "mast" if form == "Мачта" else "frame" if form == "Рама" else "pole", found["source_url"])

series(["ОГС", "СФГ", "ОГСф", "СПГ"], "silovye-opory", "Силовые гранёные", "Гранёная", "Силовая", "/silovye/granenye/")
series(["ОККС"], "silovye-opory", "Силовые круглоконические", "Круглоконическая", "Силовая", "/silovye/kruglokonicheskie/")
series(["СФ", "СП", "ОС", "ОСф"], "silovye-opory", "Силовые трубчатые", "Трубчатая", "Силовая", "/silovye/trubchatye/")
series(["ОГК", "ОГКф", "НФГ", "НПГ", "ОНО"], "nesilovye-opory", "Несиловые гранёные", "Гранёная", "Несиловая", "/nesilovye/granenye/")
series(["НФК", "ОКК", "ОМК", "НПК"], "nesilovye-opory", "Несиловые круглоконические", "Круглоконическая", "Несиловая", "/nesilovye/kruglokonicheskie/")
series(["ОТ", "ОТф", "ОП", "ОКС", "НП", "НФ"], "nesilovye-opory", "Несиловые трубчатые", "Трубчатая", "Несиловая", "/nesilovye/trubchatye/")
series(["ОГКС"], "skladyvayushchiesya-opory", "Складывающиеся гранёные", "Гранёная", "Складывающаяся", "/skladyvayuschiesya/")
add("soos", "СООС", "skladyvayushchiesya-opory", "Складывающиеся опоры", "По спецификации", "Складывающаяся", "Складывающаяся опора серии СООС. Для подбора исполнения укажите высоту, светильник и условия установки.", "pole")
series(["МГФ", "ВМО", "ВМОН", "МС-С"], "machty-osveshcheniya", "Мачты освещения", "Мачта", "Освещение", "/machty-osvescheniya/")
add('pms','ПМС','prozhektornye-machty','Прожекторные мачты','Мачта','Освещение','Прожекторная мачта для освещения больших территорий. Высота, количество прожекторов и фундамент определяются проектом.','mast',next(l['url'] for l in sources[1]['links'] if l['text'] == 'Прожекторные мачты ПМС'))
series(["ОГСГ", "ОКСГ", "ОСФГ", "СОДГ", "СС"], "svetofornye-opory", "Светофорные опоры", "По серии", "Дорожная инфраструктура", "/svetofornye-opory/")
series(["РМГ", "РМП", "РМТ"], "ramnye-opory", "Рамные опоры", "Рама", "Дорожные знаки", "/ramnye-opory/")
series(["МОГК"], "molnieotvody", "Молниеотводы", "Мачта", "Молниезащита", "/molnieotvody/")
add('molnieotvod-sm', 'СМ', 'molnieotvody', 'Молниеотводы', 'По спецификации', 'Молниезащита', 'Молниеотвод серии СМ. Высота и конструкция определяются проектом молниезащиты.', 'mast')
series(["ТП", "ТФ", "ТФГ"], "opory-kontaktnoy-seti", "Опоры контактной сети", "Трубчатая", "Контактная сеть", "/opory-kontaktnoy-seti/")

def source(part): return next(s for s in sources if part in s['url'])
def unique_links(page, predicate):
    seen = set()
    for link in page['links']:
        if link['url'] not in seen and predicate(link):
            seen.add(link['url']); yield link

# Use the catalog's product links, not marketing links or related products.
for l in unique_links(source('klassik'), lambda l: '/svetilniki/parkovye/' in l['url'] and len(urlparse(l['url']).path.strip('/').split('/')) == 3):
    name = l['text']
    if name.startswith(('Лира ', 'Легенда ')): continue  # Navigation provides the canonical short series name.
    if name == 'Пушкинский ретро': name = 'Пушкинский Ретро'
    add('light-' + l['url'].rstrip('/').split('/')[-1], name, 'parkovye-svetilniki', 'Парковые светильники', 'По серии', 'Парковое освещение', f"Парковый светильник «{name}» для благоустройства садов, парков и пешеходных зон. Источник света, крепление и цвет корпуса укажите в заявке.", 'luminaire', l['url'])

park_page2 = collect('https://dekart.tech/shop/dekorativnye-opory/?PAGEN_1=2')
park_pages = {'links': source('dekart')['links'] + park_page2.get('links', [])}
for l in unique_links(park_pages, lambda l: l['url'].startswith('https://dekart.tech/shop/dekorativnye-opory/') and l['text'].startswith(('Парковая опора ', 'Декоративная опора ', 'Ландшафтный светильник '))):
    name = re.sub(r'^(Парковая опора|Декоративная опора|Ландшафтный светильник) ', '', l['text'])
    family = 'Ландшафтные светильники' if l['text'].startswith('Ландшафтный') else 'Парковые опоры'
    add('park-' + l['url'].rstrip('/').split('/')[-1], name, 'parkovye-opory', family, 'По серии', 'Парковое освещение', f"{l['text']} для парков, жилых кварталов и пешеходных пространств. Высота, покрытие и комплектация подбираются под проект.", 'luminaire' if family.startswith('Ландшафтные') else 'pole', l['url'])

for l in unique_links(source('opory-lep-metallicheskie'), lambda l: 'опора ' in l['text'] and re.search(r'[А-Яа-я]+10-\d', l['text']) and l['url'].startswith('https://toenergo.ru/catalog/')):
    add('vl-' + l['url'].rstrip('/').split('/')[-1], l['text'], 'opory-lep', 'Металлические опоры ВЛ', 'По серии', 'Воздушные линии', 'Опора воздушной линии электропередачи. Для расчёта укажите марку, количество и приложите рабочую спецификацию.', 'frame', l['url'])

for l in unique_links(source('svai-omk'), lambda l: '/cat/vintovye-svai-' in l['url'] and len(urlparse(l['url']).path.strip('/').split('/')) == 2):
    name = l['text'].removeprefix('СВАИ ').strip()
    add('pile-' + l['url'].rstrip('/').split('/')[-1], name, 'vintovye-svai', 'Винтовые сваи', 'По серии', 'Свайные фундаменты', f"Винтовая свая {name}. Длина, диаметр, наконечник и покрытие выбираются по нагрузкам и характеристикам грунта.", 'pile', l['url'])
add('zabivnaya-svaya', 'Металлические забивные сваи', 'zabivnye-svai', 'Забивные сваи', 'По чертежу', 'Свайные фундаменты', 'Стальные сваи для погружения забивкой. Для расчёта нужны сечение, длина, количество и проект фундамента.', 'pile', 'https://svai-omk.ru/cat/svai/')

for slug, name, urlpart in [('ankernye', 'Анкерные закладные детали', 'ankernye-zakladnye-detali'), ('trubchatye', 'Трубчатые закладные детали', 'zakladnye-detali-trubchatogo-tipa'), ('vynosnye', 'Выносные закладные детали', 'zakladnye-detali-trubchatogo-tipa-vynosnye'), ('konsolnye', 'Консольные закладные детали', 'zakladnye-detali-trubchatogo-tipa-konsolnye')]:
    l = next((l for l in source('zakladnie-detali')['links'] if l['text'] == name or urlpart + '/' in l['url']), None)
    add('foundation-' + slug, name, 'zakladnye-detali', 'Закладные детали фундамента', 'Анкерная' if slug == 'ankernye' else 'Трубчатая', 'Фланцевый монтаж', 'Фундаментный элемент для установки фланцевой опоры. Геометрия, глубина заложения и анкерные элементы подбираются по опоре и расчёту нагрузок.', 'foundation', l['url'] if l else source('zakladnie-detali')['url'])
for l in unique_links(source('kronsteiny'), lambda l: l['text'] in ['Консольные кронштейны', 'Настенные кронштейны', 'Подвесные кронштейны', 'Прожекторные кронштейны', 'Торшерные кронштейны для парковых светильников']):
    add('bracket-' + l['url'].rstrip('/').split('/')[-1], l['text'], 'kronshteyny', 'Кронштейны', 'По серии', 'Крепление светильников', 'Кронштейн для размещения светильников. Для подбора укажите количество приборов, посадочный размер, высоту, вылет и угол наклона.', 'bracket', l['url'])

for slug, name, form in [('nepodvizhnye','Неподвижные опоры','Неподвижная'), ('podvizhnye','Подвижные опоры','Подвижная'), ('skolzyashchie','Скользящие опоры','Скользящая'), ('napravlyayushchie','Направляющие опоры','Направляющая'), ('ppu-nepodvizhnye','Неподвижные опоры трубопроводов в ППУ-изоляции','Неподвижная'), ('ppu-skolzyashchie','Скользящие опоры трубопроводов в ППУ-изоляции','Скользящая')]:
    add('pipe-support-' + slug, name, 'opory-truboprovodov', 'Опоры трубопроводов', form, 'Трубопроводы', 'Опорный элемент трубопровода. Диаметр, конструктивное исполнение и серия выбираются по рабочей документации, нагрузкам и температурным перемещениям трубы.', 'pipe', 'https://krasznam.ru/catalog/opory-truboprovodov/')
for slug, name in [('pe','Трубы ППУ в ПЭ-оболочке'), ('oc','Трубы ППУ в ОЦ-оболочке'), ('otvody','Отводы в ППУ-изоляции'), ('troyniki','Тройники в ППУ-изоляции'), ('perekhody','Переходы в ППУ-изоляции')]:
    add('ppu-' + slug, name, 'truby-ppu', 'Трубы и фасонные изделия', 'По спецификации', 'Тепловые сети', 'Элемент трубопровода с пенополиуретановой теплоизоляцией. Диаметр, защитная оболочка и размеры определяются спецификацией тепловой сети.', 'pipe', 'https://krasznam.ru/pipe')

# Named by the customer; exact heights and model documentation remain to be supplied.
add('odn','ОДН','opory-dvoynogo-naznacheniya','Опоры двойного назначения','По проекту','Освещение и связь','Опора для совместного размещения осветительного и телекоммуникационного оборудования. Высота, нагрузки и размещение оборудования определяются проектом.','pole')
for slug, name, purpose in [('karkasy','Каркасы зданий','Здания и сооружения'), ('fermy','Стальные фермы','Несущие конструкции'), ('kolonny','Металлические колонны','Несущие конструкции'), ('balki','Стальные балки','Несущие конструкции')]:
    add(slug,name,'metallokonstruktsii','Строительные металлоконструкции','По чертежу',purpose,'Изготавливаем по проектной документации. Для расчёта приложите чертежи КМ или КМД, ведомость металла и требования к покрытию.','structure','https://uzmzavod.ru/')
for slug, name in [('ploshchadki','Площадки обслуживания'),('lestnitsy','Технологические лестницы'),('mostiki','Переходные мостики'),('estakady','Эстакады'),('opornye-konstruktsii','Опорные конструкции под оборудование')]:
    add(slug,name,'tekhnologicheskie-metallokonstruktsii','Технологические металлоконструкции','По чертежу','Промышленные объекты','Конструкции для размещения оборудования и доступа к нему. Размеры, нагрузки, ограждения и узлы крепления определяются рабочим проектом.','structure')

for slug, name, form in [('d220-425-h540','D-220×425 H-540','Круглый'),('d220-h1500','D-220 H-1500 (Ц5)','Круглый'),('d220-276-530-h240','D-220(276)×530 H-240','Круглый'),('d220-440-h500','D-220×440 H-500','Круглый'),('d140-420-h540','D-140×420 H-540','Круглый'),('d276-h1510','D-276 H-1510','Круглый'),('d276-425-h540','D-276×425 H-540','Круглый'),('8gr-h560','Восьмигранный H-560','Восьмигранный'),('kaliningrad','Калининград','Декоративный'),('mostrans','МОСТРАНС','Декоративный')]:
    add('base-'+slug,name,'tsokoli','Стеклопластиковые цоколи',form,'Защита основания опоры','Стеклопластиковый цоколь для оформления основания опоры и защиты монтажного узла. Совместимость проверяется по диаметру ствола и размерам фланца.','base','https://svetplast.ru/catalog/tsokolya/')

def enrich(row):
    if not row['sourceUrl'] or row['sourceUrl'] in ['https://uzmzavod.ru/', 'https://krasznam.ru/pipe', 'https://svetplast.ru/catalog/tsokolya/'] or row['slug'].startswith('pipe-support-'): return row
    page = collect(row['sourceUrl'])
    if page.get('error'): row['importIssue'] = page['error']; return row
    images = page.get('images', [])
    candidates = [i for i in images if any(s in i.get('class','') for s in ['wp-post-image','woocommerce-main-image']) or i.get('itemprop') == 'image']
    if 'dekart.tech' in row['sourceUrl']:
        # Keep the supplier images in the source cache for editorial review.
        # Many carry the supplier's visible watermark or are generic banners.
        return row
    if 'toenergo.ru' in row['sourceUrl']:
        # The model drawings and product renders have a large Toenergo watermark.
        return row
    if 'klassik' in row['sourceUrl']:
        if row['name'] not in ['Лира', 'Легенда']:
            # Visual review 2026-10-16: other listing images have watermarks
            # or text overlays. Wait for clean originals before publishing.
            return row
        listing = collect('https://klassik-elektro.ru/svetilniki/parkovye/')
        linked = [i for i in listing.get('images', []) if i.get('linkedTo') and i['linkedTo'].rstrip('/').split('/')[-1] == row['sourceUrl'].rstrip('/').split('/')[-1]]
        candidates = [i for i in images if i.get('afterHeading') and '/wp-content/uploads/' in i.get('src','') and not any(s in i['src'] for s in ['logo','favicon']) and 'mc.yandex' not in i['src']]
        if linked: candidates = linked
    candidate = candidates[0].get('src') if candidates else None
    if candidate and not any(s in candidate.lower() for s in ['logo','favicon','.svg','data:']):
        ext = Path(urlparse(candidate).path).suffix.lower()
        if ext not in ['.jpg','.jpeg','.png','.webp']: return row
        filename = hashlib.sha256(candidate.encode()).hexdigest()[:16] + ext
        target = ROOT / 'public/images/catalog' / filename
        try:
            if not target.exists():
                request = urllib.request.Request(candidate, headers={'User-Agent':'Mozilla/5.0'})
                with urllib.request.urlopen(request, timeout=25) as response:
                    content_type = response.headers.get('Content-Type','')
                    data = response.read(8_000_001)
                if not content_type.startswith('image/') or len(data) > 8_000_000: return row
                target.write_bytes(data)
            row['image'] = '/images/catalog/' + filename
            row['imageSource'] = candidate
        except Exception as error: row['importIssue'] = str(error)
    return row

if __name__ == '__main__':
    (ROOT / 'public/images/catalog').mkdir(parents=True,exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: rows = list(pool.map(enrich, rows))
    # Keep research-only fields out of the browser bundle.
    (ROOT / 'research/content-registry.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2),encoding='utf-8')
    clean = [{k:v for k,v in row.items() if k not in ['importIssue','imageSource']} for row in rows]
    assert len({r['slug'] for r in clean}) == len(clean), 'Duplicate product URL'
    (ROOT / 'src/data/products.json').write_text(json.dumps(clean, ensure_ascii=False, indent=2),encoding='utf-8')
    print('Products:', len(rows), 'Images:', sum(bool(r.get('image')) for r in rows))
    for row in rows:
        if row.get('importIssue'): print('REVIEW', row['slug'], row['importIssue'])
