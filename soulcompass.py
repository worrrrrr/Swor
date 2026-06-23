def call_ai_agent(role, message):
    # ในการใช้งานจริง คุณจะใช้ API เช่น OpenAI หรือ Google Vertex AI ตรงนี้
    print(f"--- {role} กำลังประมวลผล ---")
    return f"คำตอบจาก {role} สำหรับ: '{message[:50]}...'"

# กำหนดบทบาทของเอไอ 2 ตัวตามแนวคิด Reflection [1, 2]
agent_a = "Generator (ผู้สร้างแผน)"
agent_b = "Reflector (ผู้วิจารณ์และตรวจสอบ)"

# โจทย์ที่ต้องการให้เอไอคุยกัน (ตัวอย่าง: การวางแผนงานวิจัย) [5, 6]
current_context = "จงวางแผนขั้นตอนการสังเคราะห์ BTK inhibitor รุ่นใหม่"

# วนลูปให้พวกมัน "พลัดกันสับ" หรือโต้ตอบกัน 3 รอบ
for turn in range(1, 4):
    print(f"\n[รอบที่ {turn}]")
    
    # เอไอตัวที่ 1 สร้างเนื้อหา
    response_a = call_ai_agent(agent_a, current_context)
    print(f"{agent_a}: {response_a}")
    
    # เอไอตัวที่ 2 รับเนื้อหาจากตัวแรกไปวิจารณ์หรือปรับปรุง
    response_b = call_ai_agent(agent_b, response_a)
    print(f"{agent_b}: {response_b}")
    
    # อัปเดตข้อมูลเพื่อให้คุยกันต่อในรอบถัดไป (Shared Context) [7, 8]
    current_context = response_b

print("\n--- สิ้นสุดการสนทนาของเอไอ ---")