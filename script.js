function nurseApp() {
    return {
        // --- State ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        wards: [],
        patients: [],
        configs: { depts: [], beds: [], sources: [] },
        doctors: [],
        
        // UI Controls
        showAdmitModal: false,
        mobileMenu: false,
        
        // Search
        searchHN: '', searchAN: '', searchName: '', searchDoc: '',

        // Form
        form: {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            hn: '', an: '', name: '', dob: '', ageDisplay: '',
            bed: '', dept: '', doctor: '', cc: '', ward: ''
        },

        // --- Init ---
        init() {
            this.startClock();
            this.loadInitialData();
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
                // ดึงข้อมูลตึกจาก GAS
                const response = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await response.json();
                this.wards = data.wards;
                this.configs.depts = data.depts;
                this.doctors = data.doctors;
            } catch (e) {
                console.error("Load Failed", e);
                // Mock Data สำหรับทดสอบเบื้องต้น
                this.wards = ['ปาริฉัตร', 'สงฆ์อาพาธ'];
                this.configs.depts = ['อายุรกรรม', 'ศัลยกรรม', 'กุมารเวชกรรม'];
                this.doctors = ['นพ.สมชาย ใจดี', 'พญ.สมหญิง รักเรียน'];
            }
            this.isLoading = false;
        },

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
                this.patients = []; // Clear if error
            }
            this.isLoading = false;
        },

        // --- Logic ---
        get filteredPatients() {
            return this.patients.filter(p => {
                return p.hn.toLowerCase().includes(this.searchHN.toLowerCase()) &&
                       p.an.toLowerCase().includes(this.searchAN.toLowerCase()) &&
                       p.name.toLowerCase().includes(this.searchName.toLowerCase()) &&
                       p.doctor.toLowerCase().includes(this.searchDoc.toLowerCase());
            });
        },

        get availableBeds() {
            // กรองเตียงว่างจากตึกที่เลือก (สมมติว่าดึงมาจาก configs)
            return Array.from({length: 10}, (_, i) => `Bed ${i + 1}`);
        },

        updateAge() {
            if (!this.form.dob) return;
            const birth = new Date(this.form.dob);
            const now = new Date();
            
            let years = now.getFullYear() - birth.getFullYear();
            let months = now.getMonth() - birth.getMonth();
            let days = now.getDate() - birth.getDate();

            if (days < 0) {
                months--;
                days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
            }
            if (months < 0) {
                years--;
                months += 12;
            }
            this.form.ageDisplay = `${years} ปี ${months} เดือน ${days} วัน`;
        },

        calculateLOS(admitDateStr) {
            const admit = new Date(admitDateStr);
            const now = new Date();
            const diffTime = Math.abs(now - admit);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        },

        async submitAdmit() {
            this.isLoading = true;
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors', // สำคัญสำหรับ GAS
                    body: JSON.stringify({
                        action: 'admitPatient',
                        payload: this.form
                    })
                });
                
                alert("บันทึกข้อมูลสำเร็จ!");
                this.showAdmitModal = false;
                this.fetchPatients(); // Reload table
            } catch (e) {
                alert("เกิดข้อผิดพลาดในการบันทึก");
            }
            this.isLoading = false;
        },

        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) {
                this.doctors.push(name);
                this.form.doctor = name;
            }
        }
    };
}
