// ───────────────────────────────────────────────────────────────────────────
//  Faire une chose « au calme » — quand la page ne défile plus (2026-11-20).
//
//  Pour ce qui touche aux calques FIXES de la page, comme retirer un
//  préchauffage de flou (`*-blur-prewarm`, posé en `position: fixed`). Fait en
//  plein défilement, ce retrait dérangeait Safari : la page n'était plus là où
//  Lenis l'avait posée (« reprise » du diagnostic `?diag-molette`, un léger
//  à-coup) — au premier passage de la home, vers « Chaque projet devient une
//  signature. », pile 9 s après le chargement, quand le préchauffage du slider
//  des projets était retiré à heure fixe.
//
//  `auCalme(fn, { apres, calme, max })` : `fn` part au plus tôt `apres` ms
//  après l'appel, une fois la page immobile depuis `calme` ms — et au plus
//  tard `max` ms après ce délai, quoi qu'il arrive. Renvoie une fonction qui
//  annule. Le défilement est écouté en capture : vaut aussi pour le bloc qui
//  défile sur écran tactile (`$lib/defileur.js`).
// ───────────────────────────────────────────────────────────────────────────
let dernierDefilement = 0;
let suivi = false;

function suivreDefilement() {
  if (suivi) return;
  suivi = true;
  window.addEventListener(
    "scroll",
    () => {
      dernierDefilement = performance.now();
    },
    { passive: true, capture: true }
  );
}

export function auCalme(fn, { apres = 0, calme = 400, max = 30000 } = {}) {
  if (typeof window === "undefined") return () => {};
  suivreDefilement();
  const debut = performance.now() + apres;
  let minuterie = 0;
  let fini = false;
  const essayer = () => {
    if (fini) return;
    const maintenant = performance.now();
    const attente = Math.max(debut - maintenant, dernierDefilement + calme - maintenant);
    if (attente > 0 && maintenant - debut < max) {
      minuterie = window.setTimeout(essayer, attente + 20);
      return;
    }
    fini = true;
    fn();
  };
  minuterie = window.setTimeout(essayer, apres);
  return () => {
    fini = true;
    clearTimeout(minuterie);
  };
}
