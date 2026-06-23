/**
 * @file hdInterpreter.ts
 * @description ระบบแปลผลสัตถาปัตยกรรมผังพลังงานมนุษย์ภาคภาษาไทย (Rule-based Human Design Interpretation Engine)
 * ถอดรหัสข้อกำหนดเชิงลึกทางเทคนิคให้ออกมาเป็นคู่มือแนวทางการดำเนินชีวิตที่อ่านเข้าใจง่าย 100% พร้อมใช้งานบน Production
 */

export interface TranslatedHdProfile {
    typeName: string;
    typeAura: string;
    typeStrategy: string;
    typeNotSelf: string;
    profileName: string;
    profileDescription: string;
    authorityName: string;
    authorityDescription: string;
    centersExplanations: { name: string; status: string; meaning: string }[];
}

// 1. คลังข้อมูล Rule-based สำหรับถอดรหัสกลุ่มพลังงานออร่า (Energy Type Translations)
const typeDictionary: Record<string, { name: string; aura: string; strategy: string; notSelf: string }> = {
    "Projector": {
        name: "ผู้ชี้แนะ (Projector)",
        aura: "แบบโฟกัส พุ่งตรง และเปิดรับพลังงานของผู้อื่นอย่างลึกซึ้ง (Focused & Absorbing Aura)",
        strategy: "รอคอยการยอมรับและการได้รับคำเชิญอย่างเป็นทางการ (Wait for Recognition and Invitation)",
        notSelf: "ความรู้สึกขมขื่นใจ (Bitterness) เมื่อพยายามริเริ่มลงมือทำหรือเสนอความเห็นโดยไม่มีใครเชิญชวน"
    },
    "Generator": {
        name: "ผู้สร้างพลังงานหลัก (Generator)",
        aura: "แบบเปิดกว้าง โอบอุ้ม และดึงดูดสิ่งต่าง ๆ เข้าหาตัว (Open & Enveloping Aura)",
        strategy: "รอคอยเหตุการณ์ภายนอกมากระตุ้นเพื่อตอบสนองด้วยสัญชาตญาณ (Wait to Respond)",
        notSelf: "ความรู้สึกหงุดหงิดใจและติดขัด (Frustration) เมื่อฝืนใช้ความคิดในหัวไปริเริ่มทำสิ่งต่าง ๆ เอง"
    },
    "Manifesting Generator": {
        name: "ผู้สร้างพลังงานแบบฉับไว (Manifesting Generator)",
        aura: "แบบเปิดกว้าง ว่องไว และมีแรงขับเคลื่อนหลากหลายทิศทาง (Open & Multi-faceted Aura)",
        strategy: "รอคอยเพื่อตอบสนองต่อสิ่งเร้า จากนั้นจงจินตนาการทดสอบ แล้วแจ้งให้ผู้เกี่ยวข้องทราบก่อนลงมือทำ",
        notSelf: "ความรู้สึกโกรธและหงุดหงิดระคนกัน (Anger & Frustration) เมื่อระบบหรือผู้รอบข้างทำงานตามความเร็วของตนไม่ทัน"
    },
    "Manifestor": {
        name: "ผู้ริเริ่มและปฏิวัติ (Manifestor)",
        aura: "แบบปิดกั้น ปกป้องตัวตน และมีอิทธิพลส่งแรงกระทบสูงต่อรอบข้าง (Closed & Impactful Aura)",
        strategy: "แจ้งให้ผู้ที่มีส่วนเกี่ยวข้องทราบล่วงหน้าก่อนจะเริ่มลงมือทำสิ่งใดก็ตาม (Inform Before Action)",
        notSelf: "ความรู้สึกโกรธเกรี้ยวและถูกควบคุม (Anger) เมื่อโดนแทรกแซงหรือมีคนมาขัดขวางการริเริ่ม"
    },
    "Reflector": {
        name: "ผู้สะท้อนเงาสังคม (Reflector)",
        aura: "แบบต้านทาน คัดกรอง และสุ่มตรวจจับพลังงานรอบตัวอย่างระแวดระวัง (Resistant & Sampling Aura)",
        strategy: "รอคอยให้ดวงจันทร์โคจรครบรอบวัฏจักรนักษัตร 28 วันเต็มก่อนการตัดสินใจครั้งใหญ่ (Wait 28 Days Cycle)",
        notSelf: "ความรู้สึกผิดหวังในตัวมนุษย์หรือสิ่งแวดล้อม (Disappointment) เมื่อพบเจอสังคมที่เต็มไปด้วยสารพิษปนเปื้อน"
    }
};

