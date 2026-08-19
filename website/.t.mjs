import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = []; p.on('pageerror', e => errs.push(e.message));
const state = () => p.evaluate(() => { const v = document.querySelector('.hero-media video');
  return v ? { t:+v.currentTime.toFixed(2), paused:v.paused, rs:v.readyState,
               filtre:getComputedStyle(v).filter } : null; });
await p.goto('http://localhost:5199/', { waitUntil:'commit' });
await p.waitForTimeout(900); await p.keyboard.press('Escape'); await p.waitForTimeout(2500);
console.log('depart          ', JSON.stringify(await state()));
// 1. redimensionnement plein ecran -> fenetre plus petite
await p.setViewportSize({ width: 900, height: 700 }); await p.waitForTimeout(1500);
console.log('apres resize    ', JSON.stringify(await state()));
await p.setViewportSize({ width: 1600, height: 1000 }); await p.waitForTimeout(1500);
console.log('resize retour   ', JSON.stringify(await state()));
// 2. navigation ailleurs puis retour
await p.evaluate(() => history.pushState({}, '', '/services'));
await p.goto('http://localhost:5199/services', { waitUntil:'commit' }); await p.waitForTimeout(1800);
await p.goto('http://localhost:5199/', { waitUntil:'commit' });
await p.waitForTimeout(900); await p.keyboard.press('Escape'); await p.waitForTimeout(2500);
console.log('retour sur home ', JSON.stringify(await state()));
// avance-t-elle encore ?
const a = (await state()).t; await p.waitForTimeout(1600); const c = (await state()).t;
console.log(`lecture: ${a} -> ${c}  ${c>a ? 'AVANCE' : 'BLOQUEE'}`);
console.log(errs.length ? 'ERREURS ' + errs.join(' | ') : 'aucune erreur');
await b.close();
