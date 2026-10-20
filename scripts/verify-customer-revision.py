"""Verify the live registry against the customer workbook and PDF source rows."""
import csv
import json
import re
import sys
from pathlib import Path
import openpyxl

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'research/source-cache/customer-2026-10-20'
sys.stdout.reconfigure(encoding='utf-8')
def read(path):return json.loads(path.read_text('utf-8'))
registry=read(ROOT/'research/active-catalog.json')
products=registry['products']; by_slug={p['slug']:p for p in products}
errors=[]
if len(by_slug)!=len(products):errors.append('Duplicate active slugs')
workbook=openpyxl.load_workbook(CACHE/'Тех характеристики ОГК (1).xlsx',data_only=True)
expected=list(workbook.active.values)[1:]
actual=[p for p in products if re.fullmatch(r'ogk-\d+',p['slug'])]
if len(expected)!=len(actual):errors.append('OGK size list differs from customer workbook')
for row in expected:
    slug='ogk-'+str(row[1]);p=by_slug.get(slug,{})
    facts={f['label']:f['value'] for f in p.get('specifications',[])}
    for label,value in [('Высота, м',row[1]),('Верхний диаметр, мм',row[2]),('Нижний диаметр, мм',row[3]),('Толщина стенки, мм',row[4]),('Форма фланца',row[5]),('Габарит фланца, мм',row[6]),('Межцентровое расстояние, мм',row[7]),('Отверстий, шт.',row[8]),('Диаметр отверстий, мм',row[9]),('Толщина фланца, мм',row[10])]:
        if facts.get(label)!=str(value):errors.append(f'{slug}: {label} differs from workbook')
pdf=(CACHE/'sf-sp-text.txt').read_text('utf-8')
for slug,prefix in [('sf','СФ'),('sp','СП')]:
    expected_pdf=[line.split() for line in pdf.splitlines() if re.match(r'МСД-\S+\s+'+prefix+r'-',line)]
    table=by_slug[slug]['variantTable']
    if len(table['rows'])!=len(expected_pdf):errors.append(f'{slug}: lost PDF rows')
    for cells,source in zip(table['rows'],expected_pdf):
        if cells[:6]!=source[:6]:errors.append(f'{slug}: PDF designation, mass, load, mount or diameters changed')
        if slug=='sf' and cells[6:]!=source[6:9]+[' '.join(source[9:11]),source[11]]:errors.append('SF flange or foundation mismatch')
        if slug=='sp' and cells[6:]!=source[6:7]:errors.append('SP embedment mismatch')
power=read(CACHE/'power-products.json')
for series in ['sfg','ogs','osf','os','sp']:
    expected_urls={p['sourceUrl'] for p in power if p['seriesSlug']==series}
    actual_urls={p.get('sourceUrl') for p in products if p.get('seriesSlug')==series and 'toenergo.ru' in (p.get('sourceUrl') or '')}
    if expected_urls!=actual_urls:errors.append(f'{series}: assortment differs from approved supplier')
lights=[p for p in products if p['slug'].startswith('klassiksk-')]
if len(lights)!=352:errors.append('Klassiksk assortment is incomplete')
if len([p for p in products if p['slug'].startswith('aldeks-')])!=8:errors.append('Aldeks assortment is incomplete')
for p in products:
    if p.get('seriesSlug') and p['seriesSlug'] not in by_slug:errors.append('Missing parent: '+p['slug'])
    for item in p.get('gallery') or []:
        if not (ROOT/'public'/item['src'].lstrip('/')).is_file():errors.append('Missing image '+item['src'])
    if p.get('image') and not (ROOT/'public'/p['image'].lstrip('/')).is_file():errors.append('Missing main image '+p['slug'])
    table=p.get('variantTable') or {}
    if any(len(row)!=len(table['headers']) for row in table.get('rows',[])):errors.append('Unaligned table '+p['slug'])
    for url in table.get('urls',[]):
        if url.strip('/').split('/')[-1] not in by_slug:errors.append('Broken table link '+url)
    if '--export' in sys.argv and not (ROOT/'out/product'/p['slug']/'index.html').is_file():errors.append('Missing export '+p['slug'])
rejected=read(CACHE/'new-media-rejected.json')
source_rows=read(CACHE/'klassiksk-listings.json')
requests=[]
for row in source_rows:
    if row['image'] in rejected:
        if 'Цвет изображения' in rejected[row['image']] and 'бронза' in row['name'].lower():continue
        requests.append([row['name'],row['url'],rejected[row['image']],'Фото этой модели без водяного знака'])
with (ROOT/'research/Фото_к_правкам_20_октября.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f,delimiter=';');writer.writerow(['Изделие','Источник','Причина','Что запросить']);writer.writerows(requests)
result={'activeProducts':len(products),'retiredUrls':len(registry['retiredProducts']),'ogkModels':len(actual),'sfRows':len(by_slug['sf']['variantTable']['rows']),'spRows':len(by_slug['sp']['variantTable']['rows']),'parkLights':len(lights),'parkLightsWithPhotos':sum(bool(p.get('image')) for p in lights),'photoRequests':len(requests),'errors':errors}
(ROOT/'research/customer-revision-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n','utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
if errors:sys.exit(1)
