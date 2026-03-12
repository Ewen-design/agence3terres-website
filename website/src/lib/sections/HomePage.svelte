<script>
  import { onMount, onDestroy } from "svelte";
  import {
    registerParallax,
    unregisterParallax,
    sectionIsNearViewport
  } from "../scrollEngine.js";

  let section;
  let cards = [];
  let metrics = [];

  let headerEl;
  let lineEl;

  let isMobile = false;
  let ticking = false;
  let latestScrollY = 0;

  let currentHeader = 0;
  let targetHeader = 0;

  const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
  const lerp = (a, b, t) => a + (b - a) * t;
  const round2 = (v) => Math.round(v * 100) / 100;

  function checkMobile() {
    isMobile = window.innerWidth <= 900;
  }

  function measure() {
    if (!section) return;

    const scrollY = window.scrollY;

    metrics = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      const wrapper = card.querySelector(".parallax-wrapper");

      return {
        el: card,
        wrapper,
        top: rect.top + scrollY,
        height: rect.height,
        currentOffset: 0,
        targetOffset: 0
      };
    });
  }

  function updateTargets(scrollY) {
    if (!section) return;

    const rect = section.getBoundingClientRect();
    if (!sectionIsNearViewport(rect)) return;

    const winH = window.innerHeight;

    metrics.forEach((m, i) => {
      const center = m.top - scrollY + m.height / 2;
      const progress = clamp((center - winH / 2) / winH, -1, 1);

      // amplitudes plus fines = rendu premium + plus fluide
      const speed = isMobile
        ? [36, 26, 32][i % 3]
        : [90, 60, 80][i % 3];

      m.targetOffset = round2(progress * -speed);
    });

    if (headerEl && lineEl) {
      const headerRect = headerEl.getBoundingClientRect();
      targetHeader = clamp(1 - headerRect.top / winH, 0, 1);
    }
  }

  function renderFrame() {
    ticking = false;

    const ease = isMobile ? 0.14 : 0.11;
    let needsNextFrame = false;

    metrics.forEach((m) => {
      if (!m.wrapper) return;

      m.currentOffset = lerp(m.currentOffset, m.targetOffset, ease);

      if (Math.abs(m.currentOffset - m.targetOffset) > 0.08) {
        needsNextFrame = true;
      } else {
        m.currentOffset = m.targetOffset;
      }

      m.wrapper.style.transform = `translate3d(0, ${round2(m.currentOffset)}px, 0)`;
    });

    if (headerEl && lineEl) {
      currentHeader = lerp(currentHeader, targetHeader, isMobile ? 0.16 : 0.12);

      if (Math.abs(currentHeader - targetHeader) > 0.005) {
        needsNextFrame = true;
      } else {
        currentHeader = targetHeader;
      }

      headerEl.style.opacity = `${currentHeader}`;
      headerEl.style.transform = `translate3d(0, ${round2(28 - currentHeader * 28)}px, 0)`;
      lineEl.style.transform = `scaleX(${currentHeader})`;
    }

    if (needsNextFrame) {
      requestAnimationFrame(renderFrame);
      ticking = true;
    }
  }

  function updateParallax(scrollY) {
    latestScrollY = scrollY;
    updateTargets(latestScrollY);

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  function handleResize() {
    checkMobile();
    measure();
    updateTargets(window.scrollY);

    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderFrame);
    }
  }

  onMount(() => {
    cards = [...section.querySelectorAll(".visual")];
    checkMobile();
    measure();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", handleResize);

    registerParallax(updateParallax);

    updateTargets(window.scrollY);
    requestAnimationFrame(renderFrame);
  });

  onDestroy(() => {
    unregisterParallax(updateParallax);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("load", handleResize);
  });
</script>

