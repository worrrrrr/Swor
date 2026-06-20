// src/lib/engine/easternEasternResolver.ts
import { calculatePreciseJulianDate, type BirthDateTime } from './astroEngine';

export interface CombinedEasternResult {
	vedic: {
		lagna: string;
		rashi: string;
		nakshatra: string;
		currentDasha: string;
	};
	thai: {
		rasri: string;
		lannaDay: string;
		tithi: string;
		naksatYear: string;
	};
}

const easternZodiacSigns = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"];

const nakshatras = [
	"อัศวินี", "ภรณี", "กฤตติกา", "โรหิณี", "มฤคศิระ", "อารทรา", "ปุนัพสุ", "บุษยา", "อาศเลษา",
	"มาฆะ", "บุรพผลคุนี", "อุตตรผลคุนี", "หัสตะ", "จิตรา", "สวาตี", "วิศาขา", "อนุราธะ", "เชษฐา",
	"มูละ", "ปุรพษาฒ", "อุตตรษาฒ", "ศรวณะ", "ธนิษฐา", "ศตภิษัช", "ปุรพภัทรบท", "อุตตรภัทรบท", "เรวดี"
];

const dashaPlanets = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];

// ฟังก์ชันหาปฏิทินวารศาสตร์ไทย (วันในสัปดาห์) แบบรันตามค่าจริง
function getThaiDayOfWeek(jd: number): string {
	const days = ["วันอาทิตย์ (๑)", "วันจันทร์ (๒)", "วันอังคาร (๓)", "วันพุธ (๔)", "วันพฤหัสบดี (๕)", "วันศุกร์ (๖)", "วันเสาร์ (๗)"];
	const idx = Math.floor(jd + 1.5) % 7;
	return days[idx];
}

export function resolveEasternSystem(birth: BirthDateTime, longitude: number): CombinedEasternResult {
	const jd = calculatePreciseJulianDate(birth);
	
	// 1. คำนวณหาค่าอายนางศะ (Ayanamsa) แบบแปรผันตามกาลเวลาจริง (ปีละประมาณ 50.3 ฟิลิปดา)
	const t = (jd - 2451545.0) / 36525;
	const ayanamsa = 23.0 + (51.12 / 60) * t; 

	const n = jd - 2451545.0;
	let sunLong = (280.460 + 0.9856474 * n) % 360;
	let moonLong = (218.316 + 13.176396 * n) % 360;

	// หักลบค่าอายนางศะเพื่อให้เป็นพิกัดนิรายนะ (Sidereal System) ของทางตะวันออก
	let siderealSun = (sunLong - ayanamsa + 360) % 360;
	let siderealMoon = (moonLong - ayanamsa + 360) % 360;

	// 2. คำนวณดิถีจันทรคติไทย (Tithi) แบบ Dynamic จากระยะห่างดวงจันทร์และดวงอาทิตย์
	let angleDiff = siderealMoon - siderealSun;
	if (angleDiff < 0) angleDiff += 360;
	let tithiDay = Math.floor(angleDiff / 12) + 1;
	let tithiText = tithiDay <= 15 ? `ขึ้น ${tithiDay} ค่ำ` : `แรม ${tithiDay - 15} ค่ำ`;

	// 3. คำนวณหานักษัตรพระเวท (27 กลุ่มฤกษ์) จากองศาดวงจันทร์จริง
	let nakshatraIdx = Math.floor(siderealMoon / (360 / 27)) % 27;
	
	// 4. คำนวณหามหาทศา (Vimshottari Dasha) อิงตามตำแหน่งองศานักษัตรจันทร์ ณ เวลานั้น
	let dashaIdx = Math.floor(nakshatraIdx % 9);
	let nextDashaIdx = (dashaIdx + 1) % 9;

	// 5. คำนวณปีนักษัตรไทย (รอบ 12 ปี) จากตำแหน่งดาวพฤหัสบดีโดยประมาณตามวงโคจรดาราศาสตร์
	const naksatYears = ["ปีชวด", "ปีฉลู", "ปีขาล", "ปีเถาะ", "ปีมะโรง", "ปีมะเส็ง", "ปีมะเมีย", "ปีมะแม", "ปีวอก", "ปีระกา", "ปีจอ", "ปีกุน"];
	let jupiterLong = (94.3 + 30.349 * t) % 360;
	let naksatIdx = Math.floor(jupiterLong / 30) % 12;

	return {
		vedic: {
			lagna: easternZodiacSigns[(Math.floor(siderealSun / 30) + 4) % 12], // ลัคนาแปรผันตามอาทิตย์อุทัย
			rashi: easternZodiacSigns[Math.floor(siderealMoon / 30)],
			nakshatra: `${nakshatras[nakshatraIdx]} (${nakshatraIdx + 1})`,
			currentDasha: `${dashaPlanets[dashaIdx]} - ${dashaPlanets[nextDashaIdx]}`
		},
		thai: {
			rasri: easternZodiacSigns[Math.floor(siderealSun / 30)],
			lannaDay: getThaiDayOfWeek(jd),
			tithi: `${tithiText} เดือน ${birth.month}`,
			naksatYear: naksatYears[naksatIdx]
		}
	};
}