// 2. คลังข้อมูล Rule-based สำหรับถอดรหัสโปรไฟล์ตัวตนคู่สายสัมพันธ์ (Profile Line Translations)
const profileDictionary: Record<string, { name: string; description: string }> = {
    "4/6": {
        name: "4/6: ผู้แสวงหาโอกาสและต้นแบบชีวิต (The Opportunist / Role Model)",
        description: "ขับเคลื่อนโอกาสและความสำเร็จผ่าน 'เครือข่ายมิตรภาพคนสนิท' เป็นหลัก เส้นทางชีวิตแบ่งเป็น 3 ช่วงอย่างเด่นชัด: ช่วงอายุ 0-30 ปีจะออกไปผจญภัยและลองผิดลองถูกอย่างหนักหน่วง ช่วงอายุ 30-50 ปีจะถอนตัวขึ้นสู่หลังคาเพื่อเฝ้าสังเกตการณ์และทบทวนบทเรียนชีวิต และหลังอายุ 50 ปีขึ้นไปจะก้าวลงมาเป็น 'ต้นแบบที่น่าเลื่อมใส' คอยชี้แนะแนวทางที่ถูกต้องให้แก่โลก"
    },
    "1/3": {
        name: "1/3: ผู้ตรวจสอบและผู้เผชิญความจริง (The Investigator / Martyr)",
        description: "ต้องการความมั่นคงทางข้อมูลอย่างสูง ต้องศึกษาหาความรู้ลึกซึ้งจนเจอรากฐานที่แท้จริงก่อนจึงจะมั่นใจ ควบคู่กับการเรียนรู้ชีวิตผ่านประสบการณ์ตรงด้วยการทดลอง เจ็บจริง พังจริง เพื่อคัดกรองว่าสิ่งใดใช้งานได้จริงและสิ่งใดเป็นเรื่องหลอกลวง"
    },
    "2/4": {
        name: "2/4: ผู้สันโดษและผู้แสวงหาโอกาส (The Hermit / Opportunist)",
        description: "ชอบใช้เวลาอยู่คนเดียวในพื้นที่ปลอดภัยเพื่อฝึกฝนพรสวรรค์ตามธรรมชาติแบบเงียบ ๆ โดยมักไม่รู้ตัวว่าตนเองเก่งอะไร จนกระทั่งได้รับการร้องขอหรือมีเครือข่ายคนสนิท (Line 4) คอยมองเห็นและหยิบยื่นโอกาสส่งเสียงเรียกให้ออกไปทำงานชิ้นสำคัญ"
    },
    "3/5": {
        name: "3/5: ผู้เผชิญความจริงและผู้แก้ปัญหาชะตากรรม (The Martyr / Heretic)",
        description: "เป็นนักลองผิดลองถูกระดับสากล ชีวิตเต็มไปด้วยการปรับตัวและลุกขึ้นใหม่จากความล้มเหลว ผสานกับพลังออร่าที่ดึงดูดความคาดหวังจากผู้อื่นให้มองเข้ามาว่าคุณคือฮีโร่ผู้มาโปรดหรือผู้แก้ไขวิกฤตการณ์"
    },
    "5/1": {
        name: "5/1: ผู้แก้ปัญหาและนักสืบค้นรากฐาน (The Heretic / Investigator)",
        description: "ได้รับความไว้วางใจจากคนแปลกหน้าหรือสังคมภายนอกให้เป็นผู้กอบกู้วิกฤตการณ์เสมอ มีความคิดแนวทางเชิงกลยุทธ์ที่เฉียบคม แต่จำเป็นต้องสะสมฐานข้อมูล ข้อเท็จจริงที่แน่นหนา (Line 1) เพื่อป้องกันไม่ให้โครงสร้างการทำนายหรือการแก้ปัญหาพังทลายลง"
    },
    "6/2": {
        name: "6/2: ต้นแบบชีวิตผู้รักความสันโดษ (The Role Model / Hermit)",
        description: "มองภาพรวมของโลกจากมุมสูง มีวิสัยทัศน์ที่กว้างไกลและรักความซื่อสัตย์เป็นที่สุด ในขณะเดียวกันก็มีมุมที่อยากปลีกวิเวกอยู่คนเดียวเพื่อทบทวนระบบและพัฒนาทักษะเฉพาะตัวโดยไม่ให้ใครมาวุ่นวาย"
    }
};

