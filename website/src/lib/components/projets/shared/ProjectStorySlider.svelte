<script>
  import { createEventDispatcher } from "svelte";
  import FocusZoneSlider from "$lib/components/slider/FocusZoneSlider.svelte";

  export let slides = [];
  const dispatch = createEventDispatcher();

  function toNumber(index) {
    return String(index + 1).padStart(2, "0");
  }

  $: projectSlides = slides.map((slide, index) => {
    const heading = [slide.label, slide.title].filter(Boolean).join("\n");

    return {
      number: slide.number || toNumber(index),
      title: heading || slide.title || "",
      description: slide.text || slide.description || "",
      image: slide.image,
      mobileImage: slide.mobileImage || slide.image
    };
  });
</script>

<FocusZoneSlider
  slides={projectSlides}
  zoneHeight="33svh"
  itemHeightDesktop="53vh"
  itemHeightMobile="48svh"
  on:slideractivechange={(event) => dispatch("slideractivechange", event.detail)}
/>
