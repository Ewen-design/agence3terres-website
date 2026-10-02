/**
 * Le registre des projets — une seule liste, un seul ordre.
 *
 * Trois blocs s'en servent et doivent rester d'accord entre eux :
 *   • `ProjectNextFooter` — le pied de page qui annonce le projet SUIVANT et y
 *     mène au défilement. Il peint l'image du hero du projet suivant : c'est
 *     pour ça que `hero` décrit exactement ce que le hero de ce projet affiche
 *     (image de bureau, image de téléphone, et le poster quand le hero est une
 *     vidéo — un poster est le photogramme 0 du montage, donc la même image).
 *   • `ProjectWall` — le mur des autres projets, en fin de page.
 *   • la page Travail et la home, qui listent les mêmes projets.
 *
 * L'ORDRE DE CE TABLEAU EST L'ORDRE DE LECTURE du site : c'est lui qui décide
 * quel projet vient après quel autre, et la chaîne boucle (le dernier renvoie
 * au premier). Déplacer une entrée suffit à changer tout l'enchaînement.
 *
 * `listed: false` — une page projet qui existe mais ne figure dans aucune
 * liste publique. Elle a un « projet suivant » (sinon son pied de page n'aurait
 * nulle part où aller) mais n'est jamais la destination de personne.
 */
export const PROJETS = [
  {
    slug: "projet9",
    title: "Harmonia",
    category: "Centre de médecine esthétique",
    lead: "Une identité médicale, et un site qui la porte.",
    tags: "Identité visuelle, site web, direction artistique",
    annee: "2026",
    hero: {
      image: "/images/harmonia-vitrine.webp",
      mobileImage: "/videos/harmonia-ouverture-poster.webp"
    },
    /*  `mur` prime sur `hero.image` dans le mur des autres projets. Il est là
     *  pour les cas où le visuel du hero ne tient pas en PLEIN CADRE sur un
     *  écran large — ici, le mockup livré par le client, qui dit mieux le
     *  projet que la capture d'écran du hero. Facultatif : sans lui, le mur
     *  reprend l'image du hero. */
    mur: "/images/harmonia-mockup-large.webp",
    vignette: "/videos/harmonia-univers-poster.webp",
    listed: true
  },
  {
    slug: "projet8",
    title: "Lybra",
    category: "Identité de marque",
    lead: "Un colibri modernisé pour porter l'envol de leurs clients.",
    tags: "Logo, identité visuelle, charte graphique",
    annee: "2025",
    hero: {
      image: "/images/lybra-affichage.webp",
      mobileImage: "/images/lybra-cartes.webp"
    },
    vignette: "/images/lybra-cartes.webp",
    listed: true
  },
  {
    slug: "projet4",
    title: "Ludosphères",
    category: "Site d'artiste",
    lead: "Un site sobre pour laisser respirer les œuvres.",
    tags: "Identité visuelle, site web, direction artistique",
    annee: "2026",
    hero: {
      image: "/images/ludo-site-desktop.webp",
      mobileImage: "/images/ludo-hero-mobile.webp"
    },
    vignette: "/images/ludo-tablette.webp",
    listed: true
  },
  {
    slug: "projet3",
    title: "Moovy",
    category: "Plateforme web",
    lead: "Une recommandation de films simple, directe et personnelle.",
    tags: "UX design, UI design, site web",
    annee: "2025",
    hero: {
      // Le hero de Moovy est une VIDÉO : son poster est le photogramme 0 du
      // montage, donc l'image exacte sur laquelle la page s'ouvre.
      image: "/videos/moovy-hero-poster.webp",
      mobileImage: "/videos/moovy-hero-mobile-poster.webp"
    },
    vignette: "/images/moovy-phone.webp",
    listed: true
  },
  {
    slug: "projet6",
    title: "Mission X",
    category: "Jeu social mobile",
    lead: "Des missions secrètes, un téléphone, deux camps.",
    tags: "Game design, direction artistique, interface mobile",
    annee: "2026",
    hero: {
      image: "/images/jeu_mockup.webp",
      mobileImage: "/images/jeu_mockup.webp"
    },
    vignette: "/images/missionX5.webp",
    listed: true
  },
  {
    slug: "projet1",
    title: "Serein Design",
    category: "Identité produit",
    lead: "Un univers objet premium, calme et fonctionnel.",
    tags: "UI design, UX design, direction visuelle",
    annee: "2025",
    hero: {
      image: "/images/serein_design.webp",
      mobileImage: "/images/serein_design.webp"
    },
    vignette: "/images/telephone2.webp",
    listed: true
  }
];

/** Les projets qui figurent dans les listes publiques (mur, travail, home). */
export const PROJETS_LISTES = PROJETS.filter((p) => p.listed);

/** Le projet dont l'URL est `/<slug>`. */
export function projetParSlug(slug) {
  const clef = String(slug || "").replace(/^\/+|\/+$/g, "");
  return PROJETS.find((p) => p.slug === clef) || null;
}

/**
 * Le projet qui suit celui-ci dans l'ordre de lecture, en bouclant.
 *
 * Un projet non listé n'est la destination de personne : on l'enjambe. Et
 * depuis un projet non listé, le suivant est simplement le premier de la
 * chaîne — sinon son pied de page n'aurait nulle part où aller.
 */
export function projetSuivant(slug) {
  const liste = PROJETS_LISTES;
  if (!liste.length) return null;

  const index = liste.findIndex((p) => p.slug === slug);
  if (index === -1) return liste[0];

  return liste[(index + 1) % liste.length];
}

/** Tous les autres projets listés — l'inventaire du mur de fin de page. */
export function autresProjets(slug) {
  return PROJETS_LISTES.filter((p) => p.slug !== slug);
}

/** Cette route est-elle une page projet ? */
export function estPageProjet(pathname) {
  const clef = String(pathname || "").replace(/^\/+|\/+$/g, "");
  return PROJETS.some((p) => p.slug === clef);
}
