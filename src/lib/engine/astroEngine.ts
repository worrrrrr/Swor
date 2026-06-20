// src/lib/astrology/astroEngine.ts

export interface BirthDateTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezoneOffset: number; // เช่น +7 สำหรับไทย, +9 สำหรับญี่ปุ่น
}

/**
 * คำนวณหาค่า Julian Date (JD) แบบละเอียด (High Precision) ณ เวลาเกิดจริง
 * โดยแปลงเวลาท้องถิ่น (Local Time) ให้เป็นเวลามาตรฐานสากล (Universal Time - UT) ก่อนเสมอ
 */
export function calculatePreciseJulianDate(birth: BirthDateTime): number {
    let { year, month, day, hour, minute, timezoneOffset } = birth;

    // 1. แปลงเวลาท้องถิ่นเป็นเวลา UTC/UT 
    // ตัวอย่าง: 16:49 น. ในไทย (UTC+7) จะเท่ากับ 09:49 น. UTC
    let utcHour = hour - timezoneOffset;
    let utcMinute = minute;

    // จัดการกรณีที่เวลาถอยกลับไปเป็นวันก่อนหน้า (เช่น เกิดตอนตี 2 ในไทย เมื่อแปลงเป็น UTC จะเป็นทุ่มของวันก่อน)
    if (utcHour < 0) {
        utcHour += 24;
        day -= 1;
        if (day === 0) {
            // ถอยเดือน
            month -= 1;
            if (month === 0) {
                month = 12;
                year -= 1;
            }
            // หาวันสุดท้ายของเดือนก่อนหน้า
            day = new Date(year, month, 0).getDate();
        }
    }

    // 2. เข้าสูตรดาราศาสตร์ของ Jean Meeus
    if (month <= 2) {
        year -= 1;
        month += 12;
    }

    const A = Math.floor(year / 100);
    const B = Math.floor(A / 4);
    const C = 2 - A + B;
    const E = Math.floor(365.25 * (year + 4716));
    const F = Math.floor(30.6001 * (month + 1));

    // คำนวณเศษส่วนของวันจากเวลา UTC (ชั่วโมง + นาที)
    const dayFraction = (utcHour + utcMinute / 60) / 24;

    // จำนวนวัน Julian Date เต็มรูปแบบ
    const julianDate = C + day + dayFraction + E + F - 1524.5;
    
    return julianDate;
}

/**
 * คำนวณหาค่าเวลาท้องถิ่นที่แท้จริงทางดาราศาสตร์ (Local Apparent Time / True Solar Time)
 * โดยชดเชยตามค่าลองจิจูด (Longitude) ของสถานที่เกิดจริง เพื่อใช้ในการตัดชั่วยามดวงจีนและการคำนวณลัคนา
 */
export function calculateLocalSolarTime(birth: BirthDateTime, longitude: number): { solarHour: number, solarMinute: number } {
    // คำนวณความแตกต่างระหว่างลองจิจูดเกิด กับลองจิจูดมาตรฐานของเขตเวลานั้น
    // โลกหมุน 15 องศาต่อ 1 ชั่วโมง (หรือ 1 องศาต่อ 4 นาที)
    const standardMeridian = birth.timezoneOffset * 15;
    const longitudeDifference = longitude - standardMeridian;
    const timeCorrectionMinutes = longitudeDifference * 4;

    // แปลงเวลาเกิดเป็นจำนวนนาทีรวมตั้งแต่มืด
    let totalLocalMinutes = birth.hour * 60 + birth.minute;
    let totalSolarMinutes = Math.round(totalLocalMinutes + timeCorrectionMinutes);

    // ปรับพิกัดหากเวลาล้นข้ามวัน
    if (totalSolarMinutes >= 1440) totalSolarMinutes -= 1440;
    if (totalSolarMinutes < 0) totalSolarMinutes += 1440;

    const solarHour = Math.floor(totalSolarMinutes / 60);
    const solarMinute = totalSolarMinutes % 60;

    return { solarHour, solarMinute };
}