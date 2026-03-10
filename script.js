/**
 * IPD Nurse Workbench - Frontend Logic (Alpine.js)
 * จัดการตรรกะการทำงานทั้งหมดของระบบทะเบียนผู้ป่วยและแบบประเมินพยาบาล
 */

function nurseApp() {
    return {
        // --- 1. CONFIG & STATE ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', // 'list', 'detail', 'chart'
        isEditing: false,

        selectedPatient: null,
        currentForm: null, // ฟอร์มที่กำลังเปิดในส่วน Chart
        
        // ข้อมูลพยาบาลและตำแหน่ง (ดึงจากชีต Staff)
        nurseList: [],
        bradenScore: 0,
        bradenRisk: '',

        // รายการฟอร์มมาตรฐาน
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

        // ฟอร์มเพิ่มเติม
        extraOptions: [
            { id: 'stress_assess', title: 'แบบประเมินความเครียด' },
            { id: 'pre_endo_prep', title: 'แบบเตรียมผู้ป่วยก่อนส่องกล้อง' },
            { id: 'pre_op_prep', title: 'แบบเตรียมผู้ป่วยก่อนผ่าตัด' },
            { id: 'home_care_transfer', title: 'แบบบันทึกส่งต่อเพื่อการดูแลต่อเนื่องที่บ้าน' }
        ],

        // State สำหรับ Modals
        showMoveModal: false,
        moveBeds: [], 
        moveForm: { targetWard: '', targetBed: '' },
        showSuccess: false,
        successMsg: '',
        dialog: { show: false, type: 'alert', title: '', msg: '', input: '', confirmBtnText: 'ตกลง', onConfirm: null },
        
        // ข้อมูลพื้นฐานจากระบบ
        wards: [], 
        patients: [], 
        doctors: [], 
        availableBeds: [], 
        configs: { depts: [] },
        showAdmitModal: false,
        searchHN: '', 
        searchAN: '', 
        searchName: '', 
        searchDoc: '',

        // ข้อมูลฟอร์ม Admission
        form: {
            dobInput: '', dob: '', ageDisplay: '', date: '', time: '', 
            receivedFrom: 'ER', referFrom: '', bed: '', hn: '', an: '', 
            name: '', address: '', dept: '', cc: '', pi: '', dx: '', doctor: '', ward: ''
        },

        // --- 2. INITIALIZATION ---
        init() {
            this.startClock();
            this.loadInitialData();
            this.fetchStaff();
        },

        startClock() {
            const update = () => {
                const now = new Date();
                this.realTimeClock = now.toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            };
            update();
            setInterval(update, 1000);
        },

        // --- 3. GETTERS (REACTIVE) ---
        get patientSummary() {
            if (!this.patients.length) return { total: 0, deptStr: 'ยังไม่มีข้อมูลผู้ป่วย' };
            const counts = this.patients.reduce((acc, p) => {
                const d = p.dept || 'ไม่ระบุ';
                acc[d] = (acc[d] || 0) + 1;
                return acc;
            }, {});
            const total = this.patients.length;
            const deptStr = Object.entries(counts).map(([n, c]) => `${n} ${c} ราย`).join(' • ');
            return { total, deptStr };
        },

        get filteredPatients() {
            return this.patients.filter(p => 
                (p.hn || '').toLowerCase().includes(this.searchHN.toLowerCase()) &&
                (p.an || '').toLowerCase().includes(this.searchAN.toLowerCase()) &&
                (p.name || '').toLowerCase().includes(this.searchName.toLowerCase()) &&
                (p.doctor || '').toLowerCase().includes(this.searchDoc.toLowerCase())
            );
        },

        // --- 4. CORE DATA ACTIONS ---
        async loadInitialData() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await res.json();
                this.wards = data.wards || [];
                this.configs.depts = data.depts || [];
                this.doctors = data.doctors || [];
            } catch (e) { 
                console.error("Initialization error", e); 
            }
            this.isLoading = false;
        },

        async fetchStaff() {
            try {
                const res = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'getStaff' })
                });
                this.nurseList = await res.json();
            } catch (e) { console.error("Staff load error", e); }
        },

        async selectWard(ward) {
            this.currentWard = ward;
            this.viewMode = 'list';
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getPatients&ward=${ward}`);
                this.patients = await res.json();
            } catch (e) { 
                this.patients = []; 
                console.error("Fetch patients error", e);
            }
            this.isLoading = false;
        },

        // --- 5. NURSING CHART & ASSESSMENT LOGIC ---
        openNursingChart(p) {
            this.selectedPatient = p;
            this.currentForm = this.activeForms[0]; // เริ่มต้นที่แบบประเมินแรกรับ
            this.viewMode = 'chart';
            this.bradenScore = 0;
            this.bradenRisk = '';
            window.scrollTo(0, 0);
        },

        calculateBraden() {
            const form = document.getElementById('assessment-form');
            if (!form) return;
            const formData = new FormData(form);
            let total = 0;
            const metrics = ['Sensory', 'Moisture', 'Activity', 'Mobility', 'Nutrition', 'Friction'];
            
            metrics.forEach(key => {
                const val = formData.get(`Braden_${key}`);
                if (val && val !== "0") total += parseInt(val);
            });

            this.bradenScore = total;
            
            if (total === 0) this.bradenRisk = '';
            else if (total <= 12) this.bradenRisk = 'เสี่ยงสูงมาก (High Risk)';
            else if (total <= 14) this.bradenRisk = 'เสี่ยงสูง (Moderate Risk)';
            else if (total <= 18) this.bradenRisk = 'เสี่ยงปานกลาง/ต่ำ (Mild Risk)';
            else this.bradenRisk = 'ปกติ (No Risk)';
        },

        updateAssessor(e) {
            const name = e.target.value;
            const nurse = this.nurseList.find(n => n.name === name);
            const posInput = document.getElementById('assessor-position-display');
            if (nurse && posInput) {
                posInput.value = nurse.position;
            }
        },

        async submitAssessment() {
            const form = document.getElementById('assessment-form');
            if (!form) return;
            
            this.isLoading = true;
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            
            // เพิ่ม Metadata ที่จำเป็น
            payload.AN = this.selectedPatient.an;
            payload.HN = this.selectedPatient.hn;
            payload.PatientName = this.selectedPatient.name;
            payload.Braden_Total = this.bradenScore;
            payload.Braden_Risk_Level = this.bradenRisk;

            try {
                // ส่งข้อมูลด้วย POST saveAssessment
                const res = await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({ action: 'saveAssessment', payload })
                });
                
                this.successMsg = "บันทึกแบบประเมิน FR-IPD-004 เรียบร้อย";
                this.showSuccess = true;
                setTimeout(() => { this.showSuccess = false; }, 3000);
            } catch (e) {
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },

        // --- 6. ADMISSION & CORE MANAGEMENT ---
        async openAdmitForm() {
            this.isEditing = false;
            this.resetAdmitForm();
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                this.availableBeds = await res.json();
                this.form.date = new Date().toISOString().split('T')[0];
                this.form.time = new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
                this.showAdmitModal = true;
            } catch (e) { 
                alert("โหลดข้อมูลเตียงล้มเหลว"); 
            }
            this.isLoading = false;
        },

        async submitAdmit() {
            this.isLoading = true;
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            const msg = this.isEditing ? "แก้ไขข้อมูลสำเร็จ" : "รับผู้ป่วยใหม่สำเร็จ";
            
            try {
                await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({ action, payload: this.form })
                });
                this.showAdmitModal = false;
                this.successMsg = msg;
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 2000);
                // รีโหลดข้อมูลรายชื่อ
                setTimeout(() => this.selectWard(this.currentWard), 1000);
            } catch (e) {
                alert("ดำเนินการล้มเหลว");
            } finally {
                this.isLoading = false;
            }
        },

        // --- 7. HELPERS ---
        resetAdmitForm() {
            this.form = { 
                dobInput: '', dob: '', ageDisplay: '', date: '', time: '', 
                receivedFrom: 'ER', referFrom: '', bed: '', hn: '', an: '', 
                name: '', address: '', dept: '', cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard 
            };
        },

        autoFormatDate(e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
            else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
            this.form.dobInput = v;
        },

        updateAgeFromText() {
            const input = this.form.dobInput;
            if (!input || input.length < 10) return;
            const [d, m, yBE] = input.split('/').map(Number);
            const birth = new Date(yBE - 543, m - 1, d);
            const now = new Date();
            if (birth.toString() === 'Invalid Date') return;

            let yrs = now.getFullYear() - birth.getFullYear();
            let mos = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();

            if (days < 0) {
                mos--;
                days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            }
            if (mos < 0) {
                yrs--;
                mos += 12;
            }
            this.form.ageDisplay = `${yrs} ปี ${mos} เดือน ${days} วัน`;
            this.form.dob = input;
        },

        calculateLOS(dateStr) {
            if (!dateStr) return 0;
            const admitDate = new Date(dateStr);
            const today = new Date();
            const diffTime = Math.abs(today - admitDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays === 0 ? 1 : diffDays;
        },

        addForm(opt) {
            if (!this.activeForms.find(f => f.id === opt.id)) {
                this.activeForms.push({ ...opt, isMain: false });
            }
            this.currentForm = opt;
        },

        removeForm(id) {
            this.activeForms = this.activeForms.filter(f => f.id !== id);
            if (this.currentForm && this.currentForm.id === id) {
                this.currentForm = this.activeForms[0];
            }
        }
    };
}
