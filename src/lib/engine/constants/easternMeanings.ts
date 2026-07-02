// Eastern/Vedic Zodiac Meanings - Shared Constants

export interface VedicSignMeaning {
  name: string;
  meaning: string;
  element: string;
  ruler: string;
  traits: string;
  career: string;
}

export const VEDIC_SIGN_MEANINGS: Record<string, VedicSignMeaning> = {
  'เมษ': {
    name: 'เมษ (Aries)',
    meaning: 'ราศีแห่งการเริ่มต้น กล้าหาญ ตรงไปตรงมา เป็นผู้นำ',
    element: 'ไฟ',
    ruler: 'Mars',
    traits: 'มีความเป็นผู้นำสูง กล้าหาญ ใจร้อน มุ่งมั่น ไม่ยอมแพ้ ชอบความท้าทาย',
    career: 'ทหาร นักกีฬา ผู้บริหาร นักผจญภัย'
  },
  'พฤษภ': {
    name: 'พฤษภ (Taurus)',
    meaning: 'ราศีแห่งความมั่นคง รักสวยรักงาม อดทน',
    element: 'ดิน',
    ruler: 'Venus',
    traits: 'อดทน มั่นคง รักความสะดวกสบาย มีรสนิยมดี ซื่อสัตย์',
    career: 'การเงิน ศิลปะ การออกแบบ เกษตรกรรม'
  },
  'เมถุน': {
    name: 'เมถุน (Gemini)',
    meaning: 'ราศีแห่งการสื่อสาร ปรับตัวเก่ง สองบุคลิก',
    element: 'ลม',
    ruler: 'Mercury',
    traits: 'ฉลาด ปรับตัวเก่ง ชอบเรียนรู้ ช่างพูด ช่างเจรจา มีไหวพริบ',
    career: 'สื่อสารมวลชน นักเขียน การตลาด การสอน'
  },
  'กรกฎ': {
    name: 'กรกฎ (Cancer)',
    meaning: 'ราศีแห่งความอ่อนโยน รักครอบครัว อารมณ์อ่อนไหว',
    element: 'น้ำ',
    ruler: 'Moon',
    traits: 'อ่อนโยน ดูแลครอบครัวดี มีความจำดี อารมณ์อ่อนไหว รักบ้าน',
    career: 'พยาบาล ครู เชฟ นักสังคมสงเคราะห์'
  },
  'สิงห์': {
    name: 'สิงห์ (Leo)',
    meaning: 'ราศีแห่งราชา มั่นใจในตัวเอง ใจกว้าง',
    element: 'ไฟ',
    ruler: 'Sun',
    traits: 'มีความเป็นผู้นำ มั่นใจในตัวเอง ใจกว้าง รักศักดิ์ศรี ชอบการยอมรับ',
    career: 'นักแสดง ผู้บริหาร ศิลปิน นักการเมือง'
  },
  'กันย์': {
    name: 'กันย์ (Virgo)',
    meaning: 'ราศีแห่งการวิเคราะห์ ละเอียดรอบคอบ บริการ',
    element: 'ดิน',
    ruler: 'Mercury',
    traits: 'ละเอียดรอบคอบ วิเคราะห์เก่ง จัดการดี รักความสะอาด ขยัน',
    career: 'บัญชี การแพทย์ นักวิเคราะห์ บรรณารักษ์'
  },
  'ตุลย์': {
    name: 'ตุลย์ (Libra)',
    meaning: 'ราศีแห่งความสมดุล ยุติธรรม รักสวยรักงาม',
    element: 'ลม',
    ruler: 'Venus',
    traits: 'รักความยุติธรรม มีเสน่ห์ รสนิยมดี เข้าสังคมเก่ง รักความสวยงาม',
    career: 'นักกฎหมาย ทูต ดีไซเนอร์ ศิลปิน'
  },
  'พิจิก': {
    name: 'พิจิก (Scorpio)',
    meaning: 'ราศีแห่งความลึกลับ ทรงพลัง อารมณ์เข้มข้น',
    element: 'น้ำ',
    ruler: 'Mars',
    traits: 'ลึกลับ ทรงพลัง มีเสน่ห์ดึงดูด อารมณ์เข้มข้น ฟื้นตัวเก่ง',
    career: 'จิตวิทยา การวิจัย นักสืบ ศัลยแพทย์'
  },
  'ธนู': {
    name: 'ธนู (Sagittarius)',
    meaning: 'ราศีแห่งการผจญภัย มองโลกในแง่ดี รักอิสระ',
    element: 'ไฟ',
    ruler: 'Jupiter',
    traits: 'รักอิสระ มองโลกในแง่ดี ชอบผจญภัย ใจกว้าง ชอบการเรียนรู้',
    career: 'นักเดินทาง ครู อาจารย์ นักปรัชญา นักเขียน'
  },
  'มังกร': {
    name: 'มังกร (Capricorn)',
    meaning: 'ราศีแห่งความทะเยอทะยาน รับผิดชอบสูง อดทน',
    element: 'ดิน',
    ruler: 'Saturn',
    traits: 'ทะเยอทะยาน รับผิดชอบสูง อดทน มีวินัย จริงจังกับชีวิต',
    career: 'นักธุรกิจ ผู้บริหาร วิศวกร สถาปนิก'
  },
  'กุมภ์': {
    name: 'กุมภ์ (Aquarius)',
    meaning: 'ราศีแห่งนวัตกรรม เป็นตัวของตัวเอง รักมนุษยชาติ',
    element: 'ลม',
    ruler: 'Saturn',
    traits: 'เป็นตัวของตัวเอง รักอิสระ มีความคิดสร้างสรรค์ รักเพื่อนมนุษย์',
    career: 'เทคโนโลยี นักประดิษฐ์ นักกิจกรรม สังคมศาสตร์'
  },
  'มีน': {
    name: 'มีน (Pisces)',
    meaning: 'ราศีแห่งความฝัน เห็นอกเห็นใจ มีจินตนาการ',
    element: 'น้ำ',
    ruler: 'Jupiter',
    traits: 'เห็นอกเห็นใจ มีจินตนาการ สูงส่ง ศิลปะ เข้าใจความรู้สึกผู้อื่น',
    career: 'ศิลปิน นักดนตรี นักบำบัด พยาบาล'
  }
};

