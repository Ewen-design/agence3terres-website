<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  const slides = [
    {
      number: "01",
      title: "Le reflet\nd'un art",
      description: "Dans le silence apaisant d'un lac, chaque détail trouve son écho. Chez 3 Terres, nous nous plaçons comme la surface limpide où se reflète l'essence de votre marque.",
      image: "images/photo.webp",
      eyebrow: "Data so accurate", accent: "it's personal",
      stats: [
        { value: "99%", label: "Strategic Clarity",     note: "vision aligned across teams" },
        { value: "96%", label: "Execution Accuracy",    note: "from plan to delivery" },
        { value: "91%", label: "Operational Readiness", note: "systems designed to scale" },
        { value: "84%", label: "Adoption Potential",    note: "built for real use" },
      ],
    },
    {
      number: "02",
      title: "Les lumières\nde la création",
      description: "Cet univers urbain est le théâtre de notre créativité : élégant, moderne, vibrant. 3 Terres puise dans l'énergie de la ville l'audace d'inventer, de façonner des univers visuels qui marient esthétisme et ingéniosité.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80",
      eyebrow: "Innovation with intent", accent: "built to matter",
      stats: [
        { value: "98%", label: "Experience Precision", note: "designed around real behavior" },
        { value: "94%", label: "Innovation Impact",    note: "new ideas with clear value" },
        { value: "89%", label: "Interface Quality",    note: "refined across every layer" },
        { value: "81%", label: "Launch Confidence",    note: "ready for flagship release" },
      ],
    },
    {
      number: "03",
      title: "Les sommets\nde l'ambition",
      description: "La montagne est notre troisième terre, celle de l'ambition. Nous visons le sommet pour nos clients, en créant des expériences visuelles qui inspirent et marquent les esprits.",
      image: "images/montagne.webp",
      eyebrow: "Presence with meaning", accent: "designed to stay",
      stats: [
        { value: "97%", label: "Brand Consistency",    note: "across every touchpoint" },
        { value: "93%", label: "Creative Distinction", note: "crafted to stand apart" },
        { value: "88%", label: "Narrative Strength",   note: "clear emotional resonance" },
        { value: "79%", label: "Cultural Recall",      note: "made to be remembered" },
      ],
    },
  ];

  function tokenize(str) {
    const out = [];
    let idx = 0;
    for (const line of str.split("\n")) {
      if (out.length > 0) out.push({ br: true });
      for (const ch of line) {
        out.push({ br: false, ch: ch === " " ? "\u00A0" : ch, i: idx++ });
      }
    }
    return out;
  }
  const allTokens = slides.map(s => tokenize(s.title));

  let activeIndex = 0;
  let letterOps   = slides.map((_,si) => allTokens[si].map(() => 0));
  let descOpacity = 0;

  let sections = [];
  let secTop   = [];
  let secH     = [];
  let measured = false;

  const clamp = (v,lo,hi) => v<lo?lo:v>hi?hi:v;
  const norm  = (v,a,b)   => clamp((v-a)/(b-a),0,1);

  function measure() {
    const sy = window.lenis?.animatedScroll ?? window.scrollY ?? 0;
    secTop = []; secH = [];
    for (const el of sections) {
      if (!el) { secTop.push(0); secH.push(window.innerHeight||800); continue; }
      const r = el.getBoundingClientRect();
      secTop.push(r.top + sy);
      secH.push(r.height || window.innerHeight || 800);
    }
    measured = true;
  }

  function onScroll(scrollY, { vh }) {
    if (!measured) return;

    // ── Active slide ──────────────────────────────────────────────────────────
    let newActive = slides.length - 1;
    for (let i = 0; i < slides.length; i++) {
      if (scrollY + vh * 0.5 < secTop[i] + secH[i]) { newActive = i; break; }
    }
    if (newActive !== activeIndex) {
      activeIndex = newActive;
      descOpacity = 0;
    }

    // ── Letter opacities ──────────────────────────────────────────────────────
    const newOps = slides.map((_, si) => {
      const tokens = allTokens[si];
      const total  = tokens.filter(t => !t.br).length;
      if (total === 0) return tokens.map(() => 0);

      const sCenter       = secTop[si] + secH[si] * 0.4 - scrollY;
      const enterProgress = norm(vh - sCenter, 0, vh * 0.45);
      const exitProgress  = norm(sCenter, vh * 0.12, -vh * 0.20);

      return tokens.map(t => {
        if (t.br) return 0;
        const frac = t.i / (total - 1 || 1);
        const inOp  = norm(enterProgress, frac * 0.3, frac * 0.3 + 0.7);
        const outOp = 1 - norm(exitProgress, frac * 0.3, frac * 0.3 + 0.7);
        return clamp(Math.min(inOp, outOp), 0, 1);
      });
    });
    letterOps = newOps;

    // ── Description opacity ───────────────────────────────────────────────────
    const sCenter     = secTop[activeIndex] + secH[activeIndex] * 0.4 - scrollY;
    const descFadeIn  = norm(sCenter, vh * 0.52, vh * 0.30);
    const descFadeOut = 1 - norm(sCenter, vh * 0.10, -vh * 0.20);
    descOpacity       = clamp(descFadeIn * descFadeOut, 0, 1);
  }

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 100);
  }

  onMount(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      measure();
      registerParallax(onScroll);
    }));
    window.addEventListener("resize",            onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });
  });

  onDestroy(() => {
    unregisterParallax(onScroll);
    clearTimeout(resizeTimer);
    window.removeEventListener("resize",            onResize);
    window.removeEventListener("orientationchange", onResize);
  });
</script>

