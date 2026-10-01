import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try {
 for(const path of (process.env.FORTIS_BENCH_PATHS || '/,/products').split(','))for(let run=0;run<3;run++)for(const [version,base] of [['before',process.env.FORTIS_BEFORE_URL || 'http://127.0.0.1:4188'],['after',process.env.FORTIS_AFTER_URL || 'http://127.0.0.1:4189']].filter(([version])=>!process.env.FORTIS_BENCH_VERSION || process.env.FORTIS_BENCH_VERSION===version)){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
  const page=await context.newPage();const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{
   window.audit={lcp:0,cls:0,longTasks:0};
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.audit.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.audit.cls+=e.value}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.audit.longTasks+=Math.max(0,e.duration-50)}).observe({type:'longtask',buffered:true});
  });
  await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:90000});
  await page.getByRole('heading',{level:1}).waitFor();
  const heading=await page.evaluate(()=>performance.now());
  await page.waitForTimeout(10000);
  const metrics=await page.evaluate(()=>({ ...window.audit,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,domReady:performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,bytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0),resources:performance.getEntriesByType('resource').map(r=>({name:r.name.split('/').pop(),start:r.startTime,bytes:r.transferSize}))}));
  results.push({version,path,run,heading,...metrics});console.log(JSON.stringify({...results.at(-1),resources:undefined}));
  await context.close();
 }
 await fs.writeFile('/tmp/fortis-speed-benchmark.json',JSON.stringify(results,null,2));
}finally{await browser.close();}
