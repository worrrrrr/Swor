# soulcompass_reader.py
# โปรแกรมถอดรหัสตำแหน่งดาว → คำอ่านภาษาไทย
# ใช้กับใครก็ได้! ไม่ต้องแก้โค้ด เพียงแค่เปลี่ยนข้อมูลเกิดด้านล่าง

import swisseph as swe
import math
from datetime import datetime

# ============================================================
# 1. 🔧 ตั้งค่าข้อมูลเกิด (เปลี่ยนตรงนี้ได้เลย!)
# ============================================================
# เปลี่ยนเลขด้านล่างให้เป็นวันเกิดของคนที่ต้องการดู
BIRTH_YEAR = 1992          # ค.ศ. (เช่น 1992)
BIRTH_MONTH = 8            # เดือน (1-12)
BIRTH_DAY = 8              # วัน (1-31)
BIRTH_HOUR = 16            # ชั่วโมง (0-23)
BIRTH_MINUTE = 49          # นาที (0-59)
TIMEZONE = 7               # เขตเวลาไทย = 7
LATITUDE = 6.54            # ละติจูด (ยะลา)
LONGITUDE = 101.28         # ลองจิจูด (ยะลา)

# ============================================================
# 2. ตั้งค่าระบบ
# ============================================================
swe.set_ephe_path('./ephe')

# ============================================================
# 3. พจนานุกรมฉบับสมบูรณ์ (Dynamic)
# ============================================================

