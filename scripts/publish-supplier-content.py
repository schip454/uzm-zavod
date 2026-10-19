"""Publish only reviewed media and build factual series summaries plus audits."""
import csv,hashlib,json,re,shutil,sys
from collections import defaultdict,Counter
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'src/data';RESEARCH=ROOT/'research'
sys.stdout.reconfigure(encoding='utf8')
def read(path,default=None):return json.loads(path.read_text(encoding='utf8')) if path.exists() else (default if default is not None else {})
def write(path,obj):path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
products=read(DATA/'products.json',[])+read(DATA/'dekart-full.json',[])+read(DATA/'supplier-products.json',[])+read(DATA/'additional-supplier-products.json',[])+read(DATA/'krasznam-products.json',[])
verified=read(DATA/'verified-products.json');source=read(RESEARCH/'supplier-import.json');source.update(read(RESEARCH/'krasznam-image-candidates.json'))
decisions=read(RESEARCH/'image-review-decisions.json');images=read(RESEARCH/'product-image-review.json',[])
image_by_url={x['url']:x for x in images}
dest=ROOT/'public/images/products';dest.mkdir(exist_ok=True)
output=read(DATA/'supplier-content.json');output.update(read(DATA/'krasznam-content.json'))
ledger=[];watermarks=[];by_slug={p['slug']:p for p in products}
for slug,p in by_slug.items():
    row=source.get(slug,{})
    if row.get('name'):p['name']=row['name']
    gallery=[]
    for url in row.get('imageCandidates',[]):
        image=image_by_url.get(url,{})
        name=image.get('sameAs') or image.get('file')
        decision=decisions.get(name,{})
        if decision.get('approved'):
            path=RESEARCH/'source-cache/image-review'/name
            if not path.exists():continue
            shutil.copyfile(path,dest/name)
            local='/images/products/'+name
            if any(x['src']==local for x in gallery):continue
            gallery.append({'src':local,'alt':f'{p["name"]}: изображение {len(gallery)+1}'})
            ledger.append({'productSlug':slug,'productName':p['name'],'sourcePage':row.get('sourceUrl',p.get('sourceUrl','')),'sourceImage':url,'file':local,'reviewedAt':'2026-10-16'})
        elif decision and not decision.get('approved'):
            watermarks.append([p['name'],p['categorySlug'],p.get('sourceUrl',''),url,'Водяной знак или рекламная надпись'])
    if gallery:
        output.setdefault(slug,{}).update({'gallery':gallery,'image':gallery[0]['src']})
    # Only technical sentences from a detail page may become product copy.
    for key in ['description','descriptionBlocks']:
        value=output.get(slug,{}).get(key)
        if value:
            paragraphs=[value] if isinstance(value,str) else value
            paragraphs=[re.sub(r'Для производства (.*?) мы используем',r'Для производства \1 используются',re.sub(r'\s+',' ',x)).strip() for x in paragraphs if not re.search(r'доступная цена|равнодушн|лучш\w+ цен|позвон|закаж|купить|напишите|СМИ о нас|ваш надежный партнер|будем рады|свяжитесь|наши менеджеры',x,re.I)]
            if key=='descriptionBlocks':output[slug][key]=paragraphs
            elif paragraphs:output[slug][key]=paragraphs[0]
            else:output[slug].pop(key,None)
    # Preserve the exact model name; generic supplier breadcrumb titles are not used.
    if row.get('name'):p['name']=row['name']
children=defaultdict(list)
for p in products:
    if p.get('seriesSlug'):children[p['seriesSlug']].append(p)
