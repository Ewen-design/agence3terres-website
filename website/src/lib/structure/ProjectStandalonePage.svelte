<script>
  import { projectPages } from "$lib/data/projectPages.js";
  import ProjectHero from "$lib/structure/projects/ProjectHero.svelte";
  import ProjectTextBlock from "$lib/structure/projects/ProjectTextBlock.svelte";
  import ProjectStorySlider from "$lib/structure/projects/ProjectStorySlider.svelte";
  import ProjectMediaLayout from "$lib/structure/projects/ProjectMediaLayout.svelte";
  import ProjectFullscreenPanel from "$lib/structure/projects/ProjectFullscreenPanel.svelte";

  export let slug = "";

  const project = projectPages[slug];
  const pageTitle = project ? `${project.title} | Agence 3 Terres` : "Agence 3 Terres";
  const pageDescription = project?.hero?.summary || "";
</script>

<svelte:head>
  <title>{pageTitle}</title>
  {#if pageDescription}
    <meta name="description" content={pageDescription} />
  {/if}
</svelte:head>

{#if project}
  <div class="project-page">
    <ProjectHero
      title={project.title}
      category={project.category}
      year={project.year}
      summaryMain={project.hero.summaryMain}
      summaryMuted={project.hero.summaryMuted}
      image={project.hero.image}
      alt={project.hero.alt}
      meta={project.hero.meta}
    />

    <ProjectTextBlock
      title={project.intro.title}
      text={project.intro.text}
    />

    <ProjectStorySlider title={project.slider.title} slides={project.slider.slides} />

    <ProjectMediaLayout
      title={project.galleryPrimary.title}
      text={project.galleryPrimary.text}
      images={project.galleryPrimary.images}
    />

    <ProjectFullscreenPanel
      image={project.fullscreen.image}
      alt={project.fullscreen.alt}
      title={project.fullscreen.title}
      text={project.fullscreen.text}
    />

    <ProjectTextBlock
      title={project.detail.title}
      text={project.detail.text}
    />

    <ProjectMediaLayout
      title={project.gallerySecondary.title}
      text={project.gallerySecondary.text}
      images={project.gallerySecondary.images}
    />
  </div>
{/if}

<style>
  .project-page {
    background: #050505;
  }
</style>
