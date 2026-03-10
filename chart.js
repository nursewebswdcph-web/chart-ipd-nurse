function nursingChart() {
    return {
        // ✅ เปลี่ยนเป็น URL ของคุณ
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        patient: null,
        viewMode: 'preview', // 'preview' or 'edit'
        currentForm: null,
        
        // แบบฟอร์มพื้นฐาน 8 รายการ
        activeForms: [
            { id: 'assess_initial', title: '1. แบบประเมินประวัติและสมรรถนะผู้ป่วยแรกรับ', isMain: true },
            { id: 'patient_class', title: '2. แบบบันทึกการจำแนกประเภทผู้ป่วย', isMain: true },
            { id: 'fall_risk', title: '3. แบบประเมินความเสี่ยงพลัดตกหกล้ม Morse / MAAS', isMain: true },
            { id: 'braden_scale', title: '4. แบบประเมินแผลกดทับ (Braden Scale)', isMain: true },
            { id: 'patient_edu', title: '5. แบบบันทึกการให้คำแนะนำผู้ป่วยระหว่างเข้ารับการรักษาและเมื่อกลับบ้าน', isMain: true },
            { id: 'focus_list', title: '6. แบบบันทึกรายการปัญหาสุขภาพ (Focus List)', isMain: true },
            { id: 'progress_note', title: '7. แบบบันทึกความกว้าวหน้าทางการพยาบาลNursing Progress Note', isMain: true },
            { id: 'discharge_summary', title: '8. แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย', isMain: true }
        ],

        // ✅ รายการเอกสารเพิ่มเติม (อัปเดตใหม่ตามที่ขอ)
        extraOptions: [
            { id: 'stress_assess', title: 'แบบประเมินความเครียด' },
            { id: 'pre_endo_prep', title: 'แบบเตรียมผู้ป่วยก่อนส่องกล้อง' },
            { id: 'pre_op_prep', title: 'แบบเตรียมผู้ป่วยก่อนผ่าตัด' },
            { id: 'home_care_transfer', title: 'แบบบันทึกส่งต่อเพื่อการดูแลต่อเนื่องที่บ้าน' },
        ],

        init() {
            this.currentForm = this.activeForms[0];
            const urlParams = new URLSearchParams(window.location.search);
            const an = urlParams.get('an');
            if (an) {
                this.fetchPatientData(an);
            }
        },

        // ✅ ดึงข้อมูลจริงจาก GAS
        async fetchPatientData(an) {
            this.isLoading = true;
            try {
                // เรียกใช้ action=getPatients และ Filter หาคนไข้จาก AN
                const res = await fetch(`${this.API_URL}?action=getPatients&ward=all`); // ปรับ ward เป็น all เพื่อค้นหาทั่วถึง
                const allPatients = await res.json();
                
                // ค้นหาข้อมูลผู้ป่วยที่มี AN ตรงกัน
                const foundPatient = allPatients.find(p => p.an.toString() === an.toString());
                
                if (foundPatient) {
                    this.patient = foundPatient;
                } else {
                    alert("ไม่พบข้อมูลผู้ป่วยรายนี้ในระบบ");
                }
            } catch (e) {
                console.error("Fetch Data Failed:", e);
                // ข้อมูลตัวอย่างหากเชื่อมต่อผิดพลาด (เพื่อการทดสอบ UI)
                this.patient = { 
                    name: "พระเฉลิม กมลพิศ", 
                    hn: "410100282", 
                    an: an, 
                    bed: "PA507", 
                    dx: "AFI with sepsis", 
                    doctor: "นพ.อมร ตามไท" 
                };
            }
            this.isLoading = false;
        },

        selectForm(form) {
            this.currentForm = form;
            this.viewMode = 'preview';
            // เลื่อน Content กลับไปด้านบน
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        addForm(opt) {
            // ตรวจสอบว่ามีฟอร์มนี้อยู่แล้วหรือไม่
            if (!this.activeForms.find(f => f.id === opt.id)) {
                this.activeForms.push({ ...opt, isMain: false });
                this.selectForm(opt);
            } else {
                // ถ้ามีแล้วให้เลือกฟอร์มนั้นแทน
                this.selectForm(this.activeForms.find(f => f.id === opt.id));
            }
        },

        removeForm(id) {
            if (confirm("ยืนยันการลบรายการเอกสารนี้ออกจากแถบรายการ?")) {
                this.activeForms = this.activeForms.filter(f => f.id !== id);
                if (this.currentForm.id === id) {
                    this.currentForm = this.activeForms[0];
                }
            }
        }
    };
}
