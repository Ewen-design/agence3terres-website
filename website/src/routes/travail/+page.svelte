<script>
  import Gallery2 from "$lib/sections/Gallery2.svelte";
  import Gallery3 from "$lib/sections/Gallery3.svelte";
  import StoryGalleryIntro from "$lib/sections/StoryGalleryIntro.svelte";
  import StoryGalleryEditorial from "$lib/sections/StoryGalleryEditorial.svelte";

  let travailDarkPhase = false;
</script>

<StoryGalleryIntro />
<StoryGalleryEditorial />

<Gallery2 darkPhase={travailDarkPhase} />
<Gallery3
  darkPhase={travailDarkPhase}
  on:darkchange={(e) => (travailDarkPhase = e.detail)}
/>
