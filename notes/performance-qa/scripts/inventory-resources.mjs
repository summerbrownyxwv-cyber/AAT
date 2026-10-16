// Read-only source inventory. Static references are evidence, not proof of runtime use.
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative, dirname, extname } from 'node:path';
import { canonicalAsset } from '../../../website-code/asset-urls.js';
import { plantingAssets } from '../../../content/planting-asset-manifest.js';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../../..');
const out = resolve(root, 'notes/performance-qa/data');
const ignored = new Set(['dist', 'node_modules', '.runtime', '.DS_Store']);
async function walk(dir) {
  const rows = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) rows.push(...await walk(path));
    else if (entry.isFile()) rows.push(path);
  }
  return rows;
}
const files = (await Promise.all(['assets', 'content', 'website-code'].map(d => walk(resolve(root, d))))).flat().sort();
const manifest = JSON.parse(await readFile(resolve(root, 'content/asset-map.json'), 'utf8'));
const productManifest = JSON.parse(await readFile(resolve(root, 'content/product-catalog-assets.json'), 'utf8'));
const auditRecords = new Map();
for (const record of [...manifest.files, ...productManifest.files]) {
  const existing = auditRecords.get(record.target) || [];
  existing.push(record); auditRecords.set(record.target, existing);
}
const assetPaths = new Set(files.map(p => relative(root, p)));
const sourceFiles = files.filter(p => /\.(?:html|css|js|mjs|json|md|py)$/.test(p));
const texts = new Map(await Promise.all(sourceFiles.map(async p => [relative(root, p), await readFile(p, 'utf8')])));
const references = [], dependencies = new Map(), unresolved = [];
function normalize(ref, owner) {
  ref = canonicalAsset(ref.split(/[?#]/)[0]);
  // JS markup is inserted into top-level website-code HTML documents. CSS URLs
  // instead resolve relative to their stylesheet, and imports remain module-relative.
  if (owner.endsWith('.js') && /^(?:\.\.\/)+assets\//.test(ref)) return ref.slice(ref.indexOf('assets/'));
  if (ref.startsWith('/')) return ref.slice(1);
  if (ref.startsWith('assets/') || ref.startsWith('website-code/') || ref.startsWith('content/')) return ref;
  return relative(root, resolve(root, dirname(owner), ref));
}
const catalogs = new Set(['website-code/asset-urls.js', 'website-code/xunai/responsive-images.js', 'content/planting-asset-manifest.js']);
for (const [owner, text] of texts) {
  const metadata = owner.startsWith('content/') && !owner.endsWith('.js');
  const category = metadata ? 'audit-metadata' : owner.startsWith('website-code/scripts/') ? 'development-script' : owner.startsWith('website-code/vendor/') ? 'vendor-source-example' : catalogs.has(owner) ? 'runtime-catalog' : 'runtime-literal';
  const deps = new Set();
  for (const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*|\bsrc\s*=\s*|\bhref\s*=\s*)["'](\.[^"']+|[^"']+\.(?:js|css))["']/g)) {
    const target = normalize(match[1], owner);
    // An anchor navigates to another page; it does not make that page's assets
    // dependencies of the current document.
    if (assetPaths.has(target) && /\.(?:js|css)$/.test(target)) deps.add(target);
  }
  dependencies.set(owner, deps);
  const lineStarts = [0]; for (let i=0;i<text.length;i++) if (text[i]==='\n') lineStarts.push(i+1);
  for (const match of text.matchAll(/(?:(?:\.\.\/)+|\/)?assets\/[^"'`\s<>),;\]}]+/g)) {
    const raw = match[0];
    const line = lineStarts.findLastIndex(n => n <= match.index) + 1;
    if (raw.includes('${') || raw.endsWith('/')) {
      unresolved.push({ owner, line, raw, reason: 'dynamic/template path requires runtime observation' });
      const prefix = normalize(raw.split('${')[0], owner);
      if (category==='runtime-literal' && prefix.endsWith('/')) {
        for (const target of assetPaths) if (target.startsWith(prefix)) references.push({owner,line,raw,target,category:'runtime-directory-candidate',exists:true,evidence:'Dynamic directory prefix only; individual use not proven.'});
      }
      continue;
    }
    const target = normalize(raw, owner);
    references.push({ owner, line, raw, target, category, exists: assetPaths.has(target) });
  }
}
const routes = ['index', 'company', 'planting', 'products', 'service', 'ai', 'contact', 'franchise'].map(n => `website-code/${n}.html`);
const reachable = new Map();
for (const route of routes) {
  const seen = new Set(), queue = [route];
  while (queue.length) { const item=queue.pop(); if(seen.has(item)) continue; seen.add(item); queue.push(...dependencies.get(item)||[]); }
  reachable.set(route, seen);
}
function webpInfo(b) {
  if (b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP') return null;
  let dimensions=null; const chunks=[];
  for(let at=12;at+8<=b.length;) {
    const type=b.toString('ascii',at,at+4), size=b.readUInt32LE(at+4), p=at+8; chunks.push(type);
    if(type==='VP8X'&&size>=10) dimensions={width:b.readUIntLE(p+4,3)+1,height:b.readUIntLE(p+7,3)+1,alpha:!!(b[p]&16)};
    if(type==='VP8L'&&size>=5&&!dimensions) {const v=b.readUInt32LE(p+1); dimensions={width:(v&16383)+1,height:((v>>>14)&16383)+1,alpha:!!(v&0x10000000)};}
    if(type==='VP8 '&&size>=10&&!dimensions) dimensions={width:b.readUInt16LE(p+6)&16383,height:b.readUInt16LE(p+8)&16383,alpha:false};
    at=p+size+(size%2);
  }
  return {...dimensions, encoding:chunks.includes('VP8L')?'lossless VP8L':chunks.includes('VP8 ')?'lossy VP8':'unknown',metadata:chunks.filter(t=>['ICCP','EXIF','XMP '].includes(t)),chunks};
}
function atoms(b,start=0,end=b.length) {
  const rows=[];
  for(let at=start;at+8<=end;) {
    let size=b.readUInt32BE(at), header=8; const type=b.toString('ascii',at+4,at+8);
    if(size===1){if(at+16>end)break;size=Number(b.readBigUInt64BE(at+8));header=16;} else if(size===0) size=end-at;
    if(size<header||at+size>end)break;
    rows.push({type,offset:at,size,start:at+header,end:at+size}); at+=size;
  }
  return rows;
}
function mp4Info(b) {
  const top=atoms(b), moov=top.find(a=>a.type==='moov'), mdat=top.find(a=>a.type==='mdat'); if(!moov)return {error:'no moov'};
  const tracks=[];
  for(const trak of atoms(b,moov.start,moov.end).filter(a=>a.type==='trak')) {
    const children=atoms(b,trak.start,trak.end), mdia=children.find(a=>a.type==='mdia'), tkhd=children.find(a=>a.type==='tkhd'); if(!mdia)continue;
    const md=atoms(b,mdia.start,mdia.end), mdhd=md.find(a=>a.type==='mdhd'), hdlr=md.find(a=>a.type==='hdlr'), minf=md.find(a=>a.type==='minf');
    let timescale,duration;
    if(mdhd) {const p=mdhd.start, v=b[p]; timescale=b.readUInt32BE(p+(v?20:12));duration=(v?Number(b.readBigUInt64BE(p+24)):b.readUInt32BE(p+16))/timescale;}
    const type=hdlr?b.toString('ascii',hdlr.start+8,hdlr.start+12):'unknown'; let codec=null, samples=null;
    const stbl=minf&&atoms(b,minf.start,minf.end).find(a=>a.type==='stbl');
    if(stbl){const list=atoms(b,stbl.start,stbl.end),stsd=list.find(a=>a.type==='stsd'),stsz=list.find(a=>a.type==='stsz'); if(stsd)codec=b.toString('ascii',stsd.start+12,stsd.start+16); if(stsz)samples=b.readUInt32BE(stsz.start+8);}
    tracks.push({type,codec,durationSeconds:duration,framesOrSamples:samples,framesPerSecond:type==='vide'&&samples&&duration?samples/duration:null,width:type==='vide'&&tkhd?b.readUInt32BE(tkhd.end-8)/65536:null,height:type==='vide'&&tkhd?b.readUInt32BE(tkhd.end-4)/65536:null});
  }
  const duration=Math.max(...tracks.map(t=>t.durationSeconds||0));
  return {topLevelAtoms:top.map(a=>({type:a.type,offset:a.offset,size:a.size})),fastStart:!!mdat&&moov.offset<mdat.offset,tracks,durationSeconds:duration,overallBitrate:duration?b.length*8/duration:null,note:'Container metadata only; not a decoded visual-quality measurement.'};
}
function glbInfo(b) {
  if(b.toString('ascii',0,4)!=='glTF')return null;
  const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)).replace(/\0+$/,''));
  return {version:b.readUInt32LE(4),meshes:json.meshes?.length||0,nodes:json.nodes?.length||0,textures:json.textures?.length||0,images:(json.images||[]).map(i=>({mimeType:i.mimeType,embedded:i.bufferView!==undefined,uri:i.uri||null})),externalUris:[...(json.buffers||[]),...(json.images||[])].map(v=>v.uri).filter(Boolean),extensionsUsed:json.extensionsUsed||[]};
}
const rows=[];
// Sequential hashing bounds I/O and memory while browser baselines run in parallel.
for(const file of files) {
  const path=relative(root,file), bytes=await readFile(file), type=extname(path).slice(1)||'(none)', sha256=createHash('sha256').update(bytes).digest('hex');
  const refs=references.filter(r=>r.target===path), runtimeRefs=refs.filter(r=>r.category==='runtime-literal'||r.category==='runtime-directory-candidate');
  const pages=routes.filter(route=>runtimeRefs.some(r=>reachable.get(route).has(r.owner)));
  const records=auditRecords.get(path)||[];
  const row={path,type,bytes:bytes.length,sha256,staticReferences:refs,possiblePages:pages,pageAttribution:'Module-graph potential use, not proof of a network request; catalog-only entries remain unknown.',firstScreenCritical:{status:'unknown',evidence:[]},networkTiming:'Requires browser trace; source inventory cannot establish request timing.',renderedDimensions:'Requires viewport/browser state; source dimensions are not rendered dimensions.',multiplePagesPotential:pages.length>1,existingVerification:records.length?{records:records.length,declaredPixelsIdentical:records.every(r=>!r.raster||r.pixelsIdentical===true),sha256MatchesAll:records.every(r=>(r.outputSha256||r.sourceSha256)===sha256),declaredBytesMatchAll:records.every(r=>r.after===bytes.length)}:null};
  if(type==='webp'){ row.image=webpInfo(bytes); if(row.image?.width)row.decodedRGBABytesEstimate=row.image.width*row.image.height*4; }
  else if(type==='mp4')row.video=mp4Info(bytes);
  else if(type==='glb')row.model=glbInfo(bytes);
  if(type==='webp'&&row.image?.encoding==='lossless VP8L')row.safeOptimization='Existing lossless image. Do not bulk re-encode. Evaluate responsive delivery separately with visual validation.';
  else row.safeOptimization='No automatic compression recommendation; assess actual request timing and usage.';
  for(const r of runtimeRefs) {
    const text=texts.get(r.owner)||'', line=text.split('\n')[r.line-1]||'';
    if(/rel=["']preload/.test(line)) {row.firstScreenCritical.evidence.push({owner:r.owner,line:r.line,reason:'Explicit preload declaration'});row.firstScreenCritical.status='explicit-preload';}
    else if(/hero/.test(line)&&/video|poster|image|src|url/i.test(line))row.firstScreenCritical.evidence.push({owner:r.owner,line:r.line,reason:'Hero-related source line; requires viewport confirmation'});
  }
  rows.push(row);
}
const byType={},byFolder={};
for(const r of rows)for(const [bag,key]of[[byType,r.type],[byFolder,r.path.split('/')[0]]]){bag[key]||={files:0,bytes:0};bag[key].files++;bag[key].bytes+=r.bytes;}
const groups=new Map(); for(const r of rows){const g=groups.get(r.sha256)||[];g.push(r);groups.set(r.sha256,g);}
const duplicates=[...groups.values()].filter(g=>g.length>1).map(g=>({sha256:g[0].sha256,bytesEach:g[0].bytes,paths:g.map(v=>v.path),potentialRedundantBytes:(g.length-1)*g[0].bytes}));
const devCandidates=rows.filter(r=>r.path.startsWith('website-code/scripts/')).map(r=>({path:r.path,bytes:r.bytes,reason:'Build/check/preview/conversion scripts; no browser dependency edge found.',incomingBrowserEdges:routes.filter(route=>reachable.get(route).has(r.path)),exclusionSafety:'Safe only if production build is run before excluding them, not by deleting source.'}));
const metadataCandidates=rows.filter(r=>r.path.startsWith('content/')&&!r.path.endsWith('.js')).map(r=>({path:r.path,bytes:r.bytes,reason:'Documentation/quality audit metadata, not imported by runtime module graph.',status:'candidate; search dynamic fetch and build contract before exclusion'}));
const sum=items=>items.reduce((a,r)=>a+r.bytes,0);
const summary={generatedAt:new Date().toISOString(),scope:['assets','content','website-code excluding dist'],fileCount:rows.length,totalSourceBytes:sum(rows),byType,byFolder,top20:[...rows].sort((a,b)=>b.bytes-a.bytes).slice(0,20).map(({path,type,bytes,possiblePages,image,video,model,firstScreenCritical})=>({path,type,bytes,possiblePages,image,video,model,firstScreenCritical})),duplicates,duplicateBytes:duplicates.reduce((a,g)=>a+g.potentialRedundantBytes,0),webp:{count:byType.webp?.files||0,lossless:rows.filter(r=>r.image?.encoding==='lossless VP8L').length,lossy:rows.filter(r=>r.image?.encoding==='lossy VP8').length,unknown:rows.filter(r=>r.type==='webp'&&!r.image?.width).length},manifests:{assetMapSummary:manifest.summary,productCatalogSummary:productManifest.summary,plantingOriginalKeys:Object.keys(plantingAssets).length,plantingVariantEntries:Object.values(plantingAssets).reduce((n,a)=>n+(a.variants?.length||0),0)},measurementDistinction:{sourceBytes:'Actual file byte sum excluding dist; not network transfer.',git:'Git object storage separate from source and transfer.',dist:'Build absent at audit start; root will measure actual production output.',decodedMemory:'Per-image width*height*4 estimate only; not total browser resident memory.',network:'Requires browser baseline; do not infer from directory size.'}};
try {summary.gitDiskKiB=Number(execFileSync('du',['-sk',resolve(root,'.git')],{encoding:'utf8'}).split(/\s/)[0]);}catch{}
const refAudit={generatedAt:summary.generatedAt,method:'Static literal paths + import/script/stylesheet graph; canonicalAsset aliases resolved. Runtime catalogs indexed as candidates, not assumed fetched. No deletion can be justified solely by absence from this graph.',routes,moduleGraph:[...dependencies].map(([owner,deps])=>({owner,dependencies:[...deps]})),references,missingLiteralReferences:references.filter(r=>!r.exists&&r.category==='runtime-literal'),unresolvedDynamicReferences:unresolved,productionExclusionCandidates:{scripts:devCandidates,metadata:metadataCandidates},unreferencedByLiteralCount:rows.filter(r=>r.path.startsWith('assets/')&&!r.staticReferences.length).length};
assert.equal(rows.filter(r=>r.type==='webp').length, rows.filter(r=>r.image?.width&&r.image?.height).length, 'Every WebP must have parsed dimensions');
assert.ok(rows.every(r=>r.bytes>0&&/^[a-f0-9]{64}$/.test(r.sha256)), 'Every file must have byte size and SHA-256');
assert.equal(sum(Object.values(byType).map(r=>({bytes:r.bytes}))), summary.totalSourceBytes);
assert.ok(rows.filter(r=>r.video).every(r=>r.video.tracks?.length), 'Every MP4 must have parsed tracks');
assert.ok(!reachable.get('website-code/index.html').has('website-code/company.html'), 'Navigation links must not become load dependencies');
for(const [name,value]of[['resource-inventory',rows],['resource-summary',summary],['reference-audit',refAudit]])await writeFile(resolve(out,`${name}.json`),JSON.stringify(value,null,2)+'\n');
console.log(JSON.stringify({files:summary.fileCount,bytes:summary.totalSourceBytes,byType:summary.byType,webp:summary.webp,duplicateBytes:summary.duplicateBytes,duplicateGroups:duplicates.length,top20:summary.top20.map(r=>({path:r.path,bytes:r.bytes})),missingRuntimeLiteralReferences:refAudit.missingLiteralReferences.length},null,2));
