// src/lib/engine/easternInterpreter.ts

type EasternResult = {
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
};

// ความหมายราศีแบบอินเดีย (12 ราศี)
const vedicSignMeanings: Record<string, { name: string; meaning: string; element: string; ruler: string; traits: string; career: string }> = {
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
    meaning: 'ราศีแห่งนวัตกรรม เพื่อนมนุษย์ อิสระทางความคิด',
    element: 'ลม',
    ruler: 'Saturn',
    traits: 'มีความคิดสร้างสรรค์ รักเพื่อนมนุษย์ อิสระ ไม่ชอบกรอบ',
    career: 'นักวิทยาศาสตร์ นักประดิษฐ์ นักสังคมสงเคราะห์'
  },
  'มีน': {
    name: 'มีน (Pisces)',
    meaning: 'ราศีแห่งจิตวิญญาณ โรแมนติก มีจินตนาการ',
    element: 'น้ำ',
    ruler: 'Jupiter',
    traits: 'โรแมนติก มีจินตนาการสูง เข้าอกเข้าใจผู้อื่น มีจิตวิญญาณ',
    career: 'ศิลปิน นักดนตรี กวี จิตแพทย์'
  }
};

// ความหมายนักษัตร (27 Nakshatras)
const nakshatraMeanings: Record<string, { name: string; meaning: string; ruler: string; traits: string }> = {
  'เชษฐา (18)': {
    name: 'เชษฐา (Jyeshtha)',
    meaning: 'นักษัตรแห่งผู้รู้ ปัญญา ความเป็นใหญ่',
    ruler: 'Mercury',
    traits: 'ฉลาด มีอำนาจในตัว ลึกซึ้ง ชอบปกป้องผู้อื่น มีความเป็นผู้รู้'
  },
  'อัศวินี (1)': {
    name: 'อัศวินี (Ashwini)',
    meaning: 'นักษัตรแห่งการเริ่มต้น ความรวดเร็ว',
    ruler: 'Ketu',
    traits: 'รวดเร็ว ปราดเปรียว รักอิสระ เริ่มต้นสิ่งใหม่ๆ เก่ง'
  },
  'ภรณี (2)': {
    name: 'ภรณี (Bharani)',
    meaning: 'นักษัตรแห่งการแบกรับ อดทน',
    ruler: 'Venus',
    traits: 'อดทน เข้มแข็ง รับผิดชอบสูง มีวินัย รักความยุติธรรม'
  },
  'กฤติกา (3)': {
    name: 'กฤติกา (Krittika)',
    meaning: 'นักษัตรแห่งไฟ ความมุ่งมั่น',
    ruler: 'Sun',
    traits: 'มุ่งมั่น กล้าหาญ ตรงไปตรงมา มีไฟในตัว ทะเยอทะยาน'
  },
  'โรหิณี (4)': {
    name: 'โรหิณี (Rohini)',
    meaning: 'นักษัตรแห่งความเจริญงอกงาม',
    ruler: 'Moon',
    traits: 'อ่อนโยน มีเสน่ห์ รักสวยรักงาม มีจินตนาการ โรแมนติก'
  },
  'มิคสิระ (5)': {
    name: 'มิคสิระ (Mrigashira)',
    meaning: 'นักษัตรแห่งการแสวงหา',
    ruler: 'Mars',
    traits: 'ช่างสงสัย อยากรู้อยากเห็น ชอบแสวงหา ปรับตัวเก่ง'
  },
  'อารทรา (6)': {
    name: 'อารทรา (Ardra)',
    meaning: 'นักษัตรแห่งการเปลี่ยนแปลง',
    ruler: 'Rahu',
    traits: 'เปลี่ยนแปลงเร็ว มีพลังทำลายเพื่อสร้างใหม่ ฉลาด ลึกซึ้ง'
  },
  'ปุนัพสุ (7)': {
    name: 'ปุนัพสุ (Punarvasu)',
    meaning: 'นักษัตรแห่งการกลับมาเกิดใหม่',
    ruler: 'Jupiter',
    traits: 'มองโลกในแง่ดี ใจกว้าง ฟื้นตัวเก่ง ชอบการเรียนรู้'
  },
  'ปุษยา (8)': {
    name: 'ปุษยา (Pushya)',
    meaning: 'นักษัตรแห่งการบำรุงเลี้ยงดู',
    ruler: 'Saturn',
    traits: 'มีน้ำใจ ดูแลผู้อื่นเก่ง เป็นผู้ให้ มีจิตวิญญาณแห่งการดูแล'
  },
  'อัสเลศา (9)': {
    name: 'อัสเลศา (Ashlesha)',
    meaning: 'นักษัตรแห่งความลึกลับ',
    ruler: 'Mercury',
    traits: 'ลึกลับ มีเสน่ห์ดึงดูด ฉลาดแกมโกง ช่างสังเกต'
  },
  'มาฆะ (10)': {
    name: 'มาฆะ (Magha)',
    meaning: 'นักษัตรแห่งอำนาจและบรรพบุรุษ',
    ruler: 'Ketu',
    traits: 'มีอำนาจในตัว จงรักภักดีต่อครอบครัว ภูมิใจในรากเหง้า'
  },
  'ปุรพผลคุนี (11)': {
    name: 'ปุรพผลคุนี (Purva Phalguni)',
    meaning: 'นักษัตรแห่งความรักและความสุข',
    ruler: 'Venus',
    traits: 'รักความสุขสบาย มีเสน่ห์ โรแมนติก ศิลปะในตัว'
  },
  'อุตรผลคุนี (12)': {
    name: 'อุตรผลคุนี (Uttara Phalguni)',
    meaning: 'นักษัตรแห่งมิตรภาพและความช่วยเหลือ',
    ruler: 'Sun',
    traits: 'ใจดี ช่วยเหลือผู้อื่น มั่นคง มีความเป็นผู้นำ ซื่อสัตย์'
  },
  'หัสตะ (13)': {
    name: 'หัสตะ (Hasta)',
    meaning: 'นักษัตรแห่งทักษะและฝีมือ',
    ruler: 'Moon',
    traits: 'มีทักษะในการทำงานด้วยมือ ละเอียด ประณีต ทำงานเก่ง'
  },
  'จิตรา (14)': {
    name: 'จิตรา (Chitra)',
    meaning: 'นักษัตรแห่งความงามและการสร้างสรรค์',
    ruler: 'Mars',
    traits: 'สร้างสรรค์ มีศิลปะ รักสวยรักงาม มีทักษะการออกแบบ'
  },
  'สวาดี (15)': {
    name: 'สวาดี (Swati)',
    meaning: 'นักษัตรแห่งอิสระและการเลือก',
    ruler: 'Rahu',
    traits: 'รักอิสระ ฉลาดในการตัดสินใจ ปรับตัวเก่ง ช่างเลือก'
  },
  'วิสาขา (16)': {
    name: 'วิสาขา (Visakha)',
    meaning: 'นักษัตรแห่งความมุ่งมั่นสู่เป้าหมาย',
    ruler: 'Jupiter',
    traits: 'มุ่งมั่น มีเป้าหมายชัดเจน ทะเยอทะยาน ไม่ยอมแพ้'
  },
  'อนุราธา (17)': {
    name: 'อนุราธา (Anuradha)',
    meaning: 'นักษัตรแห่งมิตรภาพที่ยั่งยืน',
    ruler: 'Saturn',
    traits: 'ซื่อสัตย์ในมิตรภาพ อดทน ทำงานเป็นทีมเก่ง เสียสละ'
  },
  'มูละ (19)': {
    name: 'มูละ (Mula)',
    meaning: 'นักษัตรแห่งรากฐานและการค้นหา',
    ruler: 'Ketu',
    traits: 'ชอบค้นหาความจริง ลึกล้ำ ไม่ชอบผิวเผิน มีจิตวิญญาณแห่งการค้นคว้า'
  },
  'ปุรพอาษาฒะ (20)': {
    name: 'ปุรพอาษาฒะ (Purva Ashadha)',
    meaning: 'นักษัตรแห่งชัยชนะครั้งแรก',
    ruler: 'Venus',
    traits: 'มองโลกในแง่ดี มีเสน่ห์ มีพลังในการเอาชนะ มุ่งมั่น'
  },
  'อุตรอาษาฒะ (21)': {
    name: 'อุตรอาษาฒะ (Uttara Ashadha)',
    meaning: 'นักษัตรแห่งชัยชนะที่ยั่งยืน',
    ruler: 'Sun',
    traits: 'ชนะอย่างยั่งยืน มีความเป็นผู้นำสูง ยุติธรรม ซื่อสัตย์'
  },
  'ศรวณะ (22)': {
    name: 'ศรวณะ (Shravana)',
    meaning: 'นักษัตรแห่งการฟังและการเรียนรู้',
    ruler: 'Moon',
    traits: 'ฟังเก่ง เรียนรู้เร็ว รับข้อมูลดี มีปัญญาจากการฟัง'
  },
  'ธนิษฐา (23)': {
    name: 'ธนิษฐา (Dhanishta)',
    meaning: 'นักษัตรแห่งความมั่งคั่งและดนตรี',
    ruler: 'Mars',
    traits: 'มีความสามารถด้านดนตรี มั่งคั่ง มีเสน่ห์ เข้าสังคมเก่ง'
  },
  'ศตภิษัช (24)': {
    name: 'ศตภิษัช (Shatabhisha)',
    meaning: 'นักษัตรแห่งการเยียวยาร้อยโรค',
    ruler: 'Rahu',
    traits: 'มีความสามารถในการรักษา เยียวยา ชอบช่วยเหลือผู้อื่น'
  },
  'ปุรพภัทรบท (25)': {
    name: 'ปุรพภัทรบท (Purva Bhadrapada)',
    meaning: 'นักษัตรแห่งการเปลี่ยนแปลงเพื่อสิ่งที่ดีกว่า',
    ruler: 'Jupiter',
    traits: 'มุ่งมั่นในการพัฒนา เปลี่ยนแปลงตัวเอง ชอบการเรียนรู้'
  },
  'อุตรภัทรบท (26)': {
    name: 'อุตรภัทรบท (Uttara Bhadrapada)',
    meaning: 'นักษัตรแห่งความสงบและภูมิปัญญา',
    ruler: 'Saturn',
    traits: 'สงบ มีปัญญาลึกซึ้ง อดทน มีจิตวิญญาณสูง'
  },
  'เรวดี (27)': {
    name: 'เรวดี (Revati)',
    meaning: 'นักษัตรแห่งความสมบูรณ์และการสิ้นสุด',
    ruler: 'Mercury',
    traits: 'สมบูรณ์แบบ รอบคอบ ละเอียด มีเมตตา ชอบช่วยเหลือ'
  }
};

