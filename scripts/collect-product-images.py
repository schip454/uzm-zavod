"""Download a deduplicated visual review queue, never publish unseen images."""
import concurrent.futures
import hashlib
import io
import json
import sys
import urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'research/source-cache/python-libs'))
from PIL import Image,ImageOps,ImageDraw,ImageFont
sys.stdout.reconfigure(encoding='utf8')
DEST=ROOT/'research/source-cache/image-review'
DEST.mkdir(exist_ok=True)
DECISIONS=json.loads((ROOT/'research/image-review-decisions.json').read_text(encoding='utf8')) if (ROOT/'research/image-review-decisions.json').exists() else {}
def download(url):
    name=hashlib.sha256(url.encode()).hexdigest()[:20]+'.webp'
    path=DEST/name
    if name in DECISIONS and not DECISIONS[name]['approved']:
        return {'url':url,'file':name,'blocked':'Previously reviewed watermark; not downloaded again'}
    if 'toenergo.ru' in url and not path.exists():
        return {'url':url,'blocked':'Supplier watermark on existing drawings; clean original needed'}
    try:
        if not path.exists():
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req,timeout=25) as r: data=r.read(12_000_001)
            if len(data)>12_000_000:raise ValueError('Image too large')
            im=ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
            if min(im.size)<50:raise ValueError('Image too small')
            im.thumbnail((1500,1500));im.save(path,'WEBP',quality=88)
        im=Image.open(path)
        return {'url':url,'file':name,'width':im.width,'height':im.height,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    except Exception as e:return {'url':url,'error':str(e)}
def main():
    records=json.loads((ROOT/'research/supplier-import.json').read_text(encoding='utf8'))
    extra=ROOT/'research/krasznam-image-candidates.json'
    if extra.exists():records.update(json.loads(extra.read_text(encoding='utf8')))
    urls=sorted({u for x in records.values() for u in x.get('imageCandidates',[])})
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        rows=list(pool.map(download,urls))
    unique={}
    for row in rows:
        if row.get('sha256') in unique: row['sameAs']=unique[row['sha256']]
        elif row.get('sha256'):unique[row['sha256']]=row['file']
    (ROOT/'research/product-image-review.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
    visuals=[x for x in rows if x.get('file') and not x.get('sameAs') and not x.get('blocked') and x['file'] not in DECISIONS]
    font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',14)
    for batch in range(0,len(visuals),36):
        sheet=Image.new('RGB',(1440,1320),'#eae7e2');draw=ImageDraw.Draw(sheet)
        for n,row in enumerate(visuals[batch:batch+36]):
            im=Image.open(DEST/row['file']);im.thumbnail((224,190))
            x=(n%6)*240;y=(n//6)*220
            sheet.paste(im,(x+(240-im.width)//2,y+(195-im.height)//2))
            draw.text((x+8,y+198),f'{batch+n+1}: {row["file"][:12]}',fill='black',font=font)
        sheet.save(ROOT/f'research/qa/product-review-{batch//36+1:02}.jpg',quality=88)
    (ROOT/'research/image-review-index.json').write_text(json.dumps(visuals,ensure_ascii=False,indent=2),encoding='utf8')
    print(f'{len(urls)} source images, {len(visuals)} distinct images to review, {sum("error" in x for x in rows)} download failures')
if __name__=='__main__':main()
