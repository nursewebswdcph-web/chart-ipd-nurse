function nursingChart() {
    return {
        // ✅ เปลี่ยน URL ของคุณที่นี่
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        patient: null,
        viewMode: 'preview',
        currentForm: null,
        dialog: { show: false, type: 'alert', title: '', msg: '', onConfirm: null, confirmBtnText: 'ตกลง' },
        
        // แบบฟอร์มหลัก 8 รายการ
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
            { id: 'home_care_transfer', title: 'แบบบันทึกส่งต่อเพื่อการดูแลต่อเนื่องที่บ้าน' }
        ],

        init() {
            this.currentForm = this.activeForms[0];
            const urlParams = new URLSearchParams(window.location.search);
            const an = urlParams.get('an');
            if (an) {
                this.fetchPatientData(an);
            }
        },

        // ✅ แก้ไข Logic ค้นหา AN ให้แม่นยำ (รองรับ String จากคอลัมน์ H)
        async fetchPatientData(an) {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getPatients&ward=all`);
                const allPatients = await res.json();
                
                // ค้นหา AN โดยลบช่องว่างและเปรียบเทียบเป็นข้อความ (String)
                const foundPatient = allPatients.find(p => 
                    p.an && p.an.toString().trim() === an.toString().trim()
                );
                
                if (foundPatient) {
                    this.patient = foundPatient;
                } else {
                    this.showAlert("ไม่พบผู้ป่วย", `ไม่พบ AN: ${an} ในฐานข้อมูล CurrentPatients`);
                }
            } catch (e) {
                this.showAlert("ผิดพลาด", "ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
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
            this.showConfirm("ยืนยันการลบ", "ต้องการนำรายการเอกสารนี้ออกจากแถบรายการใช่หรือไม่?", () => {
                this.activeForms = this.activeForms.filter(f => f.id !== id);
                if (this.currentForm.id === id) this.currentForm = this.activeForms[0];
            });
        },

        // ✅ ระบบ Dialog แทน Popup เบราว์เซอร์
        showAlert(title, msg) {
            this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'ตกลง', onConfirm: null };
        },
        showConfirm(title, msg, onConfirm) {
            this.dialog = { show: true, type: 'confirm', title, msg, confirmBtnText: 'ยืนยัน', onConfirm };
        },
        handleDialogConfirm() {
            if (this.dialog.onConfirm) this.dialog.onConfirm();
            this.dialog.show = false;
        },

        calculateLOS(date) {
            if(!date) return 0;
            const d = Math.floor(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
            return d === 0 ? 1 : d;
        }
    };
}
