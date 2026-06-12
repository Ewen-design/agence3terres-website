<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { navigate } from "$lib/navigate.js";

  const baseProjects = [
    {
      number: "01",
      title: "Serein Design",
      category: "Identite produit",
      lead: "Un univers objet premium, calme et fonctionnel.",
      rest: "Une direction pensée pour traduire une elegance sobre, technologique et durable a travers une identite visuelle claire et sensible.",
      image: "/images/telephone3.webp",
      previewImages: [
        { src: "/images/telephone2.webp", alt: "Apercu mobile Serein Design" },
        { src: "/images/telephone_main.webp", alt: "Detail interface Serein Design" },
        { src: "/images/telephone2_parfum.webp", alt: "Composition visuelle Serein Design" }
      ],
      page: "projet1",
      button: "Voir le projet",
      mobileInfo: ["Serein Design", "Identite", "Direction", "Branding", "UI design"]
    },
    {
      number: "02",
      title: "Hansatsu",
      category: "Narration visuelle",
      lead: "Un site web concu pour retracer une part d'histoire japonaise.",
      rest: "Une presence editoriale sobre et immersive, pensee pour faire circuler le regard entre recit, image et memoire.",
      image: "/images/parfum_rouge.webp",
      previewImages: [
        { src: "/images/parfum2.webp", alt: "Apercu immersif Hansatsu" },
        { src: "/images/parfum3.webp", alt: "Detail Hansatsu" },
        { src: "/images/telephone_parfum.webp", alt: "Interface mobile Hansatsu" }
      ],
      page: "projet2",
      button: "Voir le projet",
      mobileInfo: ["Hansatsu", "Site web", "Recit", "Japon", "Contenu"]
    },
    {
      number: "03",
      title: "Moovy",
      category: "Plateforme web",
      lead: "Une recommandation de films plus simple, plus directe.",
      rest: "Une plateforme pensee pour explorer un large catalogue et trouver rapidement le bon film selon ses gouts, son humeur et quelques questions.",
      image: "/images/telephone_main.webp",
      previewImages: [
        { src: "/images/ordinateur.webp", alt: "Apercu desktop Moovy" },
        { src: "/images/telephone_main.webp", alt: "Interface mobile Moovy" },
        { src: "/images/telephone2.webp", alt: "Parcours de recommandation Moovy" }
      ],
      page: "projet3",
      button: "Voir le projet",
      mobileInfo: ["Moovy", "Films", "Reco", "UX", "Web app"]
    },
    {
      number: "04",
      title: "Ludovic",
      category: "Site d'artiste",
      lead: "Un site plus calme pour laisser respirer les oeuvres.",
      rest: "Une presence web sobre et sensible, creee pour presenter les peintures de Ludovic avec plus de matiere, de rythme et de clarte.",
      image: "/images/carte-copie.jpg",
      previewImages: [
        { src: "/images/carte-copie.jpg", alt: "Apercu oeuvre Ludovic" },
        { src: "/images/livre.png", alt: "Detail editorial Ludovic" },
        { src: "/images/photo.webp", alt: "Mise en page Ludovic" }
      ],
      page: "projet4",
      button: "Voir le projet",
      mobileInfo: ["Ludovic", "Art", "Peinture", "Vitrine", "Editorial"]
    },
    {
      number: "05",
      title: "JustX",
      category: "Marque de sport",
      lead: "Un univers sportif plus direct, plus fort et plus personnel.",
      rest: "Une marque pensée autour de programmes personnalisés de musculation et nutrition, prolongée par une gamme de vêtements.",
      image: "/images/logo_justx.webp",
      previewImages: [
        { src: "/images/logo_justx.webp", alt: "Logo JustX" },
        { src: "/images/logo_justx.webp", alt: "Identité visuelle JustX" },
        { src: "/images/logo_justx.webp", alt: "Univers sportif JustX" }
      ],
      page: "projet5",
      button: "Voir le projet",
      mobileInfo: ["JustX", "Sport", "Nutrition", "Coaching", "Textile"]
    },
    {
      number: "06",
      title: "Mission X",
      category: "Jeu de stratégie",
      lead: "Un monde à explorer, des décisions à assumer.",
      rest: "Un jeu narratif où stratégie, progression et exploration se rencontrent dans un univers cinématographique.",
      image: "/images/imageterres.jpg",
      previewImages: [
        { src: "/images/imageterres.jpg", alt: "Univers de Mission X" },
        { src: "/images/missionx_strategy.png", alt: "Stratégie de Mission X" },
        { src: "/images/montagne.webp", alt: "Exploration dans Mission X" }
      ],
      page: "projet6",
      button: "Voir le projet",
      mobileInfo: ["Mission X", "Jeu", "Stratégie", "Narration", "Exploration"]
    },
    {
      number: "07",
      title: "Votre projet ?",
      category: "Collaboration",
      lead: "Une vision a faire naitre, clarifier ou amplifier.",
      rest: "Identite, direction artistique, site web ou experience digitale : construisons ensemble une presence forte, juste et memorable.",
      image: "/images/telephone2.webp",
      previewImages: [
        { src: "/images/telephone_main.webp", alt: "Projet digital" },
        { src: "/images/parfum_ordinateur.webp", alt: "Direction web" },
        { src: "/images/photo.webp", alt: "Univers de marque" }
      ],
      page: "contact",
      button: "Nous contacter",
      mobileInfo: ["Votre projet ?", "Site web", "Identite", "Strategie", "Motion"]
    }
  ];

  export let excludePages = [];

  let resizeTimer;
  let isMobile = false;
  let showcaseEl;
  let visibilityObserver;
  let isInView = false;
  let desktopRailEl;
  let desktopCardEls = [];
  let desktopScrollRaf;
  let activeDesktopIndex = 0;
  let desktopAutoAdvanceTimer = null;
  let desktopAutoResumeTimer = null;
  let isAutoScrollingDesktop = false;
  let mobileRailEl;
  let mobileCardEls = [];
  let mobileScrollRaf;
  let mobileTweenRaf;
  let activeMobileIndex = 0;
  let desktopScrollProgress = 0;
  let prefersReduced = false;
  let removeMotionListener;
  let mobileAutoAdvanceTimer = null;
  let mobileAutoResumeTimer = null;
  let isAutoScrollingMobile = false;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  $: filteredProjects = baseProjects.filter((project) => !excludePages.includes(project.page));
  $: activeDesktopIndex = Math.min(activeDesktopIndex, Math.max(filteredProjects.length - 1, 0));
  $: activeMobileIndex = Math.min(activeMobileIndex, Math.max(filteredProjects.length - 1, 0));

  function measure() {
    if (!browser) return;
    isMobile = window.innerWidth <= 900;
  }

  function updateMobileActive() {
    if (!mobileRailEl) return;

    const cards = mobileRailEl.querySelectorAll(".mobile-card");
    if (!cards.length) return;

    const centerX = mobileRailEl.scrollLeft + mobileRailEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth * 0.5 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    activeMobileIndex = nearest;
  }

  function updateDesktopActive() {
    if (!desktopRailEl) return;

    const cards = desktopRailEl.querySelectorAll(".desktop-card");
    if (!cards.length) return;

    const centerX = desktopRailEl.scrollLeft + desktopRailEl.clientWidth * 0.5;
    let nearest = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth * 0.5 - centerX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });

    activeDesktopIndex = nearest;
  }

  function handleDesktopRailScroll() {
    if (!isAutoScrollingDesktop) {
      pauseAndResumeDesktopAutoAdvance();
    }
    if (desktopScrollRaf) cancelAnimationFrame(desktopScrollRaf);
    desktopScrollRaf = requestAnimationFrame(() => {
      updateDesktopActive();
      desktopScrollRaf = null;
    });
  }

  function scrollToDesktopCard(index, behavior = "smooth") {
    const card = desktopCardEls[index];
    if (!desktopRailEl || !card) return;

    const target =
      card.offsetLeft - (desktopRailEl.clientWidth - card.offsetWidth) * 0.5;

    isAutoScrollingDesktop = true;
    desktopRailEl.scrollTo({
      left: Math.max(0, target),
      behavior
    });

    window.setTimeout(() => {
      isAutoScrollingDesktop = false;
    }, 900);
  }

  function handleMobileRailScroll() {
    if (!isAutoScrollingMobile) {
      pauseAndResumeMobileAutoAdvance();
    }
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    mobileScrollRaf = requestAnimationFrame(() => {
      updateMobileActive();
      mobileScrollRaf = null;
    });
  }

  function scrollToMobileCard(index, behavior = "smooth") {
    const card = mobileCardEls[index];
    if (!mobileRailEl || !card) return;

    if (mobileTweenRaf) cancelAnimationFrame(mobileTweenRaf);

    if (behavior === "smooth" && "scrollTo" in mobileRailEl) {
      const target =
        card.offsetLeft - (mobileRailEl.clientWidth - card.offsetWidth) * 0.5;

      isAutoScrollingMobile = true;
      mobileRailEl.scrollTo({
        left: Math.max(0, target),
        behavior
      });

      window.setTimeout(() => {
        isAutoScrollingMobile = false;
      }, 900);

      return;
    }

    const target =
      card.offsetLeft - (mobileRailEl.clientWidth - card.offsetWidth) * 0.5;

    const start = mobileRailEl.scrollLeft;
    const delta = target - start;
    const duration = 840;
    const startTime = performance.now();
    mobileRailEl.classList.add("is-programmatic-scrolling");
    isAutoScrollingMobile = true;

    function easeInOutSine(t) {
      return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    function frame(now) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = easeInOutSine(progress);
      mobileRailEl.scrollLeft = start + delta * eased;
      updateMobileActive();

      if (progress < 1) {
        mobileTweenRaf = requestAnimationFrame(frame);
        return;
      }

      mobileRailEl.scrollLeft = target;
      updateMobileActive();
      mobileRailEl.classList.remove("is-programmatic-scrolling");
      isAutoScrollingMobile = false;
      mobileTweenRaf = null;
    }

    mobileTweenRaf = requestAnimationFrame(frame);
  }

  function clearMobileAutoTimers() {
    clearInterval(mobileAutoAdvanceTimer);
    clearTimeout(mobileAutoResumeTimer);
    mobileAutoAdvanceTimer = null;
    mobileAutoResumeTimer = null;
  }

  function clearDesktopAutoTimers() {
    clearInterval(desktopAutoAdvanceTimer);
    clearTimeout(desktopAutoResumeTimer);
    desktopAutoAdvanceTimer = null;
    desktopAutoResumeTimer = null;
  }

  function startDesktopAutoAdvance() {
    clearDesktopAutoTimers();
    if (!isInView || isMobile || !desktopRailEl || prefersReduced || filteredProjects.length < 2) return;

    desktopAutoAdvanceTimer = setInterval(() => {
      const nextIndex = (activeDesktopIndex + 1) % filteredProjects.length;
      scrollToDesktopCard(nextIndex, "smooth");
    }, 5000);
  }

  function pauseAndResumeDesktopAutoAdvance() {
    clearDesktopAutoTimers();
    if (!isInView || isMobile || prefersReduced || filteredProjects.length < 2) return;

    desktopAutoResumeTimer = setTimeout(() => {
      startDesktopAutoAdvance();
    }, 7000);
  }

  function startMobileAutoAdvance() {
    clearMobileAutoTimers();
    if (!isInView || !isMobile || !mobileRailEl || prefersReduced || filteredProjects.length < 2) return;

    mobileAutoAdvanceTimer = setInterval(() => {
      const nextIndex = (activeMobileIndex + 1) % filteredProjects.length;
      scrollToMobileCard(nextIndex, "smooth");
    }, 5000);
  }

  function pauseAndResumeMobileAutoAdvance() {
    clearMobileAutoTimers();
    if (!isInView || !isMobile || prefersReduced || filteredProjects.length < 2) return;

    mobileAutoResumeTimer = setTimeout(() => {
      startMobileAutoAdvance();
    }, 7000);
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      measure();
      startDesktopAutoAdvance();
      startMobileAutoAdvance();
    }, 80);
  }

  function handleButtonMove(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    btn.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  function handleDesktopCardMove(event) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);

    const fauxButton = card.querySelector(".desktop-card-btn");
    if (!fauxButton) return;

    const buttonRect = fauxButton.getBoundingClientRect();
    fauxButton.style.setProperty("--mx", `${event.clientX - buttonRect.left}px`);
    fauxButton.style.setProperty("--my", `${event.clientY - buttonRect.top}px`);
  }

  onMount(() => {
    if (!browser) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReduced = mq.matches;

    const onMotion = (event) => {
      prefersReduced = event.matches;
      startDesktopAutoAdvance();
      startMobileAutoAdvance();
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", onMotion);
      removeMotionListener = () => mq.removeEventListener("change", onMotion);
    } else {
      mq.addListener(onMotion);
      removeMotionListener = () => mq.removeListener(onMotion);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        measure();
        updateDesktopActive();
        updateMobileActive();
        startDesktopAutoAdvance();
        startMobileAutoAdvance();
      });
    });

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = !!entry?.isIntersecting;

        if (isInView) {
          startDesktopAutoAdvance();
          startMobileAutoAdvance();
          return;
        }

        clearDesktopAutoTimers();
        clearMobileAutoTimers();
      },
      { rootMargin: "-10% 0px -10% 0px", threshold: 0.15 }
    );

    visibilityObserver.observe(showcaseEl);

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });
    desktopRailEl?.addEventListener("scroll", handleDesktopRailScroll, { passive: true });
    mobileRailEl?.addEventListener("scroll", handleMobileRailScroll, { passive: true });

    return () => {
      removeMotionListener?.();
      visibilityObserver?.disconnect();
      clearDesktopAutoTimers();
      clearMobileAutoTimers();
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      desktopRailEl?.removeEventListener("scroll", handleDesktopRailScroll);
      mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    };
  });

  onDestroy(() => {
    if (!browser) return;
    removeMotionListener?.();
    visibilityObserver?.disconnect();
    clearDesktopAutoTimers();
    clearMobileAutoTimers();
    clearTimeout(resizeTimer);
    desktopRailEl?.removeEventListener("scroll", handleDesktopRailScroll);
    mobileRailEl?.removeEventListener("scroll", handleMobileRailScroll);
    if (desktopScrollRaf) cancelAnimationFrame(desktopScrollRaf);
    if (mobileScrollRaf) cancelAnimationFrame(mobileScrollRaf);
    if (mobileTweenRaf) cancelAnimationFrame(mobileTweenRaf);
  });