# -------- ราศี + ความหมาย + คำแนะนำ --------
SIGNS = {
    "เมษ": {
        "keyword": "กล้าหาญ, ทะเยอทะยาน, ผู้นำ",
        "detail": "คุณเป็นคนกล้าได้กล้าเสีย ชอบเริ่มต้นสิ่งใหม่ มีพลังขับเคลื่อนสูง ไม่ชอบอยู่นิ่ง",
        "strength": "มีความกล้าหาญ เป็นผู้นำตามธรรมชาติ",
        "weakness": "ใจร้อน ขาดความอดทน",
        "advice": "ฝึกความอดทน คิดก่อนทำ อย่าให้อารมณ์นำการตัดสินใจ"
    },
    "พฤษภ": {
        "keyword": "มั่นคง, รักสบาย, มีรสนิยม",
        "detail": "คุณรักความมั่นคง ชอบสิ่งสวยงาม มีรสนิยมดี แต่อาจดื้อรั้นและยึดติด",
        "strength": "มีความอดทนสูง มั่นคง น่าเชื่อถือ",
        "weakness": "ดื้อรั้น เปลี่ยนแปลงยาก",
        "advice": "ลองเปิดใจรับการเปลี่ยนแปลงบ้าง ไม่ทุกอย่างต้องอยู่กับที่"
    },
    "เมถุน": {
        "keyword": "ฉลาด, ช่างพูด, อยากรู้อยากเห็น",
        "detail": "คุณเป็นคนช่างคิดช่างถาม ชอบเรียนรู้สิ่งใหม่ๆ ติดต่อสื่อสารเก่ง แต่อาจเปลี่ยนใจง่าย",
        "strength": "มีความฉลาด ปรับตัวเก่ง เข้ากับคนง่าย",
        "weakness": "เปลี่ยนใจง่าย ขาดความต่อเนื่อง",
        "advice": "พยายามโฟกัสกับสิ่งใดสิ่งหนึ่งให้จบก่อน อย่ากระโดดไปเรื่อย"
    },
    "กรกฎ": {
        "keyword": "อ่อนไหว, รักบ้าน, เป็นที่พึ่ง",
        "detail": "คุณเป็นคนอ่อนโยน เข้าใจผู้อื่น รักครอบครัว มีสัญชาตญาณในการดูแลคนอื่น",
        "strength": "มีความเห็นอกเห็นใจ อบอุ่น เป็นที่พึ่งของคนอื่น",
        "weakness": "อ่อนไหวง่าย เก็บกด",
        "advice": "เรียนรู้ที่จะปล่อยวาง อย่าเก็บทุกอย่างมาไว้ในใจคนเดียว"
    },
    "สิงห์": {
        "keyword": "ภูมิใจ, เป็นผู้นำ, อบอุ่น",
        "detail": "คุณมีความมั่นใจในตัวเองสูง เป็นผู้นำโดยธรรมชาติ ใจกว้าง รักการยอมรับ",
        "strength": "มีความมั่นใจ มีเสน่ห์ เป็นผู้นำ",
        "weakness": "หยิ่ง ทนคำวิจารณ์ยาก",
        "advice": "เปิดใจรับฟังคนอื่นบ้าง ไม่ต้องเก่งคนเดียว ความยิ่งใหญ่คือการทำให้คนอื่นเก่งด้วย"
    },
    "กันย์": {
        "keyword": "ละเอียด, มีระบบ, ขี้จู้จี้",
        "detail": "คุณเป็นคนละเอียดรอบคอบ มีระเบียบ ชอบบริการผู้อื่น แต่อาจจู้จี้และวิตกกังวล",
        "strength": "ละเอียดรอบคอบ ทำงานมีระบบ",
        "weakness": "จู้จี้ วิตกกังวล คาดหวังสูงเกินไป",
        "advice": "ผ่อนคลายมาตรฐานของตัวเองลงบ้าง ไม่ทุกอย่างต้องเพอร์เฟค"
    },
    "ตุลย์": {
        "keyword": "ยุติธรรม, เข้ากับง่าย, ลังเล",
        "detail": "คุณรักความยุติธรรม เข้ากับคนง่าย มีเสน่ห์ แต่อาจตัดสินใจลำบาก",
        "strength": "มีเสน่ห์ เข้ากับคนง่าย รักความยุติธรรม",
        "weakness": "ลังเล ตัดสินใจช้า",
        "advice": "ฝึกตัดสินใจให้เร็วขึ้น อย่าลังเลนาน เพราะชีวิตไม่รอใคร"
    },
    "พิจิก": {
        "keyword": "ลึกซึ้ง, เด็ดขาด, ลึกลับ",
        "detail": "คุณเป็นคนมีพลังอารมณ์แรง ลึกซึ้ง ไม่ยอมแพ้ ชอบความท้าทาย แต่อาจเก็บงำ",
        "strength": "มุ่งมั่น ไม่ยอมแพ้ ลึกซึ้ง",
        "weakness": "หึงหวง เก็บงำ พยาบาท",
        "advice": "ปล่อยวางความแค้น ระวังอารมณ์รุนแรง ความเข้มแข็งไม่ใช่การไม่ให้อภัย"
    },
    "ธนู": {
        "keyword": "รักอิสระ, มองโลกในแง่ดี, ตรงไปตรงมา",
        "detail": "คุณมองโลกในแง่ดี รักการผจญภัย ชอบเรียนรู้ พูดตรงไปตรงมา แต่อาจขาดไหวพริบ",
        "strength": "มองโลกในแง่ดี มีอุดมการณ์ ใจกว้าง",
        "weakness": "ตรงเกินไป ขาดไหวพริบ เบื่อง่าย",
        "advice": "ระวังการพูดตรงเกินไปจนทำร้ายคนอื่น เรียนรู้ที่จะมีไหวพริบ"
    },
    "มังกร": {
        "keyword": "มีวินัย, จริงจัง, ทะเยอทะยาน",
        "detail": "คุณเป็นคนมีระเบียบวินัย มุ่งมั่น มีเป้าหมายใหญ่ แต่อาจดูเคร่งเครียดเกินไป",
        "strength": "มีวินัย มุ่งมั่น รับผิดชอบสูง",
        "weakness": "เคร่งเครียด มองโลกในแง่ร้าย ทำงานหนักเกินไป",
        "advice": "ปล่อยให้ตัวเองได้พักบ้าง อย่าเคร่งเครียดกับการวางแผนมากเกินไป"
    },
    "กุมภ์": {
        "keyword": "คิดต่าง, รักอิสระ, แหวกแนว",
        "detail": "คุณเป็นคนมีแนวคิดแปลกใหม่ รักอิสระ ไม่ชอบถูกจำกัด และใส่ใจสังคม",
        "strength": "มีวิสัยทัศน์ คิดสร้างสรรค์ รักอิสระ",
        "weakness": "ดื้อรั้น เข้ากับคนอื่นยาก",
        "advice": "เรียนรู้ที่จะปรับตัวเข้ากับสังคมบ้าง ความคิดดีๆ ต้องมีคนฟังถึงจะเกิดประโยชน์"
    },
    "มีน": {
        "keyword": "ช่างฝัน, อ่อนไหว, จินตนาการสูง",
        "detail": "คุณเป็นคนช่างฝัน มีจินตนาการสูง อ่อนไหวง่าย มีจิตวิญญาณศิลปะ",
        "strength": "มีจินตนาการ ความคิดสร้างสรรค์ จิตวิญญาณสูง",
        "weakness": "หนีความจริง หมกมุ่นกับโลกในฝัน",
        "advice": "ตั้งสติให้มั่น อย่าหมกมุ่นกับโลกในฝันมากเกินไป ลงมือทำบ้าง"
    }
}