<section class="home-showcase" bind:this={section}>
  <div class="gallery-header" bind:this={headerEl}>
    <h2>Découvrez nos terres</h2>
    <div class="line" bind:this={lineEl}></div>
    <p>
      Notre agence repose sur 3 piliers fondamentaux : les sommets de l'ambition,
      le reflet d'un art et les lumières de la création.
    </p>
  </div>

  {#each [
    {
      img: "/images/photo2.webp",
      alt: "Creative vision",
      title: "Discover our creative VISION",
      text: "We shape visual universes where form, texture and motion create immersive brand experiences.",
      reverse: false
    },
    {
      img: "/images/photo2.webp",
      alt: "Artistic depth",
      title: "Crafted interactions with artistic DEPTH",
      text: "Every motion, contrast and transition is designed to create rhythm and harmony.",
      reverse: true
    },
    {
      img: "/images/photo2.webp",
      alt: "Emotional impact",
      title: "Where design meets emotional IMPACT",
      text: "We blend minimalism, sculpture-like compositions and cinematic pacing.",
      reverse: false
    }
  ] as sectionData}
    <div class="split {sectionData.reverse ? 'reverse' : ''}">
      <div class="visual">
        <div class="parallax-wrapper">
          <img
            src={sectionData.img}
            alt={sectionData.alt}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            draggable="false"
          />
        </div>
      </div>

      <div class="content">
        <h2>{sectionData.title}</h2>
        <p>{sectionData.text}</p>
      </div>
    </div>
  {/each}

  <div class="gallery-footer">
    <a href="/services" class="services-btn">
      Découvrir nos terres
    </a>
  </div>
</section>

<style>
.home-showcase {
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
  background: #111;
  color: #fff;
  padding: 12vh 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* HEADER */
.gallery-header {
  width: min(900px, 90%);
  margin-bottom: 6rem;
  text-align: center;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate3d(0, 28px, 0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.gallery-header h2 {
  font-family: "Aboreto", serif;
  font-size: clamp(2.5rem, 4vw, 4rem);
  letter-spacing: 0.2em;
  margin-bottom: 1.5rem;
}

.gallery-header p {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  opacity: 0.65;
  line-height: 1.6;
}

.line {
  width: 120px;
  height: 1px;
  background: #fff;
  margin: 0 auto 2rem auto;
  transform: scaleX(0);
  transform-origin: center;
  will-change: transform;
  backface-visibility: hidden;
}

/* SPLIT SECTIONS */
.split {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 6vw;
  padding: 14vh 10vw;
  width: 100%;
}

.split.reverse {
  grid-template-columns: 1fr 1.1fr;
}

.split.reverse .visual { order: 2; }
.split.reverse .content { order: 1; }

.visual {
  height: 520px;
  overflow: hidden;
  position: relative;
  background: #161616;
  contain: layout paint;
}

.parallax-wrapper {
  height: 122%;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-origin: center center;
}

img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.content h2 {
  font-family: "Aboreto", serif;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  line-height: 1.05;
  margin-bottom: 2rem;
  width: 100%;
}

.content p {
  font-size: 1.05rem;
  color: #9b9b9b;
  line-height: 1.65;
  max-width: 620px;
}

/* BOUTON */
.gallery-footer {
  text-align: center;
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.services-btn {
  display: inline-block;
  padding: 14px 36px;
  border: 1px solid #fff;
  color: #fff;
  text-decoration: none;
  font-family: "Manrope", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  transition: all 0.4s ease;
}

.services-btn:hover {
  background: #fff;
  color: #111;
}

@media (max-width: 900px) {
  .home-showcase {
    padding: 10vh 0;
  }

  .gallery-header {
    width: min(92%, 680px);
    margin-bottom: 4rem;
  }

  .split {
    grid-template-columns: 1fr;
    gap: 2.25rem;
    padding: 10vh 6vw;
  }

  .split.reverse .visual,
  .split.reverse .content {
    order: initial;
  }

  .visual {
    height: min(66vw, 460px);
  }

  .parallax-wrapper {
    height: 112%;
  }

  .content h2 {
    font-size: clamp(2rem, 7vw, 3.4rem);
  }

  .content p {
    font-size: 0.98rem;
    line-height: 1.6;
  }
}
</style>