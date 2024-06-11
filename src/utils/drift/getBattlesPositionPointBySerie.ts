import { DriftSerie } from "../../Schema/drift/Leaderboard";



export function getBattlesPositionPointBySerie(
    serie: DriftSerie | null,
    position: number
  ) {
    if (!serie) return 0;
    if (serie === DriftSerie.dmec) {
      return getDmecPointsForPosition(position);
    } else if (serie === DriftSerie.driftsmpro) {
      return getSmDriftPointsForPosition(position);
    } else if (serie === DriftSerie.fd) {
      return getFdPointsForPosition(position);
    } else {
      return 0;
    }
  }



function getDmecPointsForPosition(position: number): number {
    // 1st +100, 2nd +88, 3rd 76, 4th 64, 5th-8th 48, 9th-16th 32, 17th-32nd 16 other 0
    if (!position) return 0;
    if (position === 1) return 100;
    if (position === 2) return 88;
    if (position === 3) return 76;
    if (position === 4) return 64;
    if (position >= 5 && position <= 8) return 48;
    if (position >= 9 && position <= 16) return 32;
    if (position >= 17 && position <= 32) return 16;
    return 0;
  }

function getSmDriftPointsForPosition(position: number): number {
    // 1st +100, 2nd +84, 3rd +68, 4th +52, 5th-8th +36, 9th-16th +20 and other 0
    if (!position) return 0;
    if (position === 1) return 100;
    if (position === 2) return 84;
    if (position === 3) return 68;
    if (position === 4) return 52;
    if (position >= 5 && position <= 8) return 36;
    if (position >= 9 && position <= 16) return 20;
    return 0;
}

function getFdPointsForPosition(position: number): number {
    // not implemented yet
    return getDmecPointsForPosition(position);
}