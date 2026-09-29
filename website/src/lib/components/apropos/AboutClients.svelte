<script>
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { reveal } from "$lib/actions/reveal.js";

  // ───────────────────────────────────────────────────────────────────────────
  //  AboutClients — les marques accompagnées (page à propos, 2026-09-05)
  //
  //  Un bloc simple, d'une hauteur d'écran et dix pour cent : un visuel encadré
  //  à gauche, la phrase en grand à droite, et EN BAS À DROITE le logo de la
  //  marque, en blanc sur le fond sombre.
  //
  //  ── Le visuel et le logo changent ENSEMBLE ────────────────────────────────
  //  Toutes les deux secondes, le bloc passe à la marque suivante : le logo ET
  //  le visuel du projet basculent au même instant. C'est ce qui fait tenir le
  //  bloc — un logo qui tourne seul au-dessus d'une image fixe ne dit rien,
  //  alors que la paire « voilà la marque, voilà ce qu'on a fait pour elle » se
  //  lit sans légende.
  //
  //  ── Les logos sont des fichiers à part, en blanc et sans fond ────────────
  //  Aucun des trois n'est utilisable tel que le client l'a livré : deux sont
  //  des SVG bleu nuit, un est un aplat bleu POSÉ SUR DU NOIR.
  //  Ils sont donc convertis une fois pour toutes par
  //  `media-source/logos-clients.sh`, vers `/images/logos-clients/`. Ne pas
  //  pointer sur les fichiers d'origine : sur ce fond, deux seraient invisibles
  //  et un troisième traînerait son carré noir.
  //
  //  ── L'échelle des logos est réglée UN PAR UN ─────────────────────────────
  //  Ils n'ont pas la même forme : Lybra est un mot large et bas,
  //  Ludosphères un monogramme carré, Moovy une lettre. Mis à la même
  //  hauteur, le monogramme écrase le mot ; mis à la même largeur, il
  //  disparaît. Chaque logo porte donc son propre facteur (`scale`), réglé à
  //  l'œil pour qu'ils pèsent tous pareil.
  // ───────────────────────────────────────────────────────────────────────────

  export let title =
    "Les marques nous confient leur image. <span class='dim'>Nous lui donnons du sens et une présence.</span>";

  /** Durée d'affichage d'une marque, en millisecondes. */
  export let interval = 2000;

  export let brands = [
    {
      name: "Lybra",
      logo: "/images/logos-clients/lybra.svg",
      scale: 1,
      image: "/images/lybra-affichage.webp",
      alt: "Affichage urbain Lybra — Agence 3 Terres"
    },
    {
      name: "Ludosphères",
      logo: "/images/logos-clients/ludospheres.svg",
      // Un monogramme carré : à hauteur égale il paraît deux fois plus lourd
      // qu'un mot, on le rentre.
      scale: 0.62,
      image: "/images/ludo-drapeau.webp",
      alt: "Bannière Ludosphères sur une façade — Agence 3 Terres"
    },
    {
      name: "Moovy",
      logo: "/images/logos-clients/moovy.webp",
      scale: 0.78,
      image: "/images/moovy-phone.webp",
      alt: "Interface Moovy sur téléphone — Agence 3 Terres"
    }
  ];

  let active = 0;
  let sectionEl;
  let timer;
  let observer;

  // Le compteur ne tourne QUE quand le bloc est à l'écran. Un `setInterval` qui
  // tourne toute la page durant réveille le fil principal pour rien, et Chrome
  // le bride de toute façon hors écran — le retour se ferait alors sur une
  // marque prise au hasard, avec un saut visible.
  function start() {
    stop();
    if (brands.length < 2) return;
    timer = setInterval(() => {
      active = (active + 1) % brands.length;
    }, interval);
  }

  function stop() {
    clearInterval(timer);
    timer = undefined;
  }

  onMount(() => {
    if (!browser) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.15 }
    );
    if (sectionEl) observer.observe(sectionEl);

    return () => {
      observer?.disconnect();
      stop();
    };
  });
</script>

