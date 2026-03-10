function nurseApp() {
    return {
        // --- 1. State & Configurations ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', 
        isEditing: false,

        // ย้ายเตียง
        showMoveModal: false,
        moveBeds: [], // เก็บรายชื่อเตียงสำหรับหน้าย้ายโดยเฉพาะ
        moveForm: {
            targetWard: '',
            targetBed: ''
        },

        // ระบบแจ้งเตือน (Success/Error)
        showSuccess: false,
        successMsg: '',
        
        // ระบบ Universal Dialog (สำหรับการยืนยัน)
        dialog: {
            show: false,
            type: 'alert', // alert, confirm, prompt
            title: '',
            msg: '',
            input: '',
            confirmBtnText: 'ตกลง',
            onConfirm: null
        },
        
        // Data Storage
        wards: [],
        patients: [],
        doctors: [],
        availableBeds: [],
        configs: { depts: [] },

        // UI Modals
        showAdmitModal: false,
        
        // Search Filter
        searchHN: '', searchAN: '', searchName: '', searchDoc: '',

        // Form Object
        form: {
            dobInput: '', 
            dob: '',      
            ageDisplay: '',
            date: '', 
            time: '', 
            receivedFrom: 'ER', 
            referFrom: '',
            bed: '', 
            hn: '', 
            an: '', 
            name: '', 
            address: '',
            dept: '', 
            cc: '', 
            pi: '', 
            dx: '', 
            doctor: '', 
            ward: ''
        },

        selectedPatient: null,

        // --- 2. Initialization ---
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

        // --- 3. Getters (สรุปยอดผู้ป่วย) ---
        get patientSummary() {
            if (!this.patients || this.patients.length === 0) {
                return { total: 0, deptStr: 'ยังไม่มีคนไข้ในตึกนี้' };
            }
            const total = this.patients.length;
            const counts = this.patients.reduce((acc, p) => {
                const dName = p.dept || 'ไม่ระบุ';
                acc[dName] = (acc[dName] || 0) + 1;
                return acc;
            }, {});
            const deptStr = Object.entries(counts)
                .map(([name, count]) => `${name} ${count} ราย`)
                .join(' • ');
            return { total, deptStr };
        },

        get filteredPatients() {
            return this.patients.filter(p => {
                return (p.hn || '').toLowerCase().includes(this.searchHN.toLowerCase()) &&
                       (p.an || '').toLowerCase().includes(this.searchAN.toLowerCase()) &&
                       (p.name || '').toLowerCase().includes(this.searchName.toLowerCase()) &&
                       (p.doctor || '').toLowerCase().includes(this.searchDoc.toLowerCase());
            });
        },

        // --- 4. Smart Dialog Helpers ---
        showAlert(title, msg) {
            this.successMsg = msg; // เพื่อความสอดคล้องกับ HTML เก่า
            this.showSuccess = true;
            // ตั้งปิดอัตโนมัติใน 3 วินาที
            setTimeout(() => { this.showSuccess = false; }, 3000);
        },
        showConfirm(title, msg, onConfirm) {
            this.dialog = { show: true, type: 'confirm', title, msg, confirmBtnText: 'ยืนยัน', onConfirm };
        },
        showPrompt(title, msg, onConfirm) {
            this.dialog = { show: true, type: 'prompt', title, msg, input: '', confirmBtnText: 'ตกลง', onConfirm };
        },
        handleDialogConfirm() {
            if (this.dialog.onConfirm) {
                this.dialog.onConfirm(this.dialog.input);
            }
            this.dialog.show = false;
        },

        // --- 5. Data Fetching ---
        async loadInitialData() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await res.json();
                this.wards = data.wards || [];
                this.configs.depts = data.depts || [];
                this.doctors = data.doctors || [];
            } catch (e) {
                console.error("Load Initial Data Failed:", e);
            }
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
            } catch (e) {
                this.patients = [];
            }
            this.isLoading = false;
        },

        async fetchAvailableBeds() {
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                this.availableBeds = await res.json();
            } catch (e) {
                this.availableBeds = [];
                throw e;
            }
        },

        // ✅ ฟังก์ชันเปิดหน้าเวชระเบียนใหม่ (Nursing Chart)
        openNursingChart(an) {
            // สร้าง URL โดยส่ง AN ไปด้วย (เช่น chart.html?an=12345)
            const chartUrl = `chart.html?an=${an}`;
            window.open(chartUrl, '_blank'); // '_blank' คือการเปิด Tab ใหม่
        },
    
        // ✅ ฟังก์ชันเปิด Modal ย้ายเตียง
        async openMoveModal() {
            this.moveForm.targetWard = this.currentWard; // ค่าเริ่มต้นเป็นตึกปัจจุบัน
            this.moveForm.targetBed = '';
            await this.fetchMoveBeds();
            this.showMoveModal = true;
        },
        // ✅ ดึงข้อมูลเตียงตามตึกที่เลือกในหน้าย้าย
        async fetchMoveBeds() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.moveForm.targetWard}`);
                this.moveBeds = await res.json();
            } catch (e) {
                this.moveBeds = [];
            }
            this.isLoading = false;
        },
    
        // ✅ ยืนยันการย้าย
        async confirmMove() {
            const payload = {
                an: this.selectedPatient.an,
                oldWard: this.currentWard,
                oldBed: this.selectedPatient.bed,
                newWard: this.moveForm.targetWard,
                newBed: this.moveForm.targetBed
            };
            
            // ส่งไปที่ Backend (ใช้ Action เดียวกันครอบคลุมทั้งย้ายเตียงและย้ายตึก)
            await this.postToGAS('movePatient', payload, "ทำการย้ายผู้ป่วยไปยังที่ใหม่เรียบร้อยแล้ว");
            this.showMoveModal = false;
            this.viewMode = 'list';
        }
    }

        // --- 6. Form Management ---
        async openAdmitForm() {
            this.isLoading = true; 
            this.isEditing = false;
            try {
                this.resetForm();
                this.form.ward = this.currentWard;
                this.form.date = new Date().toISOString().split('T')[0];
                this.form.time = new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
                await this.fetchAvailableBeds();
                this.showAdmitModal = true;
            } catch (error) {
                this.showAlert("Error", "ไม่สามารถโหลดข้อมูลเตียงได้");
            } finally {
                this.isLoading = false; 
            }
        },

        async openEditForm() {
            this.isLoading = true;
            this.isEditing = true;
            try {
                this.form = { ...this.selectedPatient };
                this.form.dobInput = this.selectedPatient.dob; 
                await this.fetchAvailableBeds();
                if (!this.availableBeds.includes(this.selectedPatient.bed)) {
                    this.availableBeds.unshift(this.selectedPatient.bed);
                }
                this.viewMode = 'list';
                this.showAdmitModal = true;
            } catch (e) {
                this.showAlert("Error", "ไม่สามารถโหลดข้อมูลแก้ไขได้");
            } finally {
                this.isLoading = false;
            }
        },

        async submitAdmit() {
            if (!this.form.bed || !this.form.hn || !this.form.an) {
                this.showAlert("ข้อมูลไม่ครบ", "กรุณากรอก HN/AN และเตียงให้ครบ");
                return;
            }
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            const msg = this.isEditing ? 'แก้ไขข้อมูลสำเร็จ' : 'บันทึกรับผู้ป่วยใหม่สำเร็จ';
            await this.postToGAS(action, this.form, msg);
            this.showAdmitModal = false;
        },

        // --- 7. Core Actions ---
        async postToGAS(action, payload, msg) {
            this.isLoading = true;
            try {
                await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: JSON.stringify({ action: action, payload: payload })
                });
                this.showAlert("สำเร็จ", msg);
                // รอข้อมูล Sync
                setTimeout(async () => {
                    await this.fetchPatients();
                    this.isLoading = false;
                }, 1500);
            } catch (e) {
                this.isLoading = false;
                this.showAlert("ผิดพลาด", "เชื่อมต่อฐานข้อมูลไม่ได้");
            }
        },

        async dischargePatient() {
            this.showConfirm(
                "ยืนยันการจำหน่าย", 
                `ต้องการ Discharge คุณ ${this.selectedPatient.name} ใช่หรือไม่?`,
                async () => {
                    const payload = { an: this.selectedPatient.an, bed: this.selectedPatient.bed, ward: this.currentWard };
                    await this.postToGAS('discharge', payload, "จำหน่ายผู้ป่วยเรียบร้อย");
                    this.viewMode = 'list';
                }
            );
        },

        async moveBed() {
            this.showPrompt(
                "ย้ายเตียง", 
                `ระบุเลขเตียงใหม่สำหรับ คุณ ${this.selectedPatient.name}`,
                async (newBedValue) => {
                    if (!newBedValue) return;
                    const payload = { an: this.selectedPatient.an, oldBed: this.selectedPatient.bed, newBed: newBedValue, ward: this.currentWard };
                    await this.postToGAS('moveBed', payload, "ย้ายเตียงสำเร็จ");
                }
            );
        },

        // --- 8. Utilities ---
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
            const parts = input.split('/');
            const [d, m, yBE] = parts.map(Number);
            const yAD = yBE - 543;
            const birth = new Date(yAD, m - 1, d);
            const now = new Date();
            
            if (birth.toString() === 'Invalid Date') return;

            let yrs = now.getFullYear() - birth.getFullYear();
            let mos = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();
            if (days < 0) { mos--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
            if (mos < 0) { yrs--; mos += 12; }
            
            this.form.ageDisplay = `${yrs} ปี ${mos} เดือน ${days} วัน`;
            this.form.dob = input;
        },

        calculateLOS(date) {
            if(!date) return 0;
            const diff = Math.abs(new Date() - new Date(date));
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            return days === 0 ? 1 : days;
        },

        openPatientDetail(p) {
            this.selectedPatient = p;
            this.viewMode = 'detail';
        },

        resetForm() {
            this.form = {
                dobInput: '', dob: '', ageDisplay: '', date: '', time: '',
                receivedFrom: 'ER', referFrom: '', bed: '', hn: '', an: '',
                name: '', address: '', 
                dept: (this.configs.depts && this.configs.depts.length > 0) ? this.configs.depts[0] : '',
                cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard
            };
        },

        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) {
                this.doctors.push(name);
                this.form.doctor = name;
                this.postToGAS('addDoctor', { name: name }, "เพิ่มชื่อแพทย์แล้ว");
            }
        }
    };
}
