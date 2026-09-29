<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Le halo du contour du bouton suit le curseur (comme dans le header).
  function handleButtonMove(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  //  ContactBlock — le bloc de prise de contact de la home
  //
  //  Un cadre aux marges et à l'arrondi du site, une image en plein cadre, un
  //  voile pour tenir le texte, la phrase et le bouton au centre. Rien d'autre.
  // ───────────────────────────────────────────────────────────────────────────

  // La photo du volet « Une ambition » de la page à propos.
  export let image = "/images/pexels-jack-atkinson-1289771108-24356055.webp";
  export let alt = "Silhouette au sommet, au-dessus des nuages, à l'aube";
  export let lead = "Dites-nous tout. <span class='dim'>On s'occupe du reste.</span>";
  export let cta = "Nous contacter";
  export let href = "/contact";
</script>

<section class="cblock" aria-label="Prise de contact">
  <div class="cblock__frame">
    <img class="cblock__img" src={image} {alt} loading="lazy" decoding="async" draggable="false" />
    <div class="cblock__veil" aria-hidden="true"></div>

    <div class="cblock__body">
      <p class="cblock__lead" use:reveal>{@html lead}</p>
      <a
        class="cblock__cta nav-btn"
        {href}
        data-cursor="button"
        data-sveltekit-preload-data="hover"
        on:mousemove={handleButtonMove}
      >
        <span class="nav-btn-flip" data-text={cta}>
          <span class="nav-btn-text">{cta}</span>
        </span>
      </a>
    </div>
  </div>
</section>

<style>
  .cblock {
    box-sizing: border-box;
    width: 100%;
    background: var(--bg-deep, #000);
    padding: clamp(3rem, 7vh, 6rem) var(--site-inset) clamp(4rem, 9vh, 8rem);
    overflow-x: clip;
  }

  .cblock__frame {
    position: relative;
    /* `svh` et jamais `vh` : sur iOS, `vh` se mesure sur l'écran SANS la barre
       d'outils, et le cadre serait plus haut que prévu tant qu'elle est là. */
    height: 80svh;
    border-radius: 22px;
    overflow: hidden;
    background: var(--bg-raised, #080808);
    isolation: isolate;
  }

  .cblock__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    z-index: 0;
  }

  /* Voile : la phrase se pose au milieu de l'image, il lui faut un socle. Des
     paliers rapprochés, pour qu'aucune arête ne se voie. */
  .cblock__veil {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      radial-gradient(75% 70% at 50% 50%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.62) 0%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.52) 26%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.38) 48%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.22) 68%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.1) 84%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.04) 100%),
      linear-gradient(to top,
        rgba(var(--shade-rgb, 0, 0, 0), 0.34) 0%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.18) 18%,
        rgba(var(--shade-rgb, 0, 0, 0), 0.06) 36%,
        rgba(var(--shade-rgb, 0, 0, 0), 0) 54%);
  }

  .cblock__body {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(1.6rem, 3vw, 2.6rem);
    padding: clamp(1.4rem, 3vw, 3rem);
  }

  /* Même gabarit que les autres phrases d'accroche du site. */
  .cblock__lead {
    margin: 0;
    width: 45rem;
    max-width: 100%;
    font-family: var(--site-font);
    font-weight: 500;
    font-size: clamp(1.375rem, 2.9vw, 2.25rem);
    line-height: 1.2;
    letter-spacing: -0.01em;
    text-align: center;
    color: #f4efe6;
    text-wrap: balance;
  }

  .cblock__lead :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  /* ── Le bouton : celui du menu du header, à l'identique ──────────────────── */
  .cblock__cta {
    height: 40px;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    color: #fff;
    text-decoration: none;
  }

  .nav-btn {
    position: relative;
    font-family: var(--site-font);
    font-weight: var(--site-weight);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    cursor: pointer;
    border: 0;
    background: rgba(255, 255, 255, 0.11);
    backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    -webkit-backdrop-filter: blur(20px) saturate(160%) brightness(0.82);
    will-change: transform, opacity;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 10px;
    box-shadow: 0 6px 8px rgba(var(--shade-rgb, 0, 0, 0), 0.04);
    transition:
      color 220ms ease,
      transform 1.2s cubic-bezier(.22, .61, .36, 1),
      background 1.2s cubic-bezier(.22, .61, .36, 1);
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    transform: translateZ(0) translateY(-2px);
  }

  .nav-btn-flip {
    position: relative;
    display: block;
    overflow: hidden;
    height: 1.2em;
    line-height: 1.2em;
  }

  .nav-btn-text {
    display: block;
    transform: translateY(0%);
    transition: transform 0.45s cubic-bezier(.22, .61, .36, 1);
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition: transform 0.45s cubic-bezier(.22, .61, .36, 1);
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  /* Halo de contour au survol : un liseré d'un pixel, allumé par un dégradé
     radial qui suit le curseur. Le masque `xor` ne garde que le contour, ce qui
     respecte l'arrondi. Mêmes rayons que le bouton du header, puisque c'est son
     gabarit. */
  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .nav-btn::before {
    background: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-strong) 0%,
      var(--site-glow-mid) 22%,
      var(--site-glow-soft) 45%,
      var(--site-glow-fade) 62%,
      transparent 78%
    );
  }

  .nav-btn::after {
    background: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      var(--site-glow-ambient) 0%,
      var(--site-glow-outer) 42%,
      transparent 72%
    );
    filter: blur(2px);
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .nav-btn:focus-visible {
    outline: 2px solid var(--lead-blue, #5768ff);
    outline-offset: 3px;
  }

  @media (max-width: 900px) {
    .cblock {
      padding: clamp(2.4rem, 6vh, 4rem) 1rem clamp(3rem, 8vh, 6rem);
    }

    .cblock__frame {
      border-radius: 18px;
    }

    .cblock__lead {
      width: 100%;
    }
  }
</style>
