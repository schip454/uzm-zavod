"""Import exact product pages, preserving source URLs and a review queue for images.

Run with the project-local BeautifulSoup/Pillow dependencies. No dimensions are
inferred from model names. Images remain unpublished until visually reviewed.
"""
import concurrent.futures
import csv
import hashlib
import json
import re
import sys
import time
import urllib.request
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'research/source-cache/python-libs'))
sys.stdout.reconfigure(encoding='utf-8')
from bs4 import BeautifulSoup

CACHE = ROOT / 'research/source-cache'
DATA = ROOT / 'src/data'
REPORT = ROOT / 'research/supplier-import.json'

def clean(node):
    return ' '.join(node.get_text(' ', strip=True).split()) if node else ''

def fetch(url):
    target = CACHE / (hashlib.sha256(url.encode()).hexdigest()[:16] + '.html')
    if target.exists() and target.stat().st_size > 3000:
        return BeautifulSoup(target.read_text(encoding='utf-8'), 'html.parser')
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=25) as response:
                html = response.read().decode('utf-8', 'replace')
            target.write_text(html, encoding='utf-8')
            soup = BeautifulSoup(html, 'html.parser')
            if not soup.find('h1'): raise ValueError('Source has no product heading')
            return soup
        except Exception:
            if attempt == 2: raise
            time.sleep(1)

def inventory(product):
    url = product.get('sourceUrl', '')
    record = {'slug': product['slug'], 'sourceUrl': url, 'items': [], 'pages': []}
    if not url: return record
    try:
        soup = fetch(url)
        pages = {url}
        # Follow only pagination exposed by this exact catalog page.
        if any(h in url for h in ['dekart.tech','toenergo.ru','svai-omk.ru']):
            pages.update(urljoin(url, a['href']) for a in soup.select('a[href]') if 'PAGEN_' in a['href'] and urlparse(urljoin(url,a['href'])).netloc == urlparse(url).netloc and urlparse(urljoin(url,a['href'])).path == urlparse(url).path)
            if 'svai-omk' in url: pages.update(urljoin(url,a['href']) for a in soup.select('a.page-numbers[href]'))
        visited=set()
        while pages-visited:
            page=sorted(pages-visited)[0]
            visited.add(page)
            doc = soup if page == url else fetch(page)
            record['pages'].append(page)
            pages.update(urljoin(page,a['href']) for a in doc.select('a[href]') if 'PAGEN_' in a['href'] and urlparse(urljoin(page,a['href'])).netloc==urlparse(url).netloc and urlparse(urljoin(page,a['href'])).path==urlparse(url).path)
            selector = '.product-name[href]' if 'dekart.tech' in url else 'article.product .entry-title a[href]' if 'svai-omk' in url else '.category__item a.category__title[href]'
            links = doc.select(selector)
            for a in links:
                href = urljoin(page, a['href'])
                if clean(a) and href != url:
                    record['items'].append({'name': clean(a), 'url': href})
        record['items'] = list({x['url']: x for x in record['items']}.values())
    except Exception as e: record['error'] = str(e)
    return record