// ความหมายวันตามปฏิทินล้านนา
const lannaDayMeanings: Record<string, { name: string; meaning: string; color: string; element: string }> = {
  'วันเสาร์ (๗)': {
    name: 'วันเสาร์',
    meaning: 'วันแห่งความมั่นคง อดทน มีวินัย เป็นนักต่อสู้',
    color: 'ม่วง ดำ',
    element: 'ดิน'
  },
  'วันอาทิตย์ (๑)': {
    name: 'วันอาทิตย์',
    meaning: 'วันแห่งความเป็นผู้นำ มีอำนาจ สง่างาม',
    color: 'แดง',
    element: 'ไฟ'
  },
  'วันจันทร์ (๒)': {
    name: 'วันจันทร์',
    meaning: 'วันแห่งความอ่อนโยน โรแมนติก มีเสน่ห์',
    color: 'เหลือง ขาว',
    element: 'น้ำ'
  },
  'วันอังคาร (๓)': {
    name: 'วันอังคาร',
    meaning: 'วันแห่งความกล้าหาญ กระตือรือร้น ใจร้อน',
    color: 'ชมพู',
    element: 'ไฟ'
  },
  'วันพุธ (๔)': {
    name: 'วันพุธ',
    meaning: 'วันแห่งการสื่อสาร ฉลาด เจรจาเก่ง',
    color: 'เขียว',
    element: 'ลม'
  },
  'วันพฤหัส (๕)': {
    name: 'วันพฤหัส',
    meaning: 'วันแห่งปัญญา การศึกษา ความเมตตา',
    color: 'ส้ม',
    element: 'ดิน'
  },
  'วันศุกร์ (๖)': {
    name: 'วันศุกร์',
    meaning: 'วันแห่งความรัก ศิลปะ ความสุข',
    color: 'ฟ้า',
    element: 'น้ำ'
  }
};

