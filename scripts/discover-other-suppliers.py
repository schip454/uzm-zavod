"""Discover approved Toenergo/OMK ranges and all Svetplast plinth models."""
import concurrent.futures
import hashlib
import importlib.util
import json
from pathlib import Path
from urllib.parse import urljoin,urlparse
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('supplier_import',ROOT/'scripts/import-supplier-content.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
base=json.loads((ROOT/'src/data/products.json').read_text(encoding='utf8'))
existing_updates=json.loads((ROOT/'research/legacy-source-updates.json').read_text(encoding='utf8')) if (ROOT/'research/legacy-source-updates.json').exists() else {}
base=[{**p,**existing_updates.get(p['slug'],{})} for p in base]
roots=[('https://toenergo.ru/catalog/zakladnie-detali-fundamenta/','zakladnye-detali','foundation'),('https://toenergo.ru/catalog/kronsteiny/','kronshteyny','bracket'),('https://toenergo.ru/catalog/opory-lep-metallicheskie/','opory-lep','frame')]
groups={}
for root,category,visual in roots:
    soup=module.fetch(root)
    for a in soup.select('a[href]'):
        url=urljoin(root,a['href']);name=module.clean(a)
        if url.startswith(root) and name and '?' not in url:
            groups[url]={'slug':'to-group-'+hashlib.sha256(url.encode()).hexdigest()[:12],'name':name,'sourceUrl':url,'categorySlug':category,'family':name,'form':'По серии','purpose':{'foundation':'Фундамент опоры','bracket':'Крепление светильников','frame':'Воздушные линии'}[visual],'visual':visual}
for item in base:
    if 'svai-omk' in item.get('sourceUrl','') or 'toenergo' in item.get('sourceUrl',''):
        groups.setdefault(item['sourceUrl'],item)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
    inventories=list(pool.map(module.inventory,groups.values()))
new={};known={x.get('sourceUrl',''):x for x in base}
for record in inventories:
    parent=groups[record['sourceUrl']]
    for item in record['items']:
        if item['url'] in known:continue
        slug=('omk-' if 'svai-omk' in item['url'] else 'to-')+urlparse(item['url']).path.rstrip('/').split('/')[-1]
        new.setdefault(slug,{**{k:parent[k] for k in ['categorySlug','family','form','purpose','visual']},'slug':slug,'name':item['name'],'sourceUrl':item['url']})
svet=json.loads((ROOT/'research/svetplast-inventory.json').read_text(encoding='utf8'))
svet=[x for x in svet if '?' not in x['url']]
aliases={0:'base-d220-425-h540',2:'base-d220-h1500',3:'base-d220-276-530-h240',5:'base-d220-440-h500',8:'base-d140-420-h540',9:'base-d276-h1510',10:'base-d276-425-h540',7:'base-8gr-h560',14:'base-kaliningrad',16:'base-mostrans'}
updates=dict(existing_updates)
for i,item in enumerate(svet):
    if i in aliases:
        updates[aliases[i]]={'sourceUrl':item['url']}
        continue
    slug='svet-'+urlparse(item['url']).path.rstrip('/').split('/')[-1]
    new[slug]={'slug':slug,'name':item['name'],'sourceUrl':item['url'],'categorySlug':'tsokoli','family':'Стеклопластиковые цоколи','form':'По модели','purpose':'Защита основания опоры','visual':'base'}
# Link model cards to an unambiguous existing series, prioritising the most
# specific source listing. Shared umbrella URLs are not treated as a series.
from collections import defaultdict
by_url=defaultdict(list)
for p in base:by_url[p.get('sourceUrl')].append(p)
parents={}
for rec in sorted(inventories,key=lambda r:len(r.get('sourceUrl',''))):
    choices=by_url.get(rec.get('sourceUrl'),[])
    if len(choices)==1:
        for item in rec.get('items',[]):parents[item['url']]=choices[0]['slug']
for p in new.values():
    if p.get('sourceUrl') in parents:p['seriesSlug']=parents[p['sourceUrl']]
module.write(ROOT/'src/data/additional-supplier-products.json',list(new.values()))
module.write(ROOT/'research/legacy-source-updates.json',updates)
module.write(ROOT/'research/other-supplier-inventory.json',inventories)
print(f'Other suppliers: {len(new)} additional products, {len(svet)} plinths; {sum(bool(x.get("error")) for x in inventories)} source errors')
