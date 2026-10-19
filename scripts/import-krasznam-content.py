"""Import all published pipe-support groups and factual PPU data from cached DOM."""
import hashlib,json,re,sys
from pathlib import Path
from urllib.parse import urljoin,urlparse
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'research/source-cache/python-libs'))
from bs4 import BeautifulSoup
sys.stdout.reconfigure(encoding='utf8')
def clean(e):return ' '.join(e.get_text(' ',strip=True).replace('\u200b','').replace('\ufeff','').split()) if e else ''
def load(url):return BeautifulSoup((ROOT/'research/source-cache'/(hashlib.sha256(url.encode()).hexdigest()[:16]+'.html')).read_text(encoding='utf8'),'html.parser')
def table_rows(table):
    return [[clean(c) for c in row.find_all(['td','th'],recursive=False)] for row in table.select('tr') if row.find_all(['td','th'],recursive=False)]
inventory=json.loads((ROOT/'research/krasznam-inventory.json').read_text(encoding='utf8'))
items=[];candidates={}
for item in inventory:
    url=item['url'];s=load(url)
    for e in s.select('.t-header,.t-footer,script,style,form'):e.decompose()
    slug='kz-'+urlparse(url).path.rstrip('/').split('/')[-1]
    name=clean(s.find('h1')) or item['name']
    blocks=[]
    for e in s.select('.t-text'):
        if e.select('table'):continue
        t=clean(e)
        if len(t)>40 and len(t)<5000 and not re.search('cookie|отправ|заявк|менеджер',t,re.I) and t not in blocks:blocks.append(t)
    rows=[]
    for table in s.select('table'):
        for row in table_rows(table):
            if len(row)==2 and all(row) and row not in rows:rows.append(row)
    if rows and re.search('наименование|обозначение|стандарт',rows[0][0],re.I):rows=rows[1:]
    standards=list(dict.fromkeys(re.findall(r'(?:ГОСТ|ОСТ|Серия|ТУ|ТПР)\s+[\d][\d\w.,/−—–\- ]{2,45}',clean(s))))
    specifications=[{'label':'Группа изделий','value':name}]
    if standards:specifications.append({'label':'Документация серии','value':'; '.join(x.strip() for x in standards[:12])})
    text=blocks or [name+'. Обозначения изделий приведены в таблице серии. Исполнение выбирают по рабочей документации трубопровода.']
    product={'slug':slug,'name':name,'categorySlug':'opory-truboprovodov','family':'Опоры трубопроводов по сериям','form':'По серии','purpose':'Опоры трубопроводов','visual':'pipe','sourceUrl':url,'description':text[0],'descriptionBlocks':text,'specifications':specifications}
    if rows:product['variantTable']={'headers':['Обозначение','Изделие'],'rows':rows}
    items.append(product)
    images=[urljoin(url,i.get('data-original') or i.get('src','')) for i in s.select('img') if (i.get('data-original') or i.get('src','')).startswith(('http','/'))]
    candidates[slug]={'slug':slug,'sourceUrl':url,'imageCandidates':list(dict.fromkeys(images))}

url='https://krasznam.ru/pipe';s=load(url)
for e in s.select('.t-header,.t-footer,script,style,form'):e.decompose()
rows=table_rows(s.select_one('table'))
ppu_specs=[{'label':k,'value':v} for k,v in rows[1:]]
common=[clean(e) for e in s.select('.t-text') if not e.select('table') and 100<len(clean(e))<2200 and 'ППУ' in clean(e)]
ppu={}
for slug,name in [('ppu-pe','Трубы ППУ в ПЭ-оболочке'),('ppu-oc','Трубы ППУ в ОЦ-оболочке'),('ppu-otvody','Отводы в ППУ-изоляции'),('ppu-troyniki','Тройники в ППУ-изоляции'),('ppu-perekhody','Переходы в ППУ-изоляции')]:
    intro={'ppu-pe':'Стальные трубы с пенополиуретановой теплоизоляцией и полиэтиленовой защитной оболочкой для подземной прокладки тепловых сетей.','ppu-oc':'Стальные трубы с пенополиуретановой теплоизоляцией и стальной защитной оболочкой для надземной прокладки, проходных каналов и туннелей.','ppu-otvody':'Отводы со стальной трубой, пенополиуретановой изоляцией и защитной оболочкой для изменения направления трубопровода.','ppu-troyniki':'Тройники со стальной трубой, пенополиуретановой изоляцией и защитной оболочкой для ответвлений тепловой сети.','ppu-perekhody':'Переходы со стальной трубой, пенополиуретановой изоляцией и защитной оболочкой для соединения участков трубопровода разных диаметров.'}[slug]
    ppu[slug]={'sourceUrl':url,'description':intro,'descriptionBlocks':[intro]+common,'specifications':ppu_specs,'specificationTitle':'Параметры теплоизоляции и конструкции'}
    label={'ppu-otvody':'Отвод','ppu-troyniki':'Тройник','ppu-perekhody':'Переход'}.get(slug)
    images=[]
    if label:
        for col in s.select('.t-col'):
            if clean(col).startswith(label):
                images += [urljoin(url,i.get('data-original') or i.get('src','')) for i in col.select('img')]
    else:
        gallery=s.select_one('#rec396667915')
        if gallery:images=[i.get('data-original') or i.get('src','') for i in gallery.select('img')]
    candidates[slug]={'slug':slug,'sourceUrl':url,'imageCandidates':list(dict.fromkeys(u for u in images if u.startswith('http')))}
(ROOT/'src/data/krasznam-products.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'src/data/krasznam-content.json').write_text(json.dumps(ppu,ensure_ascii=False,indent=2),encoding='utf8')
(ROOT/'research/krasznam-image-candidates.json').write_text(json.dumps(candidates,ensure_ascii=False,indent=2),encoding='utf8')
print(f'Imported {len(items)} pipe-support groups, {sum(len((x.get("variantTable") or {}).get("rows",[])) for x in items)} table entries and 5 PPU cards')
