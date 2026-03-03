<script>
  import ClientShowcase from "../sections/ClientShowcase.svelte";

  export let navigate;

  const clients = [
    {
      name: "Maison Élixir",
      role: "Branding & Digital",
      description:
        "Identité visuelle, site web, campagne social media et déclinaisons print.",
      cover: "/images/parfum.jpg",
      page: "projet1",
      gallery: [
        { src: "/images/parfum.jpg", type: "square" },
        { src: "/images/parfum.jpg", type: "wide" },
        { src: "/images/parfum.jpg", type: "vertical" },
        { src: "/images/parfum.jpg", type: "free" }
      ]
    },
    {
      name: "Atelier Noir",
      role: "Direction artistique",
      description:
        "Conception d’univers visuel, branding premium et storytelling.",
      cover: "/images/parfum.jpg",
      page: "projet2",
      gallery: [
        { src: "/images/parfum.jpg", type: "square" },
        { src: "/images/parfum.jpg", type: "wide" },
        { src: "/images/parfum.jpg", type: "vertical" },
        { src: "/images/parfum.jpg", type: "free" }
      ]
    }
  ];
</script>

<section class="travail">
  {#each clients as client, i}
    <ClientShowcase
      {client}
      index={i}
      {navigate}
    />
  {/each}
</section>

<style>
.travail {
  width: 100%;
  overflow: hidden;
}
</style>