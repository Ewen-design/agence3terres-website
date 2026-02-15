<script>
  export let open = false;
  let closing = false;

  function close() {
    closing = true;
    setTimeout(() => {
      open = false;
      closing = false;
    }, 1200);
  }
</script>

{#if open}
<div class="menu-overlay {closing ? 'closing' : ''}">
  <div class="menu-top">

    <div class="top-block project" data-cursor="button">
      <div class="inner">
        <img src="/images/aigleciel.jpg" alt="Projet" />
        <div class="project-title">Notre dernier projet</div>
      </div>
    </div>

    <div class="top-block logo-block">
      <div class="inner">
        <img src="/images/logo.jpg" alt="Logo" />
      </div>
    </div>

    <!-- ❌ CROIX = FERMER -->
    <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
    <div class="top-block close-block" on:click={close} on:keydown={(e) => e.key === 'Enter' && close()} data-cursor="close" role="button" tabindex="0">
      <div class="inner">
        <div class="close-icon">✕</div>
      </div>
    </div>

  </div>

  <div class="menu-body">
    <div class="left-links">
      <a href="/" style="--i:0" data-cursor="button">Home</a>
      <a href="/" style="--i:1" data-cursor="button">Travail</a>
      <a href="/" style="--i:2" data-cursor="button">À propos</a>
      <a href="/" style="--i:3" data-cursor="button">Services</a>
      <a href="/" style="--i:4" data-cursor="button">Contact</a>
    </div>

    <div class="right-info">
      <div class="info-group">
        <h4>Réseaux sociaux</h4>
        <div class="info-links">
          <a href="https://www.instagram.com/agence_3terres/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="/">LinkedIn</a>
          <a href="/">Behance</a>
          <a href="/">Facebook</a>
        </div>
      </div>

      <div class="info-group">
        <h4>Contact</h4>
        <div class="info-links">
          <a href="mailto:contact@agence3terres.fr">contact@agence3terres.fr</a>
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<style>

.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  backdrop-filter: blur(34px);
  background: rgba(10,10,10,0.78);
  display: flex;
  flex-direction: column;
  animation: blurIn 1.2s cubic-bezier(.22,.61,.36,1) forwards;
}

.menu-overlay.closing {
  animation: blurOut 1.2s cubic-bezier(.22,.61,.36,1) forwards;
}

@keyframes blurIn {
  from { clip-path: inset(0 0 100% 0); opacity: 0; }
  to { clip-path: inset(0 0 0 0); opacity: 1; }
}

@keyframes blurOut {
  from { clip-path: inset(0 0 0 0); opacity: 1; }
  to { clip-path: inset(0 0 100% 0); opacity: 0; }
}

.menu-top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem 1rem 0 1rem;
  height: 22vh;
}

.top-block {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(40px);
  background: rgba(255,255,255,0.04);
  display: flex;
  justify-content: center;
  align-items: center;
}

.inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 1.2s cubic-bezier(.22,.61,.36,1);
}

.project:hover .inner,
.logo-block:hover .inner,
.close-block:hover .inner {
  transform: scale(1.05);
}

.project img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.75);
}

.project-title {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  opacity: 0;
  transition: 0.6s;
  text-align: center;
}
.project:hover .project-title { opacity: 1; }

.logo-block img { max-height: 140px; opacity: 0.6; transition: 1s; }
.logo-block:hover img { opacity: 1; }

.close-block { cursor:pointer; transition:background 1s ease; }
.close-block:hover { background:white; }

.close-icon {
  font-size: 2.4rem;
  color: white;
  transition: all .8s ease;
}
.close-block:hover .close-icon {
  color:black;
  transform: scale(1.15);
}

.menu-body {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 3rem;
}

.left-links {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
  font-family: 'Aboreto', serif;
  font-size: 3rem;
  gap: 0.8rem;
  margin-left: 2rem;
  margin-bottom: 2rem;
}

.left-links a {
  color: white;
  text-decoration: none;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.8s forwards;
  animation-delay: calc(var(--i) * 0.15s);
}

@keyframes fadeUp { to { opacity:1; transform:translateY(0); } }

.left-links a:hover {
  background: linear-gradient(90deg,#f6e7c1,#d4af37);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.right-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  margin-right: 3rem;
  text-align: right;
}

.info-group { display:flex; flex-direction:column; align-items:flex-end; }

.info-group h4 {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}

.info-links { display:flex; flex-direction:column; gap:0.4rem; }

.info-links a {
  color:white;
  text-decoration:none;
  transition: opacity .4s ease;
}

.info-links a:hover { opacity:.6; }

</style>
