/**
 * Construit la liste de sources d'une vidéo de `/videos/`, du codec le plus
 * léger au plus universel.
 *
 * Convention de nommage : `<nom>.av1.mp4` et `<nom>.h264.mp4`.
 *
 * Les chaînes `codecs` sont indispensables : sans elles, un navigateur sans AV1
 * répond « maybe » à `video/mp4` tout court, choisit le fichier AV1 et échoue au
 * lieu de passer au suivant. Celle de l'AV1 sert de simple test de capacité
 * (« ce navigateur sait-il décoder de l'AV1 ? ») — le niveau exact du fichier
 * n'a pas à y correspondre. Celle du H.264 décrit en revanche exactement nos
 * fichiers : High profile, level 4.0.
 */
const AV1 = 'video/mp4; codecs="av01.0.05M.08"';
const H264 = 'video/mp4; codecs="avc1.640028"';

/**
 * Une vidéo DÉTOURÉE (canal alpha) ne peut passer par aucun des deux codecs
 * ci-dessus : ni le H.264 ni notre chaîne AV1 ne transportent de transparence.
 * Il en faut donc deux autres, un par famille de navigateurs.
 *
 * ⚠️ LE MOV EST DÉCLARÉ EN `video/quicktime`, ET C'EST VOLONTAIRE.
 * C'est ce qui le rend invisible à Chrome, qui répond « » à ce type. Déclaré en
 * `video/mp4; codecs=hvc1`, un Chrome récent répond « probably » — il sait
 * décoder l'HEVC — prend le fichier, et affiche le sujet sur un aplat noir : la
 * couche alpha d'un HEVC n'est lue que par Safari.
 */
const HEVC_ALPHA = 'video/quicktime; codecs="hvc1"';
const VP9_ALPHA = 'video/webm; codecs="vp9"';

/**
 * `version` — le jeton de cache, à passer dès qu'un média est REMPLACÉ SUR
 * PLACE (nouveau montage, nouvel encodage, sous le même nom de fichier).
 *
 * Les fichiers de `/videos/` gardent volontairement un nom stable : c'est ce
 * qui permet de les réencoder sans toucher au code, et le Caddyfile s'appuie
 * dessus (revalidation par ETag plutôt qu'un long max-age). Ça suffit pour un
 * RECHARGEMENT de page — mais pas pour une navigation interne : le routeur
 * remonte le composant, l'URL demandée est identique au caractère près, et le
 * navigateur ressert sa copie en mémoire sans rien redemander au serveur. On
 * revoyait donc l'ANCIEN montage un instant en revenant sur la home.
 *
 * Le jeton fait partie de l'URL : le changer change la clé de cache, et le
 * remplacement devient immédiat partout — poster compris, alors qu'un poster
 * est justement l'image qu'on voit AVANT que quoi que ce soit ne soit revalidé.
 */
function versionSuffix(version) {
  return version ? `?v=${encodeURIComponent(version)}` : "";
}

export function videoSources(name, { base = "/videos", version = "" } = {}) {
  const v = versionSuffix(version);
  return [
    { src: `${base}/${name}.av1.mp4${v}`, type: AV1 },
    { src: `${base}/${name}.h264.mp4${v}`, type: H264 }
  ];
}

/**
 * Sources d'une vidéo DÉTOURÉE, de la plus répandue à la plus universelle.
 *
 * Convention de nommage : `<nom>.hevc.mov` et `<nom>.vp9.webm`.
 *
 * L'ORDRE COMPTE ICI PLUS QU'AILLEURS. Safari répond « probably » aux DEUX
 * types ; à égalité de verdict, AutoVideo garde l'ordre de la liste. L'HEVC
 * passe donc devant : c'est le seul des deux dont Safari compose réellement la
 * transparence. Les autres navigateurs ne voient que le WebM.
 */
export function alphaVideoSources(name, { base = "/videos", version = "" } = {}) {
  const v = versionSuffix(version);
  return [
    { src: `${base}/${name}.hevc.mov${v}`, type: HEVC_ALPHA },
    { src: `${base}/${name}.vp9.webm${v}`, type: VP9_ALPHA }
  ];
}

/**
 * Poster d'une vidéo de `/videos/`, même convention de nommage que ci-dessus :
 * `<nom>-poster.webp`. Il est produit par les scripts d'encodage à partir du
 * photogramme 0 du fichier livré — poster et début de lecture montrent donc la
 * même image. Passer le MÊME `version` que la vidéo : les deux sont remplacés
 * ensemble, ils doivent être invalidés ensemble.
 */
export function videoPoster(name, { base = "/videos", version = "" } = {}) {
  return `${base}/${name}-poster.webp${versionSuffix(version)}`;
}

export const isAv1Source = (source) => source?.type === AV1;

/**
 * L'appareil sait-il décoder l'AV1 SANS y laisser son processeur ?
 *
 * `canPlayType` ne répond qu'à « sais-tu lire ce codec » : Chrome sur Android
 * répond « probably » pour l'AV1 même quand il n'a qu'un décodeur logiciel. Le
 * fichier se lit alors — en saccadant, et en chauffant. `decodingInfo` est la
 * seule API qui distingue les deux, via `powerEfficient`.
 *
 * La sonde est volontairement générique (un 1080p vertical à 30 i/s) : ce qu'on
 * cherche à savoir, c'est si l'appareil a un décodeur AV1 matériel, pas si tel
 * fichier passe. Une seule promesse pour tout le site, calculée une fois.
 */
let av1Probe = null;
export function av1IsPowerEfficient() {
  if (av1Probe) return av1Probe;

  const caps = typeof navigator !== "undefined" ? navigator.mediaCapabilities : null;
  if (!caps?.decodingInfo) {
    // Pas d'API : on garde le comportement d'avant (l'AV1 reste candidat).
    av1Probe = Promise.resolve(true);
    return av1Probe;
  }

  av1Probe = caps
    .decodingInfo({
      type: "file",
      video: { contentType: AV1, width: 1080, height: 1920, bitrate: 1_500_000, framerate: 30 }
    })
    .then((info) => Boolean(info?.supported && info?.smooth && info?.powerEfficient))
    .catch(() => true);

  return av1Probe;
}
