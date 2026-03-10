function nurseApp() {
    return {
        // --- 1. State & Configurations ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', // 'list' หรือ 'detail'
        isEditing: false,

        // ระบบ Universal Smart Dialog (แจ้งเตือนสวยงาม)
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
            dobInput: '', // สำหรับพิมพ์ วว/ดด/พศ
            dob: '',      // ค่าที่จะบันทึกลง Sheet (พ.ศ.)
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

        // --- 3. Getters (Calculated Properties) ---
        get patientSummary() {
            if (!this.patients || this.patients.length === 0) {
                return { total: 0, deptStr: 'ไม่มีข้อมูลผู้ป่วย' };
            }
            const total = this.patients.length;
            const counts = this.patients.reduce((acc, p) => {
                const dName = p.dept || 'ไม่ระบุแผนก';
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
            this.dialog = { show: true, type: 'alert', title, msg, confirmBtnText: 'รับทราบ', onConfirm: null };
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
            } catch (e) {
                this.patients = [];
            }
            this.isLoading = false;
        },

        async fetchAvailableBeds() {
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                const data = await res.json();
                this.availableBeds = data || [];
            } catch (e) {
                this.availableBeds = [];
                throw e;
            }
        },

        // --- 6. Form Management (Admit & Edit) ---
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
                this.showAlert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลเตียงได้");
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
                this.showAlert("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลแก้ไขได้");
            } finally {
                this.isLoading = false;
            }
        },

        async submitAdmit() {
            if (!this.form.bed || !this.form.hn || !this.form.an) {
                this.showAlert("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลสำคัญให้ครบถ้วน");
                return;
            }
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            const msg = this.isEditing ? 'แก้ไขข้อมูลผู้ป่วยสำเร็จ' : 'บันทึกการรับผู้ป่วยใหม่สำเร็จ';
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
                setTimeout(async () => {
                    await this.fetchPatients();
                    this.isLoading = false;
                }, 1500);
            } catch (e) {
                this.showAlert("เกิดข้อผิดพลาด", "การเชื่อมต่อขัดข้อง: " + e.message);
                this.isLoading = false;
            }
        },

        async dischargePatient() {
            this.showConfirm(
                "ยืนยันการจำหน่าย", 
                `ต้องการ Discharge คุณ ${this.selectedPatient.name} ใช่หรือไม่?`,
                async () => {
                    const payload = { an: this.selectedPatient.an, bed: this.selectedPatient.bed, ward: this.currentWard };
                    await this.postToGAS('discharge', payload, "จำหน่ายผู้ป่วยและคืนสถานะเตียงว่างเรียบร้อย");
                    this.viewMode = 'list';
                }
            );
        },

        async moveBed() {
            this.showPrompt(
                "ย้ายเตียงผู้ป่วย", 
                `ระบุเลขเตียงใหม่สำหรับ คุณ ${this.selectedPatient.name}`,
                async (newBedValue) => {
                    if (!newBedValue) return;
                    const payload = { an: this.selectedPatient.an, oldBed: this.selectedPatient.bed, newBed: newBedValue, ward: this.currentWard };
                    await this.postToGAS('moveBed', payload, "ย้ายเตียงผู้ป่วยเรียบร้อยแล้ว");
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
            if (birth.toString() === 'Invalid Date') {
                this.showAlert("วันที่ไม่ถูกต้อง", "กรุณาตรวจสอบรูปแบบ วัน/เดือน/ปีพ.ศ.");
                return;
            }
            let yrs = now.getFullYear() - birth.getFullYear();
            let mos = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();
            if (days < 0) { mos--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
            if (mos < 0) { yrs--; mos += 12; }
            this.form.ageDisplay = `${yrs} ปี ${mos} เดือน ${days} วัน`;
            this.form.dob = input;
        },

        calculateLOS(admitDateStr) {
            if (!admitDateStr) return 0;
            try {
                const admitDate = new Date(admitDateStr);
                const now = new Date();
                const diffTime = Math.abs(now - admitDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return diffDays === 0 ? 1 : diffDays;
            } catch (e) { return 0; }
        },

        openPatientDetail(p) {
            this.selectedPatient = p;
            this.viewMode = 'detail';
        },

        resetForm() {
            this.form = {
                dobInput: '', dob: '', ageDisplay: '',
                date: '', time: '', receivedFrom: 'ER', referFrom: '',
                bed: '', hn: '', an: '', name: '', address: '',
                dept: (this.configs.depts && this.configs.depts.length > 0) ? this.configs.depts[0] : '', 
                cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard
            };
        },

        addNewDoctor() {
            this.showPrompt("เพิ่มรายชื่อแพทย์", "กรุณาระบุ ชื่อ-นามสกุล ของแพทย์", async (name) => {
                if (name) {
                    this.doctors.push(name);
                    this.form.doctor = name;
                    await this.postToGAS('addDoctor', { name: name }, "เพิ่มรายชื่อแพทย์ลงฐานข้อมูลแล้ว");
                }
            });
        }
    };
}
