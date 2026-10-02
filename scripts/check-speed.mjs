import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { products } from '../src/products.js';
const base=process.env.FORTIS_TEST_URL || 'http://127.0.0.1:4189';
const browser=await chromium.launch({args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[];
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error' && /React|hydration|Hydration/i.test(m.text()))errors.push(m.text());});
 const routes=['/','/products','/about','/compounding','/partners','/contact','/editorial','/privacy',...products.map(p=>`/products/${p.slug}`)];
 for(const route of routes){
  const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,route);
  await page.getByRole('heading',{level:1}).waitFor();
  await page.waitForFunction(()=>document.querySelector('.theme-switch')!==null);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${route}`);
  const data=await page.locator('#page-data').textContent();
  const parsed=JSON.parse(data);
  assert.equal(parsed.products.length,route==='/products'?products.length:route.startsWith('/products/')?1:route==='/'?products.filter(p=>p.featured).length:0);
  if(route.startsWith('/products/')){
   await page.waitForFunction(()=>{const i=document.querySelector('.detail-visual img');return i?.complete&&i.naturalWidth>0});
   assert.equal(await page.locator('.medicine-section').count(),9);
  }
 }
 await page.goto(base+'/products');
 await page.locator('#product-search').fill('არარსებული-პროდუქტი');
 await page.waitForFunction(()=>document.querySelectorAll('.product-card').length===0);
 await page.getByRole('button',{name:'ფილტრების გასუფთავება',exact:true}).click();
 assert.equal(await page.locator('.product-card').count(),products.length);
 assert.equal(await page.locator('.catalog-facet').count(),0);
 assert.equal(await page.locator('.filter-note').count(),0);
 await page.getByRole('switch').click();
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 await page.reload();
 await page.waitForFunction(()=>document.querySelector('[role="switch"]').getAttribute('aria-checked')==='true');
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
 await page.getByRole('button',{name:'დარეკეთ აფთიაქში',exact:true}).click();
 assert.equal(await page.locator('dialog').evaluate(e=>e.open),true);
 await page.getByRole('button',{name:'ფანჯრის დახურვა'}).click();
 for(const width of [320,390,700,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto(base+'/products');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`catalog ${width}`);
  const sizes=await page.locator('.product-image').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  if(width<=700)assert.equal(new Set(sizes.map(s=>`${s.w}:${s.h}`)).size,1,`equal cards ${width}`);
  await page.screenshot({path:`/tmp/fortis-products-${width}.png`});
 }
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const staticPage=await nojs.newPage();
 for(const route of ['/','/products',`/products/${products[0].slug}`]){
  await staticPage.goto(base+route);assert.equal(await staticPage.locator('h1').count(),1);
  assert.ok((await staticPage.locator('main').innerText()).length>100);
 }
 await nojs.close();
 const modelContext=await browser.newContext({viewport:{width:1440,height:1000}});
 const modelPage=await modelContext.newPage();modelPage.on('pageerror',e=>errors.push(e.message));
 await modelPage.addInitScript(() => { window.heroShifts = []; new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.heroShifts.push(entry.value); }).observe({type:'layout-shift',buffered:true}); });
 await modelPage.goto(base);
 await modelPage.waitForSelector('.equipment-ready',{timeout:90000});
 assert.ok(await modelPage.evaluate(()=>window.heroShifts.reduce((a,b)=>a+b,0)<0.1), '3D loading must preserve hero layout');
 await modelPage.getByRole('button',{name:'მოძრაობის შეჩერება',exact:true}).click();
 assert.equal(await modelPage.locator('model-viewer').evaluate(e=>e.paused),true);
 await modelPage.getByRole('button',{name:'მოძრაობის ჩართვა',exact:true}).click();
 await modelPage.getByRole('button',{name:'საწყისი ხედი',exact:true}).click();
 await modelPage.screenshot({path:'/tmp/fortis-optimized-desktop.png'});
 await modelContext.close();
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${routes.length} public routes; content without JavaScript; product details/images; search and temporarily hidden direction filters; persistent dark mode; contact dialog; equal mobile cards at 320/390/700; desktop layout; 3D model, animation, pause and reset; no page/hydration errors.`);
}finally{await browser.close();}
