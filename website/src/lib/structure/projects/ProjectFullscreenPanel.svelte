<script>
  export let image = "";
  export let alt = "";
  export let title = "";
  export let text = "";
</script>

<section class="project-fullscreen-panel" style={`--panel-image:url('${image}')`}>
  <div class="project-fullscreen-panel__overlay">
    <div class="project-fullscreen-panel__copy">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  </div>
  <img class="project-fullscreen-panel__sr-only" src={image} alt={alt} loading="lazy" />
</section>

<style>
  .project-fullscreen-panel {
    position: relative;
    min-height: 100vh;
    min-height: 100svh;
    background-image: var(--panel-image);
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }

  .project-fullscreen-panel__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: clamp(1.2rem, 3vw, 2rem);
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0.02) 12%, rgba(0, 0, 0, 0.34) 100%),
      linear-gradient(90deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.02) 58%, rgba(0, 0, 0, 0.16) 100%);
  }

  .project-fullscreen-panel__copy {
    max-width: 26rem;
  }

  .project-fullscreen-panel__copy h2 {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-style: normal;
    font-size: clamp(2.8rem, 5vw, 4.6rem);
    line-height: 0.92;
    letter-spacing: -0.06em;
    color: #f5f1e8;
    max-width: 8ch;
  }

  .project-fullscreen-panel__copy p {
    margin: 0.75rem 0 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(0.98rem, 1.1vw, 1.04rem);
    line-height: 1.55;
    color: rgba(245, 241, 232, 0.86);
    max-width: 18rem;
  }

  .project-fullscreen-panel__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
</style>
