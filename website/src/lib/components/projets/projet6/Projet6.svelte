<script>
  // ── Mission X — jeu social mobile ─────────────────────────────────────────
  //  Le projet est encore en cours : la page le dit (le badge de l'accroche le
  //  porte) et reste plus courte que les autres — il n'y a pas encore de site
  //  en ligne à montrer, donc pas de carte « voir le projet » vers l'extérieur.
  import ProjectThemePage from "$lib/components/projets/shared/ProjectThemePage.svelte";
  import ProjectHeroProjetsStyle from "$lib/components/projets/shared/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialStatement from "$lib/components/projets/shared/ProjectEditorialStatement.svelte";

  import ProjectEditoBadge from "$lib/components/projets/blocks/ProjectEditoBadge.svelte";
  // « Notre rôle » en volets : c'est le composant de la HOME, réutilisé tel
  // quel. Une copie vivait un temps dans `blocks/` et tremblait sur Safari là
  // où l'original ne tremble pas — elle a été jetée plutôt que rafistolée.
  import ProjectFlaps from "$lib/components/home/HomeFeatureCards.svelte";
  import ProjectImageTabs from "$lib/components/projets/blocks/ProjectImageTabs.svelte";
  import ProjectActionDuo from "$lib/components/projets/blocks/ProjectActionDuo.svelte";
  import ProjectWall from "$lib/components/projets/blocks/ProjectWall.svelte";

  import { autresProjets } from "$lib/data/projets.js";
</script>

<ProjectThemePage>
  <ProjectHeroProjetsStyle
    title="Mission X"
    image="/images/jeu_mockup.webp"
    mobileImage="/images/jeu_mockup.webp"
    metaBlocks={[
      { label: "Date", value: "2026" },
      { label: "Secteur", value: "Jeu social mobile" },
      {
        label: "Services",
        value: ["Game design", "Direction artistique", "Interface mobile"]
      }
    ]}
    ctaLabel="Découvrir le projet"
    scrollToId="projet-mission-x"
  />

  <div class="project-theme-band" id="projet-mission-x">
    <ProjectEditoBadge
      text="<span class='hl'>Un téléphone qui circule autour d'une table comme un dossier confidentiel.</span> Mission X oppose détectives et voleurs, et tout se joue sur ce qu'on montre ou pas."
      image="/images/missionx4.webp"
      alt="Univers visuel du jeu Mission X"
      aspect="1.6"
      mobileAspect="1.1"
    />

    <ProjectFlaps
      background="var(--project-surface-bg, var(--bg-deep, #050709))"
      title="Deux camps,<br />un seul écran."
      cards={[
        {
          title: "Le camp des détectives",
          text: "Bleu, méthodique, tourné vers la preuve. Chaque écran de ce camp doit se lire <span class='hl'>d'un coup d'œil</span> : une partie ne laisse pas le temps de chercher.",
          image: "/images/missionX5.webp",
          alt: "L'univers du détective dans Mission X"
        },
        {
          title: "Le camp des voleurs",
          text: "Rouge, rapide, tourné vers le bluff. Le <span class='hl'>langage rouge / bleu</span> sépare les deux camps sans qu'aucun texte n'ait à l'expliquer.",
          image: "/images/missionx1.webp",
          alt: "L'univers du voleur dans Mission X"
        },
        {
          title: "Le téléphone qui circule",
          text: "Un seul appareil pour toute la table : l'interface doit se <span class='hl'>replier instantanément</span> quand il change de mains. C'est la contrainte qui a dessiné le jeu.",
          image: "/images/missionx2.webp",
          alt: "Le téléphone de Mission X passé d'un joueur à l'autre"
        }
      ]}
    />
  </div>

  <div class="project-theme-band theme-deep">
    <ProjectEditorialStatement
      text="<span class='hl'>Une interface lisible et un langage de couleur immédiat.</span> De quoi rendre chaque partie jouable dès la première minute, et spectaculaire pour ceux qui regardent."
    />

    <ProjectImageTabs
      title="Un jeu qui se comprend<br /><span class='dim'>avant qu'on l'explique.</span>"
      tabs={[
        {
          label: "L'interface",
          image: "/images/missionx3.webp",
          alt: "Écrans d'interface de Mission X"
        },
        {
          label: "En main",
          image: "/images/jeu_mockup.webp",
          alt: "Mission X sur un téléphone"
        },
        {
          label: "La direction artistique",
          image: "/images/missionx4.webp",
          alt: "Univers visuel de Mission X"
        }
      ]}
      note="Le projet est <span class='hl'>en cours</span> : cette page montre la direction posée, pas encore la version publiée."
    />
  </div>

  <div class="project-theme-band">
    <ProjectActionDuo
      tint="#2f2670"
      primary={{
        label: "Le travail",
        title: "Voir ce que nous avons déjà livré.",
        href: "/travail",
        phone: { image: "/images/missionx3.webp", position: "50% 44%" }
      }}
      secondary={{
        label: "Parlons-en",
        title: "Une idée de jeu à mettre debout ?",
        href: "/contact"
      }}
    />
  </div>

  <!-- Le mur vit sur le NOIR de la palette, pas sur le gris de la page :
       sans sa bande, ses marges laisseraient voir le gris tout autour. -->
  <div class="project-theme-band theme-deep">
    <ProjectWall
      title="Le reste du <span class='dim'>travail.</span>"
      projects={autresProjets("projet6")}
    />
  </div>
</ProjectThemePage>
