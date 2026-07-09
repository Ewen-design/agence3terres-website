<script>
  import { reveal } from "$lib/actions/reveal.js";

  // Texte central figé (sticky) pendant que des visuels projets défilent sur les
  // côtés. Puis, EN DESSOUS et sans chevauchement, une image de clôture qui vient
  // se centrer : le texte se relâche puis remonte, l'image arrive au milieu.
</script>

<section class="open">
  <!-- Étage figé : texte sticky + visuels flottants qui défilent. -->
  <div class="open__stage">
    <div class="open__media" aria-hidden="true">
      <!-- Identité / charte : deux images superposées + trois pastilles au-dessus. -->
      <div class="open__colors open__pos-colors" use:reveal>
        <span class="open__colors-dots">
          <i style="background:#ffffff"></i>
          <i style="background:#0015ff"></i>
          <i style="background:#12161d"></i>
        </span>
        <span class="open__colors-stack">
          <img class="open__colors-a" src="/images/justx_textile.webp" alt="" loading="lazy" decoding="async" />
          <img class="open__colors-b" src="/images/justx.webp" alt="" loading="lazy" decoding="async" />
        </span>
      </div>

      <!-- Carte typographie. -->
      <figure class="open__type open__pos-type" use:reveal={{ delay: 90 }}>
        <span class="open__type-label">Neue Montreal</span>
        <span class="open__type-glyph">Aa</span>
      </figure>

      <!-- JustX Fitness : écran d'app + icône dans le coin. -->
      <figure class="open__phone open__pos-phone" use:reveal>
        <span class="open__phone-screen">
          <img src="/images/justx_app.webp" alt="" loading="lazy" decoding="async" />
        </span>
        <img class="open__phone-icon" src="/images/justx_icon.webp" alt="" loading="lazy" decoding="async" />
      </figure>

      <!-- Autres projets : photos. -->
      <figure class="open__photo open__pos-photo-a" use:reveal={{ delay: 80 }}>
        <img src="/images/jeu_mockup.webp" alt="" loading="lazy" decoding="async" />
      </figure>

      <figure class="open__photo open__pos-photo-b" use:reveal={{ delay: 120 }}>
        <img src="/images/moovy_recherche.webp" alt="" loading="lazy" decoding="async" />
      </figure>
    </div>

    <div class="open__sticky">
      <div class="open__scrim" aria-hidden="true"></div>
      <p class="open__text" use:reveal>
        <span class="open__lead">Chaque projet est un territoire à explorer.</span>
        <span class="open__muted">
          Une marque, une interface, une intuition encore floue — nous accueillons ce
          qui sort du cadre. Confiez-nous le vôtre ; la suite s'écrit ensemble.
        </span>
      </p>
    </div>
  </div>
</section>

