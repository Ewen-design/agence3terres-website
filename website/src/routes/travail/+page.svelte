<script>
  import Gallery2 from "$lib/sections/Gallery2.svelte";
  import Gallery3 from "$lib/sections/Gallery3.svelte";

  let travailDarkPhase = false;
</script>

<Gallery2 darkPhase={travailDarkPhase} />
<Gallery3
  darkPhase={travailDarkPhase}
  on:darkchange={(e) => (travailDarkPhase = e.detail)}
/>
