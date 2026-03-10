function nursingChart() {
    return {
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        patient: null,
        viewMode: 'preview', // 'preview' or 'edit'
        currentForm: null,
        
        // แบบฟอร์มพื้นฐาน 8 รายการ (ลบไม่ได้)
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

        // รายการเอกสารเพิ่มเติม (รอพัฒนา)
        extraOptions: [
            { id: 'skin_assess', title: 'แบบประเมินสุขภาพผิวหนัง' },
            { id: 'pain_score', title: 'แบบบันทึกการจัดการความปวด (Pain Score)' },
            { id: 'fluid_balance', title: 'แบบบันทึกสารน้ำและปัสสาวะ (I/O)' }
        ],

        init() {
            this.currentForm = this.activeForms[0];
            const urlParams = new URLSearchParams(window.location.search);
            const an = urlParams.get('an');
            if (an) {
                this.fetchPatientData(an);
            }
        },

        async fetchPatientData(an) {
            // ดึงข้อมูลพื้นฐานคนไข้จาก GAS (เหมือนหน้าทะเบียน)
            try {
                const res = await fetch(`${this.API_URL}?action=getPatientByAN&an=${an}`);
                this.patient = await res.json();
            } catch (e) {
                console.error("Fetch Patient Error", e);
                // ข้อมูลตัวอย่างสำหรับ Test UI
                this.patient = { name: "พระเฉลิม กมลพิศ", hn: "410100282", an: an, bed: "PA507" };
            }
        },

        selectForm(form) {
            this.currentForm = form;
            this.viewMode = 'preview'; // สลับหน้าฟอร์มให้เริ่มที่พรีวิวก่อนเสมอ
        },

        addForm(opt) {
            // ตรวจสอบว่ามีฟอร์มนี้อยู่แล้วหรือไม่
            if (!this.activeForms.find(f => f.id === opt.id)) {
                this.activeForms.push({ ...opt, isMain: false });
                this.selectForm(opt);
            }
        },

        removeForm(id) {
            this.activeForms = this.activeForms.filter(f => f.id !== id);
            if (this.currentForm.id === id) {
                this.currentForm = this.activeForms[0];
            }
        }
    };
}