<section class="slider">
  <div class="sticky">
    <div class="backgrounds">
      {#each slides as slide, i}
        <div class="bg" class:active={activeIndex === i}>
          <img src={slide.image} alt="" />
          <div class="overlay"></div>
          <div class="vignette"></div>
        </div>
      {/each}
    </div>
    <div class="fixed-ui">
      <div class="bottom-left" style="opacity:{descOpacity.toFixed(3)}">
        <p>{slides[activeIndex].description}</p>
      </div>
    </div>
  </div>

  <div class="slides">
    {#each slides as slide, i}
      <section
        class="slide"
        bind:this={sections[i]}
        data-index={i}
      >
        <div class="content">
          <h2>
            {#each allTokens[i] as token, t}
              {#if token.br}
                <br />
              {:else}
                {@const op = letterOps[i]?.[t] ?? 0}
                <span style="opacity:{op.toFixed(3)};transform:translateY({((1-op)*16).toFixed(1)}px)">{token.ch}</span>
              {/if}
            {/each}
          </h2>
        </div>
      </section>
    {/each}
    <!-- Extra scroll space so the last title can fully exit before next component -->
    <div class="scroll-spacer"></div>
  </div>
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Aboreto&family=Cormorant+Garamond:ital,wght@1,400&display=swap");
  :global(body) { margin:0; background:#050b14; color:white; font-family:Inter,sans-serif; }
  :global(*) { box-sizing:border-box; }

  .slider { position:relative; width:100%; }

  .sticky {
    position:sticky; top:0;
    height:100vh; height:100svh;
    overflow:hidden; background:#050b14;
    isolation:isolate; z-index:0;
  }
  .sticky::before { content:""; position:absolute; inset:0; background:#050b14; z-index:0; }

  .backgrounds { position:absolute; inset:0; z-index:1; background:#050b14; }
  .bg { position:absolute; inset:0; opacity:0; transition:opacity 900ms ease; z-index:1; background:#050b14; }
  .bg.active { opacity:1; z-index:2; }
  .bg img { width:100%; height:100%; object-fit:cover; position:absolute; inset:0; display:block; transform:scale(1.02); }

  .overlay {
    position:absolute; inset:0;
    background:linear-gradient(to right,rgba(0,0,0,.84) 0%,rgba(0,0,0,.56) 28%,rgba(0,0,0,.18) 58%,rgba(0,0,0,.42) 100%);
  }
  .vignette {
    position:absolute; inset:0;
    background:radial-gradient(circle at 50% 50%,transparent 40%,rgba(0,0,0,.14) 100%);
    pointer-events:none;
  }

  .fixed-ui { position:absolute; inset:0; z-index:4; pointer-events:none; }

  .bottom-left {
    position:absolute;
    left:clamp(1.25rem,3vw,2.4rem);
    bottom:clamp(3rem,5vw,4.5rem);
    width:min(34rem,calc(100vw - 7rem));
    will-change:opacity;
  }
  .bottom-left p {
    margin:0;
    font-size:clamp(1.05rem,1.3vw,1.28rem);
    line-height:1.55;
    color:rgba(255,255,255,.88);
    max-width:31rem;
  }

  .slides { position:relative; z-index:3; }

  .slide {
    min-height:100vh; min-height:100svh;
    display:flex; align-items:center;
    padding:clamp(4rem,7vw,8rem) clamp(1.25rem,5vw,4.5rem);
    position:relative;
  }

  /*
   * La dernière slide a besoin d'espace supplémentaire après le titre
   * pour que le titre puisse finir de disparaître avant que le scroll
   * ne passe au composant suivant.
   * 50vh = largement assez pour que le titre sorte par le haut.
   */
  .scroll-spacer {
    height: 80vh;
  }

  .content { position:relative; z-index:5; width:min(100%,760px); padding-top:clamp(5rem,8vw,7rem); }

  h2 {
    font-family:"Aboreto",serif;
    font-style:italic;
    font-size:clamp(3.5rem,6vw,8rem);
    line-height:0.92; white-space:pre-line; margin:0;
    color:white; letter-spacing:0.02em;
    position:relative; z-index:5;
    max-width:10ch; text-wrap:balance;
    text-shadow:0 10px 40px rgba(0,0,0,.22);
  }
  h2 span { display:inline; will-change:opacity,transform; }

  @media (min-width:1440px) { .content { width:min(100%,820px); } }

  @media (max-width:1024px) {
    .slide { padding:5rem 2.25rem; }
    .content { width:min(100%,680px); padding-top:6rem; }
    h2 { font-size:clamp(3rem,8vw,5.5rem); max-width:11ch; }
  }

  @media (max-width:800px) {
    .overlay { background:linear-gradient(to top,rgba(0,0,0,.8) 0%,rgba(0,0,0,.56) 28%,rgba(0,0,0,.24) 56%,rgba(0,0,0,.44) 100%); }
    .slide { align-items:flex-end; padding:0 1.25rem 7.6rem; }
    .content { width:100%; max-width:100%; padding-top:0; }
    h2 { font-size:clamp(2.3rem,12vw,4.2rem); line-height:.94; max-width:100%; margin-bottom:7rem; }
    .bottom-left { left:1rem; right:1rem; bottom:1rem; width:auto; }
    .bottom-left p { max-width:22rem; font-size:.94rem; line-height:1.42; }
  }

  @media (max-width:480px) {
    .slide { padding:0 1rem 7rem; }
    h2 { font-size:clamp(2rem,13vw,3.2rem); line-height:.96; letter-spacing:.01em; margin-bottom:6.8rem; }
    .bottom-left p { font-size:.88rem; max-width:16rem; color:rgba(255,255,255,.84); }
  }
</style>