function nursingChart() {
    return {
        // ✅ เปลี่ยน URL ของคุณที่นี่
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        patient: null,
        viewMode: 'preview',
        currentForm: null,
        dialog: { show: false, type: 'alert', title: '', msg: '', onConfirm: null, confirmBtnText: 'ตกลง' },
        
        activeForms: [
            { id: 'assess_initial', title: '1. แบบประเมินประวัติและสมรรถนะผู้ป่วยแรกรับ', isMain: true },
            { id: 'patient_class', title: '2. แบบบันทึกการจำแนกประเภทผู้ป่วย', isMain: true },
            { id: 'fall_risk', title: '3. แบบประเมินความเสี่ยง Morse / MAAS', isMain: true },
            { id: 'braden_scale', title: '4. แบบประเมินแผลกดทับ (Braden Scale)', isMain: true },
            { id: 'patient_edu', title: '5. แบบบันทึกการให้คำแนะนำผู้ป่วยระหว่างเข้ารับการรักษาและเมื่อกลับบ้าน', isMain: true },
            { id: 'focus_list', title: '6. แบบบันทึกรายการปัญหาสุขภาพ (Focus List)', isMain: true },
            { id: 'progress_note', title: '7. แบบบันทึกความก้าวหน้าทางการพยาบาล Nursing Progress Note', isMain: true },
            { id: 'discharge_summary', title: '8. แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย', isMain: true }
        ],

        extraOptions: [
            { id: 'stress_assess', title: 'แบบประเมินความเครียด' },
            { id: 'pre_endo_prep', title: 'แบบเตรียมผู้ป่วยก่อนส่องกล้อง' },
            { id: 'pre_op_prep', title: 'แบบเตรียมผู้ป่วยก่อนผ่าตัด' },
            { id: 'home_care_transfer', title: 'แบบบันทึกส่งต่อเพื่อการดูแลต่อเนื่องที่บ้าน' }
        ],

        init() {
            this.currentForm = this.activeForms[0];
            const urlParams = new URLSearchParams(window.location.search);
            const an = urlParams.get('an');
            if (an) {
                // ✅ แก้ไขปัญหาค้นหา AN ไม่พบด้วยการ Trim และแปลงเป็น String ทั้งคู่
                this.fetchPatientData(an);
            }
        },

        async fetchPatientData(an) {
            this.isLoading = true;
            try {
                // ดึงข้อมูลจาก API ตัวเดิมที่ใช้แสดงในหน้าทะเบียน (ดึงจากชีต CurrentPatients)
                const res = await fetch(`${this.API_URL}?action=getPatients&ward=all`);
                const allPatients = await res.json();
                
                // ✅ ใช้ String Matching ที่เข้มงวดเพื่อรองรับ AN แบบข้อความจากคอลัมน์ H
                const foundPatient = allPatients.find(p => 
                    p.an && p.an.toString().trim() === an.toString().trim()
                );
                
                if (foundPatient) {
                    this.patient = foundPatient;
                } else {
                    // หากไม่พบ ให้ลองดึงข้อมูลจาก Source อื่นหรือแจ้งเตือน
                    this.showAlert("ไม่พบผู้ป่วย", `ไม่พบ AN: ${an} ในฐานข้อมูลทะเบียนผู้ป่วยปัจจุบัน`);
                }
            } catch (e) {
                this.showAlert("ผิดพลาด", "ไม่สามารถเข้าถึงฐานข้อมูล CurrentPatients ได้");
            }
            this.isLoading = false;
        },

        selectForm(form) {
            this.currentForm = form;
            this.viewMode = 'preview';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        addForm(opt) {
            if (!this.activeForms.find(f => f.id === opt.id)) {
                this.activeForms.push({ ...opt, isMain: false });
                this.selectForm(opt);
            } else {
                this.selectForm(this.activeForms.find(f => f.id === opt.id));
            }
        },

        removeForm(id) {
            this.showConfirm("ยืนยันการลบ", "ต้องการนำรายการเอกสารเพิ่มเติมนี้ออกจากแถบรายการใช่หรือไม่?", () => {
                this.activeForms = this.activeForms.filter(f => f.id !== id);
                if (this.currentForm.id === id) this.currentForm = this.activeForms[0];
            });
        },

        // ✅ ฟังก์ชันแจ้งเตือนแบบกำหนดเอง (Custom Dialog)
        showAlert(title, msg) {
            this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'ตกลง', onConfirm: null };
        },
        showConfirm(title, msg, onConfirm) {
            this.dialog = { show: true, type: 'confirm', title, msg, confirmBtnText: 'ยืนยันการลบ', onConfirm };
        },
        handleDialogConfirm() {
            if (this.dialog.onConfirm) this.dialog.onConfirm();
            this.dialog.show = false;
        }
    };
}
