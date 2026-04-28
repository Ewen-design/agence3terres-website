<script>
  const combos = [
    { heavy: "Clash Display", classHeavy: "clash" },
    { heavy: "Melodrama", classHeavy: "melodrama" },
    { heavy: "Zodiak", classHeavy: "zodiak" },
    { heavy: "Array", classHeavy: "array" },
    { heavy: "Ranade", classHeavy: "ranade" },
    { heavy: "Gambarino", classHeavy: "gambarino" },
    { heavy: "Panchang", classHeavy: "panchang" },
    { heavy: "Bonny", classHeavy: "bonny" }
  ];
</script>

<svelte:head>
  <style>
    @import url('https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600&f[]=clash-display@500,600&f[]=melodrama@500,600&f[]=zodiak@400,500&f[]=array@500,700&f[]=ranade@400,500&f[]=gambarino@500,700&f[]=panchang@400,500,700&f[]=bonny@400,500,700&display=swap');
  </style>
</svelte:head>

<div class="container">
  {#each combos as combo}
    <article class="card">
      <!-- Light title (same family as text, bigger) -->
      <h2 class="lightTitle">Agence 3 Terres</h2>

      <!-- Heavy / branding title -->
      <h3 class={combo.classHeavy}>Agence 3 Terres</h3>

      <p class="text">
        Crafting refined digital identities with clarity and precision.
      </p>

      <div class="meta">
        <span class="meta-label">Titre lourd</span>
        <span class="meta-value">{combo.heavy}</span>
      </div>
      <div class="meta">
        <span class="meta-label">Texte</span>
        <span class="meta-value">General Sans Light</span>
      </div>
    </article>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
    background: #090909;
  }

  .container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 28px;
    padding: 48px;
    background:
      radial-gradient(circle at top left, rgba(255,255,255,0.045), transparent 34%),
      #090909;
  }

  .card {
    padding: 28px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 18px 50px rgba(0,0,0,0.26);
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: transform 0.28s ease, border-color 0.28s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,255,255,0.16);
  }

  /* Light title = General Sans Light but bigger */
  .lightTitle {
    font-family: 'General Sans', sans-serif;
    font-weight: 300;
    font-size: clamp(1.6rem, 2.5vw, 2.2rem);
    letter-spacing: -0.02em;
    color: rgba(255,255,255,0.9);
    margin: 0 0 4px;
  }

  /* Heavy title */
  h3 {
    margin: 0 0 10px;
    font-size: clamp(2rem, 3vw, 2.8rem);
    line-height: 0.95;
    color: #fff;
  }

  p {
    font-family: 'General Sans', sans-serif;
    font-weight: 300;
    font-size: 0.95rem;
    line-height: 1.55;
    color: rgba(255,255,255,0.68);
    margin-bottom: 12px;
    max-width: 34ch;
  }

  .meta {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .meta-label {
     
    font-size: 0.65rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }

  .meta-value {
    font-family: 'General Sans', sans-serif;
    font-size: 0.75rem;
    color: rgba(255,255,255,0.7);
  }

  /* Heavy font classes */
  .clash { font-family: 'Clash Display', sans-serif; font-weight: 600; letter-spacing: -0.03em; }
  .melodrama { font-family: 'Melodrama', serif; font-weight: 600; letter-spacing: -0.02em; }
  .zodiak { font-family: 'Zodiak', serif; font-weight: 500; letter-spacing: -0.02em; }
  .array { font-family: 'Array', sans-serif; font-weight: 600; letter-spacing: -0.03em; }
  .ranade { font-family: 'Ranade', serif; font-weight: 500; letter-spacing: -0.02em; }
  .gambarino { font-family: 'Gambarino', serif; font-weight: 600; letter-spacing: -0.02em; }
  .panchang { font-family: 'Panchang', sans-serif; font-weight: 600; letter-spacing: -0.03em; }
  .bonny { font-family: 'Bonny', serif; font-weight: 600; letter-spacing: -0.02em; }

  @media (max-width: 720px) {
    .container { padding: 24px; gap: 18px; }
    .card { padding: 22px; }
  }
</style>
