<script>
  import { onMount, onDestroy } from "svelte";
  import { registerParallax, unregisterParallax } from "../scrollEngine.js";

  let email = "";
  let bgBrand;

  function submit() {
    console.log("Email submitted:", email);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(v, max));
  }

  function updateParallax() {
    if (!bgBrand) return;

    const rect = bgBrand.getBoundingClientRect();
    const winH = window.innerHeight;
    const center = rect.top + rect.height / 2;
    const progress = clamp((center - winH / 2) / winH, -1, 1);

    const speed = -300;
    const offset = progress * speed;

    bgBrand.style.transform = `translate(-50%, ${offset}px)`;
  }

  onMount(() => {
    registerParallax(updateParallax);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
  });
</script>

<footer class="footer">
  <div class="bg-brand" bind:this={bgBrand}>3 TERRES</div>

  <div class="container">

    <div class="left">
      <h2 class="brand">3 Terres</h2>
      <p class="tagline">
        Studio créatif explorant la matière, la lumière et l’espace.
      </p>

      <div class="socials links-group">
        <a data-cursor="view" href="#">Instagram</a>
        <a data-cursor="view" href="#">Behance</a>
        <a data-cursor="view" href="#">LinkedIn</a>
        <a data-cursor="view" href="#">Pinterest</a>
      </div>
    </div>

    <div class="nav links-group">
      <div>
        <h4>Navigation</h4>
        <a data-cursor="view" href="#">Accueil</a>
        <a data-cursor="view" href="#">Projets</a>
        <a data-cursor="view" href="#">À propos</a>
        <a data-cursor="view" href="#">Services</a>
      </div>

      <div>
        <h4>Infos</h4>
        <a data-cursor="view" href="#">Contact</a>
        <a data-cursor="view" href="#">Mentions légales</a>
        <a data-cursor="view" href="#">Confidentialité</a>
      </div>
    </div>

    <div class="newsletter">
      <h3>Recevez nos actualités</h3>
      <p>Inspiration, projets et nouvelles créations.</p>

      <div class="input-row">
        <input type="email" placeholder="Votre email" bind:value={email} />
        <button data-cursor="view" on:click={submit}>→</button>
      </div>
    </div>

  </div>

  <div class="bottom">
    <span>© 2026 3 Terres — Tous droits réservés</span>
    <span class="credit">Design & Code</span>
  </div>
</footer>

<style>
.footer {
  position: relative;
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
  color: #f5f5f5;
  padding: 10vw 0 4vw; /* padding vertical uniquement */
  overflow: hidden;

  /* 🌑 dégradé noir plus long */
  background: linear-gradient(
    to bottom,
    #000 0%,
    #000 35%,
    #0e0e0e 65%,
    #0e0e0e 100%
  );
}

/* vraie marge interne gauche/droite */
.container {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.2fr;
  gap: 6vw;
  width: min(1400px, 88%);
  margin: 0 auto;
}

.bg-brand {
  position: absolute;
  bottom: -3vw;
  left: 50%;
  transform: translate(-50%, 0);
  font-size: 18vw;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: rgba(255,255,255,0.03);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  will-change: transform;
}

.left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.brand {
  font-family: "Aboreto", serif;
  font-size: 2rem;
  margin-bottom: 15px;
}

.tagline {
  opacity: 0.7;
  line-height: 1.6;
  max-width: 280px;
  margin-bottom: 30px;
}

.socials {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav {
  display: flex;
  gap: 4vw;
}

.nav div {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav h4 {
  font-size: 0.9rem;
  margin-bottom: 14px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.links-group a {
  text-decoration: none;
  color: #f5f5f5;
  opacity: 0.8;
  transition: opacity 0.4s ease;
}

.links-group:hover a {
  opacity: 0.25;
}

.links-group a:hover {
  opacity: 1;
}

.newsletter h3 {
  font-family: "Aboreto", serif;
  font-size: 1.6rem;
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.2);
  padding-bottom: 8px;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 1rem;
}

button {
  background: none;
  border: none;
  color: white;
  font-size: 1.4rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

button:hover {
  transform: translateX(6px);
}

.bottom {
  width: min(1400px, 88%);
  margin: 6vw auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  opacity: 0.5;
}

@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
    gap: 50px;
  }

  .bg-brand {
    font-size: 28vw;
  }

  .bottom {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
