<script>
  import { reveal } from "$lib/actions/reveal.js";

  /*  ── Mentions légales (refaites le 2026-10-10) ──────────────────────────
   *  Obligatoires pour tout site professionnel : article 1-1 de la loi pour la
   *  confiance dans l'économie numérique (LCEN, n° 2004-575), dans sa version
   *  issue de la loi SREN du 21 mai 2024 (l'ancien article 6, III). Sanction
   *  (article 1-2) : jusqu'à un an d'emprisonnement et 75 000 € d'amende pour
   *  une personne physique, 375 000 € pour une société. S'y ajoutent
   *  l'information RGPD (articles 13 et 14) et, le cas échéant, le médiateur de
   *  la consommation (Code de la consommation, L.612-1 et L.616-1).
   *
   *  ⚠️ TOUT CE QUI EST À REMPLIR EST ICI, dans les quatre blocs ci-dessous.
   *  Une valeur laissée à `null` s'affiche « à compléter » en couleur sur la
   *  page : rien de faux ni de vide ne peut partir en ligne sans se voir.
   *
   *  État vérifié dans le code le 2026-10-10 (à garder vrai si le site change) :
   *  - aucun cookie, aucun traceur, aucune mesure d'audience, aucun stockage
   *    dans le navigateur ; polices et vidéos servies par le site lui-même,
   *    aucune ressource tierce chargée (build de production contrôlé) ;
   *  - pas de formulaire : le contact se fait par lien e-mail et Instagram ;
   *  - le serveur (Caddy) écrit un journal des requêtes, adresses IP comprises.
   *  Ajouter un outil de mesure, une vidéo YouTube, une carte, un formulaire…
   *  oblige à revoir les sections « Données personnelles » et « Cookies » (et,
   *  pour un traceur non exempté, à poser un bandeau de consentement). */

  // ── L'ÉDITEUR — l'entreprise qui publie le site ───────────────────────────
  //  Ewen Vidamment, micro-entrepreneur : une ENTREPRISE INDIVIDUELLE (EI).
  //  Pour une EI, la loi demande le nom et le prénom de l'entrepreneur, la
  //  mention « EI » (ou « entrepreneur individuel ») à côté, et son adresse.
  //  Vérifié dans l'annuaire des entreprises (data.gouv) le 2026-10-10 :
  //  SIREN 108 013 251, entrepreneur individuel, créé le 2026-07-24, activité
  //  62.01Z (programmation informatique), siège à Issy-les-Moulineaux. Une
  //  activité libérale de ce type est immatriculée au Registre national des
  //  entreprises (RNE), pas au RCS.
  const editeur = {
    nom: "Agence 3 Terres", // le nom commercial
    titulaire: "Ewen Vidamment",
    forme: "entrepreneur individuel (EI)",
    adresse: "9 rue Édouard Branly, 92130 Issy-les-Moulineaux, France",
    immatriculation: "SIREN 108 013 251 — SIRET 108 013 251 00013, immatriculé au Registre national des entreprises (RNE)",
    // N° de TVA intracommunautaire — seulement si l'entreprise en a un (il
    // commence par « FR »). Confirmé le 2026-10-10 : franchise en base (les
    // factures portent « TVA non applicable, art. 293 B du CGI »), donc pas de
    // numéro : `""` masque la ligne. À remplir si l'entreprise en obtient un.
    tva: "",
    telephone: "06 79 51 37 82",
    email: "contact@agence3terres.fr",
    site: "agence3terres.fr"
  };

  // ── LA PUBLICATION — la personne responsable du contenu ───────────────────
  // Le représentant légal en règle générale : pour une EI, l'entrepreneur.
  const directeurPublication = "Ewen Vidamment, entrepreneur individuel";

  // ── L'HÉBERGEUR — le prestataire du serveur qui fait tourner le site ──────
  // (Pas GitHub : l'image Docker y est seulement stockée. C'est le fournisseur
  // de la machine où tourne le conteneur derrière Pangolin.)
  const hebergeur = {
    nom: null, // ex. « OVH SAS », « Hetzner Online GmbH », « Scaleway SAS »
    adresse: null,
    telephone: null
  };

  // ── LES DONNÉES ───────────────────────────────────────────────────────────
  const donnees = {
    // Le fournisseur de la boîte contact@agence3terres.fr (ex. « OVHcloud »,
    // « Google Workspace », « Infomaniak »). S'il est hors de l'Union
    // européenne, le dire : c'est un transfert de données.
    messagerie: null,
    // Durée de conservation des journaux du serveur. Ils partent aujourd'hui
    // sur la sortie standard du conteneur (Docker) : sans rotation configurée,
    // ils ne s'effacent jamais. La CNIL recommande de 6 mois à 1 an pour des
    // journaux de sécurité. Ex. : « 6 mois ».
    journaux: null
  };

  // ── LE MÉDIATEUR DE LA CONSOMMATION ───────────────────────────────────────
  // OBLIGATOIRE seulement si l'agence signe avec des PARTICULIERS (et non des
  // professionnels). Ex. : { nom: "…", adresse: "…", site: "https://…" }.
  // `null` : la section n'est pas affichée.
  const mediateur = null;

  const majLe = "10 octobre 2026";

  // ──────────────────────────────────────────────────────────────────────────

  const todo = (hint) => `<span class="legal-todo">à compléter${hint ? ` (${hint})` : ""}</span>`;
  const val = (value, hint) => (value === null || value === undefined ? todo(hint) : value);
  const mail = `<a href="mailto:${editeur.email}">${editeur.email}</a>`;
  const responsable = `${editeur.titulaire} (EI), ${editeur.nom}`;
  const tel = editeur.telephone
    ? `<a href="tel:+33${editeur.telephone.replace(/\s/g, "").slice(1)}">${editeur.telephone}</a>`
    : null;

  const legalSections = [
    {
      title: "Éditeur du site",
      paragraphs: [
        `Le site ${editeur.site} est édité par ${editeur.titulaire}, ${editeur.forme}, sous le nom commercial ${editeur.nom}.`,
        `Adresse : ${val(editeur.adresse, "adresse complète")}.`,
        `${val(editeur.immatriculation, "RNE, n° SIREN")}.`,
        editeur.tva === "" ? null : `N° de TVA intracommunautaire : ${val(editeur.tva, "si assujettie")}.`,
        `Téléphone : ${val(tel)}. E-mail : ${mail}.`
      ]
    },
    {
      title: "Directeur de la publication",
      paragraphs: [
        `${val(directeurPublication, "prénom, nom et qualité")}.`,
        `Pour toute question sur le contenu du site : ${mail}.`
      ]
    },
    {
      title: "Hébergement",
      paragraphs: [
        `Le site est hébergé par ${val(hebergeur.nom, "nom de l'hébergeur")}, ${val(hebergeur.adresse, "adresse")}.`,
        `Téléphone : ${val(hebergeur.telephone)}.`
      ]
    },
    {
      title: "Conception et réalisation",
      paragraphs: [
        `Conception, design et développement : ${editeur.nom} (${editeur.titulaire}).`,
        "Typographie : Switzer, dessinée par Indian Type Foundry, diffusée par Fontshare sous licence ITF Free Font License."
      ]
    },
    {
      title: "Propriété intellectuelle",
      paragraphs: [
        `L'ensemble des contenus de ce site — textes, éléments graphiques, mises en page, vidéos, animations et code — est la propriété de ${editeur.titulaire} (${editeur.nom}) ou est utilisé avec l'autorisation de ses titulaires, et protégé par le Code de la propriété intellectuelle.`,
        "Les marques, logos, visuels et témoignages des clients présentés dans les projets appartiennent à leurs titulaires respectifs. Ils sont reproduits avec leur accord, à titre de références.",
        "Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite."
      ]
    },
    {
      title: "Données personnelles",
      paragraphs: [
        `Responsable du traitement : ${responsable}, joignable à ${mail}.`,
        "Ce site ne comporte aucun formulaire. Si vous nous écrivez par e-mail, nous utilisons vos coordonnées et le contenu de votre message pour vous répondre et, le cas échéant, préparer et suivre notre collaboration (base légale : mesures précontractuelles et intérêt légitime). Ces échanges sont conservés trois ans après le dernier contact, sauf relation contractuelle en cours.",
        `Ils ne sont transmis à aucun tiers et ne sont jamais vendus. Notre messagerie est hébergée par ${val(donnees.messagerie, "fournisseur de la boîte e-mail")}, qui agit pour notre compte.`,
        `Comme tout serveur, celui du site enregistre des données techniques à chaque visite (adresse IP, date et heure, page demandée, navigateur), pour assurer sa sécurité et son bon fonctionnement (intérêt légitime). Elles sont conservées ${val(donnees.journaux, "durée de conservation des journaux")}.`,
        `Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données : écrivez à ${mail}. Vous pouvez aussi adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">cnil.fr</a>).`
      ]
    },
    {
      title: "Cookies",
      paragraphs: [
        "Ce site ne dépose aucun cookie et n'utilise aucun traceur : ni mesure d'audience, ni publicité, ni bouton de réseau social. Les polices et les vidéos sont servies par le site lui-même. Aucun consentement ne vous est donc demandé."
      ]
    },
    {
      title: "Liens externes",
      paragraphs: [
        `Le site renvoie vers des sites tiers (les sites des clients, Instagram). ${editeur.nom} n'en contrôle pas le contenu et ne peut en être tenue responsable ; leur consultation relève de leurs propres conditions et politiques de confidentialité.`
      ]
    },
    mediateur && {
      title: "Médiation de la consommation",
      paragraphs: [
        `Conformément aux articles L.612-1 et suivants du Code de la consommation, le client consommateur peut recourir gratuitement au médiateur de la consommation dont relève ${editeur.nom} : ${mediateur.nom}, ${mediateur.adresse}${mediateur.site ? `, <a href="${mediateur.site}" target="_blank" rel="noopener noreferrer">${mediateur.site.replace(/^https?:\/\//, "")}</a>` : ""}.`
      ]
    },
    {
      title: "Limitation de responsabilité",
      paragraphs: [
        `${editeur.nom} s'efforce d'assurer l'exactitude des informations publiées sur ce site, sans pouvoir garantir l'absence totale d'erreurs, d'omissions ou d'indisponibilités.`,
        "L'utilisateur reste responsable de l'usage qu'il fait des informations consultées sur le site."
      ]
    },
    {
      title: "Droit applicable",
      paragraphs: [
        "Les présentes mentions sont régies par le droit français.",
        `Dernière mise à jour : ${majLe}.`
      ]
    }
  ]
    .filter(Boolean)
    .map((section) => ({ ...section, paragraphs: section.paragraphs.filter(Boolean) }));
</script>

<!-- Plus de `creative-section` : cette classe est dans la liste des sections
     CLAIRES du header, qui y passait donc son texte en noir. La page est
     sombre depuis le 2026-09-01. -->
<section class="legal-page">
  <div class="legal-shell">
    <div class="legal-hero">
      <h1 use:reveal>Mentions légales</h1>
    </div>

    <div class="legal-content">
      {#each legalSections as section, i}
        <section class="legal-section" use:reveal={{ delay: (i % 2) * 80 }}>
          <h2>{section.title}</h2>

          {#each section.paragraphs as paragraph}
            <p>{@html paragraph}</p>
          {/each}
        </section>
      {/each}
    </div>
  </div>
</section>

<style>
  /* Page sombre depuis le 2026-09-01 (elle était blanche) : le gris foncé
     bleuté de la palette, comme les pages projet. */
  .legal-page {
    position: relative;
    min-height: 100svh;
    background: var(--bg-panel, #161617);
    color: #f4efe6;
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
    font-family: var(--site-font);
    font-size: clamp(3rem, 8vw, 6.25rem);
    line-height: 0.94;
    font-weight: var(--site-weight-display);
    letter-spacing: var(--site-display-letter-spacing);
    color: #f4efe6;
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
    border-top: 1px solid rgba(var(--ink-muted-rgb, 245, 241, 232), 0.14);
  }

  h2 {
    margin: 0 0 0.95rem;
    font-family: var(--site-font);
    font-size: clamp(1.3rem, 1.9vw, 1.7rem);
    line-height: 1.04;
    font-weight: var(--site-weight);
    letter-spacing: -0.03em;
    color: #f4efe6;
  }

  .legal-section p {
    margin: 0;
    max-width: 34rem;
    font-family: var(--site-font);
    font-size: clamp(0.98rem, 1.06vw, 1.05rem);
    line-height: 1.72;
    font-weight: var(--site-weight);
    color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.62);
  }

  .legal-section p + p {
    margin-top: 0.85rem;
  }

  .legal-section p :global(a) {
    color: #f4efe6;
    text-decoration: underline;
    text-decoration-color: rgba(var(--ink-muted-rgb, 245, 241, 232), 0.35);
    text-underline-offset: 0.2em;
    transition: text-decoration-color 0.2s ease;
  }

  .legal-section p :global(a:hover) {
    text-decoration-color: currentColor;
  }

  /* Une information manquante (voir le haut du fichier) : visible, pour ne
     jamais partir en ligne sans qu'on la remarque. */
  .legal-section p :global(.legal-todo) {
    color: #ffb35c;
    font-style: italic;
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
