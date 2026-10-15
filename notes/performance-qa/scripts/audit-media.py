"""Read-only media inventory. Does not encode, decode, mutate or download media."""
import hashlib, json, pathlib, re, struct, subprocess, urllib.request, datetime
ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'notes/performance-qa/data/media-audit.json'
FFMPEG = pathlib.Path('/Users/dabao/Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
def u32(data, offset=0): return struct.unpack_from('>I', data, offset)[0]
def u64(data, offset=0): return struct.unpack_from('>Q', data, offset)[0]
def boxes(data, start=0, end=None):
    end = len(data) if end is None else end
    while start + 8 <= end:
        size = u32(data, start); kind = data[start+4:start+8].decode('latin1'); header = 8
        if size == 1: size = u64(data, start+8); header = 16
        elif size == 0: size = end - start
        if size < header or start + size > end: break
        yield kind, data[start+header:start+size]
        start += size
def child(data, name): return next((body for kind, body in boxes(data) if kind == name), None)
def timing(data):
    version = data[0]
    scale = u32(data, 20 if version else 12)
    duration = u64(data, 24) if version else u32(data, 16)
    return scale, duration, duration / scale

def mp4(path):
    atoms = []; moov = None
    with path.open('rb') as file:
        position = 0; total = path.stat().st_size
        while position + 8 <= total:
            file.seek(position); header = file.read(8); size, kind = struct.unpack('>I4s', header); head = 8
            if size == 1: size = struct.unpack('>Q', file.read(8))[0]; head = 16
            elif size == 0: size = total-position
            if size < head: raise ValueError('Invalid atom')
            atoms.append({'type':kind.decode('latin1'), 'offset':position, 'bytes':size})
            if kind == b'moov': moov = file.read(size-head)
            position += size
    result = {'topLevelAtoms':atoms, 'faststart': next(a['offset'] for a in atoms if a['type']=='moov') < next(a['offset'] for a in atoms if a['type']=='mdat'), 'tracks':[]}
    result['movieDurationSeconds'] = timing(child(moov, 'mvhd'))[2]
    for kind, track in boxes(moov):
        if kind != 'trak': continue
        mdia = child(track,'mdia'); handler = child(mdia,'hdlr')[8:12].decode('latin1'); media_time = timing(child(mdia,'mdhd'))
        minf = child(mdia,'minf'); stbl = child(minf,'stbl'); stsz = child(stbl,'stsz'); sample_size, count = u32(stsz,4), u32(stsz,8)
        sample_bytes = sample_size * count if sample_size else sum(u32(stsz,12+i*4) for i in range(count))
        stsd = child(stbl,'stsd'); entries = list(boxes(stsd,8)); codec, entry = entries[0]
        item = {'handler':handler, 'codecFourCC':codec, 'timescale':media_time[0], 'durationSeconds':media_time[2], 'sampleCount':count, 'compressedSampleBytes':sample_bytes, 'averageBitrateBitsPerSecond':round(sample_bytes*8/media_time[2],3)}
        if handler == 'vide':
            item['width'], item['height'] = struct.unpack_from('>HH',entry,24)
            item['framesPerSecond'] = count/media_time[2]
            stts = child(stbl,'stts'); deltas = []
            for i in range(u32(stts,4)): deltas.append({'sampleCount':u32(stts,8+i*8), 'sampleDelta':u32(stts,12+i*8)})
            item['timeToSampleRuns'] = deltas
            stss = child(stbl,'stss')
            if stss:
                sync = [u32(stss,8+i*4) for i in range(u32(stss,4))]
                gaps = [b-a for a,b in zip(sync,sync[1:])]
                item['keyframes'] = {'count':len(sync), 'maxGapFrames':max(gaps) if gaps else None, 'averageGapFrames':sum(gaps)/len(gaps) if gaps else None}
            avcc = child(entry[78:],'avcC')
            if avcc: item['avcProfileIdc'],item['avcLevelIdc'] = avcc[1],avcc[3]
        result['tracks'].append(item)
    return result

def digest(path):
    sha=hashlib.sha256()
    with path.open('rb') as file:
        for chunk in iter(lambda:file.read(1024*1024),b''): sha.update(chunk)
    return sha.hexdigest()

code_files = [p for folder in ('website-code','content') for p in (ROOT/folder).rglob('*') if p.is_file() and p.suffix in ('.js','.css','.html','.json') and not any(n in p.parts for n in ('dist','node_modules','.runtime')) and 'scripts' not in p.parts]
texts = [(str(p.relative_to(ROOT)), p.read_text(errors='replace')) for p in code_files]
videos=[]; fonts=[]
for path in sorted((ROOT/'assets').rglob('*')):
    if not path.is_file(): continue
    suffix=path.suffix.lower()
    if suffix not in ('.mp4','.webm','.woff','.woff2','.ttf','.otf'): continue
    relative=str(path.relative_to(ROOT))
    record={'path':relative,'bytes':path.stat().st_size,'sha256':digest(path),'references':[{'file':p,'lines':[i for i,line in enumerate(text.splitlines(),1) if path.name in line]} for p,text in texts if path.name in text]}
    if suffix in ('.mp4','.webm'):
        record.update(mp4(path) if suffix=='.mp4' else {})
        record['ffmpegProbeStderr']=subprocess.run([str(FFMPEG),'-hide_banner','-i',str(path)],capture_output=True,text=True).stderr
        request=urllib.request.Request('http://127.0.0.1:4196/'+urllib.request.quote(relative,safe='/'),headers={'Range':'bytes=0-1023'})
        try:
            with urllib.request.urlopen(request, timeout=10) as response:
                record['localRangeRequest']={'url':response.url,'status':response.status,'headers':dict(response.headers),'bodyBytes':len(response.read())}
        except Exception as error: record['localRangeRequest']={'error':str(error)}
        videos.append(record)
    else:
        with path.open('rb') as file: header=file.read(48)
        if suffix=='.woff2': record['woff2Header']={'numTables':struct.unpack_from('>H',header,12)[0],'totalSfntSize':u32(header,16),'totalCompressedSize':u32(header,20)}
        fonts.append(record)

data={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'projectRoot':str(ROOT),'scope':'read-only video/font inventory; no encoding/decoding or asset changes','tools':{'ffprobe':None,'ffmpeg':str(FFMPEG),'version':subprocess.run([str(FFMPEG),'-version'],capture_output=True,text=True).stdout.splitlines()[0],'metadataMethod':'MP4 ISO-BMFF boxes + ffmpeg input probe; no frame decode or perceptual quality inference'},'videos':videos,'fonts':fonts,'totals':{'videoFiles':len(videos),'videoBytes':sum(x['bytes'] for x in videos),'fontFiles':len(fonts),'fontBytes':sum(x['bytes'] for x in fonts),'uniqueFontBytes':sum(next(x['bytes'] for x in fonts if x['sha256']==sha) for sha in set(x['sha256'] for x in fonts))},'limitations':['Local Range headers are not evidence of live Vercel cache/Range behavior.','FFmpeg probe reads metadata; not a full decode, SSIM/VMAF or visual quality test.','No network performance baseline is inferred from asset folder totals.','Font glyph coverage, original licensing outside repository and mobile Safari behavior are not inferred.']}
OUT.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(data['totals'],ensure_ascii=False))