<section class="clients" bind:this={sectionEl} aria-label="Les marques accompagnées">
  <!-- Le cadre du visuel. Toutes les images sont empilées au même endroit et
       c'est l'opacité qui décide : un `{#key}` qui remonterait l'élément
       relancerait un chargement à chaque bascule, et la première boucle
       clignoterait. -->
  <div class="clients__media">
    {#each brands as brand, i}
      <img
        class="clients__shot"
        class:is-on={i === active}
        src={brand.image}
        alt={brand.alt}
        loading={i === 0 ? "eager" : "lazy"}
        decoding="async"
        draggable="false"
      />
    {/each}
  </div>

  <div class="clients__col">
    <div class="clients__say">
      <h2 class="clients__title" use:reveal>{@html title}</h2>
    </div>

    <!-- Le logo, en bas à droite. La boîte garde une hauteur fixe : sans elle,
         le passage d'un mot large à un monogramme carré déplacerait la ligne de
         base, et tout le bas du bloc sauterait toutes les deux secondes. -->
    <div class="clients__brand">
      <div class="clients__logos">
        {#each brands as brand, i}
          <img
            class="clients__logo"
            class:is-on={i === active}
            style:--logo-scale={brand.scale ?? 1}
            src={brand.logo}
            alt={brand.name}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .clients {
    box-sizing: border-box;
    width: 100%;
    background: var(--bg-deep, #050709);
    color: #f4efe6;
    padding: var(--site-inset);
    overflow-x: clip;
  }

  .clients__media {
    position: relative;
    border-radius: var(--project-media-radius, 22px);
    overflow: hidden;
    background: var(--bg-raised, #0a0e12);
  }

  .clients__shot {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    /* Un fondu long : la bascule tombe toutes les deux secondes, un fondu court
       se lirait comme un clignotement. */
    transition: opacity 760ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .clients__shot.is-on {
    opacity: 1;
  }

  .clients__col {
    display: flex;
    flex-direction: column;
    gap: clamp(2.5rem, 8vh, 5rem);
  }

  .clients__say {
    display: flex;
    flex-direction: column;
    gap: clamp(1.2rem, 3vh, 2rem);
  }

  .clients__title {
    margin: 0;
    font-family: var(--site-font);
    font-weight: var(--site-weight-display, 500);
    font-size: clamp(1.85rem, 3.5vw, 3.3rem);
    line-height: 1.02;
    letter-spacing: var(--site-display-letter-spacing, -0.028em);
    color: #f4efe6;
    text-wrap: balance;
  }

  /* La demi-encre du site : la même valeur que les autres grands titres à deux
     tons de la home et de la page à propos. */
  .clients__title :global(.dim) {
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.5);
  }

  .clients__brand {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
  }

  /* La boîte des logos : une hauteur imposée, et tous les logos empilés dedans.
     `--logo-h` est la seule mesure à toucher pour les grossir ou les réduire
     ensemble ; `--logo-scale`, porté par chaque image, règle les écarts de
     forme entre eux. */
  .clients__logos {
    --logo-h: clamp(1.9rem, 3.4vw, 3.2rem);
    position: relative;
    height: var(--logo-h);
    width: min(20rem, 62vw);
  }

  .clients__logo {
    position: absolute;
    right: 0;
    top: 50%;
    max-width: 100%;
    max-height: calc(var(--logo-h) * var(--logo-scale, 1));
    width: auto;
    height: auto;
    opacity: 0;
    transform: translateY(-50%);
    transition: opacity 620ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .clients__logo.is-on {
    opacity: 0.94;
  }

  /* ── Grand écran : le visuel à gauche, la parole à droite ─────────────────
     C'est la disposition de la référence : un cadre haut collé au bord gauche,
     le texte en haut à droite, le logo tout en bas à droite. */
  @media (min-width: 861px) {
    .clients {
      /* La hauteur demandée : un écran et dix pour cent. En `svh` comme partout
         ailleurs sur le site — `vh` se mesure sur iOS SANS la barre d'outils, et
         le bloc déborderait tant qu'elle est affichée. */
      min-height: 110svh;
      display: flex;
      align-items: stretch;
      gap: clamp(2.5rem, 6vw, 8rem);
    }

    .clients__media {
      flex: 0 0 46%;
    }

    .clients__col {
      flex: 1 1 auto;
      min-width: 0;
      /* Le texte respire loin des bords du cadre voisin ; le bas reste au ras
         de la marge de section, où le logo doit tomber. */
      padding: clamp(2rem, 7vh, 5.5rem) clamp(1rem, 3vw, 4rem)
        clamp(1.5rem, 4vh, 3rem) 0;
    }
  }

  /* ── Écrans étroits : tout s'empile ─────────────────────────────────────── */
  @media (max-width: 860px) {
    .clients {
      display: flex;
      flex-direction: column;
      gap: clamp(2rem, 5vh, 3rem);
      padding: clamp(3rem, 9vh, 5rem) var(--site-inset) clamp(2.5rem, 7vh, 4rem);
    }

    .clients__media {
      /* Un cadre portrait : sur téléphone, une image large perdrait le sujet. */
      aspect-ratio: 4 / 5;
    }

    .clients__col {
      gap: clamp(1.8rem, 5vh, 2.6rem);
    }

    .clients__brand {
      justify-content: flex-start;
    }

    .clients__logos {
      width: 100%;
    }

    .clients__logo {
      right: auto;
      left: 0;
    }
  }

  @media (max-width: 760px) {
    .clients__title {
      font-size: clamp(1.6rem, 7vw, 2.3rem);
    }
  }

  /* ── Téléphone en paysage ─────────────────────────────────────────────────
     L'écran est plus étroit que 861 px, donc tout est empilé — mais il ne fait
     que 390 px de haut : un cadre en 4/5 pleine largeur y ferait deux écrans et
     demi à lui seul, et le titre passerait entièrement sous la ligne de
     flottaison. Le cadre reprend donc les proportions d'un écran. */
  @media (pointer: coarse) and (orientation: landscape) and (max-height: 600px) {
    .clients__title {
      font-size: clamp(1.5rem, 4vw, 2.2rem);
    }

    .clients__media {
      aspect-ratio: 16 / 9;
    }

    .clients {
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
  }

  /* Sans mouvement, le compteur ne démarre jamais (voir `onMount`) : seule la
     première marque s'affiche, et les fondus n'ont plus de raison d'être. */
  @media (prefers-reduced-motion: reduce) {
    .clients__shot,
    .clients__logo {
      transition: none;
    }
  }
</style>
