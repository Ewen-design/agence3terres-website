import { chromium } from 'playwright';
const OUT='/private/tmp/claude-501/-Users-ewenvidamment/0cce325d-5bf4-434d-8925-a6f25565bcc9/scratchpad/web';
const errs=[];
for (const [n,vp] of [['z_d',{width:1440,height:900}],['z_m',{width:390,height:844}]]) {
  const b=await chromium.launch(); const p=await b.newPage({viewport:vp});
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:5199/',{waitUntil:'commit'});
  await p.waitForTimeout(900); await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
  console.log(n, JSON.stringify(await p.evaluate(()=>{const v=document.querySelector('.hero-media video');
    return {src:v.currentSrc.split('/').pop(),dur:+v.duration.toFixed(1),loop:v.loop,paused:v.paused};})));
  for (let i=0;i<4;i++){ await p.screenshot({path:`${OUT}/${n}${i}.png`}); await p.waitForTimeout(2400); }
  await b.close();
}
console.log(errs.length?'ERREURS '+errs.join(' | '):'aucune erreur');
