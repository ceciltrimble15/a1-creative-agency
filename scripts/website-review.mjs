import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const arg = name => process.argv.find(a=>a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const base = new URL(arg('base-url') || 'http://127.0.0.1:4173');
if (!['127.0.0.1','localhost','[::1]'].includes(base.hostname)) throw new Error('This review only accepts a local preview; deployed tests need explicit scope.');
const out = resolve(arg('output-dir') || 'artifacts/website-review');
await mkdir(out,{recursive:true});
const report = { createdAt:new Date().toISOString(), base:base.href, status:'blocked', checks:[], evidence:[], limitations:['No form submissions, outbound calls, messages, purchases or live integration verification.','Screenshots require human/agent inspection against the brief; these checks do not certify the entire design.'] };
const check = (name,passed,detail) => report.checks.push({name,passed,detail});
let browser;
try {
  browser = await chromium.launch({headless:true});
  for (const [name,width,height] of [['phone',390,844],['landscape',844,390],['desktop',1440,1000]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    // Only local resources are needed. No external analytics or customer requests.
    await page.route('**/*',route=>new URL(route.request().url()).origin===base.origin ? route.continue() : route.abort());
    const response = await page.goto(base.href,{waitUntil:'load'});
    check(`${name}: homepage loads`,response?.status()===200,response?.status());
    await page.evaluate(()=>document.fonts.ready);
    check(`${name}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    check(`${name}: one main heading`,await page.locator('main h1').count()===1);
    const action = page.locator('.wrap .cta-row .btn-primary');
    const bounds = await action.boundingBox();
    // Landscape has deliberately less vertical room; preserve access, not an arbitrary fold requirement.
    check(`${name}: primary action available`,await action.isVisible());
    if (name!=='landscape') check(`${name}: primary action on first screen`,!!bounds && bounds.y>=0 && bounds.y+bounds.height<=height,bounds);
    const headings = await page.locator('main h1, main h2').allTextContents();
    check(`${name}: descriptive section headings`,headings.length>=5 && headings.every(s=>s.trim().length>0),headings);
    const heroImage = page.locator('.wrap img.mark');
    check(`${name}: official hero image loads`,await heroImage.evaluate(i=>i.complete && i.naturalWidth>0));
    await page.locator('#featured-project').scrollIntoViewIfNeeded();
    const image = page.locator('#featured-project img');
    await image.evaluate(i=>i.decode());
    check(`${name}: project image loads`,await image.evaluate(i=>i.naturalWidth>0));
    await page.screenshot({path:resolve(out,`${name}-full.png`),fullPage:true});
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:resolve(out,`${name}-hero.png`)});
    report.evidence.push(`${name}-full.png`,`${name}-hero.png`);
    if(name==='desktop') {
      const links = await page.locator('main a[href^="/"]').evaluateAll(a=>[...new Set(a.map(x=>x.getAttribute('href')))]);
      for(const href of links) {
        const response = await page.request.get(new URL(href,base).href);
        check(`local destination: ${href}`,response.status()===200,response.status());
      }
      await page.goto(new URL('/quote?package=quicklaunch',base).href,{waitUntil:'load'});
      check('quote handoff: package selection',await page.locator('#q-service').inputValue()==='Website' && (await page.locator('#package-summary').textContent()).includes('QuickLaunch Kit'));
    }
    await page.close();
  }
  report.status = report.checks.every(c=>c.passed) ? 'checks-passed-visual-review-required' : 'failed';
} catch(error) { report.blocker=String(error); report.status='blocked'; }
finally { await browser?.close(); }
await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
process.exitCode = report.status==='checks-passed-visual-review-required' ? 0 : 1;