export const NAKSHATRA_MEANINGS: Record<string, { name: string; meaning: string; ruler: string; traits: string }> = {
  'Ashwini': { name: 'Ashwini', meaning: 'ดาวม้าเร็ว เริ่มต้น รักษา หายา', ruler: 'Ketu', traits: 'รวดเร็ว รักษา เป็นผู้นำ' },
  'Bharani': { name: 'Bharani', meaning: 'ดาวแห่งการแบก อดทน สร้างสรรค์', ruler: 'Venus', traits: 'อดทน สร้างสรรค์ แบกรับภาระ' },
  'Krittika': { name: 'Krittika', meaning: 'ดาวมีดคม ตัดสินใจ เฉียบขาด', ruler: 'Sun', traits: 'เฉียบขาด ผู้นำ ตัดสินใจ' },
  'Rohini': { name: 'Rohini', meaning: 'ดาวสีแดง เจริญรุ่งเรือง สวยงาม', ruler: 'Moon', traits: 'สวยงาม เจริญรุ่งเรือง มั่นคง' },
  'Mrigashira': { name: 'Mrigashira', meaning: 'ดาวกวาง ค้นหา สำรวจ', ruler: 'Mars', traits: 'ค้นหา อยากรู้ สำรวจ' },
  'Ardra': { name: 'Ardra', meaning: 'ดาวฝนตก เปลี่ยนแปลง ทำลาย', ruler: 'Rahu', traits: 'เปลี่ยนแปลง ทำลายเพื่อสร้างใหม่' },
  'Punarvasu': { name: 'Punarvasu', meaning: 'ดาวเกิดใหม่ ฟื้นฟู กลับมา', ruler: 'Jupiter', traits: 'ฟื้นฟู เกิดใหม่ optimistic' },
  'Pushya': { name: 'Pushya', meaning: 'ดาวโภชนา เลี้ยงดู บำรุง', ruler: 'Saturn', traits: 'เลี้ยงดู บำรุง ให้' },
  'Ashlesha': { name: 'Ashlesha', meaning: 'ดาวงู缠绕 กอดรัด ลึกลับ', ruler: 'Mercury', traits: 'ลึกลับ ฉลาด กอดรัด' },
  'Magha': { name: 'Magha', meaning: 'ดาวราชวงศ์ อำนาจ บารมี', ruler: 'Ketu', traits: 'อำนาจ บารมี ความเป็นผู้นำ' },
  'PurvaPhalguni': { name: 'Purva Phalguni', meaning: 'ดาวแห่งความรัก ความสุข สันติ', ruler: 'Venus', traits: 'รัก สุข สันติ' },
  'UttaraPhalguni': { name: 'Uttara Phalguni', meaning: 'ดาวแห่งการให้ ช่วยเหลือ', ruler: 'Sun', traits: 'ให้ ช่วยเหลือ เสียสละ' },
  'Hasta': { name: 'Hasta', meaning: 'ดาวมือ ทักษะ งานฝีมือ', ruler: 'Moon', traits: 'ทักษะ งานฝีมือ ประณีต' },
  'Chitra': { name: 'Chitra', meaning: 'ดาวเพชร พลอย สวยงาม', ruler: 'Mars', traits: 'สวยงาม สร้างสรรค์ โดดเด่น' },
  'Swati': { name: 'Swati', meaning: 'ดาวลมพัด อิสระ ค้าขาย', ruler: 'Rahu', traits: 'อิสระ ค้าขาย Adaptability' },
  'Vishakha': { name: 'Vishakha', meaning: 'ดาวกิ่งไม้ แยกสาขา เป้าหมาย', ruler: 'Jupiter', traits: 'เป้าหมาย มุ่งมั่น แยกสาขา' },
  'Anuradha': { name: 'Anuradha', meaning: 'ดาวความสำเร็จ มิตรภาพ', ruler: 'Saturn', traits: 'ความสำเร็จ มิตรภาพ ร่วมมือ' },
  'Jyeshtha': { name: 'Jyeshtha', meaning: 'ดาวผู้ใหญ่ อำนาจ ป้องกัน', ruler: 'Mercury', traits: 'อำนาจ ป้องกัน ความเป็นผู้ใหญ่' },
  'Mula': { name: 'Mula', meaning: 'ดาวรากฐาน ค้นหาความจริง', ruler: 'Ketu', traits: 'ค้นหาความจริง รากฐาน ลึกซึ้ง' },
  'PurvaShadha': { name: 'Purva Shadha', meaning: 'ดาวชัยชนะ ไม่ย่อท้อ', ruler: 'Venus', traits: 'ชัยชนะ ไม่ย่อท้อ Invincible' },
  'UttaraShadha': { name: 'Uttara Shadha', meaning: 'ดาวชัยชนะสุดท้าย ความเป็นผู้นำ', ruler: 'Sun', traits: 'ความเป็นผู้นำ ชัยชนะสุดท้าย' },
  'Shravana': { name: 'Shravana', meaning: 'ดาวการฟัง เรียนรู้', ruler: 'Moon', traits: 'ฟัง เรียนรู้ รับข้อมูล' },
  'Dhanishta': { name: 'Dhanishta', meaning: 'ดาวความมั่งคั่ง ชื่อเสียง', ruler: 'Mars', traits: 'ความมั่งคั่ง ชื่อเสียง ทีมงาน' },
  'Shatabhisha': { name: 'Shatabhisha', meaning: 'ดาวร้อยหมอ รักษา ปกปิด', ruler: 'Rahu', traits: 'รักษา ปกปิด ลึกลับ' },
  'PurvaBhadra': { name: 'Purva Bhadra', meaning: 'ดาวความดีงาม before', ruler: 'Jupiter', traits: 'ความดีงาม before การเปลี่ยนแปลง' },
  'UttaraBhadra': { name: 'Uttara Bhadra', meaning: 'ดาวความดีงามหลัง ความมั่นคง', ruler: 'Saturn', traits: 'ความมั่นคง ความดีงามหลัง' },
  'Revati': { name: 'Revati', meaning: 'ดาวความอุดมสมบูรณ์ สุดท้าย', ruler: 'Mercury', traits: 'อุดมสมบูรณ์ สุดท้าย บริบูรณ์' }
};

