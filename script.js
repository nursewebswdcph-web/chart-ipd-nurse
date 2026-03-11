function nurseApp() {
    return {
        // --- 1. CONFIG & STATE ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', 
        isEditing: false,
        nurses: [],

        selectedPatient: null,
        currentForm: null, 
        showAssessmentPreview: false, // ควบคุมการสลับหน้าฟอร์ม/พรีวิว
        savedAssessment: null,        // เก็บข้อมูลที่พึ่งบันทึกเพื่อแสดงในพรีวิว
        
        
        isSidebarCollapsed: false, // สถานะการพับ Sidebar
        
        activeForms: [
            { id: 'assess_initial', title: '1. แบบประเมินประวัติและสมรรถนะผู้ป่วยแรกรับ', icon: 'fa-clipboard-user', isMain: true },
            { id: 'patient_class', title: '2. แบบบันทึกการจำแนกประเภทผู้ป่วย', icon: 'fa-user-tag', isMain: true },
            { id: 'fall_risk', title: '3. แบบประเมินความเสี่ยงพลัดตหกล้ม Morse / MAAS', icon: 'fa-person-falling', isMain: true },
            { id: 'braden_scale', title: '4. แบบประเมินแผลกดทับ (Braden Scale)', icon: 'fa-bed', isMain: true },
            { id: 'patient_edu', title: '5. แบบบันทึกการให้คำแนะนำระหว่างเข้ารับการรักษาและเมื่อจำหน่าย', icon: 'fa-chalkboard-user', isMain: true },
            { id: 'focus_list', title: '6. แบบบันทึกรายการปัญหาสุขภาพ (Focus List)', icon: 'fa-list-check', isMain: true },
            { id: 'progress_note', title: '7. แบบบันทึกความก้าวหน้าทางการพยาบาล Nursing Progress Note', icon: 'fa-notes-medical', isMain: true },
            { id: 'discharge_summary', title: '8. แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย', icon: 'fa-door-open', isMain: true }
        ],

        extraOptions: [],
        showMoveModal: false,
        moveBeds: [], 
        moveForm: { targetWard: '', targetBed: '' },
        showSuccess: false,
        successMsg: '',
        dialog: { show: false, type: 'alert', title: '', msg: '', input: '', confirmBtnText: 'ตกลง', onConfirm: null },
        wards: [], patients: [], doctors: [], availableBeds: [], configs: { depts: [] },
        showAdmitModal: false,
        searchHN: '', searchAN: '', searchName: '', searchDoc: '', searchNurse: '', showNurseList: false,

        form: {
            date: '', time: '', ward: '', bed: '', 
            receivedFrom: 'ER', referFrom: '', 
            hn: '', an: '', name: '', address: '', 
            dobInput: '', dob: '', ageDisplay: '', 
            dept: '', cc: '', pi: '', dx: '', doctor: '', 
            status: 'Active'
        },

        init() {
            this.startClock();
            this.loadInitialData();
        },

        startClock() {
            const update = () => {
                this.realTimeClock = new Date().toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            };
            update();
            setInterval(update, 1000);
        },

        get patientSummary() {
            if (!this.patients || this.patients.length === 0) return { total: 0, deptStr: 'ยังไม่มีข้อมูลผู้ป่วย' };
            const total = this.patients.length;
            const counts = this.patients.reduce((acc, p) => {
                const d = p.dept || 'ไม่ระบุ';
                acc[d] = (acc[d] || 0) + 1;
                return acc;
            }, {});
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
        get filteredNurses() {
            // 1. ป้องกัน Error กรณีโหลดข้อมูลจากชีตไม่สำเร็จ
            if (!this.nurses || !Array.isArray(this.nurses)) return [];
            
            // 2. ถ้าช่องค้นหาว่าง ให้แสดงรายชื่อพยาบาลทั้งหมดเลย
            if (!this.searchNurse) return this.nurses;
        
            // 3. กรองข้อมูลตามตัวอักษรที่พิมพ์
            const term = this.searchNurse.toString().toLowerCase();
            return this.nurses.filter(n => 
                n && n.name && n.name.toString().toLowerCase().includes(term)
            );
        },

        async loadInitialData() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await res.json();
                this.wards = data.wards || [];
                this.configs.depts = data.depts || [];
                this.doctors = data.doctors || [];
                this.nurses = data.nurses || [];
            } catch (e) { console.error("Initialization error", e); }
            this.isLoading = false;
        },

        async selectWard(ward) {
            this.currentWard = ward;
            this.viewMode = 'list';
            await this.fetchPatients();
        },

        async fetchPatients() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getPatients&ward=${this.currentWard}`);
                this.patients = await res.json();
            } catch (e) { this.patients = []; }
            this.isLoading = false;
        },

        openNursingChart(patient) {
            this.selectedPatient = patient;
            this.currentForm = this.activeForms.find(f => f.id === 'assess_initial');
            this.viewMode = 'chart';
            window.scrollTo(0, 0);
            this.$nextTick(() => {
                const formElement = document.getElementById('assessment-form-v2');
                if (formElement) {
                    formElement.reset(); // ล้างฟอร์มก่อน
                    
                    // นำข้อมูลลงทะเบียนแรกรับ มาใส่ในฟอร์ม เพื่อให้สามารถแก้ไขได้
                    if (formElement.elements['AdmitDate']) formElement.elements['AdmitDate'].value = patient.date || '';
                    if (formElement.elements['AdmitTime']) formElement.elements['AdmitTime'].value = patient.time || '';
                    if (formElement.elements['AdmittedFrom']) formElement.elements['AdmittedFrom'].value = patient.receivedFrom || '';
                    if (formElement.elements['Refer']) formElement.elements['Refer'].value = patient.referFrom || '';
                    if (formElement.elements['ChiefComplaint']) formElement.elements['ChiefComplaint'].value = patient.cc || '';
                    if (formElement.elements['PresentIllness']) formElement.elements['PresentIllness'].value = patient.pi || '';
                }
            });
        },

        async saveAssessmentData() {
            const formElement = document.getElementById('assessment-form-v2');
            if (!formElement) return this.showAlert('Error', 'ไม่พบฟอร์มข้อมูล');
        
            // โหลดข้อมูลดิบทั้งหมดจากฟอร์ม
            const formData = new FormData(formElement);
            const data = {};
        
            // 1. จัดการข้อมูลให้รองรับ Checkbox ที่ติ๊กได้หลายข้อ (Multi-select)
            formData.forEach((value, key) => {
                if (!data[key]) {
                    data[key] = value;
                    return;
                }
                // ถ้าเป็น Array อยู่แล้ว ก็ยัดเพิ่ม ถ้าไม่ ให้แปลงเป็น Array ก่อน
                if (!Array.isArray(data[key])) {
                    data[key] = [data[key]];
                }
                data[key].push(value);
            });
        
            // 2. แปลง Array เป็น String ด้วยคอมม่า
            for (let key in data) {
                if (Array.isArray(data[key])) {
                    data[key] = data[key].join(', ');
                }
            }
        
            // 3. เตรียมข้อมูลส่งขึ้นเซิร์ฟเวอร์
            const payload = {
                an: this.selectedPatient?.an,
                hn: this.selectedPatient?.hn,
                patientName: this.selectedPatient?.name,
                ward: this.currentWard,
                formData: data,
                bradenScore: document.getElementById('braden-total')?.innerText || "0",
                bradenInterpretation: document.getElementById('braden-result')?.innerText || "ไม่ได้ประเมิน"
            };
        
            // 4. ส่งไป GAS
            try {
                await this.postToGAS('saveAssessmentInitial', payload, "บันทึกแบบประเมินแรกรับ (FR-IPD-004) สำเร็จ");
                
                // --- สิ่งที่แก้ไขเพิ่มเติม ---
                // เมื่อบันทึกสำเร็จ ให้เก็บข้อมูลลง savedAssessment และเปิดหน้าพรีวิว
                this.savedAssessment = { ...data, 
                    PatientName: this.selectedPatient?.name,
                    HN: this.selectedPatient?.hn,
                    AN: this.selectedPatient?.an,
                    Bed: this.selectedPatient?.bed,
                    Date: this.selectedPatient?.date,
                    Time: this.selectedPatient?.time
                };
                this.showAssessmentPreview = true; 
                window.scrollTo(0, 0);
        
            } catch (error) {
                this.showAlert('Error', 'เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
            }
        },
        async openAdmitForm() {
            this.isLoading = true;
            this.isEditing = false;
            this.resetForm();
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                this.availableBeds = await res.json();
                this.form.date = new Date().toISOString().split('T')[0];
                this.form.time = new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
                this.showAdmitModal = true;
            } catch (e) { this.showAlert("Error", "โหลดเตียงว่างไม่สำเร็จ"); }
            this.isLoading = false;
        },

        async openEditForm() {
            if (!this.selectedPatient) return;
            this.isLoading = true;
            this.isEditing = true;
            
            try {
                // คัดลอกข้อมูลจากคนไข้ที่เลือกมาใส่ฟอร์ม
                this.form = { ...this.selectedPatient };
                
                // จัดการรูปแบบวันเกิดให้แสดงผลในช่องกรอก (ถ้ามีข้อมูล)
                if (this.selectedPatient.dob) {
                    const dateObj = new Date(this.selectedPatient.dob);
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const y = dateObj.getFullYear() + 543;
                    this.form.dobInput = `${d}/${m}/${y}`;
                }
        
                // โหลดเตียงว่าง และเพิ่มเตียงปัจจุบันของคนไข้เข้าไปในตัวเลือกด้วย
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                this.availableBeds = await res.json();
                if (!this.availableBeds.includes(this.selectedPatient.bed)) {
                    this.availableBeds.unshift(this.selectedPatient.bed);
                }
                
                this.showAdmitModal = true;
            } catch (e) {
                this.showAlert("Error", "ไม่สามารถโหลดข้อมูลเพื่อแก้ไขได้");
            } finally {
                this.isLoading = false;
            }
        },

        async submitAdmit() {
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            const msg = this.isEditing ? "อัปเดตข้อมูลผู้ป่วยสำเร็จ" : "รับผู้ป่วยใหม่เข้าตึกสำเร็จ";
            await this.postToGAS(action, this.form, msg);
            this.showAdmitModal = false;
        },

        async openMoveModal() {
            this.moveForm.targetWard = this.currentWard; 
            this.moveForm.targetBed = '';
            await this.fetchMoveBeds();
            this.showMoveModal = true;
        },

        async fetchMoveBeds() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.moveForm.targetWard}`);
                this.moveBeds = await res.json();
            } catch (e) { this.moveBeds = []; }
            this.isLoading = false;
        },

        async confirmMove() {
            const payload = { an: this.selectedPatient.an, oldWard: this.currentWard, oldBed: this.selectedPatient.bed, newWard: this.moveForm.targetWard, newBed: this.moveForm.targetBed };
            await this.postToGAS('movePatient', payload, "ย้ายตำแหน่งผู้ป่วยเรียบร้อย");
            this.showMoveModal = false;
            this.viewMode = 'list';
        },

        async dischargePatient() {
            this.showConfirm("ยืนยันการ Discharge", `ต้องการจำหน่ายคุณ ${this.selectedPatient.name} ออกจากตึกใช่หรือไม่?`, async () => {
                const p = { an: this.selectedPatient.an, bed: this.selectedPatient.bed, ward: this.currentWard };
                await this.postToGAS('discharge', p, "Discharge ผู้ป่วยเรียบร้อยแล้ว");
                this.viewMode = 'list';
            });
        },

        async postToGAS(action, payload, msg) {
            this.isLoading = true;
            try {
                await fetch(this.API_URL, { 
                    method: 'POST', 
                    mode: 'no-cors', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, payload }) 
                });
                this.successMsg = msg;
                this.showSuccess = true;
                setTimeout(() => { this.showSuccess = false; }, 3000);
                setTimeout(async () => { await this.fetchPatients(); this.isLoading = false; }, 1000);
            } catch (e) { 
                this.isLoading = false; 
                this.showAlert("Error", "ไม่สามารถบันทึกข้อมูลได้: " + e.message); 
            }
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
        
            try {
                const [d, m, yBE] = input.split('/').map(Number);
                const yAD = yBE - 543; // แปลง พ.ศ. เป็น ค.ศ.
                const birthDate = new Date(yAD, m - 1, d);
                const today = new Date();
        
                if (isNaN(birthDate.getTime())) throw new Error();
        
                let years = today.getFullYear() - birthDate.getFullYear();
                let months = today.getMonth() - birthDate.getMonth();
                let days = today.getDate() - birthDate.getDate();
        
                if (days < 0) {
                    months--;
                    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
                }
                if (months < 0) {
                    years--;
                    months += 12;
                }
        
                this.form.ageDisplay = `${years} ปี ${months} เดือน ${days} วัน`;
                this.form.dob = `${yAD}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            } catch (e) {
                this.form.ageDisplay = "รูปแบบวันที่ไม่ถูกต้อง";
            }
        },

        calculateLOS(date) {
            if(!date) return 0;
            const entryDate = new Date(date);
            const today = new Date();
            entryDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            const diffDays = Math.ceil(Math.abs(today - entryDate) / (1000 * 60 * 60 * 24)); 
            return diffDays === 0 ? 1 : diffDays;
        },

        showAlert(title, msg) { this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'ตกลง' }; },
        showConfirm(title, msg, onConfirm) { this.dialog = { show: true, type: 'confirm', title, msg, confirmBtnText: 'ยืนยัน', onConfirm }; },
        handleDialogConfirm() { if (this.dialog.onConfirm) this.dialog.onConfirm(); this.dialog.show = false; },
        // ใน script.js (ตรวจสอบให้แน่ใจว่ามีส่วนนี้)
        openPatientDetail(p) {
            if (!p) return;
            this.selectedPatient = p;
            this.viewMode = 'detail';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        
        resetForm() {
            this.form = {
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                ward: this.currentWard,
                bed: '', receivedFrom: 'ER', referFrom: '',
                hn: '', an: '', name: '', address: '',
                dobInput: '', dob: '', ageDisplay: '',
                dept: '', cc: '', pi: '', dx: '', doctor: '',
                status: 'Active'
            };
        },

        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) { this.doctors.push(name); this.form.doctor = name; }
        },

        selectForm(form) { this.currentForm = form; },
        
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
        },
        // ฟังก์ชันคำนวณคะแนน Braden Scale อัตโนมัติ
        calculateBradenInForm() {
            let total = 0;
            const inputs = document.querySelectorAll('.braden-input');
            inputs.forEach(select => {
                total += parseInt(select.value) || 0;
            });
            
            const display = document.getElementById('braden-total-display');
            if (display) {
                display.innerText = total;
                // เปลี่ยนสีตามความเสี่ยง
                if (total <= 12) display.className = 'text-2xl font-black text-red-600 ml-2 animate-bounce';
                else if (total <= 18) display.className = 'text-2xl font-black text-orange-500 ml-2';
                else display.className = 'text-2xl font-black text-emerald-600 ml-2';
            }
        },
         // ฟังก์ชันสำหรับคำนวณคะแนน Braden Scale และแปลผลอัตโนมัติ
        calculateBradenScore() {
            const params = ['Sensory', 'Moisture', 'Activity', 'Mobility', 'Nutrition', 'Friction'];
            let total = 0;
            
            params.forEach(p => {
                const selected = document.querySelector(`input[name="Braden_${p}"]:checked`);
                if (selected) total += parseInt(selected.value);
            });
        
            const display = document.getElementById('braden-total');
            const result = document.getElementById('braden-result');
            
            if (display) {
                display.innerText = total;
                // แปลผลตามเกณฑ์
                let interpretation = "";
                let colorClass = "";
                
                if (total === 0) {
                    interpretation = "";
                } else if (total <= 9) {
                    interpretation = "Very high risk";
                    colorClass = "text-red-600";
                } else if (total <= 12) {
                    interpretation = "High risk";
                    colorClass = "text-orange-600";
                } else if (total <= 14) {
                    interpretation = "Moderate risk";
                    colorClass = "text-amber-600";
                } else {
                    interpretation = "Low risk";
                    colorClass = "text-emerald-600";
                }
                
                result.innerText = interpretation;
                display.className = `text-3xl font-black ${colorClass}`;
            }
        },
        hasVal(key, value) {
            const data = this.savedAssessment?.[key];
            if (!data) return false;
            if (value === undefined) return !!data; // ถ้าแค่เช็คว่ามีคีย์นี้ไหม
            return data.toString().includes(value); // เช็คว่าในข้อความมีค่านั้นไหม (รองรับ Checkbox หลายอัน)
        }
    };
}
