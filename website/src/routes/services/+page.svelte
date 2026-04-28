<script>
  import MixSlider from "$lib/components/services/MixSlider.svelte";
  import HeroServices from "$lib/components/services/HeroServices.svelte";
  import ServicesEditorialHoverShowcase from "$lib/components/services/ServicesEditorialHoverShowcase.svelte";
</script>

<HeroServices />

<MixSlider />

<ServicesEditorialHoverShowcase
  eyebrow="Services"
  text="Des formats pensés pour clarifier, donner du relief et installer une présence digitale plus juste."
  leftImage="/images/photo.webp"
  leftAlt="Direction visuelle Agence 3 Terres"
  leftTitleLeft="Image"
  leftTitleRight="Direction"
  leftHoverImages={[
    { src: "/images/parfum2.webp", alt: "Aperçu direction artistique" },
    { src: "/images/serein_design.webp", alt: "Aperçu design digital" },
    { src: "/images/telephone_main.webp", alt: "Aperçu interface mobile" }
  ]}
  rightImage="/images/parfum_ordinateur.webp"
  rightAlt="Interface digitale Agence 3 Terres"
  rightTitleLeft="Digital"
  rightTitleRight="Experience"
  rightHoverImages={[
    { src: "/images/parfum3.webp", alt: "Aperçu univers de marque" },
    { src: "/images/telephone_parfum.webp", alt: "Aperçu expérience mobile" },
    { src: "/images/parfum4.webp", alt: "Aperçu contenu visuel" }
  ]}
/>