</script>

<section
  class="project-showcase"
  bind:this={showcaseEl}
  style={`--project-count:${filteredProjects.length};`}
>
  <div class="desktop-stack">
    <div class="desktop-rail" bind:this={desktopRailEl} data-native-wheel="true">
      {#each filteredProjects as project, i}
        <button
          class="desktop-card"
          class:is-active={activeDesktopIndex === i}
          bind:this={desktopCardEls[i]}
          data-cursor="view"
          aria-label={project.button}
          type="button"
          on:mousemove={handleDesktopCardMove}
          on:click={() => navigate(project.page)}
        >
          <div class="desktop-image">
            <img src={project.image} alt={project.title} />
            <div class="desktop-image-shade" aria-hidden="true"></div>
          </div>

          <div class="desktop-card-overlay">
            <div class="desktop-card-meta">
              <div class="desktop-card-index-wrap" aria-hidden="true">
                <span class="desktop-card-index-inner">{project.number}</span>
              </div>

              <div class="desktop-card-title-wrap" aria-hidden="true">
                <span class="desktop-card-title">{project.title}</span>
              </div>
            </div>

            <div class="desktop-card-content" aria-hidden={activeDesktopIndex !== i}>
              <p class="desktop-card-rest">{project.rest}</p>
              <span class="nav-btn desktop-card-btn">
                <span class="nav-btn-flip" data-text={project.button}>
                  <span class="nav-btn-text">{project.button}</span>
                </span>
              </span>
            </div>
          </div>
        </button>
      {/each}
    </div>

    <div class="desktop-nav-shell" aria-label="Navigation projets desktop">
      <button
        class="desktop-nav-btn desktop-nav-prev"
        class:is-hidden={activeDesktopIndex === 0}
        type="button"
        aria-label="Projet précédent"
        on:click={() => scrollToDesktopCard(Math.max(activeDesktopIndex - 1, 0), "smooth")}
      >
        <span class="desktop-nav-chevron" aria-hidden="true"></span>
      </button>

      <button
        class="desktop-nav-btn desktop-nav-next"
        class:is-hidden={activeDesktopIndex === filteredProjects.length - 1}
        type="button"
        aria-label="Projet suivant"
        on:click={() => scrollToDesktopCard(Math.min(activeDesktopIndex + 1, filteredProjects.length - 1), "smooth")}
      >
        <span class="desktop-nav-chevron" aria-hidden="true"></span>
      </button>
    </div>
  </div>

  <div class="mobile-stack">
    <div class="mobile-rail" bind:this={mobileRailEl} data-native-wheel="true">
    {#each filteredProjects as project, i}
      <button
        class="mobile-card"
        class:is-active={activeMobileIndex === i}
        bind:this={mobileCardEls[i]}
        data-cursor="view"
        aria-label={project.button}
        type="button"
        on:mousemove={handleButtonMove}
        on:click={() => navigate(project.page)}
      >
        <div class="mobile-card-title-wrap" aria-hidden="true">
          <span class="mobile-card-title">{project.title}</span>
        </div>

        <div class="mobile-image">
          <img src={project.image} alt={project.title} />
          <div class="mobile-card-plus" aria-hidden="true">+</div>
        </div>
        <div class="mobile-card-index-wrap" aria-hidden="true">
          <span class="mobile-card-index-inner">{project.number}</span>
        </div>
      </button>
    {/each}
    </div>

    <div class="mobile-nav-shell" aria-label="Navigation projets mobile">
      <button
        class="mobile-nav-btn mobile-nav-prev"
        class:is-hidden={activeMobileIndex === 0}
        type="button"
        aria-label="Projet précédent"
        on:click={() => {
          pauseAndResumeMobileAutoAdvance();
          scrollToMobileCard(Math.max(activeMobileIndex - 1, 0), "smooth");
        }}
      >
        <span class="mobile-nav-chevron" aria-hidden="true"></span>
      </button>

      <button
        class="mobile-nav-btn mobile-nav-next"
        class:is-hidden={activeMobileIndex === filteredProjects.length - 1}
        type="button"
        aria-label="Projet suivant"
        on:click={() => {
          pauseAndResumeMobileAutoAdvance();
          scrollToMobileCard(Math.min(activeMobileIndex + 1, filteredProjects.length - 1), "smooth");
        }}
      >
        <span class="mobile-nav-chevron" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</section>

<style>
  .project-showcase {
    position: relative;
    background: #000;
    color: #f5f1e8;
    min-height: auto;
  }

  .nav-btn {
    font-family: "Clash Display", sans-serif;
    position: relative;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 1.5rem;
    font-size: 0.9rem;
    font-weight: 400;
    white-space: nowrap;
    color: inherit;
    border: 0px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 2px;
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
    transition:
      transform 1.2s cubic-bezier(.22,.61,.36,1),
      box-shadow 1.2s cubic-bezier(.22,.61,.36,1),
      background 1.2s cubic-bezier(.22,.61,.36,1);
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
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
  }

  .nav-btn-flip::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    line-height: 1.2em;
    transform: translateY(100%);
    transition:
      transform 0.45s cubic-bezier(.22,.61,.36,1),
      opacity 0.28s ease;
    white-space: nowrap;
    color: inherit;
  }

  .nav-btn:hover .nav-btn-text {
    transform: translateY(-100%);
  }

  .nav-btn:hover .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .nav-btn::before,
  .nav-btn::after {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .nav-btn::before {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      68px circle at var(--mx, 50%) var(--my, 50%),
      rgba(220, 240, 255, 1) 0%,
      rgba(145, 205, 255, 0.98) 22%,
      rgba(74, 140, 255, 0.62) 45%,
      rgba(18, 45, 120, 0.14) 62%,
      transparent 78%
    );
    transition: opacity 0.25s ease;
  }

  .nav-btn::after {
    border: 1px solid transparent;
    border-radius: inherit;
    border-image-slice: 1;
    border-image-source: radial-gradient(
      78px circle at var(--mx, 50%) var(--my, 50%),
      rgba(95, 165, 255, 0.42) 0%,
      rgba(74, 140, 255, 0.18) 42%,
      transparent 72%
    );
    filter: blur(2px);
    transition: opacity 0.25s ease;
  }

  .nav-btn:hover::before,
  .nav-btn:hover::after {
    opacity: 1;
  }

  .desktop-stack {
    display: block;
    width: 100%;
    margin: 0 auto;
    padding: clamp(5.8rem, 9vh, 7rem) 0 clamp(2.2rem, 5vh, 3.4rem);
    position: relative;
  }

  .desktop-rail {
    width: 100%;
    margin: 0;
    display: flex;
    gap: 1.2rem;
    overflow-x: auto;
    overflow-y: visible;
    padding: 0 6.5vw 2rem;
    scroll-snap-type: x mandatory;
    scroll-snap-stop: always;
    scroll-padding-left: 6.5vw;
    scroll-padding-right: 6.5vw;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y pinch-zoom;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .desktop-rail::-webkit-scrollbar {
    display: none;
  }

  .desktop-card {
    position: relative;
    flex: 0 0 min(87vw, 1380px);
    width: min(87vw, 1380px);
    display: block;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    border: 0;
    outline: none;
    border-radius: 3px;
    padding: 0;
    background: transparent;
    text-align: left;
    box-shadow: none;
    font: inherit;
    color: inherit;
    line-height: inherit;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
  }

  .desktop-image {
    position: relative;
    aspect-ratio: 1.72 / 1;
    min-height: min(78vh, 860px);
    overflow: hidden;
    background: #080808;
    border-radius: 3px;
  }

  .desktop-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transform: translateZ(0);
    transition:
      transform .56s cubic-bezier(.22,.61,.36,1);
    will-change: transform;
  }

  .desktop-image-shade {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      72% 64% at 13% 88%,
      rgba(0, 0, 0, 0.82) 0%,
      rgba(0, 0, 0, 0.5) 34%,
      rgba(0, 0, 0, 0.2) 62%,
      rgba(0, 0, 0, 0) 100%
    );
    pointer-events: none;
  }

  .desktop-card-overlay {
    position: absolute;
    left: clamp(1.2rem, 2.2vw, 2rem);
    right: clamp(1.2rem, 2.2vw, 2rem);
    bottom: clamp(1.15rem, 2vw, 1.8rem);
    z-index: 8;
    display: grid;
    gap: 1rem;
    pointer-events: none;
  }

  .desktop-card-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.45rem;
  }

  .desktop-card-title-wrap,
  .desktop-card-index-wrap {
    overflow: hidden;
  }

  .desktop-card-title {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(2.2rem, 4.2vw, 4.2rem);
    font-weight: 200;
    line-height: 0.96;
    max-width: 12ch;
    color: rgba(255,255,255,.98);
    text-shadow: 0 1px 12px rgba(0,0,0,.38);
    opacity: 0;
    transform: translate3d(0,-115%,0);
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      opacity .32s ease;
  }

  .desktop-card-index-inner {
    display: block;
    font-family: "Clash Display", sans-serif;
    font-weight: 300;
    font-size: 1.02rem;
    line-height: 1;
    letter-spacing: -0.02em;
    color: rgba(245,241,232,1);
    text-shadow: 0 1px 10px rgba(0,0,0,.34);
    opacity: 0;
    transform: translate3d(0,-115%,0);
    transition:
      transform .42s cubic-bezier(.22,.61,.36,1),
      opacity .32s ease;
  }

  .desktop-card-content {
    max-width: min(36rem, 46vw);
    opacity: 0;
    transform: translate3d(0, 18px, 0);
    transition:
      transform .52s cubic-bezier(.22,.61,.36,1),
      opacity .34s ease;
  }

  .desktop-card-rest {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    color: rgba(245,241,232,1);
    text-shadow: 0 1px 10px rgba(0,0,0,.34);
    font-weight: 300;
  }

  .desktop-card-rest {
    font-size: clamp(0.94rem, 1.1vw, 1.04rem);
    line-height: 1.54;
    max-width: 38rem;
    color: rgba(245,241,232,.82);
  }

  .desktop-card-btn {
    margin-top: 1rem;
    pointer-events: none;
  }

  .desktop-card:hover .desktop-card-btn .nav-btn-text,
  .desktop-card:focus-visible .desktop-card-btn .nav-btn-text {
    transform: translateY(-100%);
  }

  .desktop-card:hover .desktop-card-btn .nav-btn-flip::after,
  .desktop-card:focus-visible .desktop-card-btn .nav-btn-flip::after {
    transform: translateY(0%);
  }

  .desktop-card:hover .desktop-card-btn::before,
  .desktop-card:hover .desktop-card-btn::after,
  .desktop-card:focus-visible .desktop-card-btn::before,
  .desktop-card:focus-visible .desktop-card-btn::after {
    opacity: 1;
  }

  .desktop-card.is-active .desktop-image img {
    transform: scale(1.045) translateZ(0);
  }

  .desktop-card.is-active .desktop-card-title,
  .desktop-card.is-active .desktop-card-index-inner {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .desktop-card.is-active .desktop-card-content {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .desktop-nav-shell {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .desktop-nav-btn {
    position: absolute;
    top: calc(clamp(5.8rem, 9vh, 7rem) + min(78vh, 860px) * 0.5);
    width: 3.8rem;
    height: 3.8rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: #fff;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    outline: none;
    -webkit-tap-highlight-color: transparent;
    z-index: 10;
    pointer-events: auto;
    padding: 0;
    transition: opacity .35s ease;
  }

  .desktop-nav-prev { left: 1rem; }
  .desktop-nav-next { right: 1rem; }

  .desktop-nav-chevron {
    display: block;
    width: 1.6rem;
    height: 1.6rem;
    border-top: 1.5px solid currentColor;
    border-right: 1.5px solid currentColor;
    filter: drop-shadow(0 1px 8px rgba(0,0,0,.34));
  }

  .desktop-nav-prev .desktop-nav-chevron { transform: rotate(-135deg); }
  .desktop-nav-next .desktop-nav-chevron { transform: rotate(45deg); }

  .desktop-nav-btn.is-hidden {
    opacity: 0;
    pointer-events: none;
  }

  .mobile-stack {
    display: none;
  }

  @media (max-width: 900px) {
    .project-showcase {
      min-height: auto;
      padding: 6rem 0 4rem;
    }

    .desktop-stack {
      display: none;
    }

    .mobile-stack {
      display: block;
      width: 100%;
      margin: 0 auto;
      position: relative;
    }

    .mobile-rail {
      width: 100%;
      margin: 0;
      display: flex;
      gap: 0.95rem;
      overflow-x: auto;
      overflow-y: visible;
      padding-top: 0;
      padding-bottom: 2.6rem;
      padding-left: calc((100vw - clamp(292px,84vw,368px)) / 2);
      padding-right: calc((100vw - clamp(292px,84vw,368px)) / 2);
      scroll-snap-type: x mandatory;
      scroll-snap-stop: always;
      scroll-padding-left: calc((100vw - clamp(292px,84vw,368px)) / 2);
      scroll-padding-right: calc((100vw - clamp(292px,84vw,368px)) / 2);
      -webkit-overflow-scrolling: touch;
      touch-action: pan-x pan-y pinch-zoom;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
    }

    :global(.mobile-rail.is-programmatic-scrolling) {
      scroll-snap-type: none;
    }

    .mobile-rail::-webkit-scrollbar {
      display: none;
    }

    .mobile-card {
      position: relative;
      flex: 0 0 clamp(292px,84vw,368px);
      width: clamp(292px,84vw,368px);
      display: block;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      border: 0;
      outline: none;
      border-radius: 0;
      padding: 0;
      background: transparent;
      text-align: left;
      box-shadow: none;
      font: inherit;
      color: inherit;
      line-height: inherit;
      -webkit-tap-highlight-color: transparent;
    }

    .mobile-card-title-wrap {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: 2.45rem;
      z-index: 8;
      pointer-events: none;
      overflow: hidden;
    }

    .mobile-card-title {
      display: block;
      font-family: "Clash Display", sans-serif;
      font-size: 1.46rem;
      font-weight: 400;
      line-height: 1.04;
      max-width: 15ch;
      color: rgba(255,255,255,.98);
      text-shadow: 0 1px 10px rgba(0,0,0,.34);
      opacity: 0;
      transform: translate3d(0,-115%,0);
      transition:
        transform .42s cubic-bezier(.22,.61,.36,1),
        opacity .32s ease;
    }

    .mobile-image {
      position: relative;
      aspect-ratio: .8 / 1.76;
      overflow: hidden;
      background: #080808;
      border-radius: 3px;
    }

    .mobile-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transform: translateZ(0);
      transition:
        filter .34s ease,
        transform .42s ease;
      will-change: transform, filter;
    }

    .mobile-card-index-wrap {
      position: absolute;
      left: 14px;
      bottom: 12px;
      z-index: 8;
      overflow: hidden;
      width: max-content;
      height: 1.15em;
      pointer-events: none;
    }

    .mobile-card-index-inner {
      display: block;
      font-family: "Clash Display", sans-serif;
      font-style: normal;
      font-weight: 400;
      font-size: .82rem;
      line-height: 1;
      letter-spacing: -0.02em;
      color: rgba(53,53,53,.98);
      text-shadow: 0 1px 8px rgba(0,0,0,.32);
      opacity: 0;
      transform: translate3d(0, -115%, 0);
      transition:
        transform .42s cubic-bezier(.22,.61,.36,1),
        opacity .32s ease;
    }

    .mobile-card-plus {
      position: absolute;
      right: 14px;
      bottom: 12px;
      z-index: 8;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,.98);
      text-shadow: 0 1px 8px rgba(0,0,0,.32);
      font-family: "Junicode", serif;
      font-size: 2.45rem;
      font-weight: 300;
      line-height: 1;
      transition:
        transform .42s cubic-bezier(.22,.61,.36,1),
        opacity .32s ease;
      transform: translate3d(0,-115%,0);
      opacity: 0;
      pointer-events: none;
    }

    .mobile-card.is-active .mobile-image img {
      filter: brightness(.68);
      transform: scale(1.02) translateZ(0);
    }

    .mobile-card.is-active .mobile-card-title,
    .mobile-card.is-active .mobile-card-index-inner {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .mobile-card.is-active .mobile-card-plus {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .mobile-nav-shell {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .mobile-nav-btn {
      position: absolute;
      top: calc(2rem + (clamp(292px,84vw,368px) * 1.76 / 0.8) * 0.5);
      width: 3rem;
      height: 3rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: translateY(-50%);
      border: 0;
      background: transparent;
      color: #fff;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      z-index: 10;
      pointer-events: auto;
      padding: 0;
      transition:
        opacity .35s ease;
    }

    .mobile-nav-prev { left: .45rem; }
    .mobile-nav-next { right: .45rem; }

    .mobile-nav-chevron {
      display: block;
      width: 1.35rem;
      height: 1.35rem;
      border-top: 1.5px solid currentColor;
      border-right: 1.5px solid currentColor;
      filter: drop-shadow(0 1px 8px rgba(0,0,0,.34));
    }

    .mobile-nav-prev .mobile-nav-chevron { transform: rotate(-135deg); }
    .mobile-nav-next .mobile-nav-chevron { transform: rotate(45deg); }

    .mobile-nav-btn.is-hidden {
      opacity: 0;
      pointer-events: none;
    }
  }

  @media (max-width: 640px) {
    .mobile-rail {
      gap: .8rem;
      padding-bottom: 2.45rem;
      padding-left: calc((100vw - clamp(276px,84vw,338px)) / 2);
      padding-right: calc((100vw - clamp(276px,84vw,338px)) / 2);
      scroll-padding-left: calc((100vw - clamp(276px,84vw,338px)) / 2);
      scroll-padding-right: calc((100vw - clamp(276px,84vw,338px)) / 2);
    }

    .mobile-card {
      flex-basis: clamp(276px,84vw,338px);
      width: clamp(276px,84vw,338px);
    }

    .mobile-card-title-wrap { left: 12px; right: 12px; bottom: 2.3rem; }
    .mobile-card-title { font-size: 1.28rem; }
    .mobile-card-index-wrap { bottom: 12px; left: 12px; }
    .mobile-card-plus { right: 12px; bottom: 12px; }
    .mobile-nav-btn { width: 2.6rem; height: 2.6rem; }
    .mobile-nav-chevron {
      width: 1.18rem;
      height: 1.18rem;
      border-top-width: 1.4px;
      border-right-width: 1.4px;
    }
    .mobile-nav-prev { left: .3rem; }
    .mobile-nav-next { right: .3rem; }
  }

  @media (max-width: 420px) {
    .mobile-rail {
      gap: .75rem;
      padding-bottom: 2.3rem;
      padding-left: calc((100vw - 86vw) / 2);
      padding-right: calc((100vw - 86vw) / 2);
      scroll-padding-left: calc((100vw - 86vw) / 2);
      scroll-padding-right: calc((100vw - 86vw) / 2);
    }

    .mobile-card {
      flex-basis: 86vw;
      width: 86vw;
    }

    .mobile-card-title-wrap { left: 10px; right: 10px; bottom: 2.15rem; }
    .mobile-card-title { font-size: 1.18rem; }
    .mobile-card-index-wrap { bottom: 10px; left: 10px; }
    .mobile-card-plus { right: 10px; bottom: 10px; }
    .mobile-nav-btn { width: 2.35rem; height: 2.35rem; }
    .mobile-nav-chevron {
      width: 1.06rem;
      height: 1.06rem;
      border-top-width: 1.3px;
      border-right-width: 1.3px;
    }
    .mobile-nav-prev { left: .18rem; }
    .mobile-nav-next { right: .18rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-btn,
    .nav-btn-text,
    .nav-btn-flip::after,
    .mobile-card-title,
    .mobile-card-index-inner,
    .mobile-card-plus,
    .desktop-card-title,
    .desktop-card-index-inner,
    .desktop-card-content,
    .desktop-nav-btn,
    .mobile-nav-btn {
      transition: none !important;
      animation: none !important;
    }
  }

  @keyframes project-showcase-slideshow {
    0% {
      opacity: 0;
    }

    8%,
    42% {
      opacity: 1;
    }

    58%,
    100% {
      opacity: 0;
    }
  }
</style>
