import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import lighthouse from '../tooling/node_modules/lighthouse/core/index.js';
import { launch } from '../tooling/node_modules/chrome-launcher/dist/index.js';
import { throttling, userAgents } from '../tooling/node_modules/lighthouse/core/config/constants.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const qa = path.join(root, 'notes/prelaunch-qa');
const output = path.join(qa, 'performance');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const pages = ['index', 'company', 'planting', 'products', 'service', 'ai', 'contact'];
const profiles = [
  {name:'desktop', width:1440, height:900, dpr:1, formFactor:'desktop', mobile:false, throttling:throttling.desktopDense4G, userAgent:userAgents.desktop},
  {name:'mobile', width:390, height:844, dpr:3, formFactor:'mobile', mobile:true, throttling:throttling.mobileSlow4G, userAgent:userAgents.mobile},
];
const chromeFlags = ['--headless=new', '--no-first-run', '--no-default-browser-check', '--mute-audio'];
const summary = {
  stage:'Phase 01 initial lab baseline, not final acceptance',
  baselineCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
  startedAt:new Date().toISOString(),
  environment:{os:execFileSync('sw_vers',[],{encoding:'utf8'}).trim(),node:process.version,lighthouse:'13.5.0',chrome:execFileSync(chromePath,['--version'],{encoding:'utf8'}).trim(),platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0]?.model,logicalCpus:os.cpus().length,chromePath,extraChromeFlags:chromeFlags,headless:true,freshProfilePerRun:true,runConcurrency:1},
  limitations:[
    'Local loopback HTTP development server; no public hosting, CDN, TLS, production cache/compression, real network geography or published SEO measured.',
    'Lighthouse simulated throttling is a laboratory model. Mobile viewport390x844 uses DPR3; desktop1440x900 uses DPR1. CSS pixels are recorded independently of physical display.',
    'Each page/profile was measured once; shared host also runs one screenshot browser context. CPU contention and run-to-run variability are possible; these scores are not stable rankings.',
    'Navigation/initial viewport only; homepage scroll-driven opening remains in its initial state. Results do not cover all below-fold interactive chapters, subroutes, forms or interaction states.',
    'TBT is a lab blocking-time metric, not INP. No real-user INP/RUM/CrUX data available. No claim of field Web Vitals pass.',
    'Accessibility and SEO automated scores require manual validation and do not prove WCAG conformance or publication readiness.'
  ],
  profiles:profiles.map(p=>({...p,throttlingMethod:'simulate'})),runs:[]
};
await fs.mkdir(output,{recursive:true});
const save = ()=>fs.writeFile(path.join(qa,'data/performance-summary.json'),JSON.stringify(summary,null,2)+'\n');
await save();
for (const p of profiles) for (const slug of pages) {
  const name = `${slug}-${p.name}-${p.width}x${p.height}`;
  const url = `http://127.0.0.1:4196/website-code/${slug}.html`;
  const dir = path.join(output,p.name,slug);
  const profile = path.join(qa,'.runtime/lighthouse-profiles',name);
  const run = {slug,profile:p.name,url,cssViewport:{width:p.width,height:p.height},dpr:p.dpr,startedAt:new Date().toISOString(),hostLoadAverageBefore:os.loadavg(),status:'running'};
  summary.runs.push(run);await save();
  await fs.mkdir(dir,{recursive:true});
  await fs.mkdir(profile,{recursive:true});
  let chrome,timeout;
  console.log(`START ${name} ${run.startedAt}`);
  try {
    chrome = await launch({chromePath,userDataDir:profile,chromeFlags});
    run.chromeLaunchArgs=chrome.process.spawnargs;
    const config = {extends:'lighthouse:default',settings:{onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:p.formFactor,screenEmulation:{mobile:p.mobile,width:p.width,height:p.height,deviceScaleFactor:p.dpr,disabled:false},emulatedUserAgent:p.userAgent,throttlingMethod:'simulate',throttling:p.throttling,maxWaitForFcp:30000,maxWaitForLoad:45000}};
    await fs.writeFile(path.join(dir,'configuration.json'),JSON.stringify({url,flags:{output:['html','json'],logLevel:'error'},config,chromeLaunchArgs:run.chromeLaunchArgs},null,2)+'\n');
    const result = await Promise.race([
      lighthouse(url,{port:chrome.port,output:['html','json'],logLevel:'error'},config),
      new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Audit exceeded150-second watchdog')),150000)})
    ]);
    clearTimeout(timeout);
    if(!result?.lhr)throw new Error('Lighthouse returned no report');
    await fs.writeFile(path.join(dir,'report.html'),result.report[0]);
    await fs.writeFile(path.join(dir,'report.json'),result.report[1]);
    const lhr=result.lhr;
    const metric=id=>({value:lhr.audits[id]?.numericValue,unit:lhr.audits[id]?.numericUnit,display:lhr.audits[id]?.displayValue,score:lhr.audits[id]?.score});
    run.status=lhr.runtimeError?'runtime-error':'completed';run.runtimeError=lhr.runtimeError;
    run.fetchTime=lhr.fetchTime;run.finalDisplayedUrl=lhr.finalDisplayedUrl;run.runWarnings=lhr.runWarnings;
    run.settings=lhr.configSettings;run.lighthouseEnvironment=lhr.environment;
    run.scores=Object.fromEntries(Object.entries(lhr.categories).map(([id,v])=>[id,v.score===null?null:Math.round(v.score*100)]));
    run.metrics={fcp:metric('first-contentful-paint'),lcp:metric('largest-contentful-paint'),tbt:metric('total-blocking-time'),cls:metric('cumulative-layout-shift'),speedIndex:metric('speed-index')};
    run.inp={measured:false,reason:'Navigation Lighthouse report does not provide real-user INP; do not substitute TBT'};
    run.totalByteWeight=lhr.audits['total-byte-weight']?.numericValue;
    run.failedAudits=Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1&&!['notApplicable','manual','informative'].includes(a.scoreDisplayMode)).map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue,metricSavings:a.metricSavings,detailsType:a.details?.type,overallSavingsMs:a.details?.overallSavingsMs,overallSavingsBytes:a.details?.overallSavingsBytes}));
    run.resources=(lhr.audits['network-requests']?.details?.items||[]).map(({url,resourceType,statusCode,transferSize,resourceSize,startTime,endTime})=>({url,resourceType,statusCode,transferSize,resourceSize,startTime,endTime}));
    run.report=path.relative(qa,path.join(dir,'report.html'));run.json=path.relative(qa,path.join(dir,'report.json'));
    const screenshot=lhr.audits['final-screenshot']?.details?.data;
    if(screenshot){const [,mime,data]=screenshot.match(/^data:([^;]+);base64,(.+)$/)||[];if(data){const filename=mime==='image/png'?'final-viewport.png':'final-viewport.jpg';await fs.writeFile(path.join(dir,filename),Buffer.from(data,'base64'));run.initialViewportImage=path.relative(qa,path.join(dir,filename));}}
    console.log(`DONE ${name} ${JSON.stringify(run.scores)} LCP=${run.metrics.lcp.value} TBT=${run.metrics.tbt.value} CLS=${run.metrics.cls.value}`);
  } catch(error) {
    clearTimeout(timeout);run.status='failed';run.error=String(error.stack||error);
    await fs.writeFile(path.join(dir,'failure.txt'),run.error+'\n');
    console.log(`FAIL ${name} ${error.message}`);
  } finally {
    if(chrome)try{await chrome.kill()}catch(error){run.chromeCleanupError=String(error)}
    run.finishedAt=new Date().toISOString();run.hostLoadAverageAfter=os.loadavg();await save();
  }
}
summary.finishedAt=new Date().toISOString();await save();
console.log('ALL AUDITS FINISHED');