# -------- ดาวเคราะห์ + ความหมาย --------
PLANETS = {
    "อาทิตย์": {
        "role": "ตัวตนที่แท้จริง, อีโก้, แก่นของชีวิต",
        "detail": "ดาวดวงนี้คือตัวคุณในระดับลึกที่สุด มันบอกว่าแท้จริงแล้วคุณเป็นคนแบบไหน"
    },
    "จันทร์": {
        "role": "อารมณ์, จิตใต้สำนึก, ความต้องการทางใจ",
        "detail": "ดาวดวงนี้คือโลกภายในของคุณ มันบอกว่าคุณรู้สึกและตอบสนองทางอารมณ์อย่างไร"
    },
    "พุธ": {
        "role": "ความคิด, การสื่อสาร, การเรียนรู้",
        "detail": "ดาวดวงนี้คือวิธีคิดและการสื่อสารของคุณ มันบอกว่าคุณเรียนรู้และส่งต่อข้อมูลอย่างไร"
    },
    "ศุกร์": {
        "role": "ความรัก, ความสัมพันธ์, ค่านิยม",
        "detail": "ดาวดวงนี้คือสิ่งที่คุณรักและคุณค่าในชีวิต มันบอกว่าคุณรักและถูกดึงดูดแบบไหน"
    },
    "อังคาร": {
        "role": "พลังงาน, แรงขับ, การกระทำ",
        "detail": "ดาวดวงนี้คือพลังขับเคลื่อนของคุณ มันบอกว่าคุณทำอะไรและทำอย่างไร"
    },
    "พฤหัสบดี": {
        "role": "โชคลาภ, การเติบโต, ปรัชญาชีวิต",
        "detail": "ดาวดวงนี้คือโชคและการขยายตัว มันบอกว่าคุณเติบโตและค้นพบความหมายของชีวิตอย่างไร"
    },
    "เสาร์": {
        "role": "ข้อจำกัด, วินัย, ความรับผิดชอบ",
        "detail": "ดาวดวงนี้คือบทเรียนและอุปสรรค มันบอกว่าคุณต้องเรียนรู้อะไรและเติบโตตรงไหน"
    },
    "มฤตยู": {
        "role": "การเปลี่ยนแปลง, อิสรภาพ, ความแหวกแนว",
        "detail": "ดาวดวงนี้คือการเปลี่ยนแปลงที่ไม่คาดฝัน มันบอกว่าคุณต้องปล่อยวางอะไร"
    },
    "เนปจูน": {
        "role": "จินตนาการ, ความฝัน, จิตวิญญาณ",
        "detail": "ดาวดวงนี้คือความฝันและจินตนาการ มันบอกว่าคุณหลงใหลและเพ้อฝันเรื่องอะไร"
    },
    "พลูโต": {
        "role": "อำนาจ, การเปลี่ยนแปลงลึกซึ้ง, การเกิดใหม่",
        "detail": "ดาวดวงนี้คือพลังการเปลี่ยนแปลงครั้งใหญ่ มันบอกว่าคุณต้องล้มแล้วลุกใหม่ตรงไหน"
    }
}

