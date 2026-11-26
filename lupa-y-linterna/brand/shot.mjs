import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('/opt/node-tools/node_modules/playwright');
const b = await chromium.launch(); 
for (const [f,w,h] of [["banner",2560,1440],["avatar",800,800]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto("file://"+process.cwd()+"/"+f+".html"); await p.waitForTimeout(600);
  await p.screenshot({ path: f+".png" }); }
await b.close();
