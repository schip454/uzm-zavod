"""Prepare the customer's 20 October revision from the supplied evidence.

Inputs stay in the ignored source cache. No engineering values are inferred
from product names; repeated PDF rows are retained in the series tables.
"""
import concurrent.futures
import hashlib
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'research/source-cache/customer-2026-10-20'
DATA = ROOT / 'src/data'
sys.stdout.reconfigure(encoding='utf-8')

def read(path): return json.loads(path.read_text(encoding='utf-8'))
def write(path, value): path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def specs(**values): return [{'label':k, 'value':str(v)} for k,v in values.items()]

def prepare_media_queue():
    rows = read(CACHE/'klassiksk-listings.json') + read(CACHE/'aldeks-products.json')
    approved = read(CACHE/'new-media-approved.json') if (CACHE/'new-media-approved.json').exists() else {}
    images = {r['image'] for r in rows if r.get('image') in approved}
    folder = CACHE/'new-media'; folder.mkdir(exist_ok=True)
    def fetch(url):
        target = folder/(hashlib.sha256(url.encode()).hexdigest()[:16]+'.jpg')
        if not target.exists():
            try:
                req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
                target.write_bytes(urllib.request.urlopen(req,timeout=20).read())
            except Exception as e: return {'url':url,'error':str(e)}
        return {'url':url,'file':target.name}
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: result=list(pool.map(fetch,sorted(images)))
    write(CACHE/'new-media-index.json',result)
    from PIL import Image, ImageDraw
    good=[r for r in result if r.get('file')]
    for offset in range(0,len(good),60):
        chunk=good[offset:offset+60]; sheet=Image.new('RGB',(1200,((len(chunk)+7)//8)*140),'#eee')
        draw=ImageDraw.Draw(sheet)
        for i,row in enumerate(chunk):
            try:
                im=Image.open(folder/row['file']).convert('RGB');im.thumbnail((144,112))
                x=(i%8)*150;y=(i//8)*140;sheet.paste(im,(x+(150-im.width)//2,y))
                draw.text((x+5,y+115),str(offset+i),fill='black')
            except Exception as e: row['error']=str(e)
        sheet.save(CACHE/f'new-media-sheet-{offset//60}.jpg')
    write(CACHE/'new-media-index.json',result)
    print('Media candidates',len(result),'sheets',(len(good)+59)//60)

def build():
    from PIL import Image
    import openpyxl
    assets=ROOT/'public/images/customer-2026-10';assets.mkdir(exist_ok=True)
    generated=Path('C:/Users/user/.codex/generated_images/01a0d243-3ac8-77f0-858c-0e8c01330556')
    temp=Path('C:/Users/user/AppData/Local/Temp')
    sources={
        'ogk':generated/'exec-aafb58db-82f2-43bc-9319-45715d88ac6d.png',
        'okk':generated/'exec-1837045a-dbd0-4ab6-b767-fe7b5e526d05.png',
        'npg':generated/'exec-55b8259d-4cef-4256-849b-b9bdf9be5756.png',
        'ogks':generated/'exec-83448556-9983-452d-9724-6a81bfcc3518.png',
        'tubular-flange':temp/'codex-clipboard-c5c476a8-51c5-4258-af6e-93e8f6a87965.png',
        'tubular-direct':generated/'exec-08906400-bcdd-4a1c-95cd-d3b7556ace05.png',
        'fm-vynosnaya':temp/'codex-clipboard-0f41692d-f87b-45d5-aa2a-7dfd8581d0bf.png',
        'fm-konsolnaya':temp/'codex-clipboard-a322757f-c74b-4d67-84ee-50717332ee8d.png',
        'bracket-1':temp/'codex-clipboard-3405093d-48ec-49a4-ba7b-49406d2f6748.png',
        'bracket-2-180':temp/'codex-clipboard-60c6d2ef-74f2-4bec-a9df-d0133ff91b3c.png',
        'bracket-2-90':temp/'codex-clipboard-1b32912a-5600-4586-a555-95a8b4fd44d1.png',
    }
    for name,path in sources.items():
        im=Image.open(path).convert('RGB');im.thumbnail((1400,1400));im.save(assets/(name+'.webp'),quality=90)
    def img(name): return '/images/customer-2026-10/'+name+'.webp'
    def gallery(name,title): return [{'src':img(name),'alt':title}]
    base={}
    for filename in ['products.json','dekart-full.json','supplier-products.json','additional-supplier-products.json','krasznam-products.json']:
        for p in read(DATA/filename): base[p['slug']]=p
    for filename in ['verified-products.json','supplier-content.json','krasznam-content.json','project-content.json']:
        for slug,content in read(DATA/filename).items():
            if slug in base: base[slug].update(content)
    new=[]; overrides={}; notes=[]
    overrides['karkasy']=dict(image='/images/uzm-frame.jpg',gallery=[{'src':'/images/uzm-frame.jpg','alt':'Стальной каркас здания'},{'src':'/images/uzm-trusses.jpg','alt':'Фермы для каркаса здания'}],description='Стальные каркасы зданий по проектной документации КМ или КМД. В состав каркаса входят колонны, балки, фермы и связи.',descriptionBlocks=['Каркас образует несущую основу здания. Пролёты, высоту, сечения элементов и узлы соединений определяют расчётом по проекту. Для расчёта стоимости пришлите чертежи, ведомость металла и требования к покрытию.'])
    overrides['fermy']=dict(image='/images/uzm-trusses.jpg',gallery=[{'src':'/images/uzm-trusses.jpg','alt':'Стальные фермы'}])
    def pole(slug,name,category,family,form,purpose,**extra):
        return dict(slug=slug,name=name,categorySlug=category,family=family,form=form,purpose=purpose,visual='pole',**extra)
    wb=openpyxl.load_workbook(CACHE/'Тех характеристики ОГК (1).xlsx',data_only=True)
    rows=list(wb.active.values); headers=['Модель','Высота, м','Верхний диаметр, мм','Нижний диаметр, мм','Толщина стенки, мм','Форма фланца','Габарит фланца, мм','Межцентровое расстояние, мм','Отверстий, шт.','Диаметр отверстий, мм','Толщина фланца, мм']
    table={'headers':headers,'rows':[],'urls':[]}
    for row in rows[1:]:
        if not row[1]:continue
        height=row[1];name='ОГК-'+str(height);slug='ogk-'+str(height)
        values=[name]+list(row[1:]);values=[str(v) for v in values]
        table['rows'].append(values);table['urls'].append('/product/'+slug+'/')
        facts=[{'label':k,'value':v} for k,v in zip(headers[1:],values[1:])]+specs(Установка='Фланцевая',Сечение='Гранёное коническое',Назначение='Несиловая')
        description=f'{name} — несиловая гранёная коническая опора высотой {height} м с фланцевым креплением. Применяется для освещения улиц, дворов и пешеходных зон.'
        new.append(pole(slug,name,'nesilovye-opory','Несиловые гранёные','Гранёная','Несиловая',seriesSlug='ogk',description=description,descriptionBlocks=[description,'Светильник устанавливается на кронштейне. Кабель подводится внутри ствола опоры. Комплектацию и фундамент выбирают по проекту.'],specifications=facts,image=img('ogk'),gallery=gallery('ogk',name)))
    for slug in ['ogk','nfg','ono','ogkf']:
        name=base[slug]['name'];overrides[slug]=dict(image=img('ogk'),gallery=gallery('ogk',name),specifications=specs(Сечение='Гранёное коническое',Установка='Фланцевая',Назначение='Несиловая'),variantTable=table,description=f'{name} — несиловые гранёные конические опоры. Обозначения ОГК, ОГКф, НФГ и ОНО используются для этой конструкции. Размеры исполнений приведены в таблице.',descriptionBlocks=['Ствол имеет коническую гранёную форму. Опора крепится фланцем к фундаменту. Светильники устанавливаются на кронштейне; кабель проходит внутри ствола.'])
    overrides['npg']=dict(image=img('npg'),gallery=gallery('npg','НПГ — прямостоечная гранёная опора'),variantTable=None,specifications=specs(Установка='Прямостоечная, без фланца',Сечение='Гранёное коническое',Назначение='Несиловая'),description='НПГ — несиловая гранёная коническая опора без опорного фланца. Нижнюю часть ствола устанавливают непосредственно в грунтовое основание по проекту.',descriptionBlocks=['Конструкция ствола аналогична ОГК. Глубину заделки и размеры основания определяют расчётом для конкретного объекта.'])
    for slug in ['okk','nfk']:
        overrides[slug]=dict(image=img('okk'),gallery=gallery('okk',base[slug]['name']),description=f'{base[slug]["name"]} — несиловая круглоконическая опора с фланцевым креплением. ОКК, ОККф и НФК — обозначения одной группы конструкций. Светильник устанавливается на кронштейне.')
    for slug,name,family,form,picture in [('okkf','ОККф','Несиловые круглоконические','Круглоконическая','okk'),('tans-ogk','ТАНС (ОГК)','Несиловые гранёные','Гранёная','ogk'),('tans-okk','ТАНС (ОКК)','Несиловые круглоконические','Круглоконическая','okk')]:
        new.append(pole(slug,name,'nesilovye-opory',family,form,'Несиловая',image=img(picture),gallery=gallery(picture,name),specifications=specs(Установка='Фланцевая',Сечение=form,Назначение='Несиловая'),description=f'{name} — несиловая опора освещения с фланцевым креплением. Обозначение ТАНС применяют для разных конструктивных серий; здесь показано соответствующее сечение ствола.'))
    for slug,mount in [('ot','Прямостоечная, без фланца'),('otf','Фланцевая')]:
        overrides[slug]=dict(specifications=specs(Сечение='Трубчатое',Установка=mount,Назначение='Несиловая'),variantTable=None,description=f'{base[slug]["name"]} — несиловая трубчатая опора освещения. Установка: {mount.lower()}. Диаметры труб и высоту выбирают по спецификации проекта.',descriptionBlocks=['Конструкция предназначена для установки светильника на кронштейне. ОТ и ОТф отличаются способом установки: прямостоечным и фланцевым.'])
        if slug=='otf':overrides[slug].update(image=img('tubular-flange'),gallery=gallery('tubular-flange','ОТф'))
        else:overrides[slug].update(image=img('tubular-direct'),gallery=gallery('tubular-direct','ОТ — прямостоечная опора'))
    for slug in ['op','oks']:
        overrides[slug]=dict(specifications=specs(Сечение='Трубчатое',Назначение='Несиловая'),description=f'{base[slug]["name"]} — несиловая трубчатая опора освещения. Диаметры секций, высоту и способ установки задают в проектной спецификации.',descriptionBlocks=['Опоры ОТ, ОКС и ОП различаются диаметрами труб и исполнением крепления. Для подбора конкретной модели укажите требуемые размеры и способ установки.'])
    power=read(CACHE/'power-products.json');content=read(CACHE/'power-content.json')
    # Supplier marks and customer PDF marks stay separate: their dimensions differ.
    for p in power:
        c=content[p['slug']];p.update({k:c[k] for k in ['description','descriptionBlocks','specifications'] if k in c})
        # Reuse only already reviewed illustrations of this exact construction.
        series=base[p['seriesSlug']]
        if p['seriesSlug'] in ['sfg','ogs']:
            p.update(image=series.get('image'),gallery=series.get('gallery',[]))
        elif p['seriesSlug']=='osf':
            p.update(image=img('tubular-flange'),gallery=gallery('tubular-flange',p['name']))
        new.append(p)
    for series in ['sfg','ogs','os','osf']:
        items=[p for p in new if p.get('seriesSlug')==series]
        labels=list(dict.fromkeys(s['label'] for p in items for s in p.get('specifications',[])))
        variant={'headers':['Модель']+labels,'rows':[],'urls':[]}
        for p in items:
            values={s['label']:s['value'] for s in p['specifications']}
            variant['rows'].append([p['name']]+[values.get(k,'—') for k in labels]);variant['urls'].append('/product/'+p['slug']+'/')
        branch='granenye-opory' if series in ['sfg','ogs'] else 'trubchatye-opory'
        common=[fact for fact in items[0]['specifications'] if all(fact in p['specifications'] for p in items)]
        overrides[series]=dict(variantTable=variant,specifications=common,sourceUrl=f'https://toenergo.ru/catalog/opory-osveshchenyia/opory-osveshcheniya-silovye/{branch}/opory-osveshcheniya-{series}/')
    # Preserve every SF/SP PDF row, including repeated designations with different masses.
    lines=(CACHE/'sf-sp-text.txt').read_text('utf-8').splitlines()
    for series,prefix in [('sf','СФ'),('sp','СП')]:
        raw=[line.split() for line in lines if re.match(r'МСД-\S+\s+'+prefix+r'-',line)]
        labels=['Марка по ГОСТ','Марка по каталогу','Масса с покрытием, кг','Нагрузка, тс','Место кронштейна','Диаметры секций D1/D2, мм']
        labels+=['Фланец / межцентровое, мм','Отверстий, шт.','Диаметр отверстий, мм','Фундаментный блок','Высота ФБ, м'] if series=='sf' else ['Глубина заделки, м']
        parsed=[]
        for values in raw:
            if series=='sf':
                assert len(values)==13,(len(values),values)
                parsed.append(values[:9]+[' '.join(values[9:11]),values[11]])
            else:
                assert len(values)==8,(len(values),values)
                parsed.append(values[:7])
        # SF has thirteen tokens, SP eight, including shipping capacity.
        overrides[series]=dict(variantTable={'headers':labels,'rows':parsed},specifications=specs(Сечение='Трубчатое',Назначение='Силовая',Установка='Фланцевая' if series=='sf' else 'Прямостоечная'),description=f'{prefix} — силовые трубчатые опоры освещения. '+('Крепятся фланцем к фундаментному блоку.' if series=='sf' else 'Нижняя часть опоры заделывается в основание.')+' Диаметры секций, нагрузки и монтажные размеры приведены в таблице исполнений.',descriptionBlocks=['Для одной маркировки в таблице предусмотрены разные сочетания секций и массы. При заказе укажите строку с нужными диаметрами D1/D2 и местом установки кронштейна.'],image=img('tubular-flange') if series=='sf' else None,gallery=gallery('tubular-flange',prefix) if series=='sf' else [])
        notes.append({'source':'СФ и СП.pdf','series':series,'rows':len(parsed)})
        marks=list(dict.fromkeys(row[1] for row in parsed))
        urls={mark:'pdf-'+series+'-'+hashlib.sha256(mark.encode()).hexdigest()[:10] for mark in marks}
        overrides[series]['variantTable']['urls']=['/product/'+urls[row[1]]+'/' for row in parsed]
        for mark in marks:
            versions=[row for row in parsed if row[1]==mark]
            facts=[{'label':label,'value':versions[0][i]} for i,label in enumerate(labels) if i!=1 and len(set(row[i] for row in versions))==1]
            new.append(pole(urls[mark],mark,'silovye-opory','Силовые трубчатые','Трубчатая','Силовая',seriesSlug=series,specifications=facts,variantTable={'headers':labels,'rows':versions},description=f'{mark} — силовая трубчатая опора. '+('Фланцевое крепление к фундаментному блоку.' if series=='sf' else 'Прямостоечная установка с заделкой в основание.')+' В таблице приведены все исполнения этой марки из технических характеристик.',image=img('tubular-flange') if series=='sf' else None,gallery=gallery('tubular-flange',mark) if series=='sf' else []))
    for slug in ['tp','tf']:
        mount='Прямостоечная' if slug=='tp' else 'Фланцевая'
        overrides[slug]=dict(categorySlug='silovye-opory',family='Силовые трубчатые',form='Трубчатая',purpose='Силовая',variantTable=None,specifications=specs(Сечение='Трубчатое',Установка=mount,**{'Ввод кабеля':'01 — верхний; 02 — внутренний, с люком','Покрытие':'Ц — горячее цинкование; Л — лакокрасочное'}),description=f'{base[slug]["name"]} — трубчатая силовая опора контактной сети. Установка: {mount.lower()}. Нагрузку и высоту указывают в маркировке.',descriptionBlocks=['В обозначении ТП указывают надземную и общую высоту, в обозначении ТФ — надземную высоту. Исполнение ввода кабеля и покрытия выбирают по проекту.'],sourceUrl='https://kss-zavod.ru/nashi-uslugi-i-produktsiya/category/opory/',image=img('tubular-flange') if slug=='tf' else None,gallery=gallery('tubular-flange','ТФ') if slug=='tf' else [])
    for slug in ['sp','tp','os']:
        overrides[slug].update(image=img('tubular-direct'),gallery=gallery('tubular-direct',base[slug]['name']))
    for p in new:
        if p.get('seriesSlug') in ['sp','os']:
            p.update(image=img('tubular-direct'),gallery=gallery('tubular-direct',p['name']))
    overrides['ogks']=dict(image=img('ogks'),gallery=gallery('ogks','ОГКС — складывающаяся опора'),description='ОГКС — складывающаяся гранёная коническая опора освещения. Поворотная верхняя секция позволяет опустить оборудование для обслуживания.',descriptionBlocks=['При подборе учитывают высоту, массу светильников и геометрию механизма складывания. Исполнение выбирают по проектной спецификации.'])
    overrides['foundation-vynosnye']=dict(name='Выносная ФМ',image=img('fm-vynosnaya'),gallery=gallery('fm-vynosnaya','Выносная ФМ'))
    overrides['foundation-konsolnye']=dict(name='Консольная ФМ',image=img('fm-konsolnaya'),gallery=gallery('fm-konsolnaya','Консольная ФМ'))
    for slug,name,picture,count,angle in [('bracket-1','Кронштейн однорожковый','bracket-1','1',None),('bracket-2-180','Кронштейн двухрожковый 180°','bracket-2-180','2','180°'),('bracket-2-90','Кронштейн двухрожковый 90°','bracket-2-90','2','90°')]:
        facts=specs(**{'Количество рожков':count})
        if angle:facts+=specs(**{'Угол между рожками':angle})
        new.append(dict(slug=slug,name=name,categorySlug='kronshteyny',family='Кронштейны для уличных светильников',form='Трубчатый',purpose='Крепление светильников',visual='bracket',image=img(picture),gallery=gallery(picture,name),specifications=facts,description=f'{name} для установки уличных светильников на опоре. Высоту, вылет и присоединительный размер выбирают по проекту.'))
    approved_media=read(CACHE/'new-media-approved.json') if (CACHE/'new-media-approved.json').exists() else {}
    def approved_image(row):
        rejected=read(CACHE/'new-media-rejected.json')
        issue=rejected.get(row.get('image',''),'')
        if 'Цвет изображения' in issue and 'дымчат' in row['name'].lower():return None
        source=approved_media.get(row.get('image',''))
        if not source:return None
        dest='supplier-'+Path(source).stem+'.webp'
        if not (assets/dest).exists():
            im=Image.open(CACHE/'new-media'/source).convert('RGBA');im.thumbnail((1200,1200));im.save(assets/dest,quality=90)
        return '/images/customer-2026-10/'+dest
    for row in read(CACHE/'aldeks-products.json'):
        slug='aldeks-'+row['url'].rstrip('/').rsplit('/',1)[-1];facts=row['specifications']
        if 'k36-06-06' in slug:
            facts=[f for f in facts if f['label'] not in ['Вылет, м','Высота кронштейна, м']]
            notes.append({'source':row['url'],'issue':'Вылет/высота в карточке не соответствуют маркировке. Не публиковать до уточнения.'})
        picture=approved_image(row)
        new.append(dict(slug=slug,name=row['name'],categorySlug='kronshteyny',family='Торшерные кронштейны',form='Однорожковый',purpose='Парковое освещение',visual='bracket',sourceUrl=row['url'],specifications=facts,description=row['name']+' для установки паркового светильника. Параметры крепления приведены в характеристиках.',image=picture,gallery=[{'src':picture,'alt':row['name']}] if picture else []))
    for row in read(CACHE/'klassiksk-listings.json'):
        slug='klassiksk-'+re.search(r'/goods/(\d+)',row['url'])[1]
        # Take labelled product facts only; supplier promises and payment terms are excluded.
        facts=[]
        text=re.split(r'Мы |Работаем |Для постоянных',row.get('description') or '')[0]
        for sentence in re.split(r'\.\s+(?=[А-ЯЁ])',text):
            if ':' in sentence:
                k,v=sentence.split(':',1);k=k.strip();v=v.strip().rstrip('.')
                if k not in ['Маркировка по ГОСТ']:facts.append({'label':k,'value':v})
        family=next((f for f in ['Сфера','Шар','Лира','Лотос','Ретро','Ферзь','Легенда','Конус','Кристалл','Ладья','Пешка','Медуза-5','Медуза-8','Светлячок-1','Светлячок-2','Тюльпан','Прогресс'] if f.lower() in row['name'].lower()),'Другие парковые светильники')
        picture=approved_image(row)
        description=row['name']+'. Предназначен для освещения парков, скверов и пешеходных пространств.'
        new.append(dict(slug=slug,name=re.sub(r'^Светильник парковый\s+(?:Классик\s+)?','',row['name']).split(', ')[0],categorySlug='parkovye-svetilniki',family=family,form='Парковый светильник',purpose='Парковое освещение',visual='luminaire',sourceUrl=row['url'],specifications=facts,description=description,descriptionBlocks=[description,'Тип лампы, мощность и исполнение рассеивателя выбирают по характеристикам данной модели. Совместимость с опорой и кронштейном проверяют по присоединительным размерам.'],image=picture,gallery=[{'src':picture,'alt':row['name']}] if picture else []))
    # Exact approved series; no substring filtering that could admit unrelated models.
    keep={'ogk','ogkf','nfg','npg','ono','okk','nfk','ot','otf','op','oks','sfg','ogs','sf','sp','os','osf','ogks','soos','tp','tf'}
    for slug,p in base.items():
        if p.get('categorySlug')=='nesilovye-opory' and p.get('seriesSlug') in ['okk','nfk','ot','otf','op','oks']:keep.add(slug)
        if p.get('categorySlug')=='skladyvayushchiesya-opory' and p.get('seriesSlug') in ['ogks','soos']:keep.add(slug)
    # Apply the approved family illustrations to exact circular and folding children.
    for slug in keep:
        p=base.get(slug,{})
        if p.get('seriesSlug') in ['okk','nfk']:overrides.setdefault(slug,{}).update(image=img('okk'),gallery=gallery('okk',p['name']))
        if p.get('seriesSlug')=='ogks':overrides.setdefault(slug,{}).update(image=img('ogks'),gallery=gallery('ogks',p['name']))
    write(DATA/'customer-products.json',new)
    write(DATA/'customer-revision.json',{'date':'2026-10-20','managedCategories':['nesilovye-opory','silovye-opory','skladyvayushchiesya-opory'],'keepSlugs':sorted(keep),'overrides':overrides})
    write(ROOT/'research/customer-revision-sources.json',{'customerDate':'2026-10-20','ogkRows':len(table['rows']),'powerSourceRows':len(power),'parkLights':352,'torsherBrackets':8,'notes':notes,'media':{k:str(v) for k,v in sources.items()}})
    print('New products',len(new),'overrides',len(overrides),'OGK rows',len(table['rows']),notes[:2])

if __name__=='__main__':
    if '--media' in sys.argv:prepare_media_queue()
    else:build()