# -------- เรือน + ความหมาย --------
HOUSES = {
    1: {"name": "ลัคนา", "meaning": "ตัวตน, บุคลิกภายนอก, ภาพลักษณ์"},
    2: {"name": "ทรัพย์", "meaning": "เงินทอง, ทรัพย์สิน, คุณค่าในตัวเอง"},
    3: {"name": "สหชา", "meaning": "พี่น้อง, การสื่อสาร, การเดินทางใกล้"},
    4: {"name": "กัมมะ", "meaning": "บ้าน, ครอบครัว, รากฐานชีวิต"},
    5: {"name": "บริวาร", "meaning": "บุตร, ความคิดสร้างสรรค์, ความรัก"},
    6: {"name": "อนามัย", "meaning": "สุขภาพ, งานประจำ, การบริการ"},
    7: {"name": "ปัตนิ", "meaning": "คู่ครอง, หุ้นส่วน, การเจรจา"},
    8: {"name": "มรณะ", "meaning": "การเปลี่ยนแปลง, ทรัพย์มรดก, วิกฤตชีวิต"},
    9: {"name": "บุญ", "meaning": "โชคลาภ, การเดินทางไกล, ปรัชญา"},
    10: {"name": "กัมมะ", "meaning": "อาชีพ, ชื่อเสียง, เกียรติยศ"},
    11: {"name": "ลาภ", "meaning": "มิตร, รายได้เสริม, ความหวัง"},
    12: {"name": "วินาสน์", "meaning": "ความสูญเสีย, เรื่องลับ, การปล่อยวาง"}
}

# -------- มุมมอง + ความหมาย --------
ASPECTS = {
    "ร่วม": {"symbol": "☌", "meaning": "พลังรวมกันเป็นหนึ่ง", "detail": "ดาวสองดวงนี้ทำงานร่วมกัน พลังของมันผสมผสานกันอย่างแข็งแกร่ง"},
    "เสก": {"symbol": "⚹", "meaning": "โอกาสดี ความกลมกลืน", "detail": "ดาวสองดวงนี้สนับสนุนกัน ให้โอกาสและความร่วมมือที่ดี"},
    "จตุรโกณ": {"symbol": "□", "meaning": "ความขัดแย้ง บทเรียนท้าทาย", "detail": "ดาวสองดวงนี้ขัดแย้งกัน ก่อให้เกิดแรงเสียดทานและบทเรียนชีวิต"},
    "ตรีโกณ": {"symbol": "△", "meaning": "โชคดี ง่าย สำเร็จ", "detail": "ดาวสองดวงนี้กลมกลืนกัน ทำให้ชีวิตไหลลื่น มีพรสวรรค์ติดตัว"},
    "จตุรโกณที่ 5": {"symbol": "⚺", "meaning": "ปรับตัวยาก ขัดแย้งทางความคิด", "detail": "ดาวสองดวงนี้เข้ากันได้ยาก ต้องปรับตัวอย่างมาก"},
    "ปัจฉิม": {"symbol": "☍", "meaning": "ตรงข้าม ต้องหาจุดสมดุล", "detail": "ดาวสองดวงนี้อยู่คนละขั้ว ต้องหาจุดกึ่งกลางระหว่างสองด้าน"}
}

# -------- ระดับความแรงของดาวในเรือน --------
HOUSE_STRENGTH = {
    1: "แรงที่สุด (Angular)",
    4: "แรง (Angular)",
    7: "แรง (Angular)",
    10: "แรง (Angular)",
    2: "ปานกลาง (Succedent)",
    5: "ปานกลาง (Succedent)",
    8: "ปานกลาง (Succedent)",
    11: "ปานกลาง (Succedent)",
    3: "อ่อน (Cadent)",
    6: "อ่อน (Cadent)",
    9: "อ่อน (Cadent)",
    12: "อ่อนที่สุด (Cadent)"
}

# ============================================================
# 4. ฟังก์ชันคำนวณ (เหมือนเดิม)
# ============================================================

def compute_birth_data(year, month, day, hour, minute, lat, lng, tz=7):
    utc_h = hour - tz
    if utc_h < 0:
        utc_h += 24
        day -= 1
    jd, _ = swe.utc_to_jd(year, month, day, utc_h, minute, 0, swe.GREG_CAL)
    return jd

