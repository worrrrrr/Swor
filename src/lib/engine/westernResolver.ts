import type { BirthDateTime } from './astroEngine';
import { calculatePreciseJulianDate } from './astroEngine';

// ============================================================
// WESTERN TYPES
// ============================================================

export interface WesternPlanetResult {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
  signIndex: number;
  signName: string;
  degree: number;
  minute: number;
  second: number;
  isRetrograde: boolean;
  hdGate: number;
  hdLine: number;
}

export interface WesternHouseResult {
  id: number;
  longitude: number;
  signName: string;
  degree: number;
  minute: number;
}

export interface FullWesternChart {
  julianDayNumber: number;
  ascendant: { longitude: number; signName: string; degree: number; minute: number };
  mc: { longitude: number; signName: string; degree: number; minute: number };
  planets: WesternPlanetResult[];
  houses: WesternHouseResult[];
  humanDesign: HumanDesignChart;
}

// ============================================================
// HUMAN DESIGN TYPES
// ============================================================

export type HdCenter =
  | 'Head' | 'Ajna' | 'Throat' | 'G'
  | 'Heart' | 'Sacral' | 'SolarPlexus' | 'Spleen' | 'Root';

export type HdType =
  | 'Projector' | 'Generator' | 'ManifestingGenerator' | 'Manifestor' | 'Reflector';

export type HdAuthority =
  | 'Emotional' | 'Sacral' | 'Splenic' | 'Ego' | 'Self Projected' | 'Mental' | 'None';

export type HdDefinition = 'Single' | 'Split' | 'Triple Split' | 'Quadruple Split';

export interface HdActivation {
  name: string;
  gate: number;
  line: number;
}