export const LANNADAY_MEANINGS: Record<string, { name: string; meaning: string; color: string; element: string }> = {
  'อาทิตย์': { name: 'วันอาทิตย์', meaning: 'พลัง ความเป็นผู้นำ ความร้อนแรง', color: 'แดง', element: 'ไฟ' },
  'จันทร์': { name: 'วันจันทร์', meaning: 'ความอ่อนโยน อารมณ์ ความเย็น', color: 'เหลือง', element: 'น้ำ' },
  'อังคาร': { name: 'วันอังคาร', meaning: 'ความกล้าหาญ พลังงาน การต่อสู้', color: 'ชมพู', element: 'ไฟ' },
  'พุธ': { name: 'วันพุธ', meaning: 'การสื่อสาร สติปัญญา การค้า', color: 'เขียว', element: 'ดิน' },
  'พฤหัสบดี': { name: 'วันพฤหัสบดี', meaning: 'ความรู้ ปัญญา ศีลธรรม', color: 'ส้ม', element: 'ลม' },
  'ศุกร์': { name: 'วันศุกร์', meaning: 'ความรัก ความสวยงาม ความสุข', color: 'ฟ้า', element: 'ลม' },
  'เสาร์': { name: 'วันเสาร์', meaning: 'ความอดทน ความรับผิดชอบ ความยากลำบาก', color: 'ม่วง', element: 'ดิน' }
};

export const TITHI_MEANINGS: Record<string, string> = {
  '1': 'เริ่มสิ่งใหม่ เหมาะกับการเริ่มต้น',
  '2': 'สร้างความมั่นคง',
  '3': 'ทำลายอุปสรรค',
  '4': 'ระวังปัญหาสุขภาพ',
  '5': 'โชคดีด้านการเงิน',
  '6': 'เหมาะสมกับการแต่งงาน',
  '7': 'ระวังการทะเลาะวิวาท',
  '8': 'ทำบุญสะเดาะเคราะห์',
  '9': 'โชคดีด้านการศึกษา',
  '10': 'ประสบความสำเร็จในการงาน',
  '11': 'เหมาะสำหรับการลงทุน',
  '12': 'ระวังอุบัติเหตุ',
  '13': 'ทำลายศัตรู',
  '14': 'ทำสมาธิภาวนา',
  '15': 'เต็มดวง บุญบารมีสูงสุด'
};