def get_planet_positions(jd):
    planets = {}
    codes = {swe.SUN:"อาทิตย์", swe.MOON:"จันทร์", swe.MERCURY:"พุธ",
             swe.VENUS:"ศุกร์", swe.MARS:"อังคาร", swe.JUPITER:"พฤหัสบดี",
             swe.SATURN:"เสาร์", swe.URANUS:"มฤตยู", swe.NEPTUNE:"เนปจูน",
             swe.PLUTO:"พลูโต"}
    for code, name in codes.items():
        res = swe.calc_ut(jd, code)
        deg = res[0][0]
        speed = res[0][3]
        si = int(deg // 30)
        sign = list(SIGNS.keys())[si]
        planets[name] = {
            'deg': deg,
            'sign': sign,
            'deg_in_sign': deg % 30,
            'speed': speed,
            'retrograde': speed < 0,
            'sign_idx': si
        }
    return planets

def get_houses(jd, lat, lng):
    houses, asc_mc = swe.houses_ex(jd, lat, lng, b'P')
    return {
        'asc': houses[0],
        'mc': houses[1],
        'houses': houses
    }

def get_aspect(deg1, deg2):
    diff = abs(deg1 - deg2) % 360
    if diff > 180:
        diff = 360 - diff
    aspect_map = {0:"ร่วม", 60:"เสก", 90:"จตุรโกณ", 120:"ตรีโกณ", 150:"จตุรโกณที่ 5", 180:"ปัจฉิม"}
    orb = 8
    for angle, name in aspect_map.items():
        if abs(diff - angle) <= orb:
            return name, diff
    return None, diff

def get_weekday(year, month, day):
    d = datetime(year, month, day)
    weekdays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]
    return weekdays[d.weekday()]

def get_zodiac_year(year_buddhist):
    zodiacs = ["ชวด", "ฉลู", "ขาล", "เถาะ", "มะโรง", "มะเส็ง",
               "มะเมีย", "มะแม", "วอก", "ระกา", "จอ", "กุน"]
    base = 2527
    return zodiacs[(year_buddhist - base) % 12]

def get_house_number(deg, houses):
    """หาว่าองศานี้อยู่ในเรือนไหน (1-12)"""
    for i in range(12):
        next_i = (i + 1) % 12
        h1 = houses[i]
        h2 = houses[next_i]
        if h2 < h1:
            h2 += 360
        d = deg if deg >= h1 else deg + 360
        if h1 <= d < h2:
            return i + 1
    return 12

# ============================================================
# 5. ฟังก์ชันแปลความหมาย (Dynamic)
# ============================================================

def get_advice_from_signs(asc_sign, sun_sign, moon_sign):
    """สร้างคำแนะนำจากราศีที่มีในดวง โดยไม่ต้อง Hard-code"""
    advices = []
    for sign, label in [(asc_sign, "ลัคนา"), (sun_sign, "อาทิตย์"), (moon_sign, "จันทร์")]:
        adv = SIGNS.get(sign, {}).get('advice', '')
        if adv:
            advices.append(f"   - {adv} (จากราศี{sign} - {label})")
    
    if not advices:
        advices = ["   - พัฒนาตัวเองอย่างต่อเนื่อง", "   - ดูแลสุขภาพกายและใจ"]
    
    return "\n".join(advices)

def get_strengths_from_signs(asc_sign, sun_sign, moon_sign):
    """สร้างจุดเด่นจากราศีที่มีในดวง"""
    strengths = []
    for sign, label in [(asc_sign, "ลัคนา"), (sun_sign, "อาทิตย์"), (moon_sign, "จันทร์")]:
        s = SIGNS.get(sign, {}).get('strength', '')
        if s:
            strengths.append(f"   - {s} (จากราศี{sign} - {label})")
    return "\n".join(strengths) if strengths else "   - (ยังไม่มีข้อมูล)"