for slug,models in children.items():
    parent=by_slug.get(slug)
    if not parent:continue
    details=[{**verified.get(p['slug'],{}),**output.get(p['slug'],{})} for p in models]
    fields=defaultdict(list)
    for detail in details:
        for item in detail.get('specifications',[]):fields[item['label']].append(item['value'])
    common=[{'label':label,'value':values[0]} for label,values in fields.items() if len(values)==len(models) and len(set(values))==1]
    columns=[k for k in ['Высота, м','Вес, кг','Установка','Верхний диаметр Ø, мм','Нижний диаметр Ø, мм','Толщина стенки, мм','Нагрузка в верхней точке P, кг'] if k in fields]
    if not columns:columns=list(fields)[:5]
    table=[];urls=[]
    for p,detail in zip(models,details):
        facts={x['label']:x['value'] for x in detail.get('specifications',[])}
        table.append([p['name']]+[facts.get(k,'—') for k in columns]);urls.append('/product/'+p['slug']+'/')
    entry=output.setdefault(slug,{})
    if common:entry['specifications']=common;entry['specificationTitle']='Общие характеристики серии'
    if columns:entry['variantTable']={'headers':['Модель']+columns,'rows':table,'urls':urls}
    if not entry.get('descriptionBlocks'):
        intro=f'{parent["family"]}, серия {parent["name"]}. В каталоге представлены {len(models)} исполнений. Размеры, масса и монтажные параметры каждого исполнения приведены в его карточке.'
        entry['description']=intro;entry['descriptionBlocks']=[intro]
    if not entry.get('gallery'):
        example=next((x for x in details if x.get('gallery')),None)
        if example:entry['gallery']=example['gallery'];entry['image']=example['gallery'][0]['src']
# Where the supplier publishes only structured fields, use those exact fields
# for the introduction instead of fabricating a technical narrative.
for slug,p in by_slug.items():
    entry=output.setdefault(slug,{})
    if entry.get('description') or entry.get('descriptionBlocks') or p.get('description'):continue
    facts=entry.get('specifications') or verified.get(slug,{}).get('specifications') or p.get('specifications') or []
    if not facts:continue
    lines=[f"{x['label']}: {x['value']}" for x in facts[:4]]
    entry['description']=p['name']+'. '+'. '.join(lines)+'.'
    entry['descriptionBlocks']=[entry['description']]
write(DATA/'supplier-content.json',output)
write(RESEARCH/'published-product-images.json',ledger)
with (RESEARCH/'Запрос_фото_без_водяных_знаков.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f,delimiter=';');w.writerow(['Изделие','Раздел','Страница поставщика','Изображение поставщика','Причина запроса'])
    w.writerows(sorted(set(tuple(x) for x in watermarks)))
with (RESEARCH/'supplier-coverage.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f);w.writerow(['Supplier','Source pages with named products','Discovered unique product URLs','Imported product URLs','Missing URLs'])
    inventories=read(RESEARCH/'supplier-inventory.json',[])+read(RESEARCH/'other-supplier-inventory.json',[])
    groups=defaultdict(list)
    for r in inventories:groups[urlparse(r.get('sourceUrl','')).netloc].append(r)
    imported={output.get(p['slug'],{}).get('sourceUrl',p.get('sourceUrl')) for p in products}
    for host,records in groups.items():
        found={x['url'] for r in records for x in r.get('items',[])}
        w.writerow([host,len(records),len(found),len(found&imported),len(found-imported)])
    for host, paths in [
        ('klassik-elektro.ru', {p.get('sourceUrl') for p in products if 'klassik-elektro.ru' in p.get('sourceUrl','')}),
        ('svetplast.ru', {r['url'] for r in read(RESEARCH/'svetplast-inventory.json',[]) if '?' not in r['url'] and r['url'].rstrip('/').split('/')[-1]!='tsokolya'}),
        ('krasznam.ru', {r['url'] for r in read(RESEARCH/'krasznam-inventory.json',[])}),
        ('batissur.ru', {'https://batissur.ru/catalog/ant-dron/ant-dron-1/'}),
    ]:
        imported_for_host=imported | ({'https://batissur.ru/catalog/ant-dron/ant-dron-1/'} if host=='batissur.ru' else set())
        w.writerow([host,1,len(paths),len(paths&imported_for_host),len(paths-imported_for_host)])
print(f'{len(products)} product records; {len(ledger)} published image associations; {len(set(x[2] for x in watermarks))} pages requiring clean images')
