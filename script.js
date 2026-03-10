function nurseApp() {
    return {
        // --- State & Configuration ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        
        // Data Lists
        wards: [],
        patients: [],
        doctors: [],
        availableBeds: [],
        configs: { depts: [] },

        // UI Modals & Views
        showAdmitModal: false,
        showEditModal: false,
        showMoveBedModal: false,
        showMoveWardModal: false,
        viewMode: 'list', // 'list' หรือ 'detail'
        
        // Search
        searchHN: '', searchAN: '', searchName: '', searchDoc: '',

        // Form Object (ใช้ร่วมกันทั้ง Admit และ Edit)
        form: {
            rowId: '', // สำหรับอ้างอิงตอนแก้ไข/ย้าย
            date: '', time: '', receivedFrom: 'ER', referFrom: '',
            bed: '', hn: '', an: '', name: '', address: '',
            dob: '', ageDisplay: '', dept: '', 
            cc: '', pi: '', dx: '', doctor: '', ward: ''
        },

        selectedPatient: null, // เก็บข้อมูลคนไข้ที่กำลังคลิกดู/จัดการ

        // --- 1. Initialization ---
        init() {
            this.startClock();
            this.loadInitialData(); // โหลดตึก, แผนก, แพทย์ เริ่มต้น
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

        async loadInitialData() {
            this.isLoading = true;
            try {
                // ดึงข้อมูล Config ทั้งหมดจาก GAS
                const response = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await response.json();
                this.wards = data.wards;
                this.configs.depts = data.depts;
                this.doctors = data.doctors;
            } catch (e) {
                console.error("Load Initial Data Failed", e);
            }
            this.isLoading = false;
        },

        // --- 2. Ward & Patient List Logic ---
        async selectWard(ward) {
            this.currentWard = ward;
            this.form.ward = ward;
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

        get filteredPatients() {
            return this.patients.filter(p => {
                return p.hn.toLowerCase().includes(this.searchHN.toLowerCase()) &&
                       p.an.toLowerCase().includes(this.searchAN.toLowerCase()) &&
                       p.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
                       p.doctor.toLowerCase().includes(this.searchDoc.toLowerCase());
            });
        },

        // --- 3. Admission Logic ---
        async openAdmitForm() {
            this.resetForm();
            this.form.date = new Date().toISOString().split('T')[0];
            this.form.time = new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
            this.form.ward = this.currentWard;
            
            // โหลดเตียงว่างของตึกนี้
            await this.fetchAvailableBeds(this.currentWard);
            this.showAdmitModal = true;
        },

        async fetchAvailableBeds(ward) {
            try {
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${ward}`);
                this.availableBeds = await res.json();
            } catch (e) {
                this.availableBeds = [];
            }
        },

        updateAge() {
            if (!this.form.dob) return;
            
            // 1. แยกส่วนวันที่ (ค.ศ.) จาก Input
            const [yearAD, month, day] = this.form.dob.split('-').map(Number);
            const birthDate = new Date(yearAD, month - 1, day);
            const now = new Date();
            
            // 2. คำนวณอายุ (ปี เดือน วัน)
            let years = now.getFullYear() - birthDate.getFullYear();
            let months = now.getMonth() - birthDate.getMonth();
            let days = now.getDate() - birthDate.getDate();
        
            if (days < 0) {
                months--;
                days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }
        
            // 3. แสดงผลอายุ และเก็บค่า ปี พ.ศ. ไว้แสดงผล/บันทึก
            const yearBE = yearAD + 543;
            this.form.ageDisplay = `${years} ปี ${months} เดือน ${days} วัน`;
            
            // สร้างตัวแปรใหม่สำหรับเก็บวันที่ในรูปแบบ พ.ศ. (เช่น 10/03/2510)
            this.form.dobBE = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${yearBE}`;
        },

        calculateLOS(admitDateStr) {
            const admit = new Date(admitDateStr);
            const now = new Date();
            const diffTime = Math.abs(now - admit);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        },

        // --- 4. Core Actions (Save / Edit / Move / Discharge) ---
        
        async submitAdmit() {
            this.isLoading = true;
            try {
                // เตรียม Payload โดยใช้ค่า dobBE ที่เป็น พ.ศ. แทนค่า dob ปกติ
                const payloadToSave = { 
                    ...this.form, 
                    dob: this.form.dobBE // ส่งค่าที่เป็น พ.ศ. ไปบันทึกที่ Google Sheet
                };
        
                await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    body: JSON.stringify({
                        action: 'admitPatient',
                        payload: payloadToSave
                    })
                });
                
                alert("บันทึกข้อมูล (พ.ศ.) สำเร็จ!");
                this.showAdmitModal = false;
                this.fetchPatients(); 
            } catch (e) {
                alert("เกิดข้อผิดพลาดในการบันทึก");
            }
            this.isLoading = false;
        },

        openPatientDetail(p) {
            this.selectedPatient = p;
            // แมปข้อมูลเข้าฟอร์มเผื่อกดแก้ไข
            this.form = { ...p };
            this.viewMode = 'detail';
        },

        async saveEdit() {
            await this.postToGAS('editPatient', this.form, "แก้ไขข้อมูลสำเร็จ!");
            this.viewMode = 'list';
        },

        async moveBed() {
            const newBed = prompt(`ย้ายเตียงคุณ ${this.selectedPatient.name}\nจาก ${this.selectedPatient.bed} เป็นเตียงหมายเลขอะไร?`);
            if (newBed) {
                const payload = { an: this.selectedPatient.an, oldBed: this.selectedPatient.bed, newBed: newBed, ward: this.currentWard };
                await this.postToGAS('moveBed', payload, "ย้ายเตียงสำเร็จ!");
            }
        },

        async moveWard() {
            const targetWard = prompt(`ย้ายคุณ ${this.selectedPatient.name} ไปตึกไหน? (ระบุชื่อตึกให้ถูกต้อง)`);
            if (targetWard && this.wards.includes(targetWard)) {
                const payload = { an: this.selectedPatient.an, oldBed: this.selectedPatient.bed, oldWard: this.currentWard, newWard: targetWard };
                await this.postToGAS('moveWard', payload, "ย้ายตึกสำเร็จ! ข้อมูลจะไปปรากฏที่ตึกปลายทาง");
                this.viewMode = 'list';
            } else {
                alert("ชื่อตึกไม่ถูกต้อง");
            }
        },

        async dischargePatient() {
            if (confirm(`ยืนยันการจำหน่าย (Discharge) คุณ ${this.selectedPatient.name} ออกจากระบบ?`)) {
                const payload = { an: this.selectedPatient.an, bed: this.selectedPatient.bed, ward: this.currentWard };
                await this.postToGAS('discharge', payload, "จำหน่ายผู้ป่วยสำเร็จ!");
                this.viewMode = 'list';
            }
        },

        // --- Helper: Central Post Function ---
        async postToGAS(action, payload, successMsg) {
            this.isLoading = true;
            try {
                // ใช้โหมด no-cors เพื่อส่งข้อมูลข้าม Domain จาก Github ไปยัง GAS
                await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    body: JSON.stringify({ action: action, payload: payload })
                });
                
                alert(successMsg);
                await this.fetchPatients(); // รีเฟรชตาราง
            } catch (e) {
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อ Server");
            }
            this.isLoading = false;
        },

        resetForm() {
            this.form = {
                rowId: '', date: '', time: '', receivedFrom: 'ER', referFrom: '',
                bed: '', hn: '', an: '', name: '', address: '',
                dob: '', ageDisplay: '', dept: this.configs.depts[0] || '', 
                cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard
            };
        },

        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) {
                this.postToGAS('addDoctor', { name: name }, "เพิ่มรายชื่อแพทย์สำเร็จ");
                this.doctors.push(name);
                this.form.doctor = name;
            }
        }
    };
}
