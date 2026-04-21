/** Deterministic mock odds per fixture (no real odds API). Values within single 1.8–6, acc leg 1.3–2.5. */
export function getMockOdds1X2(fixtureId: number): [number, number, number] {
  const seed = fixtureId % 100;
  return [
    1.8 + (seed % 30) / 100,
    3.2 + (seed % 20) / 100,
    4.1 + (seed % 15) / 100,
  ];
}

export function getMockOddsOverUnder25(fixtureId: number): [number, number] {
  const seed = fixtureId % 100;
  return [1.9 + (seed % 10) / 100, 1.85 + (seed % 12) / 100];
}

export function getMockOddsBTTS(fixtureId: number): [number, number] {
  const seed = fixtureId % 100;
  return [1.85 + (seed % 8) / 100, 1.9 + (seed % 10) / 100];
}

export function getMockOddsDoubleChance(fixtureId: number): [number, number, number] {
  const seed = fixtureId % 100;
  return [
    1.3 + (seed % 5) / 100,
    1.25 + (seed % 5) / 100,
    1.35 + (seed % 5) / 100,
  ];
}

export function getMockOddsDrawNoBet(fixtureId: number): [number, number] {
  const seed = fixtureId % 100;
  return [1.5 + (seed % 20) / 100, 1.45 + (seed % 25) / 100];
}

export function getMockOddsHandicap(fixtureId: number): [number, number] {
  const seed = fixtureId % 100;
  return [1.75 + (seed % 15) / 100, 1.8 + (seed % 12) / 100];
}

export function getMockOddsTeamTotals(fixtureId: number): [number, number] {
  const seed = fixtureId % 100;
  return [1.6 + (seed % 18) / 100, 1.65 + (seed % 15) / 100];
}