// ความหมายดิถี

const tithiMeanings: Record<string, string> = {
  'ขึ้น 1 ค่ำ': 'เริ่มต้นสิ่งใหม่ๆ เหมาะแก่การตั้งเป้าหมาย',
  'ขึ้น 2 ค่ำ': 'สะสมพลัง สร้างฐาน',
  'ขึ้น 3 ค่ำ': 'ลงมือทำจริง แสดงความสามารถ',
  'ขึ้น 4 ค่ำ': 'สร้างความมั่นคง ลงรากฐาน',
  'ขึ้น 5 ค่ำ': 'ขยายตัว เติบโต ก้าวหน้า',
  'ขึ้น 6 ค่ำ': 'พัฒนาทักษะ เรียนรู้สิ่งใหม่',
  'ขึ้น 7 ค่ำ': 'ก้าวกระโดด มีความก้าวหน้าแบบก้าวกระโดด',
  'ขึ้น 8 ค่ำ': 'ประสบความสำเร็จขั้นต้น',
  'ขึ้น 9 ค่ำ': 'มีพลังเข้มแข็ง เตรียมพร้อมสูงสุด',
  'ขึ้น 10 ค่ำ': 'เต็มเปี่ยมไปด้วยพลังบวก เหมาะแก่การตัดสินใจสำคัญ',
  'ขึ้น 11 ค่ำ': 'สมบูรณ์เกือบสูงสุด เก็บเกี่ยวผล',
  'ขึ้น 12 ค่ำ': 'สำเร็จสมบูรณ์ ถึงจุดสูงสุด',
  'ขึ้น 13 ค่ำ': 'อิ่มตัว เริ่มชะลอ ทบทวน',
  'ขึ้น 14 ค่ำ': 'เตรียมเปลี่ยนผ่าน สรุปบทเรียน',
  'ขึ้น 15 ค่ำ': 'เต็มดวง สว่างสูงสุด พลังงานสูง',
  'แรม 1 ค่ำ': 'เริ่มถดถอย ปล่อยวาง',
  'แรม 2 ค่ำ': 'ลดละ เลิกสิ่งไม่จำเป็น',
  'แรม 3 ค่ำ': 'ชำระล้าง ทำความสะอาด',
  'แรม 4 ค่ำ': 'พักผ่อน ฟื้นฟู',
  'แรม 5 ค่ำ': 'ทบทวนตัวเอง วิเคราะห์',
  'แรม 6 ค่ำ': 'เรียนรู้จากอดีต แก้ไข',
  'แรม 7 ค่ำ': 'เปลี่ยนมุมมอง คิดใหม่',
  'แรม 8 ค่ำ': 'ปลดปล่อย ปล่อยอดีต',
  'แรม 9 ค่ำ': 'มืดที่สุด เตรียมเริ่มใหม่',
  'แรม 10 ค่ำ': 'สงบนิ่ง ฟังเสียงภายใน',
  'แรม 11 ค่ำ': 'สร้างพลังใหม่ ตั้งหลัก',
  'แรม 12 ค่ำ': 'วางแผน เตรียมพร้อม',
  'แรม 13 ค่ำ': 'เก็บตัว สะสมพลัง',
  'แรม 14 ค่ำ': 'พักสูงสุดก่อนเริ่มใหม่',
  'แรม 15 ค่ำ': 'สิ้นสุดวัฏจักร พร้อมเริ่มใหม่'
};

