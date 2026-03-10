function nurseApp() {
    return {
        // --- 1. State & Configurations ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        realTimeClock: '',
        currentWard: null,
        viewMode: 'list', 
        showSuccess: false,
        successMsg: '',
        isEditing: false,
        
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
        get patientSummary() {
            if (!this.patients || this.patients.length === 0) {
                return { total: 0, deptStr: 'ไม่มีข้อมูล' };
            }
        
            const total = this.patients.length;
        
            // 1. นับแยกตามแผนก (Dept)
            const counts = this.patients.reduce((acc, p) => {
                const dName = p.dept || 'ไม่ระบุแผนก';
                acc[dName] = (acc[dName] || 0) + 1;
                return acc;
            }, {});
        
            // 2. แปลงผลลัพธ์เป็นข้อความสวยๆ เช่น "อายุรกรรม 5 ราย, ศัลยกรรม 2 ราย"
            const deptStr = Object.entries(counts)
                .map(([name, count]) => `${name} ${count} ราย`)
                .join(' • '); // ใช้เครื่องหมายจุดกลางแบ่งแผนก
        
            return { total, deptStr };
        },

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
                const admitDate = new Date(admitDateStr);
                const now = new Date();
                const diffTime = Math.abs(now - admitDate);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                return diffDays === 0 ? 1 : diffDays;
            } catch (e) { return 0; }
        },

        // --- 4. Admission & Bed Logic ---
        async openAdmitForm() {
            this.isLoading = true; 
            this.isEditing = false; // 👈 ระบุว่านี่คือการ "รับใหม่" ไม่ใช่การแก้ไข
            
            try {
                this.resetForm(); // ล้างข้อมูลเก่าออกให้หมด
                this.form.ward = this.currentWard;
                
                // ตั้งค่าวันที่และเวลาปัจจุบัน (ค.ศ. สำหรับ input type="date")
                this.form.date = new Date().toISOString().split('T')[0];
                this.form.time = new Date().toLocaleTimeString('th-TH', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
        
                await this.fetchAvailableBeds(); // โหลดเตียงว่าง
                this.showAdmitModal = true;
                
            } catch (error) {
                console.error("Error opening admit form:", error);
                alert("ไม่สามารถโหลดข้อมูลเตียงได้");
            } finally {
                this.isLoading = false; 
            }
        },
        async fetchAvailableBeds() {
            try {
                const response = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                const data = await response.json();
                this.availableBeds = data || [];
            } catch (e) {
                this.availableBeds = [];
                throw e;
            }
        },

        // --- 5. Date & Age Logic ---
        autoFormatDate(e) {
            let v = e.target.value.replace(/\D/g, '');
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
            this.form.dob = input;
        },

        // --- 6. Core Actions ---
        async postToGAS(action, payload, msg) {
            this.isLoading = true;
            try {
                // สำหรับ POST ใน Google Apps Script แนะนำให้ใช้ URLSearchParams หรือส่งเป็น blob
                await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    body: JSON.stringify({ action: action, payload: payload })
                });

                this.successMsg = msg;
                this.showSuccess = true;

                setTimeout(async () => {
                    await this.fetchPatients();
                    this.isLoading = false;
                }, 1500);

            } catch (e) {
                alert("Error: " + e.message);
                this.isLoading = false;
            }
        },

        async submitAdmit() {
            if (!this.form.bed || !this.form.hn || !this.form.an) {
                alert("กรุณากรอกข้อมูลสำคัญให้ครบถ้วน");
                return;
            }
    
            const action = this.isEditing ? 'editPatient' : 'admitPatient';
            const msg = this.isEditing ? 'แก้ไขข้อมูลสำเร็จ' : 'บันทึก Admit สำเร็จ';
            
            await this.postToGAS(action, this.form, msg);
            this.showAdmitModal = false;
            this.isEditing = false; // รีเซ็ตสถานะหลังจบงาน
        },

        async dischargePatient() {
            if (confirm(`ยืนยันการจำหน่าย (Discharge) คุณ ${this.selectedPatient.name} ?`)) {
                const payload = { an: this.selectedPatient.an, bed: this.selectedPatient.bed, ward: this.currentWard };
                await this.postToGAS('discharge', payload, "จำหน่ายสำเร็จ!");
                this.viewMode = 'list';
            }
        },

        async moveBed() {
            const newBed = prompt(`ย้ายเตียงคุณ ${this.selectedPatient.name}\nเตียงปัจจุบัน: ${this.selectedPatient.bed}\nเลขเตียงใหม่:`);
            if (newBed) {
                const payload = { an: this.selectedPatient.an, oldBed: this.selectedPatient.bed, newBed: newBed, ward: this.currentWard };
                await this.postToGAS('moveBed', payload, "ย้ายเตียงเรียบร้อยแล้ว");
            }
        },
        async openEditForm() {
            this.isLoading = true;
            this.isEditing = true; // ตั้งสถานะว่ากำลังแก้ไข
            
            try {
                // 1. ดึงข้อมูลจากคนไข้ที่เลือก (selectedPatient) เข้าสู่ฟอร์ม
                // ใช้การ Copy ข้อมูลแบบ Spread เพื่อไม่ให้ค่าในตารางเปลี่ยนทันทีขณะพิมพ์
                this.form = { ...this.selectedPatient };
                
                // 2. จัดการเรื่องวันที่ พ.ศ. ให้แสดงในช่องกรอก
                this.form.dobInput = this.selectedPatient.dob; 
    
                // 3. โหลดเตียง (รวมเตียงปัจจุบันของคนไข้เข้าไปในตัวเลือกด้วย)
                await this.fetchAvailableBeds();
                if (!this.availableBeds.includes(this.selectedPatient.bed)) {
                    this.availableBeds.unshift(this.selectedPatient.bed);
                }
    
                // 4. ปิดหน้า Detail และเปิดหน้าฟอร์ม
                this.viewMode = 'list';
                this.showAdmitModal = true;
            } catch (e) {
                alert("ไม่สามารถโหลดข้อมูลแก้ไขได้");
            } finally {
                this.isLoading = false;
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
                dept: this.configs.depts ? this.configs.depts[0] : '', 
                cc: '', pi: '', dx: '', doctor: '', ward: this.currentWard
            };
        },

        addNewDoctor() {
            const name = prompt("ระบุชื่อ-นามสกุล แพทย์:");
            if (name) {
                this.postToGAS('addDoctor', { name: name }, "เพิ่มรายชื่อแพทย์แล้ว");
                this.doctors.push(name);
                this.form.doctor = name;
            }
        }
    };
}