export interface HumanDesignChart {
  personality: HdActivation[];
  design: HdActivation[];
  activeGates: number[];
  activeChannels: Array<{ gates: [number, number]; centers: [HdCenter, HdCenter] }>;
  definedCenters: HdCenter[];
  type: HdType;
  authority: HdAuthority;
  definition: HdDefinition;
  profile: string;
  incarnationCrossGates: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const westernZodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const HD_WHEEL = [
  25, 17, 21, 51, 42,  3, 27, 24,  2, 23,  8, 20, 16, 35, 45, 12,
  15, 52, 39, 53, 62, 56, 31, 33,  7,  4, 29, 59, 40, 64, 47,  6,
  46, 18, 48, 57, 32, 50, 28, 44,  1, 43, 14, 34,  9,  5, 26, 11,
  10, 58, 38, 54, 61, 60, 41, 19, 13, 49, 30, 55, 37, 63, 22, 36,
];

const HD_WHEEL_OFFSET = 1.72; // degrees — calibrated against Jovian Archive

const HD_CHANNELS: { gates: [number, number]; centers: [HdCenter, HdCenter] }[] = [
  { gates: [64, 47], centers: ['Head', 'Ajna'] },
  { gates: [61, 24], centers: ['Head', 'Ajna'] },
  { gates: [63,  4], centers: ['Head', 'Ajna'] },
  { gates: [17, 62], centers: ['Ajna', 'Throat'] },
  { gates: [43, 23], centers: ['Ajna', 'Throat'] },
  { gates: [11, 56], centers: ['Ajna', 'Throat'] },
  { gates: [31,  7], centers: ['Throat', 'G'] },
  { gates: [33, 13], centers: ['Throat', 'G'] },
  { gates: [20, 10], centers: ['Throat', 'G'] },
  { gates: [ 8,  1], centers: ['Throat', 'G'] },
  { gates: [45, 21], centers: ['Throat', 'Heart'] },
  { gates: [35, 36], centers: ['Throat', 'SolarPlexus'] },
  { gates: [12, 22], centers: ['Throat', 'SolarPlexus'] },
  { gates: [20, 34], centers: ['Throat', 'Sacral'] },
  { gates: [20, 57], centers: ['Throat', 'Spleen'] },
  { gates: [16, 48], centers: ['Throat', 'Spleen'] },
  { gates: [51, 25], centers: ['G', 'Heart'] },
  { gates: [14,  2], centers: ['G', 'Sacral'] },
  { gates: [29, 46], centers: ['G', 'Sacral'] },
  { gates: [34, 10], centers: ['Sacral', 'G'] },
  { gates: [ 5, 15], centers: ['Sacral', 'G'] },
  { gates: [57, 10], centers: ['Spleen', 'G'] },
  { gates: [40, 37], centers: ['Heart', 'SolarPlexus'] },
  { gates: [26, 44], centers: ['Heart', 'Spleen'] },
  { gates: [59,  6], centers: ['Sacral', 'SolarPlexus'] },
  { gates: [27, 50], centers: ['Sacral', 'Spleen'] },
  { gates: [57, 34], centers: ['Spleen', 'Sacral'] },
  { gates: [ 9, 52], centers: ['Sacral', 'Root'] },
  { gates: [ 3, 60], centers: ['Sacral', 'Root'] },
  { gates: [42, 53], centers: ['Sacral', 'Root'] },
  { gates: [19, 49], centers: ['Root', 'SolarPlexus'] },
  { gates: [39, 55], centers: ['Root', 'SolarPlexus'] },
  { gates: [41, 30], centers: ['Root', 'SolarPlexus'] },
  { gates: [32, 54], centers: ['Spleen', 'Root'] },
  { gates: [28, 38], centers: ['Spleen', 'Root'] },
  { gates: [18, 58], centers: ['Spleen', 'Root'] },
];

// ============================================================
// ORBITAL ELEMENTS
// ============================================================

interface OrbitElements {
  a: number; e: number; i: number; w: number; M0: number; N: number;
  da: number; de: number; di: number; dw: number; dM: number; dN: number;
  tracking?: number;
}

const planetElements: Record<string, OrbitElements> = {
  Sun:     { a: 1.00000261, e: 0.01671123, i: 0.0,      w: 102.93768193, M0: 357.52910918, N: 0,        da: 0.0,         de: -0.00003804, di: 0.0,      dw: 0.32327364,  dM: 35999.05034, dN: 0,        tracking: 0.0 },
  Moon:    { a: 0.00257,    e: 0.05490000, i: 5.145,    w: 83.35324312,  M0: 134.9634114,  N: 125.04452, da: 0.0,         de: 0.0,         di: 0.0,      dw: 4069.0137,   dM: 477198.868,  dN: -1934.136, tracking: 0.0 },
  Mercury: { a: 0.38709893, e: 0.20563069, i: 7.00487,  w: 77.45645,     M0: 174.79459,    N: 48.33167,  da: 0.0,         de: 0.00002040,  di: -0.00594, dw: 0.16213,     dM: 149472.6741, dN: -0.12542 },
  Venus:   { a: 0.72333199, e: 0.00677323, i: 3.39471,  w: 131.53298,    M0: 50.11587,     N: 76.68069,  da: 0.0,         de: -0.00004776, di: -0.00079, dw: 0.00213,     dM: 58517.81538, dN: -0.27769 },
  Mars:    { a: 1.52366231, e: 0.09341233, i: 1.85061,  w: 336.04084,    M0: 19.38700,     N: 49.57854,  da: -0.00000497, de: 0.00011902,  di: -0.00724, dw: 0.44388,     dM: 19140.30268, dN: -0.29498 },
  Jupiter: { a: 5.20336301, e: 0.04839266, i: 1.30530,  w: 14.75385,     M0: 19.89503,     N: 100.55615, da: 0.00060737,  de: -0.00012880, di: -0.00415, dw: 0.19116,     dM: 3034.74612,  dN: 0.20404 },
  Saturn:  { a: 9.53707032, e: 0.05415060, i: 2.48446,  w: 92.43194,     M0: 316.96706,    N: 113.71504, da: -0.00301530, de: -0.00036762, di: 0.00193,  dw: -0.41897,    dM: 1222.11379,  dN: -0.28867 },
  Uranus:  { a: 19.1912639, e: 0.04716771, i: 0.76998,  w: 170.96424,    M0: 142.95572,    N: 74.22988,  da: 0.00152025,  de: -0.00019150, di: -0.00269, dw: 0.40931,     dM: 428.48202,   dN: -0.20917 },
  Neptune: { a: 30.0689634, e: 0.00858587, i: 1.76917,  w: 44.97135,     M0: 260.24713,    N: 131.72169, da: -0.00125196, de: 0.00002514,  di: 0.00022,  dw: -0.32241,    dM: 218.45945,   dN: -0.00949 },
  Pluto:   { a: 39.4816867, e: 0.24880766, i: 17.14175, w: 224.06676,    M0: 238.92881,    N: 110.30347, da: -0.00076912, de: 0.00006465,  di: 0.01105,  dw: -0.04067,    dM: 145.20780,   dN: -0.01183 },
};

// ============================================================
// LOW-LEVEL HELPERS
// ============================================================

function splitLongitudeToZodiac(long: number) {
  const normLong = (long % 360 + 360) % 360;
  const signIndex = Math.floor(normLong / 30);
  const signName = westernZodiacSigns[signIndex];
  const rem = normLong % 30;
  const degree = Math.floor(rem);
  const minRem = (rem - degree) * 60;
  const minute = Math.floor(minRem);
  const second = Math.round((minRem - minute) * 60);
  return { signIndex, signName, degree, minute, second };
}

function convertLongitudeToHdGateAndLine(longitude: number) {
  const normLong = ((longitude + HD_WHEEL_OFFSET) % 360 + 360) % 360;
  const totalArcPerGate = 360 / 64;
  const rawIndex = Math.floor(normLong / totalArcPerGate);
  const gate = HD_WHEEL[rawIndex % 64];
  const remainderInGate = normLong % totalArcPerGate;
  const line = Math.floor(remainderInGate / (totalArcPerGate / 6)) + 1;
  return { gate, line };
}

function computePlanetLongitude(name: string, T: number): number {
  const el = planetElements[name];
  const a = el.a + el.da * T;
  const e = el.e + el.de * T;
  const i = ((el.i + el.di * T) * Math.PI) / 180;
  const N = ((el.N + el.dN * T) * Math.PI) / 180;
  const w = ((el.w + el.dw * T) * Math.PI) / 180;
  const M = ((el.M0 + el.dM * T) * Math.PI) / 180;

  let E = M;
  for (let loop = 0; loop < 5; loop++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  const x_orb = a * (Math.cos(E) - e);
  const y_orb = a * Math.sqrt(1.0 - e * e) * Math.sin(E);
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosN = Math.cos(N), sinN = Math.sin(N);
  const cosi = Math.cos(i);

  const xecl = x_orb * (cosw * cosN - sinw * sinN * cosi) - y_orb * (sinw * cosN + cosw * sinN * cosi);
  const yecl = x_orb * (cosw * sinN + sinw * cosN * cosi) - y_orb * (sinw * sinN - cosw * cosN * cosi);

  let lonDeg = (Math.atan2(yecl, xecl) * 180) / Math.PI;
  if (lonDeg < 0) lonDeg += 360;
  return lonDeg;
}

// ============================================================
// HUMAN DESIGN HELPERS
// ============================================================

function hdType(
  definedCenters: Set<HdCenter>,
  activeChannels: typeof HD_CHANNELS
): HdType {
  if (definedCenters.size === 0) return 'Reflector';
  const motors: HdCenter[] = ['SolarPlexus', 'Heart', 'Sacral', 'Root'];
  const motorToThroat = activeChannels.some(({ centers: [c1, c2] }) =>
    (motors.includes(c1) && c2 === 'Throat') || (motors.includes(c2) && c1 === 'Throat')
  );
  const hasSacral = definedCenters.has('Sacral');
  if (hasSacral && motorToThroat) return 'ManifestingGenerator';
  if (hasSacral) return 'Generator';
  if (!hasSacral && motorToThroat) return 'Manifestor';
  return 'Projector';
}

function hdAuthority(definedCenters: Set<HdCenter>, type: HdType): HdAuthority {
  if (type === 'Reflector') return 'None';
  const priority: [HdCenter, HdAuthority][] = [
    ['SolarPlexus', 'Emotional'], ['Sacral', 'Sacral'], ['Spleen', 'Splenic'],
    ['Heart', 'Ego'], ['G', 'Self Projected'],
  ];
  for (const [c, a] of priority) if (definedCenters.has(c)) return a;
  return 'Mental';
}

function hdDefinition(
  definedCenters: Set<HdCenter>,
  activeChannels: typeof HD_CHANNELS
): HdDefinition {
  if (definedCenters.size === 0) return 'Single';
  const adj = new Map<HdCenter, Set<HdCenter>>();
  for (const c of definedCenters) adj.set(c, new Set());
  for (const { centers: [c1, c2] } of activeChannels) {
    if (definedCenters.has(c1) && definedCenters.has(c2)) {
      adj.get(c1)!.add(c2);
      adj.get(c2)!.add(c1);
    }
  }
  const visited = new Set<HdCenter>();
  let components = 0;
  for (const start of definedCenters) {
    if (visited.has(start)) continue;
    components++;
    const queue: HdCenter[] = [start];
    while (queue.length) {
      const node = queue.pop()!;
      if (visited.has(node)) continue;
      visited.add(node);
      for (const n of adj.get(node) ?? []) if (!visited.has(n)) queue.push(n);
    }
  }
  if (components === 1) return 'Single';
  if (components === 2) return 'Split';
  if (components === 3) return 'Triple Split';
  return 'Quadruple Split';
}

const PLANET_NAMES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

function getPlanetActivations(jd: number): HdActivation[] {
  const T = (jd - 2451545.0) / 36525.0;
  const activations: HdActivation[] = [];

  for (const name of PLANET_NAMES) {
    const lon = computePlanetLongitude(name, T);
    const { gate, line } = convertLongitudeToHdGateAndLine(lon);
    activations.push({ name, gate, line });
  }

  // Earth = opposite Sun
  const sunLon = computePlanetLongitude('Sun', T);
  const earthLon = (sunLon + 180) % 360;
  const earth = convertLongitudeToHdGateAndLine(earthLon);
  activations.push({ name: 'Earth', gate: earth.gate, line: earth.line });

  return activations;
}

function getDesignJd(birthJd: number): number {
  // Find JD where Sun was 88° behind birth Sun
  const T0 = (birthJd - 2451545.0) / 36525.0;
  const birthSunLon = computePlanetLongitude('Sun', T0);
  const targetLon = ((birthSunLon - 88) % 360 + 360) % 360;
  let jd = birthJd - 88;
  for (let i = 0; i < 20; i++) {
    const T = (jd - 2451545.0) / 36525.0;
    let diff = computePlanetLongitude('Sun', T) - targetLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    jd -= (diff / 360) * 365.25;
  }
  return jd;
}

function calculateHumanDesign(birthJd: number): HumanDesignChart {
  const designJd = getDesignJd(birthJd);
  const personality = getPlanetActivations(birthJd);
  const design = getPlanetActivations(designJd);

  const activeGatesSet = new Set<number>();
  for (const p of [...personality, ...design]) activeGatesSet.add(p.gate);

  const activeChannels = HD_CHANNELS.filter(
    ({ gates: [g1, g2] }) => activeGatesSet.has(g1) && activeGatesSet.has(g2)
  );

  const definedCentersSet = new Set<HdCenter>();
  for (const { centers: [c1, c2] } of activeChannels) {
    definedCentersSet.add(c1);
    definedCentersSet.add(c2);
  }

  const type = hdType(definedCentersSet, activeChannels);
  const authority = hdAuthority(definedCentersSet, type);
  const definition = hdDefinition(definedCentersSet, activeChannels);

  const pSun = personality.find(p => p.name === 'Sun')!;
  const dSun = design.find(p => p.name === 'Sun')!;
  const pEarth = personality.find(p => p.name === 'Earth')!;
  const dEarth = design.find(p => p.name === 'Earth')!;

  return {
    personality,
    design,
    activeGates: [...activeGatesSet].sort((a, b) => a - b),
    activeChannels,
    definedCenters: [...definedCentersSet],
    type,
    authority,
    definition,
    profile: `${pSun.line}/${dSun.line}`,
    incarnationCrossGates: `${pSun.gate}/${pEarth.gate} | ${dSun.gate}/${dEarth.gate}`,
  };
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function resolveWesternChart(birth: BirthDateTime, latitude: number, longitude: number): FullWesternChart {
  const jd = calculatePreciseJulianDate(birth);
  const T = (jd - 2451545.0) / 36525.0;

  const planetsResult: WesternPlanetResult[] = PLANET_NAMES.map((name, index) => {
    const el = planetElements[name];
    const a = el.a + el.da * T;
    const e = el.e + el.de * T;
    const i = ((el.i + el.di * T) * Math.PI) / 180;
    const N = ((el.N + el.dN * T) * Math.PI) / 180;
    const w = ((el.w + el.dw * T) * Math.PI) / 180;
    const M = ((el.M0 + el.dM * T) * Math.PI) / 180;

    let E = M;
    for (let loop = 0; loop < 5; loop++) {
      E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1.0 - e * e) * Math.sin(E);
    const cosw = Math.cos(w), sinw = Math.sin(w);
    const cosN = Math.cos(N), sinN = Math.sin(N);
    const cosi = Math.cos(i), sini = Math.sin(i);

    const xecl = x_orb * (cosw * cosN - sinw * sinN * cosi) - y_orb * (sinw * cosN + cosw * sinN * cosi);
    const yecl = x_orb * (cosw * sinN + sinw * cosN * cosi) - y_orb * (sinw * sinN - cosw * cosN * cosi);
    const zecl = x_orb * (sinw * sini) + y_orb * (cosw * sini);

    let lonDeg = (Math.atan2(yecl, xecl) * 180) / Math.PI;
    if (lonDeg < 0) lonDeg += 360;
    const latDeg = (Math.atan2(zecl, Math.sqrt(xecl * xecl + yecl * yecl)) * 180) / Math.PI;
    const dist = Math.sqrt(xecl * xecl + yecl * yecl + zecl * zecl);

    const zodiac = splitLongitudeToZodiac(lonDeg);
    const hd = convertLongitudeToHdGateAndLine(lonDeg);
    const baseSpeed = el.dM / 365.25;
    const lonSpeed = baseSpeed * (1 + 2 * e * Math.cos(M));

    return {
      id: index + 1,
      name,
      longitude: lonDeg,
      latitude: latDeg,
      distance: dist,
      longitudeSpeed: lonSpeed,
      latitudeSpeed: 0.0012 * Math.sin(M),
      distanceSpeed: 0.0005 * Math.cos(M),
      ...zodiac,
      isRetrograde: lonSpeed < 0,
      hdGate: hd.gate,
      hdLine: hd.line,
    };
  });

  const gst = (18.697374558 + 24.06570982441908 * (jd - 2451545.0)) % 24;
  const lst = (gst + longitude / 15) * 15;
  const ascLong = (lst + 90) % 360;
  const mcLong = lst % 360;

  const housesResult: WesternHouseResult[] = Array.from({ length: 12 }).map((_, index) => {
    const hLong = (ascLong + index * 30) % 360;
    const zData = splitLongitudeToZodiac(hLong);
    return { id: index + 1, longitude: hLong, signName: zData.signName, degree: zData.degree, minute: zData.minute };
  });

  return {
    julianDayNumber: jd,
    ascendant: { longitude: ascLong, signName: westernZodiacSigns[Math.floor(ascLong / 30)], degree: Math.floor(ascLong % 30), minute: 0 },
    mc: { longitude: mcLong, signName: westernZodiacSigns[Math.floor(mcLong / 30)], degree: Math.floor(mcLong % 30), minute: 0 },
    planets: planetsResult,
    houses: housesResult,
    humanDesign: calculateHumanDesign(jd),
  };
}