function nurseApp() {
    return {
        // --- 1. State ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', 
        isEditing: false,

        // ย้ายเตียง/ย้ายตึก
        showMoveModal: false,
        moveBeds: [], 
        moveForm: { targetWard: '', targetBed: '' },

        // ระบบแจ้งเตือน & Dialog
        dialog: { show: false, type: 'alert', title: '', msg: '', confirmBtnText: 'ตกลง', onConfirm: null },
        
        // Data Storage
        wards: [], patients: [], doctors: [], availableBeds: [], configs: { depts: [] },
        showAdmitModal: false,
        searchHN: '', searchAN: '', searchName: '', searchDoc: '',

        form: {
            dobInput: '', dob: '', ageDisplay: '', date: '', time: '', 
            receivedFrom: 'ER', referFrom: '', bed: '', hn: '', an: '', 
            name: '', address: '', dept: '', cc: '', pi: '', dx: '', doctor: '', ward: ''
        },
        selectedPatient: null,

        // --- 2. Initialization ---
        init() {
            this.startClock();
            this.loadInitialData();
        },

        startClock() {
            setInterval(() => {
                this.realTimeClock = new Date().toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                });
            }, 1000);
        },

        // --- 3. Getters ---
        get patientSummary() {
            if (!this.patients || this.patients.length === 0) return { total: 0, deptStr: 'ยังไม่มีคนไข้ในตึกนี้' };
            const counts = this.patients.reduce((acc, p) => {
                const d = p.dept || 'ไม่ระบุ';
                acc[d] = (acc[d] || 0) + 1;
                return acc;
            }, {});
            const deptStr = Object.entries(counts).map(([n, c]) => `${n} ${c} ราย`).join(' • ');
            return { total: this.patients.length, deptStr };
        },

        get filteredPatients() {
            return this.patients.filter(p => 
                (p.hn || '').toLowerCase().includes(this.searchHN.toLowerCase()) &&
                (p.name || '').toLowerCase().includes(this.searchName.toLowerCase())
            );
        },

        // --- 4. Logic Functions ---
        async loadInitialData() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await res.json();
                this.wards = data.wards || [];
                this.configs.depts = data.depts || [];
                this.doctors = data.doctors || [];
            } catch (e) { console.error("Init failed", e); }
            this.isLoading = false;
        },

        async selectWard(ward) {
            this.currentWard = ward;
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

        openNursingChart(an) {
            window.open(`chart.html?an=${an}`, '_blank');
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
            const payload = {
                an: this.selectedPatient.an,
                oldWard: this.currentWard,
                oldBed: this.selectedPatient.bed,
                newWard: this.moveForm.targetWard,
                newBed: this.moveForm.targetBed
            };
            await this.postToGAS('movePatient', payload, "ย้ายตำแหน่งผู้ป่วยสำเร็จ");
            this.showMoveModal = false;
            this.viewMode = 'list';
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
            } catch (e) { this.showAlert("Error", "โหลดข้อมูลไม่สำเร็จ"); }
            this.isLoading = false;
        },

        async submitAdmit() {
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            await this.postToGAS(action, this.form, "บันทึกข้อมูลเรียบร้อยแล้ว");
            this.showAdmitModal = false;
        },

        async postToGAS(action, payload, msg) {
            this.isLoading = true;
            try {
                await fetch(this.API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ action, payload }) });
                this.showAlert("สำเร็จ", msg);
                setTimeout(async () => { await this.fetchPatients(); this.isLoading = false; }, 1500);
            } catch (e) { 
                this.isLoading = false; 
                this.showAlert("Error", "ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
            }
        },

        showAlert(title, msg) {
            this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'รับทราบ', onConfirm: null };
        },

        handleDialogConfirm() {
            if (this.dialog.onConfirm) this.dialog.onConfirm();
            this.dialog.show = false;
        },

        autoFormatDate(e) {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
            else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
            this.form.dobInput = v;
        },

        updateAgeFromText() {
            if (!this.form.dobInput || this.form.dobInput.length < 10) return;
            const [d, m, yBE] = this.form.dobInput.split('/').map(Number);
            const yAD = yBE - 543;
            const birth = new Date(yAD, m - 1, d);
            const now = new Date();
            let yrs = now.getFullYear() - birth.getFullYear();
            let mos = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();
            if (days < 0) { mos--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
            if (mos < 0) { yrs--; mos += 12; }
            this.form.ageDisplay = `${yrs} ปี ${mos} เดือน ${days} วัน`;
            this.form.dob = this.form.dobInput;
        },

        calculateLOS(dateStr) {
            if(!dateStr) return 0;
            const d = Math.floor(Math.abs(new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
            return d === 0 ? 1 : d;
        },

        openPatientDetail(p) { this.selectedPatient = p; this.viewMode = 'detail'; },
        resetForm() { this.form = { dobInput: '', dob: '', ageDisplay: '', date: '', time: '', bed: '', hn: '', an: '', name: '', dept: this.configs.depts[0] || '', ward: this.currentWard }; }
    };
}