// 3. คลังข้อมูล Rule-based สำหรับถอดรหัสระบบอำนาจตัดสินใจสูงสุด (Inner Authority Translations)
const authorityDictionary: Record<string, { name: string; description: string }> = {
    "Self Projected": {
        name: "การนำทางด้วยเสียงสะท้อนแห่งตัวตน (Self Projected Authority)",
        description: "คุณมีศูนย์ทิศทางและตัวตน (G-Center) เชื่อมต่อตรงสู่ศูนย์การแสดงออก (Throat Center) ห้ามใช้ตรรกะในสมองตัดสินใจเด็ดขาด วิธีการหาคำตอบที่ดีที่สุดคือการ 'พูดคุยออกเสียงเสียงดัง ๆ' กับเพื่อนสนิทหรือคนรับฟังที่ไว้ใจได้ โดยไม่ต้องให้คู่สนทนาออกความคิดเห็น แต่ให้คุณ 'ฟังกระแสเสียงและน้ำเสียงของตัวเอง' ในขณะที่กำลังพูด เรื่องที่ใช่จะทำให้น้ำเสียงของคุณมีความสุข ทรงพลัง และเปี่ยมด้วยความกระตือรือร้นจากแก่นแท้"
    },
    "Sacral": {
        name: "สัญชาตญาณความรู้สึกในพุง (Sacral Authority)",
        description: "ตัดสินใจได้ดีที่สุดในวินาทีปัจจุบันเมื่อมีสิ่งภายนอกมากระตุ้น โดยใช้ปฏิกิริยาตอบสนองทางร่างกาย (Gut Response) หรือเสียงในลำคอ เช่น 'อื้อ' (ใช่) หรือ 'หึอึ' (ไม่ใช่) หากรู้สึกมีพลังฮึดในพุงแปลว่าให้ลุยทันที"
    },
    "Emotional": {
        name: "ความคล่องตัวตามคลื่นอารมณ์ (Emotional Authority)",
        description: "คุณมีคลื่นอารมณ์ที่ขึ้นลงเป็นวัฏจักร ห้ามตัดสินใจในขณะที่กำลังดีใจสุดขีด เศร้าสุดขีด หรือโกรธสุดขีดเด็ดขาด ทางออกคือต้องให้เวลาตัวเองรอจนกระทั่งอารมณ์นิ่งสนิทและเกิดความชัดเจนภายใน (Emotional Clarity) จึงค่อยตอบตกลง"
    },
    "Splenic": {
        name: "สัญชาตญาณความปลอดภัยและสุขภาพ (Splenic Authority)",
        description: "ฟังเสียงเตือนแผ่วเบาที่เกิดขึ้นเพียงครั้งเดียวในเสี้ยววินาทีจากสัญชาตญาณการเอาตัวรอดของร่างกาย หากรู้สึกแปลก ๆ หรือไม่ปลอดภัยแม้เพียงนิดเดียว ให้ปฏิเสธทันทีโดยไม่ต้องหาเหตุผลประกอบ"
    },
    "Ego Projected": {
        name: "พลังเจตจำนงแห่งความต้องการส่วนตน (Ego Projected Authority)",
        description: "ตัดสินใจโดยตั้งคำถามกับตัวเองตรง ๆ ว่า 'ฉันต้องการสิ่งนี้จริง ๆ หรือไม่?' หรือ 'สิ่งนี้คุ้มค่ากับพลังงานที่ฉันจะเสียไปไหม?' จงซื่อสัตย์กับความปรารถนาและผลประโยชน์ของตัวเองโดยไม่ต้องรู้สึกผิด"
    },
    "Mental / Outer": {
        name: "กระบวนการประมวลผลผ่านสภาพแวดล้อม (Mental / Environmental Authority)",
        description: "ไม่มีศูนย์พลังงานภายในร่างกายไว้ใช้ตัดสินใจ ทางออกคือต้องนำตัวเองไปอยู่ในสภาพแวดล้อมที่สะอาด สบายใจ แล้วทำการพูดคุยปรึกษากับผู้คนหลากหลายเพื่อทดสอบดูว่าความคิดของเราสะท้อนกลับมาอย่างไร"
    },
    "Lunar Cycle": {
        name: "วัฏจักรเงาสะท้อนแห่งดวงจันทร์ (Lunar Cycle Authority)",
        description: "เป็นคุณลักษณะพิเศษของ Reflector ต้องให้เวลาตัวเองพิจารณาเรื่องสำคัญยาวนานอย่างน้อย 28 วัน เพื่อให้ดวงจันทร์โคจรผ่านครบทั้ง 64 ประตู แล้วคอยบันทึกความรู้สึกในแต่ละวันจนกระทั่งตกตะกอนความคิด"
    }
};

