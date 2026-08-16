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
