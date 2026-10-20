<script>
  /*  Panneau de diagnostic TEMPORAIRE (2026-10-20) — header et cache du haut
   *  qui descendent sur iPhone. Inactif sauf si l'adresse contient
   *  `?debug-fixes` (retenu pour l'onglet, `?debug-fixes=0` l'éteint). À
   *  retirer une fois le bug compris. */
  import { onMount } from "svelte";

  let on = false;
  let lines = [];
  let log = [];
  let probe;
  let timer;

  const r = (n) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : n);

  function sample() {
    const vv = window.visualViewport;
    const header = document.querySelector(".nav-wrapper")?.getBoundingClientRect();
    const mask = document.querySelector(".ios-top-mask")?.getBoundingClientRect();
    const stage = document.querySelector(".page-stage");
    const main = document.querySelector("main");
    const cs = main ? getComputedStyle(main) : null;
    lines = [
      `y ${r(scrollY)}  innerH ${innerHeight}  clientH ${document.documentElement.clientHeight}`,
      `vv top ${r(vv?.offsetTop)}  pageTop ${r(vv?.pageTop)}  h ${r(vv?.height)}  s ${r(vv?.scale)}`,
      `safe-top ${probe ? getComputedStyle(probe).paddingTop : "?"}  docH ${document.documentElement.scrollHeight}`,
      `header ${r(header?.top)}  mask ${r(mask?.top)}/${r(mask?.height)}`,
      `html ov ${document.documentElement.style.overflow || "-"}  stage tf ${stage?.style.transform ? "oui" : "-"}`,
      `main tf ${cs?.transform}  filt ${cs?.filter}  wc ${cs?.willChange}`
    ];
  }

  function note(msg) {
    log = [`${new Date().toLocaleTimeString()} ${msg}`, ...log].slice(0, 4);
  }

  function nudge(px) {
    const y = scrollY;
    scrollTo(0, y + px);
    requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(0, y)));
    note(`saut ${px}px`);
  }

  function repaint() {
    for (const el of document.querySelectorAll(".nav-wrapper, .ios-top-mask")) {
      const d = el.style.display;
      el.style.display = "none";
      void el.offsetHeight;
      el.style.display = d;
    }
    note("repeint");
  }

  function toggleMask() {
    const m = document.querySelector(".ios-top-mask");
    if (!m) return;
    m.style.visibility = m.style.visibility === "hidden" ? "" : "hidden";
    note(`cache ${m.style.visibility || "visible"}`);
  }

  onMount(() => {
    const q = new URLSearchParams(location.search).get("debug-fixes");
    try {
      if (q === "0") sessionStorage.removeItem("debug-fixes");
      else if (q !== null) sessionStorage.setItem("debug-fixes", "1");
      on = sessionStorage.getItem("debug-fixes") === "1";
    } catch {
      on = q !== null && q !== "0";
    }
    if (!on) return;
    timer = setInterval(sample, 250);
    const ev = (name) => () => note(name);
    const fns = [
      ["app:fixed-resync", ev("resync")],
      ["pageshow", ev("pageshow")]
    ];
    fns.forEach(([n, f]) => addEventListener(n, f));
    return () => {
      clearInterval(timer);
      fns.forEach(([n, f]) => removeEventListener(n, f));
    };
  });
</script>

{#if on}
  <div class="fd-probe" bind:this={probe}></div>
  <div class="fd">
    {#each lines as l}<div>{l}</div>{/each}
    {#each log as l}<div class="fd-log">{l}</div>{/each}
    <div class="fd-btns">
      <button on:click={() => nudge(1)}>1 px</button>
      <button on:click={() => nudge(120)}>120 px</button>
      <button on:click={repaint}>Repeindre</button>
      <button on:click={toggleMask}>Cache</button>
    </div>
  </div>
{/if}

<style>
  .fd-probe {
    position: fixed;
    visibility: hidden;
    padding-top: env(safe-area-inset-top, 0px);
  }

  .fd {
    position: fixed;
    left: 8px;
    right: 8px;
    bottom: 110px;
    z-index: 2147483000;
    padding: 8px;
    border-radius: 8px;
    background: rgba(255, 230, 0, 0.92);
    color: #000;
    font: 11px/1.35 ui-monospace, Menlo, monospace !important;
    white-space: pre-wrap;
    pointer-events: auto;
  }

  .fd * {
    font: inherit !important;
  }

  .fd-log {
    color: #6a2600;
  }

  .fd-btns {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }

  .fd-btns button {
    flex: 1;
    padding: 8px 0;
    border-radius: 6px;
    background: #000;
    color: #fff;
  }
</style>
