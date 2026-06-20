<script>
  export let image = "";
  export let alt = "";
  export let title = "";
  export let subtitle = "";
</script>

<section class="project-fullscreen-title-image" style={`--panel-image:url('${image}')`}>
  <div class="project-fullscreen-title-image__overlay">
    <div class="project-fullscreen-title-image__copy">
      <h2>{title}</h2>
      {#if subtitle}
        <p>{subtitle}</p>
      {/if}
    </div>
  </div>

  <img class="project-fullscreen-title-image__sr-only" src={image} alt={alt} loading="lazy" />
</section>

<style>
  .project-fullscreen-title-image {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    background-image: var(--panel-image);
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }

  .project-fullscreen-title-image__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: clamp(1rem, 2.4vw, 1.7rem);
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.02) 18%, rgba(0, 0, 0, 0.38) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.02) 48%, rgba(0, 0, 0, 0.08) 100%);
  }

  .project-fullscreen-title-image__copy {
    max-width: 28rem;
  }

  .project-fullscreen-title-image__copy h2 {
    margin: 0;
    font-family: "Inter", sans-serif;
    font-style: normal;
    font-weight: 400;
    font-size: clamp(2.8rem, 5vw, 5.3rem);
    line-height: 0.92;
    letter-spacing: -0.06em;
    color: #f5f1e8;
  }

  .project-fullscreen-title-image__copy p {
    margin: 0.7rem 0 0;
    max-width: 17rem;
    font-family: "Inter", sans-serif;
    font-size: clamp(0.95rem, 1vw, 1.02rem);
    line-height: 1.45;
    color: rgba(245, 241, 232, 0.78);
  }

  .project-fullscreen-title-image__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
</style>
