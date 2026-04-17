<svelte:head>
  <title>Projet 1 | Agence 3 Terres</title>
</svelte:head>

<script>
  import ProjectHeroProjetsStyle from "$lib/structure/projects/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/structure/projects/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/structure/projects/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/structure/projects/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/structure/projects/ProjectEditorialMobileShowcase.svelte";
</script>

<ProjectHeroProjetsStyle
  title="Projet 1"
  image="/images/serein_design.webp"
  finalText="Une page projet pensée pour montrer le travail avec plus de clarté, de tenue et de précision visuelle."
/>

<ProjectEditorialRole
  title="Notre rôle"
  images={[
    { src: "/images/photo.webp", alt: "Composition visuelle large du projet 1" },
    { src: "/images/serein_design.webp", alt: "Univers principal du projet 1" }
  ]}
  items={[
    {
      title: "Website UX et UI Design",
      text: "Un parcours plus clair, plus direct et plus calme, pensé pour mieux guider la lecture."
    },
    {
      title: "Direction visuelle",
      text: "Un langage plus net, plus premium, avec davantage d'air et une hiérarchie plus juste."
    },
    {
      title: "Déploiement mobile",
      text: "Une adaptation précise pour garder la même tenue sur des surfaces plus serrées."
    }
  ]}
/>

<ProjectEditorialSplit
  title="Interface mobile"
  text="Une présence plus simple et plus lisible. Le projet garde sa clarté jusque dans les vues les plus rapprochées."
  image="/images/telephone_main.webp"
  alt="Vue mobile projet 1"
/>

<ProjectEditorialStatement
  eyebrow="Système visuel"
  text="Le projet repose surtout sur les rapports d'échelle, la respiration entre les blocs et une lecture plus ouverte."
/>

<ProjectEditorialMobileShowcase
  eyebrow="Mobile first"
  text="Le mobile devient ici un vrai support d'expression, pas une simple adaptation plus compacte."
  leftImage="/images/telephone2.webp"
  leftAlt="Interface mobile verticale projet 1"
  rightImage="/images/photo2.webp"
  rightAlt="Mise en situation mobile projet 1"
/>

<ProjectEditorialSplit
  title="Vue desktop"
  text="Sur desktop, le système reste sobre et très lisible. Les espacements et les rapports de taille portent l'ensemble."
  image="/images/ordinateur.webp"
  alt="Vue desktop projet 1"
  reverse={true}
/>
