/**
 * Erkennt die aktuelle Jahreszeit basierend auf dem Datum
 */

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

/**
 * Gibt die aktuelle Jahreszeit zurück
 * Winter: Dezember, Januar, Februar
 * Frühling: März, April, Mai
 * Sommer: Juni, Juli, August
 * Herbst: September, Oktober, November
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  
  if (month === 11 || month === 0 || month === 1) {
    return 'winter';
  } else if (month >= 2 && month <= 4) {
    return 'spring';
  } else if (month >= 5 && month <= 7) {
    return 'summer';
  } else {
    return 'autumn';
  }
}

/**
 * Gibt den Bildpfad für die aktuelle Jahreszeit zurück
 */
export function getSeasonalWavingImage(): string {
  const season = getCurrentSeason();
  return `/marmot_${season}.png`;
}