def get_weaknesses_from_signs(asc_sign, sun_sign, moon_sign):
    """สร้างจุดอ่อนจากราศีที่มีในดวง"""
    weaknesses = []
    for sign, label in [(asc_sign, "ลัคนา"), (sun_sign, "อาทิตย์"), (moon_sign, "จันทร์")]:
        w = SIGNS.get(sign, {}).get('weakness', '')
        if w:
            weaknesses.append(f"   - {w} (จากราศี{sign} - {label})")
    return "\n".join(weaknesses) if weaknesses else "   - (ยังไม่มีข้อมูล)"

def interpret_planet(name, data, houses):
    """แปลความหมายของดาวดวงหนึ่ง (Dynamic)"""
    sign = data['sign']
    deg_in = data['deg_in_sign']
    retro = data['retrograde']
    
    house_num = get_house_number(data['deg'], houses)
    house_info = HOUSES.get(house_num, {"name": "ไม่ทราบ", "meaning": ""})
    house_strength = HOUSE_STRENGTH.get(house_num, "")
    
    planet_info = PLANETS.get(name, {"role": "", "detail": ""})
    sign_info = SIGNS.get(sign, {"keyword": "", "detail": ""})
    
    result = f"""
━━━ {name} ━━━
  📍 ราศี: {sign} ({deg_in:.2f}°)
  🏠 เรือนที่: {house_num} ({house_info['name']}) - {house_info['meaning']}
  💪 ความแรงในเรือน: {house_strength}
  🎯 หน้าที่: {planet_info['role']}
  💬 ความหมาย: {planet_info['detail']}
  🔥 แสดงออก: {sign_info['detail']}
"""
    if retro:
        result += "  ⚠️ ดวงนี้เดินถอยหลัง (Retrograde) → คิดและสื่อสารต่างจากคนทั่วไป\n"
    
    return result

def interpret_aspect(name1, name2, aspect_name, diff):
    """แปลความหมายของมุมมอง (Dynamic)"""
    aspect_info = ASPECTS.get(aspect_name, {"symbol": "", "detail": ""})
    strength_stars = "⭐" * min(5, max(1, 6 - int(diff / 30)))
    return f"""
  {name1} {aspect_info['symbol']} {name2}
     → {aspect_name} (ต่าง {diff:.1f}°) {strength_stars}
     → {aspect_info['detail']}
"""

def interpret_big_three(asc_sign, sun_sign, moon_sign):
    """แปล Big Three แบบ Dynamic"""
    asc_info = SIGNS.get(asc_sign, {"keyword": "", "detail": ""})
    sun_info = SIGNS.get(sun_sign, {"keyword": "", "detail": ""})
    moon_info = SIGNS.get(moon_sign, {"keyword": "", "detail": ""})
    
    combined = (f"คุณคือคนที่ภายนอกดู {asc_info['keyword']} "
                f"แต่ตัวตนที่แท้จริงคือ {sun_info['keyword']} "
                f"และจิตใจลึกๆ คือ {moon_info['keyword']}")
    
    return f"""
╔═══════════════════════════════════════════════════╗
║              3 ทหารเสือแห่งตัวตน                 ║
╚═══════════════════════════════════════════════════╝

🌅 ลัคนา {asc_sign} ({asc_info['keyword']})
   → {asc_info['detail']}
   → หน้ากากที่ใช้เผชิญโลก

☀️ อาทิตย์ {sun_sign} ({sun_info['keyword']})
   → {sun_info['detail']}
   → ตัวตนและแก่นแท้ของคุณ

🌙 จันทร์ {moon_sign} ({moon_info['keyword']})
   → {moon_info['detail']}
   → โลกภายในและจิตใต้สำนึก

🔮 สรุป: {combined}
"""

# ============================================================
# 6. ฟังก์ชันหลัก (Dynamic)
# ============================================================

