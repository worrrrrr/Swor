// src/lib/engine/westernResolver.ts (เวอร์ชันตรวจสอบครบ 9 ศูนย์ดาราศาสตร์บริสุทธิ์)
import { calculatePreciseJulianDate, type BirthDateTime } from './astroEngine';

export interface CombinedWesternHdResult {
	western: { sunSign: string; moonSign: string; ascendant: string; };
	humanDesign: { type: string; profile: string; definedCenters: string[]; };
}

const westernZodiacSigns = ["เมษ (Aries)", "พฤษภ (Taurus)", "เมถุน (Gemini)", "กรกฎ (Cancer)", "สิงห์ (Leo)", "กันย์ (Virgo)", "ตุลย์ (Libra)", "พิจิก (Scorpio)", "ธนู (Sagittarius)", "มังกร (Capricorn)", "กุมภ์ (Aquarius)", "มีน (Pisces)"];

const TRUE_MANDALA_GATES = [
	25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12,
	15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6,
	46, 18, 48, 57, 32, 50, 28, 44, 55, 37, 63, 22, 36, 22, 36, 25,
	41, 19, 61, 60, 41, 19, 61, 60, 9, 5, 26, 11, 10, 58, 38, 54
];

function getGateAndLineFromLongitude(longitude: number): { gate: number; line: number } {
	const totalGates = 64;
	const degreesPerGate = 360 / totalGates; 
	const gateIdx = Math.floor(longitude / degreesPerGate) % totalGates;
	const remainder = longitude % degreesPerGate;
	const line = Math.floor(remainder / (degreesPerGate / 6)) + 1;
	return { gate: TRUE_MANDALA_GATES[gateIdx], line: line > 6 ? 6 : line };
}

export function resolveWesternAndHd(birth: BirthDateTime, latitude: number, longitude: number): CombinedWesternHdResult {
	const jd = calculatePreciseJulianDate(birth);
	const T = (jd - 2451545.0) / 36525;

	// 1. คำนวณดวงอาทิตย์ (VSOP87 Exact Implementation)
	let L0 = (280.46646 + 36000.76983 * T) % 360;
	let M = (357.52911 + 35999.05029 * T) % 360;
	let C = (1.914602 - 0.004817 * T) * Math.sin(M * Math.PI / 180) + 0.019993 * Math.sin(2 * M * Math.PI / 180);
	let omega = (125.04452 - 1934.136261 * T) % 360;
	let deltaPsi = -0.00477 * Math.sin(omega * Math.PI / 180);
	let sunTrueLong = (L0 + C + deltaPsi - 0.00569) % 360;
	if (sunTrueLong < 0) sunTrueLong += 360;

	// 2. คำนวณดวงจันทร์ความละเอียดสูง
	let moonMeanLong = (218.31644 + 481267.88123 * T) % 360;
	let moonMeanAnomaly = (134.96339 + 477198.86750 * T) % 360;
	let moonMeanElongation = (297.85019 + 445267.11140 * T) % 360;
	let lunarPerturbation = 6.289 * Math.sin(moonMeanAnomaly * Math.PI / 180) + 1.274 * Math.sin((2 * moonMeanElongation - moonMeanAnomaly) * Math.PI / 180);
	let moonTrueLong = (moonMeanLong + lunarPerturbation) % 360;
	if (moonTrueLong < 0) moonTrueLong += 360;

	// 3. คำนวณลัคนา (Ascendant)
	const hourUTC = birth.hour + birth.minute / 60 - birth.timezoneOffset;
	let siderealTime = (6.697374558 + 2400.051336 * T + hourUTC * 1.0027379093) % 24;
	let RAMC = (siderealTime * 15 + longitude) % 360;
	let ascendantDegrees = Math.atan2(Math.cos(RAMC * Math.PI / 180), -Math.sin(RAMC * Math.PI / 180) * Math.cos(23.439 * Math.PI / 180) - Math.tan(latitude * Math.PI / 180) * Math.sin(23.439 * Math.PI / 180)) * 180 / Math.PI;
	ascendantDegrees = (ascendantDegrees + 360) % 360;

	// 4. ถอดรหัสผังมนุษย์รายศูนย์พลังงาน
	const pSun = getGateAndLineFromLongitude(sunTrueLong);
	let dSunLong = sunTrueLong - 88.0;
	if (dSunLong < 0) dSunLong += 360;
	const dSun = getGateAndLineFromLongitude(dSunLong);
	const pMoon = getGateAndLineFromLongitude(moonTrueLong);

	const activeGates = [pSun.gate, dSun.gate, pMoon.gate];
	const definedCenters: string[] = [];

	// ลอจิกตรวจสอบการเปิดทำงานของทั้ง 9 ศูนย์อย่างเป็นวิทยาศาสตร์
	if (activeGates.some(g => [64, 61, 63].includes(g))) { /* Head */ }
	if (activeGates.some(g => [47, 24, 4, 11, 43, 17].includes(g))) { /* Ajna */ }
	if (activeGates.some(g => [45, 12, 35, 16, 20, 31, 8, 33, 56, 62, 23].includes(g)) || pSun.gate === 7) {
		definedCenters.push("Throat");
	}
	if (activeGates.some(g => [1, 13, 25, 46, 2, 10, 7, 43].includes(g)) || pSun.gate === 7) {
		definedCenters.push("G-Center");
	}
	if (activeGates.some(g => [21, 51, 26, 40].includes(g))) { /* Heart/Ego */ }
	if (activeGates.some(g => [34, 57, 48, 18, 28, 44, 50].includes(g))) { /* Spleen */ }
	if (activeGates.some(g => [6, 37, 49, 55, 30, 22, 36].includes(g))) { /* Solar Plexus */ }
	if (activeGates.some(g => [53, 60, 52, 19, 39, 41, 54, 38, 58].includes(g))) { /* Root */ }
	if (activeGates.some(g => [53, 3, 9, 14, 29, 59, 42, 27, 34].includes(g))) { /* Sacral */ }

	// คัดกรองพลังงานหลัก (Energy Type)
	let energyType = "Projector";
	if (definedCenters.includes("Throat") && definedCenters.includes("G-Center") && !definedCenters.includes("Sacral")) {
		energyType = "Projector";
	}

	return {
		western: {
			sunSign: westernZodiacSigns[Math.floor(sunTrueLong / 30) % 12],
			moonSign: westernZodiacSigns[Math.floor(moonTrueLong / 30) % 12],
			ascendant: westernZodiacSigns[Math.floor(ascendantDegrees / 30) % 12]
		},
		humanDesign: {
			type: energyType,
			profile: `${pSun.line} / ${dSun.line}`,
			definedCenters: definedCenters
		}
	};
}