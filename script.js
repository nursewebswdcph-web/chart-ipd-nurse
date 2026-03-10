function nurseApp() {
    return {
        // --- 1. State & Configurations ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', // 'list' หรือ 'detail'
        
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

        async loadInitialData() {
            this.isLoading = true;
            try {
                // ดึงข้อมูลพื้นฐาน (ตึก, แผนก, แพทย์)
                const res = await fetch(`${this.API_URL}?action=getInitData`);
                const data = await res.json();
                this.wards = data.wards || [];
                this.configs.depts = data.depts || [];
                this.doctors = data.doctors || [];
            } catch (e) {
                console.error("Load Initial Data Failed:", e);
                // Fallback กรณีเชื่อมต่อไม่ได้
                this.wards = ['ปาริฉัตร', 'สงฆ์อาพาธ'];
            }
            this.isLoading = false;
        },

        // --- 3. Patient List & Search Logic ---
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

        get filteredPatients() {
            return this.patients.filter(p => {
                return (p.hn || '').toLowerCase().includes(this.searchHN.toLowerCase()) &&
                       (p.an || '').toLowerCase().includes(this.searchAN.toLowerCase()) &&
                       (p.name || '').toLowerCase().includes(this.searchName.toLowerCase()) &&
                       (p.doctor || '').toLowerCase().includes(this.searchDoc.toLowerCase());
            });
        },

        calculateLOS(admitDateStr) {
            if (!admitDateStr) return 0;
            try {
                // ตรวจสอบฟอร์แมตวันที่ (คาดหวัง YYYY-MM-DD จากระบบ)
                const admitDate = new Date(admitDateStr);
                const now = new Date();
                const diffTime = Math.abs(now - admitDate);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            } catch (e) { return 0; }
        },

        // --- 4. Admission & Bed Logic ---
        async openAdmitForm() {
            // 1. เริ่มแสดงตัวโหลดทันทีที่คลิก
            this.isLoading = true; 
            
            try {
                // 2. เคลียร์ค่าฟอร์มเก่า
                this.resetForm();
                this.form.ward = this.currentWard;
                this.form.date = new Date().toISOString().split('T')[0];
                this.form.time = new Date().toLocaleTimeString('th-TH', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
                // 3. ดึงข้อมูลเตียงว่างล่าสุดจาก Server
                // (เราใส่ isLoading = true ซ้ำใน fetchAvailableBeds ได้เพื่อความชัวร์)
                await this.fetchAvailableBeds(); 
        
                // 4. เมื่อข้อมูลมาครบแล้ว จึงเปิด Modal
                this.showAdmitModal = true;
                
            } catch (error) {
                console.error("Error opening form:", error);
                alert("ไม่สามารถโหลดข้อมูลเตียงได้ กรุณาลองใหม่อีกครั้ง");
            } finally {
                // 5. ปิดตัวโหลด (ไม่ว่าจะโหลดสำเร็จหรือพัง)
                this.isLoading = false; 
            }
        },

        async fetchAvailableBeds() {
            // ฟังก์ชันนี้จะถูกเรียกจาก openAdmitForm
            try {
                const response = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                const data = await response.json();
                this.availableBeds = data || [];
            } catch (e) {
                this.availableBeds = [];
                throw e; // ส่ง Error กลับไปให้ openAdmitForm จัดการ
            }
        },

        // --- 5. Date & Age Logic (พ.ศ.) ---
        autoFormatDate(e) {
            let v = e.target.value.replace(/\D/g, ''); // เอาเฉพาะตัวเลข
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length >= 5) {
                v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
            } else if (v.length >= 3) {
                v = v.slice(0, 2) + '/' + v.slice(2);
            }
            this.form.dobInput = v;
        },

        updateAgeFromText() {
            const input = this.form.dobInput;
            if (!input || input.length < 10) return;

            const parts = input.split('/');
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            const yBE = parseInt(parts[2]);

            if (isNaN(d) || isNaN(m) || isNaN(yBE)) return;

            // คำนวณอายุ (แปลง พ.ศ. -> ค.ศ. สำหรับ JS Date)
            const yAD = yBE - 543;
            const birth = new Date(yAD, m - 1, d);
            const now = new Date();

            if (birth.toString() === 'Invalid Date') {
                alert("วันที่ไม่ถูกต้อง");
                return;
            }

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
            this.form.dob = input; // เก็บค่า พ.ศ. (วว/ดด/พศ) ลงตัวแปรที่จะส่งไป Sheet
        },

        // --- 6. Core Actions (Save / Discharge / Move) ---
        async postToGAS(action, payload, successMsg) {
            this.isLoading = true;
            try {
                await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors', // ข้อกำหนดของ GAS
                    cache: 'no-cache',
                    body: JSON.stringify({ action: action, payload: payload })
                });
                alert(successMsg);
                await this.fetchPatients(); // รีเฟรชตารางหลังทำงานเสร็จ
            } catch (e) {
                alert("การเชื่อมต่อขัดข้อง: " + e.message);
            }
            this.isLoading = false;
        },

        async submitAdmit() {
            // ตรวจสอบข้อมูลบังคับ
            if (!this.form.bed || !this.form.hn || !this.form.an) {
                alert("กรุณากรอกข้อมูล เตียง, HN และ AN ให้ครบถ้วน");
                return;
            }
            await this.postToGAS('admitPatient', this.form, "Admitted เรียบร้อยแล้ว");
            this.showAdmitModal = false;
        },

        async dischargePatient() {
            if (confirm(`ยืนยันการจำหน่าย (Discharge) คุณ ${this.selectedPatient.name} ?`)) {
                const payload = { 
                    an: this.selectedPatient.an, 
                    bed: this.selectedPatient.bed, 
                    ward: this.currentWard 
                };
                await this.postToGAS('discharge', payload, "จำหน่ายผู้ป่วยและคืนสถานะเตียงเรียบร้อยแล้ว");
                this.viewMode = 'list';
            }
        },

        async moveBed() {
            const newBed = prompt(`ย้ายเตียงคุณ ${this.selectedPatient.name}\nเตียงปัจจุบัน: ${this.selectedPatient.bed}\nระบุเลขเตียงใหม่:`);
            if (newBed) {
                const payload = { 
                    an: this.selectedPatient.an, 
                    oldBed: this.selectedPatient.bed, 
                    newBed: newBed, 
                    ward: this.currentWard 
                };
                await this.postToGAS('moveBed', payload, "ย้ายเตียงเรียบร้อยแล้ว");
            }
        },

        // --- 7. UI Helpers ---
        openPatientDetail(p) {
            this.selectedPatient = p;
            this.viewMode = 'detail';
        },

        resetForm() {
            this.form = {
                dobInput: '', dob: '', ageDisplay: '',
                date: '', time: '', receivedFrom: 'ER', referFrom: '',
                bed: '', hn: '', an: '', name: '', address: '',
                dept: this.configs.depts[0] || '', 
                cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard
            };
        },

        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) {
                this.doctors.push(name);
                this.form.doctor = name;
                // ส่งไปบันทึกที่ Sheet Doctors ด้วย (ถ้าต้องการ)
                this.postToGAS('addDoctor', { name: name }, "เพิ่มรายชื่อแพทย์ลงฐานข้อมูลแล้ว");
            }
        }
    };
}