// 4. คลังข้อมูล Rule-based สำหรับถอดรหัสศูนย์รวมพลังงานทั้ง 9 (9 Centers Core Mapping)
const centerDictionary: Record<string, { name: string; definedMeaning: string; undefinedMeaning: string }> = {
    "Head Center": {
        name: "ศูนย์หัวและปัญญาญาณ (Head Center)",
        definedMeaning: "มีแรงบันดาลใจและวิธีการคิดคำถามในแบบของตัวเองอย่างคงที่ มักส่งแรงบันดาลใจให้ผู้อื่นได้ดี",
        undefinedMeaning: "เปิดรับแรงบันดาลใจจากภายนอกได้หลากหลาย แต่ระวังการเสียเวลาไปกับความคิดหรือคำถามที่ไม่ใช่เรื่องของตัวเอง"
    },
    "Ajna Center": {
        name: "ศูนย์ความคิดและการประมวลผล (Ajna Center)",
        definedMeaning: "มีระบบการคิด วิเคราะห์ และจัดเก็บข้อมูลที่แน่นอนคงที่ มีจุดยืนทางความคิดที่ยากจะสั่นคลอน",
        undefinedMeaning: "มีความยืดหยุ่นทางความคิดสูง สามารถมองปัญหาได้หลากหลายมิติ ไม่ยึดติดกับกรอบความเชื่อเดิมๆ"
    },
    "Throat Center": {
        name: "ศูนย์ลำคอและการแสดงออก (Throat Center)",
        definedMeaning: "รูปแบบการสื่อสาร เสียง และการลงมือทำมีเอกลักษณ์เฉพาะตัวที่ทรงพลัง สามารถดึงดูดความสนใจได้ง่าย",
        undefinedMeaning: "การสื่อสารแปรผันตามคนรอบข้าง ระวังการพยายามพูดเพื่อเรียกร้องความสนใจหรือกดดันตัวเองให้ลงมือทำ"
    },
    "G-Center": {
        name: "ศูนย์ทิศทาง ตัวตน และความรัก (G-Center)",
        definedMeaning: "รู้จักตัวตนและจุดยืนของตัวเองอย่างชัดเจน มีเข็มทิศชีวิตและความรักภายในที่มั่นคง ไม่เปลี่ยนตามใคร",
        undefinedMeaning: "ตัวตนและทิศทางแปรผันตามสภาพแวดล้อมและผู้คนที่อยู่ใกล้ สามารถกลมกลืนกับสถานที่ใหม่ๆ ได้อย่างน่าอัศจรรย์"
    },
    "Heart/Ego Center": {
        name: "ศูนย์เจตจำนงและคุณค่า (Heart/Ego Center)",
        definedMeaning: "มีพลังใจ พลังขับเคลื่อน และความสามารถในการรักษาสัญญาที่มั่นคง เหมาะแก่การแข่งขันและพิสูจน์ตัวเอง",
        undefinedMeaning: "ไม่มีแรงขับในการแข่งขันตามธรรมชาติ ไม่จำเป็นต้องพิสูจน์คุณค่าของตัวเองให้ใครเห็น และควรระวังการรับปากรักษาสัญญา"
    },
    "Spleen Center": {
        name: "ศูนย์สัญชาตญาณและระบบภูมิคุ้มกัน (Spleen Center)",
        definedMeaning: "มีสัญชาตญาณเตือนภัยและภูมิคุ้มกันที่ว่องไว เฉียบคม รู้ได้ทันทีว่าสิ่งใดดีหรือไม่ดีต่อสุขภาพในเสี้ยววินาที",
        undefinedMeaning: "ไวต่อพลังงานความเจ็บป่วยของผู้อื่น ระวังการยึดติดอยู่กับสิ่งของ ความสัมพันธ์ หรือสถานที่ที่เป็นพิษเพียงเพราะรู้สึกอุ่นใจ"
    },
    "Solar Plexus": {
        name: "ศูนย์อารมณ์และความรู้สึก (Solar Plexus Center)",
        definedMeaning: "มีคลื่นอารมณ์สุข-เศร้าที่เกิดขึ้นภายในตัวเองเป็นวัฏจักร ต้องรอความนิ่งของอารมณ์ก่อนตัดสินใจ",
        undefinedMeaning: "เหมือนฟองน้ำซับอารมณ์จากรอบข้างได้รวดเร็ว มักกลัวการเผชิญหน้าและชอบทำตัวเป็นคนคอยตามใจผู้อื่นเพื่อเลี่ยงความขัดแย้ง"
    },
    "Sacral Center": {
        name: "ศูนย์แรงงานและพลังชีวิต (Sacral Center)",
        definedMeaning: "มีแหล่งพลังงานชีวิตอุดมสมบูรณ์ สามารถทำงานที่รักต่อเนื่องได้ยาวนาน มีสัญชาตญาณตอบสนองที่เด่นชัด",
        undefinedMeaning: "พลังงานชีวิตมีจำกัด ไม่ได้ออกแบบมาให้ทำงานหนักต่อเนื่องยาวนาน ต้องรู้จักพักผ่อนทันทีเมื่อรู้สึกเหนื่อยล้า"
    },
    "Root Center": {
        name: "ศูนย์แรงกดดันและวิวัฒนาการ (Root Center)",
        definedMeaning: "มีระบบจัดการความเครียดและแรงกดดันคงที่ สามารถเปลี่ยนแรงกดดันภายนอกให้กลายเป็นพลังขับเคลื่อนงานได้ดี",
        undefinedMeaning: "ไวต่อแรงกดดันและความเร่งรีบจากผู้อื่น มักชอบรีบทำงานให้เสร็จไว ๆ เพียงเพื่ออยากหลุดพ้นจากความเครียดนั้น"
    }
};

