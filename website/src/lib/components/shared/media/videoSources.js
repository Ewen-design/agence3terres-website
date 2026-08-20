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

export function videoSources(name, base = "/videos") {
  return [
    { src: `${base}/${name}.av1.mp4`, type: AV1 },
    { src: `${base}/${name}.h264.mp4`, type: H264 }
  ];
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
