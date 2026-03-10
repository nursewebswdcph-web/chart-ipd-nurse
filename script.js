function nurseApp() {
    return {
        // --- 1. CONFIG & STATE ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list',
        isEditing: false,

        showMoveModal: false,
        moveBeds: [], 
        moveForm: { targetWard: '', targetBed: '' },

        showSuccess: false,
        successMsg: '',
        dialog: { show: false, type: 'alert', title: '', msg: '', input: '', confirmBtnText: 'ตกลง', onConfirm: null },
        
        wards: [], patients: [], doctors: [], availableBeds: [], configs: { depts: [] },
        showAdmitModal: false,
        searchHN: '', searchAN: '', searchName: '', searchDoc: '',

        form: {
            dobInput: '', dob: '', ageDisplay: '', date: '', time: '', 
            receivedFrom: 'ER', referFrom: '', bed: '', hn: '', an: '', 
            name: '', address: '', dept: '', cc: '', pi: '', dx: '', doctor: '', ward: ''
        },
        selectedPatient: null,

        // --- 2. INITIALIZATION ---
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

        // --- 3. GETTERS (SUMMARY) ---
        get patientSummary() {
            if (!this.patients || this.patients.length === 0) return { total: 0, deptStr: 'ยังไม่มีคนไข้ในระบบ' };
            const total = this.patients.length;
            const counts = this.patients.reduce((acc, p) => {
                const d = p.dept || 'ไม่ระบุ';
                acc[d] = (acc[d] || 0) + 1;
                return acc;
            }, {});
            const deptStr = Object.entries(counts).map(([n, c]) => `${n} ${c}`).join(' • ');
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

        // --- 4. CORE FETCHING ---
        async loadInitialData() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await res.json();
                this.wards = data.wards || [];
                this.configs.depts = data.depts || [];
                this.doctors = data.doctors || [];
            } catch (e) { 
                console.error("Initial Load Error", e); 
                this.wards = ['ปาริฉัตร', 'สงฆ์อาพาธ']; 
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
            } catch (e) { this.patients = []; }
            this.isLoading = false;
        },

        async fetchAvailableBeds() {
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                this.availableBeds = await res.json();
            } catch (e) { this.availableBeds = []; }
        },

        // --- 5. ADMISSION & EDIT ---
        async openAdmitForm() {
            this.isLoading = true;
            this.isEditing = false;
            this.resetForm();
            try {
                await this.fetchAvailableBeds();
                this.form.ward = this.currentWard;
                this.form.date = new Date().toISOString().split('T')[0];
                this.form.time = new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
                this.showAdmitModal = true;
            } catch (e) { this.showAlert("Error", "โหลดข้อมูลล้มเหลว"); }
            this.isLoading = false;
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
            } catch (e) { this.showAlert("Error", "โหลดข้อมูลไม่สำเร็จ"); }
            this.isLoading = false;
        },

        async submitAdmit() {
            if (!this.form.bed || !this.form.hn || !this.form.an) {
                this.showAlert("ข้อมูลไม่ครบ", "กรุณาระบุเตียง, HN และ AN");
                return;
            }
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            const msg = this.isEditing ? "อัปเดตเวชระเบียนเรียบร้อย" : "รับผู้ป่วยใหม่สำเร็จ";
            await this.postToGAS(action, this.form, msg);
            this.showAdmitModal = false;
        },

        // --- 6. TRANSFER & DISCHARGE ---
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
            await this.postToGAS('movePatient', payload, "ย้ายตำแหน่งผู้ป่วยสำเร็จ");
            this.showMoveModal = false;
            this.viewMode = 'list';
        },

        async dischargePatient() {
            this.showConfirm("ยืนยันการจำหน่าย", `ต้องการ Discharge คุณ ${this.selectedPatient.name} หรือไม่?`, async () => {
                const p = { an: this.selectedPatient.an, bed: this.selectedPatient.bed, ward: this.currentWard };
                await this.postToGAS('discharge', p, "จำหน่ายผู้ป่วยสำเร็จ");
                this.viewMode = 'list';
            });
        },

        // --- 7. UTILITIES ---
        openNursingChart(an) { window.open(`chart.html?an=${an}`, '_blank'); },

        async postToGAS(action, payload, msg) {
            this.isLoading = true;
            try {
                await fetch(this.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action, payload }) });
                this.successMsg = msg;
                this.showSuccess = true;
                setTimeout(() => { this.showSuccess = false; }, 3000);
                setTimeout(async () => { await this.fetchPatients(); this.isLoading = false; }, 1500);
            } catch (e) { this.isLoading = false; this.showAlert("Error", "การเชื่อมต่อขัดข้อง"); }
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
            const d = Math.floor(Math.abs(new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
            return d === 0 ? 1 : d;
        },

        showAlert(title, msg) { this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'ตกลง' }; },
        showConfirm(title, msg, onConfirm) { this.dialog = { show: true, type: 'confirm', title, msg, confirmBtnText: 'ยืนยัน', onConfirm }; },
        handleDialogConfirm() { if (this.dialog.onConfirm) this.dialog.onConfirm(); this.dialog.show = false; },
        openPatientDetail(p) { this.selectedPatient = p; this.viewMode = 'detail'; },
        resetForm() {
            this.form = { dobInput: '', dob: '', ageDisplay: '', date: '', time: '', receivedFrom: 'ER', referFrom: '', bed: '', hn: '', an: '', name: '', address: '', dept: this.configs.depts[0] || '', cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard };
        },
        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) { this.doctors.push(name); this.form.doctor = name; this.postToGAS('addDoctor', { name: name }, "เพิ่มชื่อแพทย์แล้ว"); }
        }
    };
}