export function interpretEastern(easternResult: EasternResult) {
  const lagnaInfo = vedicSignMeanings[easternResult.vedic.lagna] || {
    name: easternResult.vedic.lagna,
    meaning: 'มีความเป็นเอกลักษณ์ตามราศีนี้',
    element: '',
    ruler: '',
    traits: '',
    career: ''
  };

  const nakshatraInfo = nakshatraMeanings[easternResult.vedic.nakshatra] || {
    name: easternResult.vedic.nakshatra,
    meaning: 'มีคุณสมบัติพิเศษตามนักษัตรนี้',
    ruler: '',
    traits: ''
  };

  const lannaDayInfo = lannaDayMeanings[easternResult.thai.lannaDay] || {
    name: easternResult.thai.lannaDay,
    meaning: 'มีพลังวันเกิดที่ส่งผลต่อบุคลิก',
    color: '',
    element: ''
  };

  const tithiMeaning = tithiMeanings[easternResult.thai.tithi] || 'มีจังหวะชีวิตที่เหมาะสมกับวันเกิด';

  return {
    vedic: {
      lagna: {
        ...lagnaInfo,
        description: `ลัคนาของคุณคือราศี${lagnaInfo.name} ${lagnaInfo.traits}`
      },
      rashi: {
        name: easternResult.vedic.rashi,
        meaning: vedicSignMeanings[easternResult.vedic.rashi]?.meaning || 'มีพลังตามราศี',
        description: `ราศีเกิดของคุณคือ${easternResult.vedic.rashi} ส่งผลต่อตัวตนพื้นฐาน`
      },
      nakshatra: {
        ...nakshatraInfo,
        description: `นักษัตร${nakshatraInfo.name} ${nakshatraInfo.traits}`
      },
      currentDasha: {
        name: easternResult.vedic.currentDasha,
        description: `ช่วงดวงนี้เป็นช่วงของ${easternResult.vedic.currentDasha} ส่งผลต่อการตัดสินใจและโอกาสในชีวิต`
      }
    },
    thai: {
      rasri: {
        name: easternResult.thai.rasri,
        description: `ราศรี${easternResult.thai.rasri} ให้${vedicSignMeanings[easternResult.thai.rasri]?.traits || 'ลักษณะเด่นตามราศี'}`
      },
      lannaDay: {
        ...lannaDayInfo,
        description: `เกิด${lannaDayInfo.name} ${lannaDayInfo.meaning} สีประจำวัน: ${lannaDayInfo.color}`
      },
      tithi: {
        name: easternResult.thai.tithi,
        meaning: tithiMeaning,
        description: `เกิดวัน${easternResult.thai.tithi} ${tithiMeaning}`
      },
      naksatYear: {
        name: easternResult.thai.naksatYear,
        description: `ปีนักษัตร${easternResult.thai.naksatYear} ส่งผลต่อชะตาชีวิตโดยรวม`
      }
    }
  };
}