def extract(product):
    url = product.get('sourceUrl', '')
    result = {'slug': product['slug'], 'sourceUrl': url, 'imageCandidates': []}
    if not url: return result
    try:
        soup = fetch(url)
        specs = []
        paragraphs = []
        images = []
        # These selectors are specific to actual detail blocks, never nav cards.
        for row in soup.select('.feature-row'):
            label, value = clean(row.select_one('.feature-name')), clean(row.select_one('.feature-subname'))
            if label and value: specs.append({'label':label, 'value':value})
        for row in soup.select('.props__item, .props__row'):
            label, value = clean(row.select_one('.props__name')), clean(row.select_one('.props__value'))
            if label and value: specs.append({'label':label, 'value':value})
        if not specs:
            names, values = soup.select('.props__name'), soup.select('.props__value')
            if len(names) == len(values): specs.extend({'label':clean(k), 'value':clean(v)} for k,v in zip(names, values) if clean(k) and clean(v))
        for table in soup.select('.tab-pane table, .woocommerce-product-attributes, .product-characteristics table'):
            for row in table.select('tr'):
                cells=row.find_all(['th','td'],recursive=False)
                if len(cells)==2 and not row.select('img'):
                    label,value=map(clean,cells)
                    if label and value and len(label)<100 and len(value)<350: specs.append({'label':label,'value':value})
        for row in soup.select('table.variations tr'):
            label=clean(row.select_one('label'))
            values=[clean(o) for o in row.select('option[value]') if o.get('value')]
            if label and values:specs.append({'label':label,'value':', '.join(dict.fromkeys(values))})
        if 'dekart.tech' in url:
            blocks=soup.select('.tab-pane:not(#panel-1), .industry-content__description')
            images=[urljoin(url,a['href']) for a in soup.select('.card-swiper a.glightbox[href]')]
            images += [urljoin(url,i.get('src','')) for b in blocks for i in b.select('img[src]')]
        elif 'toenergo.ru' in url:
            blocks=soup.select('.detail__text, .catalog-detail__text, .product__description, .tabs__content .text-page, .text-page')
            images=[urljoin(url,a['href']) for a in soup.select('a.fancybox[href],a[data-fancybox][href]') if re.search(r'\.(jpg|png|jpeg|webp)$',a['href'],re.I)]
        elif 'klassik-elektro' in url:
            blocks=soup.select('.pageContent')
            images=[urljoin(url,i.get('src','')) for b in blocks for i in b.select('img')]
        elif 'svai-omk' in url:
            blocks=soup.select('.term-description,.woocommerce-Tabs-panel--description,.woocommerce-product-details__short-description')
            images=[urljoin(url,a['href']) for a in soup.select('.woocommerce-product-gallery__image a[href]')]
        elif 'svetplast' in url:
            blocks=soup.select('[itemprop=description],.product-detail-description,.detail_text,.detail-text')
            for row in soup.select('.props .char'):
                label,value=clean(row.select_one('.char-name')),clean(row.select_one('.char-value'))
                if label and value:specs.append({'label':label,'value':value})
            og=soup.select_one('meta[property="og:image"]')
            images=([urljoin(url,og['content'])] if og else [])+[urljoin(url,i['src']) for i in soup.select('[id$=big_slider] img[src]')]
            images=[re.sub(r'/upload/resize_cache/iblock/([^/]+)/[^/]+/',r'/upload/iblock/\1/',u) for u in images]
        elif 'batissur' in url:
            blocks=soup.select('main .text,main .content, .product-description, .product_description')
        else: blocks=[]
        for block in blocks:
            for p in block.select('p,li'):
                text=clean(p)
                if len(text)<(2 if p.name=='li' else 25) or len(text)>1800: continue
                if re.search(r'Декарт|Точка опоры|Классик|Batissur|Батиссур|будем рады|свяжитесь|менеджер|бесплатн|купить|в наличии|низк\w+ цен|руб\.|заказ\w+ (сайт|телефон)|Пн-Пт|отзыв|©|cookie|доставк\w+ по город',text,re.I): continue
                if text not in paragraphs: paragraphs.append(text)
        if specs:
            result['specifications']=list({x['label']:x for x in specs}.values())
            result['specificationTitle']='Характеристики'
        if paragraphs:
            result['descriptionBlocks']=paragraphs
            result['description']=paragraphs[0]
        result['imageCandidates']=list(dict.fromkeys(u for u in images if re.search(r'\.(jpg|jpeg|webp|png)(\?|$)',u,re.I) and not re.search(r'logo|favicon|banner|icon',u,re.I)))
        result['sourceTitle']=clean(soup.find('h1'))
        if 'svetplast' in url and '/tsokolya/' in url and url.rstrip('/').split('/')[-1]!='tsokolya':result['name']=result['sourceTitle']
        # A factual introduction derived exclusively from named source fields.
        if specs and not paragraphs:
            facts = {x['label']:x['value'] for x in specs}
            fragments=[]
            for k in ['Сечение','Установка','Назначение','Марка стали','Защитное покрытие','Высота, м']:
                if facts.get(k): fragments.append(f'{k}: {facts[k]}'+(' м' if k=='Высота, м' else ''))
            if fragments:
                result['description']=product['name']+'. '+'. '.join(fragments)+'.'
                result['descriptionBlocks']=[result['description']]
        result['checkedAt']='2026-10-16'
    except Exception as e: result['error']=str(e)
    return result