def analyze_birth(year, month, day, hour, minute, lat, lng, tz=7):
    """วิเคราะห์และถอดรหัสดวงชะตา (Dynamic - ใช้กับใครก็ได้)"""
    
    # -------- คำนวณ --------
    jd = compute_birth_data(year, month, day, hour, minute, lat, lng, tz)
    planets = get_planet_positions(jd)
    houses_data = get_houses(jd, lat, lng)
    houses = houses_data['houses']
    asc_deg = houses_data['asc']
    mc_deg = houses_data['mc']
    
    asc_si = int(asc_deg // 30)
    mc_si = int(mc_deg // 30)
    asc_sign = list(SIGNS.keys())[asc_si]
    mc_sign = list(SIGNS.keys())[mc_si]
    
    sun_sign = planets['อาทิตย์']['sign']
    moon_sign = planets['จันทร์']['sign']
    
    # -------- คำนวณมุมมอง --------
    names = list(planets.keys())
    degs = [planets[n]['deg'] for n in names]
    aspects_found = []
    for i in range(len(names)):
        for j in range(i+1, len(names)):
            aspect_name, diff = get_aspect(degs[i], degs[j])
            if aspect_name:
                aspects_found.append((names[i], names[j], aspect_name, diff))
    
    # -------- ข้อมูลเพิ่มเติม --------
    buddhist_year = year + 543
    weekday = get_weekday(year, month, day)
    zodiac = get_zodiac_year(buddhist_year)
    
    # ============================================================
    # 7. แสดงผล
    # ============================================================
    
    print("="*70)
    print("🌟  ถอดรหัสดวงชะตา  (Natal Chart Reading)")
    print("="*70)
    print(f"📅 เกิด: {day}/{month}/{buddhist_year} (ค.ศ. {year})")
    print(f"🕐 เวลา: {hour:02d}:{minute:02d} น. (เวลาท้องถิ่น)")
    print(f"📍 สถานที่: ละติจูด {lat}°, ลองจิจูด {lng}°")
    print(f"📌 วันเกิด: วัน{weekday}")
    print(f"🐵 ปีนักษัตร: {zodiac}")
    print("="*70)
    print()
    
    # ---- 1. Big Three ----
    print(interpret_big_three(asc_sign, sun_sign, moon_sign))
    print()
    
    # ---- 2. ดาวเคราะห์ทุกดวง ----
    print("╔═══════════════════════════════════════════════════╗")
    print("║           ตำแหน่งดาวเคราะห์และความหมาย          ║")
    print("╚═══════════════════════════════════════════════════╝")
    print()
    
    for name in ["อาทิตย์", "จันทร์", "พุธ", "ศุกร์", "อังคาร", "พฤหัสบดี", "เสาร์", "มฤตยู", "เนปจูน", "พลูโต"]:
        data = planets[name]
        print(interpret_planet(name, data, houses))
        print()
    
    # ---- 3. ลัคนาและมัธยม ----
    print("╔═══════════════════════════════════════════════════╗")
    print("║              จุดสำคัญในดวงชะตา                  ║")
    print("╚═══════════════════════════════════════════════════╝")
    print()
    
    asc_info = SIGNS.get(asc_sign, {"detail": ""})
    mc_info = SIGNS.get(mc_sign, {"detail": ""})
    
    print(f"🌅 ลัคนา (Ascendant): {asc_sign} {asc_deg % 30:.2f}°")
    print(f"   → หน้ากากที่ใช้เผชิญโลก บุคลิกภายนอก")
    print(f"   → {asc_info['detail']}")
    print()
    print(f"⬆️ มัธยม (MC): {mc_sign} {mc_deg % 30:.2f}°")
    print(f"   → จุดสูงสุดแห่งอาชีพและชื่อเสียง")
    print(f"   → {mc_info['detail']}")
    print()
    
    # ---- 4. เรือน ----
    print("╔═══════════════════════════════════════════════════╗")
    print("║              เรือนทั้ง 12 ภพ                    ║")
    print("╚═══════════════════════════════════════════════════╝")
    print()
    for i in range(12):
        h_deg = houses[i]
        si = int(h_deg // 30)
        sign = list(SIGNS.keys())[si]
        house_info = HOUSES.get(i+1, {"name": "", "meaning": ""})
        strength = HOUSE_STRENGTH.get(i+1, "")
        print(f"  เรือนที่ {i+1:2d} ({house_info.get('name', '')}): {sign} {h_deg % 30:.2f}° ({strength})")
        print(f"     → {house_info.get('meaning', '')}")
        print()
    
    # ---- 5. มุมมองสำคัญ ----
    print("╔═══════════════════════════════════════════════════╗")
    print("║           มุมมองระหว่างดาว (Aspects)            ║")
    print("╚═══════════════════════════════════════════════════╝")
    print()
    
    if aspects_found:
        sorted_aspects = sorted(aspects_found, key=lambda x: x[3])
        
        print("🔮 มุมมองที่ดี (กลมกลืน):")
        good = [a for a in sorted_aspects if a[2] in ["เสก", "ตรีโกณ", "ร่วม"]]
        if good:
            for n1, n2, asp, diff in good[:5]:
                print(interpret_aspect(n1, n2, asp, diff))
        else:
            print("  (ไม่มีมุมมองที่ดีในระดับนี้)")
        print()
        
        print("⚡ มุมมองที่ท้าทาย (ขัดแย้ง):")
        hard = [a for a in sorted_aspects if a[2] in ["จตุรโกณ", "ปัจฉิม", "จตุรโกณที่ 5"]]
        if hard:
            for n1, n2, asp, diff in hard[:5]:
                print(interpret_aspect(n1, n2, asp, diff))
        else:
            print("  (ไม่มีมุมมองที่ท้าทายในระดับนี้)")
    else:
        print("  (ไม่มีมุมมองสำคัญ)")
    
    print()
    
    # ---- 6. มุมที่แรงที่สุด ----
    print("╔═══════════════════════════════════════════════════╗")
    print("║          มุมที่ส่งผลต่อชีวิตมากที่สุด            ║")
    print("╚═══════════════════════════════════════════════════╝")
    print()
    
    if aspects_found:
        strong = [a for a in aspects_found if a[2] in ["ร่วม", "ปัจฉิม", "จตุรโกณ", "ตรีโกณ"]]
        if strong:
            for n1, n2, asp, diff in strong[:3]:
                asp_info = ASPECTS.get(asp, {})
                print(f"🔴 {n1} {asp_info.get('symbol', '')} {n2} : {asp} (ต่าง {diff:.1f}°)")
                print(f"   → {asp_info.get('detail', '')}")
                print(f"   → นี่คือบทเรียนสำคัญที่คุณต้องเผชิญในชีวิต")
                print()
        else:
            print("  (ไม่มีมุมที่แรงมากเป็นพิเศษ)")
    else:
        print("  (ไม่มีข้อมูล)")
    
    # ---- 7. สรุปภาพรวม (Dynamic) ----
    print("="*70)
    print("📊 สรุปภาพรวมตัวตนของคุณ")
    print("="*70)
    print()
    
    # สรุปจาก Big Three
    asc_kw = SIGNS.get(asc_sign, {}).get('keyword', '')
    sun_kw = SIGNS.get(sun_sign, {}).get('keyword', '')
    moon_kw = SIGNS.get(moon_sign, {}).get('keyword', '')
    
    print(f"🔹 คุณคือคนที่ภายนอกดู {asc_kw}")
    print(f"   แต่ภายในแท้จริงคือ {sun_kw}")
    print(f"   และจิตใจลึกๆ คือ {moon_kw}")
    print()
    
    # จุดเด่น (Dynamic)
    print("💪 จุดเด่น:")
    print(get_strengths_from_signs(asc_sign, sun_sign, moon_sign))
    print()
    
    # จุดอ่อน (Dynamic)
    print("⚠️ จุดที่ควรพัฒนา:")
    print(get_weaknesses_from_signs(asc_sign, sun_sign, moon_sign))
    print()
    
    # คำแนะนำ (Dynamic)
    print("💡 คำแนะนำ:")
    print(get_advice_from_signs(asc_sign, sun_sign, moon_sign))
    print()
    
    print("="*70)
    print("✨ จบการถอดรหัส")
    print("   'ใช้กับใครก็ได้ ไม่ต้องแก้โค้ด!'")
    print("="*70)

# ============================================================
# 8. เริ่มทำงาน
# ============================================================
if __name__ == "__main__":
    analyze_birth(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY,
                  BIRTH_HOUR, BIRTH_MINUTE,
                  LATITUDE, LONGITUDE, TIMEZONE)