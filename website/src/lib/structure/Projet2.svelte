<svelte:head>
  <title>Projet 2 | Agence 3 Terres</title>
</svelte:head>

<script>
  import ProjectHeroProjetsStyle from "$lib/structure/projects/ProjectHeroProjetsStyle.svelte";
  import ProjectEditorialRole from "$lib/structure/projects/ProjectEditorialRole.svelte";
  import ProjectEditorialSplit from "$lib/structure/projects/ProjectEditorialSplit.svelte";
  import ProjectEditorialStatement from "$lib/structure/projects/ProjectEditorialStatement.svelte";
  import ProjectEditorialMobileShowcase from "$lib/structure/projects/ProjectEditorialMobileShowcase.svelte";
</script>

<ProjectHeroProjetsStyle
  title="Projet 2"
  image="/images/parfum_rouge.webp"
  finalText="Une page projet conçue pour installer un univers plus sensoriel, plus narratif et plus immersif dès l'arrivée."
/>

<ProjectEditorialRole
  title="Notre rôle"
  images={[
    { src: "/images/parfum4.webp", alt: "Composition visuelle large du projet 2" },
    { src: "/images/parfum2.webp", alt: "Univers principal du projet 2" }
  ]}
  items={[
    {
      title: "Direction artistique",
      text: "Une ambiance plus dense, plus sensorielle, pensée pour faire ressentir avant d'expliquer."
    },
    {
      title: "Narration digitale",
      text: "Un rythme plus assumé entre images, espaces et points d'accroche éditoriaux."
    },
    {
      title: "Expérience mobile",
      text: "Un travail d'écran pensé pour prolonger l'intensité du projet sans perdre la lecture."
    }
  ]}
/>

<ProjectEditorialSplit
  title="Iconographie"
  text="Des détails plus précis, une image plus incarnée, et un mobile qui garde toute l'intention visuelle du projet."
  image="/images/telephone_parfum.webp"
  alt="Vue mobile projet 2"
  reverse={true}
/>

<ProjectEditorialMobileShowcase
  eyebrow="Mobile matters"
  text="L'expérience mobile devait porter le projet avec la même intensité, la même précision et la même sensation d'immersion."
  leftImage="/images/parfum3.webp"
  leftAlt="Interface projet 2 sur fond sombre"
  rightImage="/images/telephone_parfum.webp"
  rightAlt="Mise en situation mobile projet 2"
  reverse={true}
/>

<ProjectEditorialStatement
  eyebrow="Mouvement et rythme"
  text="Le projet avance surtout par tension visuelle, densité maîtrisée et contraste entre grands vides et images très présentes."
/>

<ProjectEditorialSplit
  title="Direction digitale"
  text="L'ensemble garde une lecture claire, mais avec plus de densité visuelle et un rapport plus sensible entre image, matière et interface."
  image="/images/parfum_ordinateur.webp"
  alt="Vue desktop projet 2"
/>