def write(path, value): path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main():
    seeds=json.loads((DATA/'products.json').read_text(encoding='utf-8'))+json.loads((DATA/'dekart-full.json').read_text(encoding='utf-8'))
    extra=DATA/'additional-supplier-products.json'
    if extra.exists():seeds+=json.loads(extra.read_text(encoding='utf8'))
    updates=ROOT/'research/legacy-source-updates.json'
    if updates.exists():
        updates=json.loads(updates.read_text(encoding='utf8'))
        seeds=[{**p,**updates.get(p['slug'],{})} for p in seeds]
    # Also inspect grouping/facet pages from the complete published navigation;
    # some products are absent from the named series pages.
    known_seed_urls={p.get('sourceUrl','').rstrip('/') for p in seeds}
    discovery=[]
    for r in csv.DictReader((ROOT/'research/dekart-url-inventory.csv').open(encoding='utf-8-sig')):
        url=r['source_url']
        if url.rstrip('/') in known_seed_urls:continue
        path=urlparse(url).path
        if '/opory-osvescheniya/' in path:
            category='skladyvayushchiesya-opory' if 'skladyvayuschiesya' in path else 'nesilovye-opory' if 'nesilovye' in path else 'silovye-opory'
        else:
            category=next((cat for part,cat in [('dekorativnye-opory','parkovye-opory'),('machty-osvescheniya','machty-osveshcheniya'),('zhd-opory','zhd-opory'),('machty-sotovoy','machty-svyazi'),('opory-lep','opory-lep'),('prozhektornye','prozhektornye-machty'),('opory-dlya-dorozhnykh','ramnye-opory')] if part in path),None)
        if category:discovery.append({'slug':'discovery-'+hashlib.sha256(url.encode()).hexdigest()[:12],'sourceUrl':url,'name':r['name'],'categorySlug':category,'family':r['name'],'form':'По модели','purpose':'По назначению серии','visual':'pole','discoverOnly':True})
    # Broad series list from the site is used only for discovery, with all detail
    # pages linked back to the exact source series and the existing UZM category.
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        inventories=list(pool.map(inventory,[p for p in seeds+discovery if 'dekart.tech' in p.get('sourceUrl','')]))
    write(ROOT/'research/supplier-inventory.json',inventories)
    by_slug={p['slug']:p for p in seeds+discovery}
    known_urls={p.get('sourceUrl',''):p for p in seeds}
    new={}
    for record in inventories:
        parent=by_slug[record['slug']]
        for item in record['items']:
            if item['url'] in known_urls: continue
            slug='dk-'+urlparse(item['url']).path.rstrip('/').split('/')[-1]
            if slug in new and new[slug]['sourceUrl']!=item['url']:slug+='-'+hashlib.sha256(item['url'].encode()).hexdigest()[:6]
            new.setdefault(slug,{**{k:parent[k] for k in ['categorySlug','family','form','purpose','visual'] if k in parent},'slug':slug,'name':item['name'],'sourceUrl':item['url'],**({'seriesSlug':parent['slug']} if not parent.get('discoverOnly') else {})})
    write(DATA/'supplier-products.json',list(new.values()))
    items=seeds+list(new.values())
    previous=json.loads(REPORT.read_text(encoding='utf-8')) if REPORT.exists() else {}
    pending=[p for p in items if p['slug'] not in previous or previous[p['slug']].get('error')] if '--only-new' in sys.argv else items
    print(f'Discovered {len(new)} individual products; extracting {len(pending)} pages',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for n,result in enumerate(pool.map(extract,pending),1):
            previous[result['slug']]=result
            if n%30==0:
                write(REPORT,previous);print(f'Extracted {n}/{len(pending)}',flush=True)
    write(REPORT,previous)
    publish={slug:{k:v for k,v in row.items() if k in ['name','sourceUrl','description','descriptionBlocks','specifications','specificationTitle']} for slug,row in previous.items()}
    write(DATA/'supplier-content.json',publish)
    print(f'Finished: {len(publish)} records, {sum(bool(x.get("specifications")) for x in publish.values())} with exact fields',flush=True)

if __name__=='__main__': main()