<style>
  .open {
    position: relative;
    background: #000;
    color: #f4efe6;
  }

  /* ── Étage figé (hauteur = distance de scroll pendant laquelle le texte est figé) ── */
  .open__stage {
    position: relative;
    height: 300vh;
  }

  /* ── Couche des visuels flottants (au-dessus du texte) ── */
  .open__media {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .open__media figure,
  .open__colors {
    position: absolute;
    margin: 0;
  }

  /* ── Identité / charte graphique ── */
  .open__colors {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .open__colors-dots {
    display: flex;
    gap: 0.5rem;
    margin: 0 0 0.85rem 0.3rem;
  }

  .open__colors-dots i {
    width: 0.95rem;
    height: 0.95rem;
    border-radius: 999px;
    display: block;
  }

  .open__colors-stack {
    position: relative;
    display: block;
  }

  .open__colors-a {
    display: block;
    width: clamp(10rem, 15vw, 13.5rem);
    height: clamp(7.5rem, 11vw, 10rem);
    object-fit: cover;
    border-radius: 16px;
    box-shadow: 0 34px 76px rgba(0, 0, 0, 0.55);
  }

  .open__colors-b {
    display: block;
    position: absolute;
    right: -2.4rem;
    bottom: -2rem;
    width: clamp(6.5rem, 9.5vw, 8.5rem);
    height: clamp(5rem, 7.5vw, 6.6rem);
    object-fit: cover;
    border-radius: 14px;
    box-shadow: 0 26px 60px rgba(0, 0, 0, 0.6);
  }

  /* ── Écran d'application (téléphone) + icône ── */
  .open__phone {
    width: clamp(9.5rem, 14vw, 15rem);
    height: clamp(18rem, 27vw, 27rem);
  }

  .open__phone-screen {
    position: absolute;
    inset: 0;
    border-radius: 30px;
    overflow: hidden;
    background: #0c0c0e;
    box-shadow: 0 40px 90px rgba(0, 0, 0, 0.62);
  }

  .open__phone-screen img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .open__phone-icon {
    display: block;
    position: absolute;
    width: 40%;
    height: auto;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    left: -10%;
    bottom: -6%;
    border-radius: 24%;
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55);
    z-index: 1;
  }

  /* ── Photos projets ── */
  .open__photo {
    width: clamp(12rem, 18vw, 17.5rem);
    height: clamp(8.5rem, 12.5vw, 12rem);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 36px 80px rgba(0, 0, 0, 0.58);
  }

  .open__photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ── Carte typographie ── */
  .open__type {
    width: clamp(8rem, 11.5vw, 11rem);
    height: clamp(8rem, 11.5vw, 11rem);
    padding: 0.85rem 0.95rem;
    border-radius: 22px;
    background: rgba(16, 16, 18, 0.94);
    box-shadow: 0 32px 70px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .open__type-label {
    font-family: "Inter", sans-serif;
    font-size: 0.72rem;
    letter-spacing: -0.01em;
    color: rgba(244, 239, 230, 0.5);
  }

  .open__type-glyph {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: clamp(2.4rem, 4vw, 3.6rem);
    line-height: 0.9;
    letter-spacing: -0.04em;
    color: #f4efe6;
  }

  /* ── Positions (top = % de la hauteur de l'étage → défilement) ── */
  .open__pos-colors { top: 8%; right: 7vw; }
  .open__pos-phone { top: 26%; left: 12vw; }
  .open__pos-type { top: 45%; right: 13vw; }
  .open__pos-photo-a { top: 63%; left: 17vw; }
  .open__pos-photo-b { top: 82%; right: 8vw; }

  /* ── Texte central figé ── */
  .open__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  /* Voile sombre derrière le texte → lisible malgré les visuels qui passent. */
  .open__scrim {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(820px, 96vw);
    height: 74vh;
    background: radial-gradient(
      58% 46% at 50% 50%,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.6) 46%,
      rgba(0, 0, 0, 0) 78%
    );
    pointer-events: none;
  }

  .open__text {
    position: relative;
    width: min(600px, 86%);
    margin: 0;
    text-align: left;
    font-family: "Inter", sans-serif;
    font-weight: 300;
    font-size: clamp(1.5rem, 2.5vw, 2.55rem);
    line-height: 1.18;
    letter-spacing: -0.025em;
    text-wrap: pretty;
  }

  .open__lead { color: #f7f3ea; }
  .open__muted { color: rgba(244, 239, 230, 0.6); }

  @media (max-width: 900px) {
    .open__stage { height: 250vh; }

    .open__text {
      width: min(540px, 86%);
      font-size: clamp(1.5rem, 6.6vw, 2rem);
    }

    .open__scrim { height: 70vh; }

    .open__pos-colors { top: 7%; right: 4vw; }
    .open__pos-phone { top: 26%; left: 4vw; }
    .open__pos-type { top: 45%; right: 5vw; }
    .open__pos-photo-a { top: 64%; left: 5vw; }
    .open__pos-photo-b { top: 82%; right: 4vw; }
  }

  /* ── Mobile : visuels petits, calés dans les coins, faible chevauchement ── */
  @media (max-width: 640px) {
    .open__stage { height: 230vh; }

    .open__text { width: 84%; }

    .open__colors-a {
      width: clamp(6.5rem, 29vw, 8.5rem);
      height: clamp(5rem, 22vw, 6.4rem);
    }
    .open__colors-b {
      width: clamp(4.4rem, 19vw, 5.6rem);
      height: clamp(3.4rem, 15vw, 4.4rem);
      right: -1.4rem;
      bottom: -1.2rem;
    }
    .open__colors-dots i { width: 0.72rem; height: 0.72rem; }

    .open__phone {
      width: clamp(6rem, 27vw, 8rem);
      height: clamp(11rem, 50vw, 15rem);
    }

    .open__photo {
      width: clamp(7.5rem, 34vw, 10rem);
      height: clamp(5.2rem, 24vw, 6.8rem);
    }

    .open__type { display: none; }
    .open__pos-colors { top: 6%; right: 2vw; }
    .open__pos-phone { top: 26%; left: 2vw; }
    .open__pos-photo-a { top: 62%; left: 2vw; }
    .open__pos-photo-b { top: 84%; right: 2vw; }
  }
</style>
