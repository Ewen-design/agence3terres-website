<script>
  const legalSections = [
    {
      title: "Éditeur du site",
      paragraphs: [
        "Le site agence3terres.com est édité par Agence 3 Terres.",
        "Adresse : Paris, France.",
        "E-mail : contact@agence3terres.com.",
        "Responsable de la publication : Agence 3 Terres."
      ]
    },
    {
      title: "Hébergement",
      paragraphs: [
        "Le site est hébergé par un prestataire technique dont les informations complètes peuvent être précisées ici.",
        "À compléter : nom de l'hébergeur, adresse postale et numéro de téléphone."
      ]
    },
    {
      title: "Propriété intellectuelle",
      paragraphs: [
        "L'ensemble des contenus présents sur ce site, incluant notamment les textes, éléments graphiques, marques, logos et créations, est protégé par le droit de la propriété intellectuelle.",
        "Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation préalable écrite, est interdite."
      ]
    },
    {
      title: "Données personnelles",
      paragraphs: [
        "Les informations éventuellement transmises via le formulaire de contact sont utilisées uniquement pour répondre aux demandes envoyées à Agence 3 Terres.",
        "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à contact@agence3terres.com."
      ]
    },
    {
      title: "Cookies",
      paragraphs: [
        "Le site peut utiliser des cookies ou traceurs strictement nécessaires à son bon fonctionnement ainsi qu'à la mesure d'audience, selon sa configuration en production.",
        "Si vous mettez en place des outils de mesure ou des services tiers, pensez à compléter cette section avec les informations correspondantes."
      ]
    },
    {
      title: "Limitation de responsabilité",
      paragraphs: [
        "Agence 3 Terres s'efforce d'assurer l'exactitude des informations publiées sur ce site, sans pouvoir garantir l'absence totale d'erreurs, d'omissions ou d'indisponibilités.",
        "L'utilisateur reste responsable de l'usage qu'il fait des informations consultées sur le site."
      ]
    }
  ];
</script>

<section class="creative-section legal-page">
  <div class="legal-shell">
    <div class="legal-hero">
      <h1>Mentions légales</h1>
    </div>

    <div class="legal-content">
      {#each legalSections as section}
        <section class="legal-section">
          <h2>{section.title}</h2>

          {#each section.paragraphs as paragraph}
            <p>{paragraph}</p>
          {/each}
        </section>
      {/each}
    </div>
  </div>
</section>

<style>
  .legal-page {
    position: relative;
    min-height: 100svh;
    background: #ffffff;
    color: #131313;
  }

  .legal-shell {
    width: min(100%, 1120px);
    margin: 0 auto;
    padding:
      clamp(7.5rem, 12vw, 10.5rem)
      clamp(1.15rem, 2.8vw, 2rem)
      clamp(5rem, 8vw, 7rem);
  }

  .legal-hero {
    max-width: 44rem;
    padding-bottom: clamp(2.4rem, 5vw, 3.8rem);
  }

  h1 {
    margin: 0;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(3rem, 8vw, 6.25rem);
    line-height: 0.94;
    font-weight: 200;
    letter-spacing: -0.05em;
    color: #111111;
    text-wrap: balance;
  }

  .legal-content {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(2rem, 4vw, 3rem) clamp(2rem, 5vw, 4.5rem);
    padding-top: clamp(2.4rem, 5vw, 4rem);
  }

  .legal-section {
    padding-top: 1.2rem;
    border-top: 1px solid rgba(19, 19, 19, 0.08);
  }

  h2 {
    margin: 0 0 0.95rem;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(1.3rem, 1.9vw, 1.7rem);
    line-height: 1.04;
    font-weight: 300;
    letter-spacing: -0.03em;
    color: #111111;
  }

  .legal-section p {
    margin: 0;
    max-width: 34rem;
    font-family: "Clash Display", sans-serif;
    font-size: clamp(0.98rem, 1.06vw, 1.05rem);
    line-height: 1.72;
    font-weight: 300;
    color: rgba(19, 19, 19, 0.62);
  }

  .legal-section p + p {
    margin-top: 0.85rem;
  }

  @media (max-width: 900px) {
    .legal-shell {
      padding-top: clamp(15rem, 52vw, 21rem);
      padding-left: clamp(1rem, 5vw, 1.4rem);
      padding-right: clamp(1rem, 5vw, 1.4rem);
      padding-bottom: clamp(4rem, 12vw, 5rem);
    }

    .legal-content {
      grid-template-columns: 1fr;
      gap: 1.6rem;
    }

    h1 {
      max-width: 8ch;
      font-size: clamp(2.6rem, 14vw, 4.2rem);
    }
  }
</style>
