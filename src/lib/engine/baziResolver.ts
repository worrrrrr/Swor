// src/lib/engine/baziResolver.ts
import { calculatePreciseJulianDate, calculateLocalSolarTime, type BirthDateTime } from './astroEngine';

export interface BaziPillarResult {
    code: string;
    element: string;
    animal: string;
}

export interface FullBaziChart {
    julianDay: string;
    solarTimeActual: string;
    year: BaziPillarResult;
    month: BaziPillarResult;
    day: BaziPillarResult;
    hour: BaziPillarResult;
    dayMaster: string;
}

const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const stemThaiDetails: Record<string, string> = {
    "甲": "ไม้หยาง", "乙": "ไม้หยิน", "丙": "ไฟหยาง", "丁": "ไฟหยิน", "戊": "ดินหยาง",
    "己": "ดินหยิน", "庚": "ทองหยาง", "辛": "ทองหยิน", "壬": "น้ำหยาง", "癸": "น้ำหยิน"
};

const branchThaiDetails: Record<string, string> = {
    "子": "ชวด (หนู)", "丑": "ฉลู (วัว)", "寅": "ขาล (เสือ)", "卯": "เถาะ (กระต่าย)",
    "辰": "มะโรง (มังกร)", "巳": "มะเส็ง (งูเล็ก)", "午": "มะเมีย (ม้า)", "未": "มะแม (แพะ)",
    "申": "วอก (ลิง)", "酉": "ระกา (ไก่)", "戌": "จอ (หมา)", "亥": "กุน (หมู)"
};

// ลูป 60 จีะจือ (Jia Zi) 
const jiaZiCycle: string[] = [];
for (let i = 0; i < 60; i++) {
    jiaZiCycle.push(heavenlyStems[i % 10] + earthlyBranches[i % 12]);
}

const wuHuDunRules: Record<string, number> = {
    "甲": 2, "己": 2, "乙": 4, "庚": 4, "丙": 6, "辛": 6, "丁": 8, "壬": 8, "戊": 0, "癸": 0
};

const wuShuDunRules: Record<string, number> = {
    "甲": 0, "己": 0, "乙": 2, "庚": 2, "丙": 4, "辛": 4, "丁": 6, "壬": 6, "戊": 8, "癸": 8
};

function createPillarObject(pillarCode: string): BaziPillarResult {
    return {
        code: pillarCode,
        element: stemThaiDetails[pillarCode[0]],
        animal: branchThaiDetails[pillarCode[1]]
    };
}

/**
 * ฟังก์ชันประมวลผลคำนวณดวงจีน 4 เสาหลักแบบ Dynamic (แก้ไขเวอร์ชันปัดเศษเวลาเที่ยงคืน)
 */
export function resolveBaziChart(birth: BirthDateTime, longitude: number): FullBaziChart {
    const jdPrecise = calculatePreciseJulianDate(birth);
    const { solarHour, solarMinute } = calculateLocalSolarTime(birth, longitude);

    // [FIXED LOGIC] ดึงค่าจำนวนวันจำนวนเต็ม (Integer Day) ณ เวลาเที่ยงคืนสากลอย่างแม่นยำ
    // ป้องกันอาการเหลื่อมวันของพิกัดเวลาบ่าย
    const jdDayInteger = Math.floor(jdPrecise + 0.5);

    // 1. คำนวณเสาปี (Year Pillar)
    let yearOffset = (birth.year - 4) % 60;
    if (yearOffset < 0) yearOffset += 60;
    if (birth.month < 2 || (birth.month === 2 && birth.day < 4)) {
        yearOffset = (yearOffset - 1 + 60) % 60;
    }
    const yearPillarCode = jiaZiCycle[yearOffset];

    // 2. คำนวณเสาเดือน (Month Pillar)
    let monthBranchIdx = (birth.month - 2) % 12;
    if (birth.day < 7) { 
        monthBranchIdx = (monthBranchIdx - 1 + 12) % 12;
    }
    const yearStemChar = yearPillarCode[0];
    const baseMonthStemIdx = wuHuDunRules[yearStemChar];
    const monthStemChar = heavenlyStems[(baseMonthStemIdx + monthBranchIdx) % 10];
    const monthBranchChar = earthlyBranches[(monthBranchIdx + 2) % 12];
    const monthPillarCode = monthStemChar + monthBranchChar;

    // 3. คำนวณเสาวัน (Day Pillar) -> [FIXED CALCULATION]
    // ปรับเปลี่ยนสมการหาเศษให้ตรงตามฐานอ้างอิงของระบบปฏิทินกาลเวลาจีนดั้งเดิม
    const dayOffset = (jdDayInteger + 49) % 60; // 25 มาจากการเทียบกับ 2000-01-01
    let dayStemIdx = dayOffset % 10;
    let dayBranchIdx = dayOffset % 12;

    // ระบบทางดวงจีน: ถ้ารอบเวลาสุริยะเกิน 23:00 น. ขึ้นไป จะถือว่าเป็น "ชั่วยามหนูยามดึก" 
    // พลังงานจะเปลี่ยนเข้าสู่เสาวันของ "วันถัดไป" ทันที
    if (solarHour >= 23) {
        dayStemIdx = (dayStemIdx + 1) % 10;
        dayBranchIdx = (dayBranchIdx + 1) % 12;
    }

    const dayPillarCode = heavenlyStems[dayStemIdx] + earthlyBranches[dayBranchIdx];

    // 4. คำนวณเสาเวลา (Hour Pillar)
    const hourBranchIdx = Math.floor((solarHour + 1) / 2) % 12;
    const dayStemChar = dayPillarCode[0];
    const baseHourStemIdx = wuShuDunRules[dayStemChar];
    const hourStemChar = heavenlyStems[(baseHourStemIdx + hourBranchIdx) % 10];
    const hourBranchChar = earthlyBranches[hourBranchIdx];
    const hourPillarCode = hourStemChar + hourBranchChar;

    return {
        julianDay: jdPrecise.toFixed(4),
        solarTimeActual: `${solarHour.toString().padStart(2, '0')}:${solarMinute.toString().padStart(2, '0')}`,
        year: createPillarObject(yearPillarCode),
        month: createPillarObject(monthPillarCode),
        day: createPillarObject(dayPillarCode),
        hour: createPillarObject(hourPillarCode),
        dayMaster: `${dayPillarCode[0]} (${stemThaiDetails[dayPillarCode[0]]})`
    };
}