/**
 * ฟังก์ชันหลักในการรันระบบ Rule-based แปลผลข้อมูลดิบสากลให้กลายเป็นบทวิเคราะห์ภาษาคน
 * รองรับการตรวจสอบข้อมูลว่างเพื่อป้องกัน Error 500 (Null-safe implementation)
 */
export function interpretHdResult(
    technicalType: string,
    technicalProfile: string,
    technicalAuthority: string,
    definedCentersList: string[] | undefined | null
): TranslatedHdProfile {
    
    // จัดการข้อมูลให้ปลอดภัย (Fallback Protection)
    const safeCentersList = Array.isArray(definedCentersList) ? definedCentersList : [];

    const typeInfo = typeDictionary[technicalType] || {
        name: technicalType,
        aura: "ไม่ระบุคุณลักษณะออร่าจำเพาะ",
        strategy: "โปรดอ้างอิงตามคู่มือระบบหลัก",
        notSelf: "ไม่พบข้อมูลสภาวะแรงต้าน"
    };

    const profileInfo = profileDictionary[technicalProfile] || {
        name: `โปรไฟล์รหัส ${technicalProfile}`,
        description: "สถิติพิกัดเส้นตัดสายสัมพันธ์อยู่ระหว่างกระบวนการขยายระบบข้อมูลเชิงลึก"
    };

    const authorityInfo = authorityDictionary[technicalAuthority] || {
        name: technicalAuthority,
        description: "โปรดใช้ความสงบภายในและการพิจารณาตามความเหมาะสมของโครงสร้างสากล"
    };

    // ประมวลผลถอดรหัสความหมายศูนย์พลังงานทั้ง 9
    const centersExplanations = Object.keys(centerDictionary).map(centerKey => {
        const centerConfig = centerDictionary[centerKey];
        
        // ใช้ safeCentersList ที่ดักค่า null/undefined ไว้แล้ว
        const isDefined = safeCentersList.some(dc => dc.toLowerCase().includes(centerKey.split(' ')[0].toLowerCase()));
        
        return {
            name: centerConfig.name,
            status: isDefined ? "เปิดทำงาน (Defined)" : "เปิดรับ/ไวต่อสิ่งเร้า (Undefined)",
            meaning: isDefined ? centerConfig.definedMeaning : centerConfig.undefinedMeaning
        };
    });

    return {
        typeName: typeInfo.name,
        typeAura: typeInfo.aura,
        typeStrategy: typeInfo.strategy,
        typeNotSelf: typeInfo.notSelf,
        profileName: profileInfo.name,
        profileDescription: profileInfo.description,
        authorityName: authorityInfo.name,
        authorityDescription: authorityInfo.description,
        centersExplanations
    };
}