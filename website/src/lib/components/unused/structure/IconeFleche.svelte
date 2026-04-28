<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let progress = 0;
  let x = 50;
  let y = 50;
  let visible = false;
  let arrowColor = "white";

  $: progressGradient =
    $page.url.pathname === "/services"
      ? "rgba(145, 205, 255, 0.98), rgba(74, 140, 255, 0.68), rgba(145, 205, 255, 0.98)"
      : $page.url.pathname === "/travail"
      ? "rgba(214, 155, 255, 0.98), rgba(140, 92, 255, 0.75), rgba(214, 155, 255, 0.98)"
      : $page.url.pathname === "/apropos"
      ? "rgba(255, 170, 170, 0.98), rgba(255, 110, 90, 0.75), rgba(255, 170, 170, 0.98)"
      : $page.url.pathname === "/contact"
      ? "rgba(186, 132, 255, 0.98), rgba(110, 74, 255, 0.7), rgba(186, 132, 255, 0.98)"
      : "rgba(213, 184, 89, 0.95), rgba(212, 102, 55, 0.45), rgba(213, 184, 89, 0.95)";

  function updateScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;

    progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
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
      "section.hero-wrapper, section.creative-section, section.services, section.dna-section, section.lifestyles-section"
    );

    let overSection = false;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (btnMid >= rect.top && btnMid <= rect.bottom) {
        overSection = true;
      }
    });

    arrowColor = overSection ? "black" : "white";
  }

  onMount(() => {
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
    return () => window.removeEventListener("scroll", updateScroll);
  });
</script>

<button
  class="scroll-btn {visible ? 'show' : ''}"
  on:click={scrollToTop}
  on:mousemove={handleMove}
  style="--progress:{progress}; --x:{x}%; --y:{y}%; --progress-gradient:{progressGradient}"
  aria-label="Retour en haut"
>
  <span class="arrow-flip" aria-hidden="true">
    <span class="arrow-face arrow-current">
      <svg viewBox="0 0 24 24" class="arrow" stroke={arrowColor}>
        <path d="M12 5v14M12 5l-6 6M12 5l6 6" />
      </svg>
    </span>

    <span class="arrow-face arrow-next">
      <svg viewBox="0 0 24 24" class="arrow" stroke={arrowColor}>
        <path d="M12 5v14M12 5l-6 6M12 5l6 6" />
      </svg>
    </span>
  </span>
</button>

<style>
  .scroll-btn {
    position: fixed;
    bottom: max(2rem, var(--safe-bottom-offset));
    right: 2rem;
    width: 48px;
    height: 48px;
    border-radius: 3px;
    border: none;
    cursor: pointer;
    z-index: 2000;
    display: grid;
    place-items: center;

    opacity: 0;
    transform: translateY(20px) scale(0.95);
    pointer-events: none;
    transition: all 0.8s cubic-bezier(.22,.61,.36,1);

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
    border-radius: 3px;
    padding: 1px;
    background: conic-gradient(
      from 0deg,
      rgba(255,255,255,0.06) 0deg,
      var(--progress-gradient) calc(var(--progress) * 1%),
      rgba(255,255,255,0.06) 0deg
    );
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .arrow-flip {
    position: relative;
    display: block;
    width: 20px;
    height: 20px;
    overflow: hidden;
  }

  .arrow-face {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .arrow-current {
    transform: translateY(0%);
    opacity: 1;
  }

  .arrow-next {
    transform: translateY(100%);
    opacity: 1;
  }

  .arrow {
    width: 20px;
    height: 20px;
    stroke-width: 1.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.3s ease;
  }

  .scroll-btn:hover .arrow-current {
    transform: translateY(-100%);
  }

  .scroll-btn:hover .arrow-next {
    transform: translateY(0%);
  }
</style>
