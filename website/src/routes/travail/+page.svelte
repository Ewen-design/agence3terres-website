<script>
  import HeroProjets from "$lib/components/travail/HeroProjets.svelte";
  import ProjectShowcase from "$lib/components/travail/ProjectShowcase.svelte";
  import OpenToProjects from "$lib/components/travail/OpenToProjects.svelte";
  import PremiumContactTransitionCta from "$lib/components/shared/cta/PremiumContactTransitionCta.svelte";
</script>

<h1 class="seo-page-title">Travail et projets - Réalisations Agence 3 Terres</h1>
<HeroProjets />
<ProjectShowcase excludePages={["contact"]} />
<OpenToProjects />
<ProjectShowcase onlyPages={["contact"]} full={true} />
