function nursingChart() {
    return {
        // ✅ URL GAS ของคุณ
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
            { id: 'patient_edu', title: '5. แบบบันทึกการให้คำแนะนำผู้ป่วย', isMain: true },
            { id: 'focus_list', title: '6. แบบบันทึกรายการปัญหาสุขภาพ (Focus List)', isMain: true },
            { id: 'progress_note', title: '7. Nursing Progress Note', isMain: true },
            { id: 'discharge_summary', title: '8. แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย', isMain: true }
        ],

        extraOptions: [
            { id: 'stress_assess', title: 'แบบประเมินความเครียด' },
            { id: 'pre_endo_prep', title: 'แบบเตรียมผู้ป่วยก่อนส่องกล้อง' },
            { id: 'pre_op_prep', title: 'แบบเตรียมผู้ป่วยก่อนผ่าตัด' },
            { id: 'home_care_transfer', title: 'แบบบันทึกส่งต่อเพื่อการดูแลต่อเนื่องที่บ้าน' }
        ],

        async init() {
            this.currentForm = this.activeForms[0];
            const urlParams = new URLSearchParams(window.location.search);
            const anFromUrl = urlParams.get('an');
            
            if (anFromUrl) {
                console.log("Searching for AN from URL:", anFromUrl);
                await this.fetchPatientData(anFromUrl);
            } else {
                this.showAlert("ลิ้งค์ไม่ถูกต้อง", "ไม่พบเลข AN จากหน้าทะเบียน");
            }
        },

        // ✅ ฟังก์ชันดึงข้อมูลที่เสถียรที่สุด (Strict Matching)
        async fetchPatientData(anToFind) {
            this.isLoading = true;
            try {
                // ดึงข้อมูลทะเบียนผู้ป่วยปัจจุบัน (CurrentPatients)
                const res = await fetch(`${this.API_URL}?action=getPatients&ward=all`);
                const allPatients = await res.json();
                
                // แปลงค่า AN ที่ต้องการค้นหาให้เป็น String และตัดช่องว่างออกทั้งหมด
                const targetAN = String(anToFind).trim();

                // ค้นหาโดยการเปรียบเทียบแบบละเอียด
                const found = allPatients.find(p => {
                    if (!p.an) return false;
                    // แปลงค่า AN ในชีตให้เป็น String และตัดช่องว่างออกเพื่อความแม่นยำ 100%
                    return String(p.an).trim() === targetAN;
                });
                
                if (found) {
                    this.patient = found;
                    console.log("Found Patient Data:", found);
                } else {
                    this.showAlert("ไม่พบผู้ป่วย", `ไม่พบเลข AN: ${targetAN} ในฐานข้อมูลทะเบียนผู้ป่วยปัจจุบัน`);
                }
            } catch (e) {
                console.error("Fetch Error:", e);
                this.showAlert("Error", "ไม่สามารถเชื่อมต่อฐานข้อมูลได้ โปรดตรวจสอบอินเทอร์เน็ต");
            }
            this.isLoading = false;
        },

        selectForm(form) {
            this.currentForm = form;
            this.viewMode = 'preview';
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
            this.showConfirm("ยืนยันการลบ", "ต้องการนำแบบฟอร์มเพิ่มเติมนี้ออกจากชาร์ตชั่วคราวหรือไม่?", () => {
                this.activeForms = this.activeForms.filter(f => f.id !== id);
                if (this.currentForm.id === id) this.currentForm = this.activeForms[0];
            });
        },

        showAlert(title, msg) { this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'ตกลง', onConfirm: null }; },
        showConfirm(title, msg, onConfirm) { this.dialog = { show: true, type: 'confirm', title, msg, confirmBtnText: 'ยืนยัน', onConfirm }; },
        handleDialogConfirm() { if (this.dialog.onConfirm) this.dialog.onConfirm(); this.dialog.show = false; }
    };
}
