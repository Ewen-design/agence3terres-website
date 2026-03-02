<script>
  import { onMount } from "svelte";

  let progress = 0;
  let x = 50;
  let y = 50;
  let visible = false;
  let arrowColor = "white"; // couleur dynamique de la flèche

  function updateScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;

    progress = (scrollTop / docHeight) * 100;
    visible = scrollTop > 0;

    updateArrowColor();
  }

  function scrollToTop() {
    const start = window.scrollY;
    const duration = 2200;
    const startTime = performance.now();

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(time) {
      const elapsed = time - startTime;
      const prog = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(prog);
      window.scrollTo(0, start * (1 - ease));

      if (prog < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    x = ((e.clientX - rect.left) / rect.width) * 100;
    y = ((e.clientY - rect.top) / rect.height) * 100;
  }

  function updateArrowColor() {
    const btn = document.querySelector(".scroll-btn");
    if (!btn) return;

    const btnMid = btn.getBoundingClientRect().top + btn.offsetHeight / 2;
    const sections = document.querySelectorAll(
      "section.hero-wrapper, section.creative-section, section.services, section.contact"
    );

    let overSection = false;
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (btnMid >= rect.top && btnMid <= rect.bottom) {
        overSection = true;
      }
    });

    arrowColor = overSection ? "black" : "white";
  }

  onMount(() => {
    window.addEventListener("scroll", updateScroll);
    updateScroll();
    return () => window.removeEventListener("scroll", updateScroll);
  });
</script>

<button
  class="scroll-btn {visible ? 'show' : ''}"
  on:click={scrollToTop}
  on:mousemove={handleMove}
  style="--progress:{progress}; --x:{x}%; --y:{y}%"
  aria-label="Retour en haut"
>
  <svg viewBox="0 0 24 24" class="arrow" stroke={arrowColor}>
    <path d="M12 5v14M12 5l-6 6M12 5l6 6" />
  </svg>
</button>

<style>
.scroll-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  z-index: 2000;
  display: grid;
  place-items: center;

  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.8s cubic-bezier(.22,.61,.36,1);

  /* Fond blur identique au header */
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  box-shadow:
    0 8px 10px rgba(0,0,0,0.06),
    inset 0 0 0 0px rgba(255,255,255,0.4);
}

.scroll-btn.show {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.scroll-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 1px;
  background: conic-gradient(
    #f8eacb calc(var(--progress) * 1%),
    rgba(255,255,255,0.06) 0%
  );
  -webkit-mask:
    radial-gradient(farthest-side, transparent calc(100% - 2px), black 0);
  mask:
    radial-gradient(farthest-side, transparent calc(100% - 2px), black 0);
}

.arrow {
  width: 20px;
  height: 20px;
  stroke-width: 1.5;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.6s ease, stroke 0.3s ease;
}

.scroll-btn:hover .arrow {
  transform: translateY(-4px);
}
</style>