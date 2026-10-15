from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[2]
source = Path('/Users/dabao/Desktop/素材')
files = {
 'suspension-box-pack': '悬灸盒1.png',
 'suspension-box-device': '四联悬灸盒2.png',
 'ear-moxa': '耳灸器.png',
 'eye-moxa-pack': 'KHP01562.png',
 'eye-moxa-device': 'KHP00946.png',
 'essential-oil-pack': 'KHP01757.png',
 'essential-oil-bottle': 'KHP01730.png',
 'essential-oil-stick-pack': 'KHP05363.png',
 'essential-oil-stick-device': 'KHP05369.png',
 'bath-essence-pack': 'KHP04500.png',
 'bath-essence-cup': 'KHP05232.png',
 'itch-ointment': 'KHP07240.png',
 'soothing-oil-pack': 'KHP07225.png',
 'soothing-oil-bottle': '舒缓精华油2..png',
 'eye-patch-pack': 'KHP01531.png',
 'flower-patch': '艾灸精华贴-内贴.png',
 'foot-patch-pack': 'KHP01528.png',
 'foot-patch-device': 'KHP01671.png',
 'tea-pack': 'KHP05549.png',
 'tea-bag': 'KHP05582.png',
}
def convert(pair):
 key, name = pair
 source_path = source / name
 target = root / 'assets/products/catalog' / (key + '.webp')
 with Image.open(source_path) as original:
  original = original.convert('RGBA')
  source_size = original.size
  bounds = original.getchannel('A').getbbox()
  original = original.crop(bounds)
  original.save(target, 'WEBP', lossless=True, exact=True, method=4)
  source_pixels = original.tobytes()
  with Image.open(target) as result:
   assert result.size == original.size
   assert result.convert('RGBA').tobytes() == source_pixels, name
  record = dict(key=key, source=str(source_path), target=str(target.relative_to(root)), width=original.width, height=original.height, sourceWidth=source_size[0], sourceHeight=source_size[1], sourceBounds=bounds, transparentMarginOnly=True, before=source_path.stat().st_size, after=target.stat().st_size, sourceSha256=sha256(source_path.read_bytes()).hexdigest(), outputSha256=sha256(target.read_bytes()).hexdigest(), pixelSha256=sha256(source_pixels).hexdigest(), pixelsIdentical=True)
 print(key, record['before'], record['after'], flush=True)
 return record
with ThreadPoolExecutor(max_workers=2) as executor:
 records=list(executor.map(convert, files.items()))
manifest=dict(summary=dict(assets=len(records), before=sum(r['before'] for r in records), after=sum(r['after'] for r in records), allDecodedPixelsIdentical=True), files=records)
(root/'content/product-catalog-assets.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(manifest['summary']))
