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
        showNurseListFor: null,

        selectedPatient: null,
        currentForm: null, 
        showAssessmentPreview: false, 
        savedAssessment: null,    
        showBradenModal: false,
        showBradenGuidelineModal: false,
        showBradenSummaryModal: false,
        isEduEditing: false,
        eduForm: null, // จะถูกสร้างด้วย defaultEduForm() ตอนโหลด

        fallHistory: [],
        fallGridData: {},
        bradenHistory: [],
        bradenForm: {
            evalDate: new Date().toISOString().split('T')[0],
            admitDate: '', transferDate: '',fromWard: '', firstEvalDate: '', diagnosis: '', initialUlcer: 'ไม่มี', initialUlcerDetail: '', albumin: '', hb: '', hct: '', bmi: '',
            s1_m1: null, s1_m2: null, s1_m3: null, s1_m4: null, s1_m5: null, s1_m6: null, totalScore: 0,
            s3_location: '', s3_stage: '', s3_appearance: '', assessor: '',
            s4_dischargeDate: '', s4_outcome: '', s4_ulcerDate: '', s4_location: '', s4_size: '', s4_appearance: '', s4_stage: '', s4_count: ''
        },
         defaultEduForm() {
            return {
                D1: { checked: false, text1: '', date: '', provider: '', pos: '', receiver: '' },
                M1: { checked: false, text1: '', text2: '', date: '', provider: '', pos: '', receiver: '' },
                E1: { checked: false, options: [], date: '', provider: '', pos: '', receiver: '' },
                E2: { checked: false, options: [], date: '', provider: '', pos: '', receiver: '' },
                T1: { checked: false, options: [], text1: '', text2: '', date: '', provider: '', pos: '', receiver: '' },
                T2: { checked: false, options: [], text1: '', date: '', provider: '', pos: '', receiver: '' },
                T3: { checked: false, options: [], date: '', provider: '', pos: '', receiver: '' },
                H1: { checked: false, options: [], date: '', provider: '', pos: '', receiver: '' },
                O1: { checked: false, text1: '', text2: '', text3: '', date: '', provider: '', pos: '', receiver: '' },
                O2: { checked: false, options: [], text1: '', date: '', provider: '', pos: '', receiver: '' },
                O3: { checked: false, date: '', provider: '', pos: '', receiver: '' },
                Diet1: { checked: false, text1: '', text2: '', text3: '', date: '', provider: '', pos: '', receiver: '' }
            };
        },  
        // สถานะของ Focus List
        focusList: [],
        focusTemplates: [],
        focusForm: { id: '', focus: '', goal: '', startDate: '', endDate: '' },
        editingFocusIndex: -1,
        showFocusTemplateModal: false,
        searchFocusTemplate: '',
        focusModal: { show: false, type: '', msg: '', input: '', index: -1 },

        progressNotes: [],
        nursingTemplates: [],
        pnForm: { id: '', date: '', shift: 'เช้า (08.00-16.00)', time: '', focus: '', s: '', o: '', i: '', e: '', nurse: '', pos: '', addToFocusList: false },
        editingProgressIndex: -1,
        showNurseListForProgress: false,
        
        showProgressTemplateModal: false,
        searchProgressTemplate: '',

        showReProblemModal: false,
        searchReProblem: '',
        showCreateTemplateModal: false,
        newTemplateForm: { templateName: '', focus: '', s: '', o: '', i: '', e: '' },
        pnForm: { id: '', date: '', shift: 'เช้า (08.00-16.00)', time: '', focus: '', s: '', o: '', i: '', e: '', eTime: '', nurse: '', pos: '', addToFocusList: false },

        dischargeForm: {},
        showNurseListForDischarge: false,
        
        isSidebarCollapsed: false, // สถานะการพับ Sidebar
        
        activeForms: [
            { id: 'assess_initial', title: '1. แบบประเมินประวัติและสมรรถนะผู้ป่วยแรกรับ', icon: 'fa-clipboard-user', isMain: true },
            { id: 'patient_class', title: '2. แบบบันทึกการจำแนกประเภทผู้ป่วย', icon: 'fa-user-tag', isMain: true },
            { id: 'fall_risk', title: '3. แบบประเมินความเสี่ยงพลัดตหกล้ม Morse / MAAS', icon: 'fa-person-falling', isMain: true },
            { id: 'braden_scale', title: '4. แบบประเมินแผลกดทับ (Braden Scale)', icon: 'fa-bed', isMain: true },
            { id: 'patient_edu', title: '5. แบบบันทึกการให้คำแนะนำระหว่างเข้ารับการรักษาและเมื่อจำหน่าย', icon: 'fa-chalkboard-user', isMain: true },
            { id: 'focus_list', title: '6. แบบบันทึกรายการปัญหาสุขภาพ (Focus List)', icon: 'fa-list-check', isMain: true },
            { id: 'progress_note', title: '7. แบบบันทึกความก้าวหน้าทางการพยาบาล Nursing Progress Note', icon: 'fa-notes-medical', isMain: true },
            { id: 'discharge_record', title: '8. แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย', icon: 'fa-door-open', isMain: true }
        ],
        classForm: {
            evalDate: new Date().toISOString().split('T')[0],
            shift: 'เช้า',
            scores: [0, 0, 0, 0, 0, 0, 0, 0], // ค่าเริ่มต้นเป็น 0 (ยังไม่ประเมิน)
            assessor: ''
        },
        classHistory: [],
        currentPageIndex: 0,
        showClassModal: false, // ควบคุมการเปิด/ปิด Popup ประเมินรอบใหม่
        showClassNurseList: false, // ควบคุม Dropdown ค้นหาชื่อพยาบาล
        gridData: {},

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
        filteredNursesEdu(term) {
            if (!this.nurses) return [];
            if (!term) return this.nurses.slice(0, 20); // แสดง 20 คนแรกถ้ายังไม่พิมพ์
            const q = term.toLowerCase();
            return this.nurses.filter(n => n.name.toLowerCase().includes(q));
        },

        // กรอง Template ตามคำค้นหา
        get filteredFocusTemplates() {
            if (!this.searchFocusTemplate) return this.focusTemplates;
            const q = this.searchFocusTemplate.toLowerCase();
            return this.focusTemplates.filter(t => t.problemName && t.problemName.toLowerCase().includes(q));
        },
        get filteredProgressTemplates() {
            if (!this.searchProgressTemplate) return this.nursingTemplates;
            const q = this.searchProgressTemplate.toLowerCase();
            return this.nursingTemplates.filter(t => t.focus && t.focus.toLowerCase().includes(q));
        },
        get filteredReProblems() {
            if (!this.searchReProblem) return this.progressNotes;
            const q = this.searchReProblem.toLowerCase();
            return this.progressNotes.filter(p => p.focus && p.focus.toLowerCase().includes(q));
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

        async openNursingChart(patient) {
            this.isLoading = true;
            this.selectedPatient = patient;
            
            // 1. ล้างข้อมูลเก่าของคนไข้คนก่อนหน้าทิ้งทันที ป้องกันข้อมูลค้าง
            this.savedAssessment = null;
            this.classHistory = []; 
            this.currentPageIndex = 0;
            
            // 2. ตั้งค่าหน้าเริ่มต้นและเปลี่ยนโหมดการแสดงผล
            this.currentForm = this.activeForms.find(f => f.id === 'assess_initial');
            this.viewMode = 'chart';
            window.scrollTo(0, 0);

            try {
                // 3. โหลดข้อมูล Form 1 และ Form 2 มารอไว้พร้อมกัน (ใช้ Promise.all เพื่อความเร็ว)
                await Promise.all([
                    this.loadAssessmentData(patient.an),
                    this.loadClassifications(patient.an)
                ]);
                
                // 4. จัดการ UI ฟอร์มแรกรับหลังจากข้อมูลมาแล้ว
                this.$nextTick(() => {
                    const formElement = document.getElementById('assessment-form-v2');
                    if (formElement && !this.savedAssessment) {
                        formElement.reset(); // ล้างช่องกรอกถ้าเป็นคนไข้ใหม่ที่ยังไม่เคยประเมิน
                        
                        // นำข้อมูลจากการ Admit มาใส่ในช่องพื้นฐาน
                        const fields = {
                            'AdmitDate': patient.date,
                            'AdmitTime': patient.time,
                            'AdmittedFrom': patient.receivedFrom,
                            'Refer': patient.referFrom,
                            'ChiefComplaint': patient.cc,
                            'PresentIllness': patient.pi
                        };
                        
                        Object.entries(fields).forEach(([id, val]) => {
                            if (formElement.elements[id]) formElement.elements[id].value = val || '';
                        });
                    }
                });
            } catch (e) {
                console.error("Error loading patient chart:", e);
            } finally {
                this.isLoading = false;
            }
        },

        async saveAssessmentData(shouldPrint = false) {
            const formElement = document.getElementById('assessment-form-v2');
            if (!formElement) return this.showAlert('Error', 'ไม่พบฟอร์มข้อมูล');
        
            const formData = new FormData(formElement);
            const data = {};
            formData.forEach((value, key) => {
                if (!data[key]) { data[key] = value; return; }
                if (!Array.isArray(data[key])) { data[key] = [data[key]]; }
                data[key].push(value);
            });
        
            this.isLoading = true;
            try {
                const payload = { an: this.selectedPatient?.an, formData: data, ward: this.currentWard };
                const res = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveAssessmentInitial', payload: payload })
                });
                const result = await res.json();
                
                if (result.status === 'success') {
                    this.successMsg = result.message;
                    this.showSuccess = true;
                    setTimeout(() => this.showSuccess = false, 3000);
        
                    // อัปเดตข้อมูลที่จะใช้พิมพ์
                    this.savedAssessment = { 
                        ...data, 
                        PatientName: this.selectedPatient?.name,
                        HN: this.selectedPatient?.hn,
                        AN: this.selectedPatient?.an,
                        Bed: this.selectedPatient?.bed,
                        Date: this.selectedPatient?.date,
                        Time: this.selectedPatient?.time 
                    };
        
                    // หากกดปุ่มพิมพ์ ให้ทำงานต่อทันที
                    if (shouldPrint) {
                        this.$nextTick(() => {
                            this.printAssessment();
                        });
                    }
                }
            } catch (error) {
                this.showAlert('Error', 'เกิดข้อผิดพลาด: ' + error.message);
            } finally {
                this.isLoading = false;
            }
        },
        async loadAssessmentData(an) {
            this.isLoading = true; // เปิดสถานะโหลด
            try {
                // เรียกใช้ fetch ไปที่ API_URL ของคุณ เหมือนฟังก์ชันอื่นๆ
                const response = await fetch(`${this.API_URL}?action=getAssessmentInitial&an=${an}`);
                const data = await response.json();
        
                if (data && Object.keys(data).length > 0) {
                    // 🟢 มีข้อมูลแล้ว -> เก็บใส่ตัวแปรและเปิดโหมด A4 Preview ทันที
                    this.savedAssessment = data;
                    
                    // ยัดค่าเดิมกลับเข้าฟอร์มด้วย เผื่อกรณีที่ผู้ใช้กดปุ่ม "แก้ไขข้อมูล"
                    this.$nextTick(() => {
                        setTimeout(() => {
                            const form = document.getElementById('assessment-form-v2');
                            if (form) {
                                Object.keys(data).forEach(key => {
                                    const el = form.elements[key];
                                    if (!el) return;
                                    
                                    // 🟢 ตรวจสอบว่า el เป็น "กลุ่มของ Input" ที่ใช้ชื่อเดียวกันหรือไม่ (เช่น Radio หรือ Checkbox หลายอัน)
                                    // (ใช้ el.tagName !== 'SELECT' เพราะ Select ก็มี length เหมือนกันแต่เป็น Input เดี่ยว)
                                    if (el.length && el.tagName !== 'SELECT') {
                                        Array.from(el).forEach(inputNode => {
                                            if (inputNode.type === 'radio') {
                                                inputNode.checked = (inputNode.value === data[key]);
                                            } else if (inputNode.type === 'checkbox') {
                                                // กรณีเป็น Checkbox กลุ่ม ให้แยกคำด้วยลูกน้ำแล้วเช็คว่ามีค่าตรงไหม
                                                const savedValues = data[key] ? data[key].toString().split(',').map(v => v.trim()) : [];
                                                inputNode.checked = savedValues.includes(inputNode.value);
                                            }
                                        });
                                    } 
                                    // 🟢 กรณีเป็น Input เดี่ยวๆ (Text, Textarea, Select, Checkbox เดี่ยว)
                                    else {
                                        if (el.type === 'checkbox') {
                                            el.checked = (data[key] === 'on' || data[key] === true || data[key] === el.value);
                                        } else {
                                            el.value = data[key];
                                            // เช็คให้ชัวร์ว่ามีฟังก์ชัน dispatchEvent ก่อนค่อยสั่งงาน เพื่อป้องกัน Error
                                            if (typeof el.dispatchEvent === 'function') {
                                                el.dispatchEvent(new Event('input')); 
                                            }
                                        }
                                    }
                                });
                            }
                        }, 100);
                    });
                } else {
                    // 🔴 ถ้ายังไม่มีข้อมูล -> เปิดเป็นหน้าฟอร์มกรอกว่างๆ 
                    this.savedAssessment = null;
                }
            } catch (err) {
                console.error("Error loading assessment:", err);
                this.savedAssessment = null;
            } finally {
                this.isLoading = false; // ปิดสถานะโหลด
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

        // ฟังก์ชันเมื่อผู้ใช้กดเลือกฟอร์มเมนูด้านซ้าย
        async selectForm(form) {
            // ป้องกันการกดซ้ำที่ฟอร์มเดิม
            if (this.currentForm?.id === form.id) return;
            
            this.isLoading = true;
            this.currentForm = form;
            this.currentPageIndex = 0; // กลับไปหน้า 1 ของตารางเสมอเมื่อสลับฟอร์ม

            try {
                // ดึงข้อมูลล่าสุดตามฟอร์มที่เลือก
                if (form.id === 'assess_initial') {
                    await this.loadAssessmentData(this.selectedPatient.an);
                } else if (form.id === 'patient_class') {
                    await this.loadClassifications(this.selectedPatient.an);
                } else if (form.id === 'fall_risk') {
                    await this.loadFallRisk(this.selectedPatient.an);
                }  else if (form.id === 'braden_scale') {
                    await this.loadBraden(this.selectedPatient.an);
                } else if (form.id === 'patient_edu') {
                    await this.loadPatientEdu(this.selectedPatient.an);
                } else if (form.id === 'focus_list') {
                } else if (form.id === 'progress_note') {
                } else if (form.id === 'discharge_record') {
                }
            } catch (e) {
                console.error("Error switching form:", e);
            } finally {
                this.isLoading = false;
            }
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
            
            // กรณีเป็น Checkbox เดี่ยวๆ (เช่น วัยเด็ก, ผู้สูงอายุ)
            if (value === undefined) return (data !== false && data !== 'off' && data !== ''); 
            
            // กรณีมีหลายตัวเลือก แยกค่าด้วยลูกน้ำ และลบช่องว่างหัวท้ายออก
            const valuesArray = data.toString().split(',').map(v => v.trim());
            
            // ตรวจสอบแบบคำต่อคำ (Exact Match) ป้องกันปัญหาคำว่า "มี" ซ้อนใน "ไม่มี"
            return valuesArray.includes(value.toString().trim());
        },
        // ฟังก์ชันแปลงวันที่ yyyy-mm-dd เป็นแบบไทย
        formatThaiDate(dateStr) {
            if (!dateStr) return '..................';
            const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const date = new Date(dateStr);
            
            // ตรวจสอบว่าเป็นรูปแบบวันที่ที่ถูกต้องหรือไม่
            if (isNaN(date.getTime())) return dateStr; 
            
            const d = date.getDate();
            const m = months[date.getMonth()];
            const y = date.getFullYear() + 543; // แปลง ค.ศ. เป็น พ.ศ.
            
            return `${d} ${m} ${y}`;
        },
        printAssessment() {
            // 1. ดึงเนื้อหา HTML จากเทมเพลตที่จัดวางไว้แล้ว
            const printContent = document.getElementById('a4-print-area').innerHTML;
            const iframe = document.getElementById('print-frame');
            const pri = iframe.contentWindow;
        
            // 2. ดึง CSS จากหน้าหลักไปใส่ใน Iframe เพื่อให้รูปแบบเหมือนกันเป๊ะ
            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(s => s.outerHTML)
                .join('');
        
            // 3. เขียนเนื้อหาลงใน Iframe
            pri.document.open();
            pri.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>IPD Nurse Workbench - Printing</title>
                        ${styles}
                        <style>
                            /* ตั้งค่าหน้ากระดาษ A4 ปรับขอบ บน-ล่าง 5mm, ซ้าย-ขวา 8mm */
                            @page { size: A4 portrait; margin: 10mm 10mm; } 
                            body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
                            
                            .a4-page { 
                                width: 100% !important; 
                                box-shadow: none !important; 
                                margin: 0 !important; 
                                position: relative;
                                page-break-after: always; 
                                overflow: hidden;
                                line-height: 1.15 !important; 
                                /* 🔴 ปรับ Padding ด้านล่างให้มากขึ้น (ประมาณ 75px) เพื่อไม่ให้เนื้อหาถูกกรอบผู้ป่วยบัง */
                                padding-bottom: 75px !important; 
                            }
                            .a4-page:last-child {
                                page-break-after: auto; 
                            }

                            /* CSS สำหรับ Global Footer ให้โผล่ขอบล่างทุกหน้า */
                            .print-global-footer {
                                position: fixed;
                                bottom: 0;
                                left: 0;
                                width: 100%;
                                text-align: center;
                                font-size: 9px;
                                color: #6b7280; 
                                border-top: 1px solid #9ca3af; 
                                padding-top: 4px;
                                padding-bottom: 4px;
                                background-color: white;
                                z-index: 1000;
                            }

                            /* 🔴 CSS สำหรับกรอบข้อมูลผู้ป่วย (Fixed ล่างขวา เหนือ Footer) */
                            .print-patient-info {
                                position: fixed;
                                bottom: 22px; /* ยกขึ้นมาให้อยู่เหนือ Footer */
                                right: 15px; /* ชิดขวา */
                                width: 260px; /* ความกว้างของกรอบ */
                                border: 1px solid #000; /* กรอบสี่เหลี่ยมสีดำ */
                                border-radius: 4px;
                                padding: 6px 8px;
                                font-size: 10px;
                                background-color: white;
                                z-index: 1000;
                                line-height: 1.4;
                            }

                            /* บังคับลดช่องว่างเฉพาะตอนพิมพ์ */
                            .a4-page .mt-1 { margin-top: 2px !important; }
                            .a4-page .mt-2 { margin-top: 4px !important; }
                            .a4-page .mt-3 { margin-top: 6px !important; }
                            .a4-page .mt-4 { margin-top: 8px !important; }
                            .a4-page .mb-1 { margin-bottom: 2px !important; }
                            .a4-page .mb-2 { margin-bottom: 4px !important; }
                            .a4-page .gap-y-1 { row-gap: 2px !important; }
                            
                            /* บีบตารางให้แคบลง */
                            .a4-page table td { 
                                padding-top: 0px !important; 
                                padding-bottom: 0px !important; 
                            }
                        </style>
                    </head>
                    <body>
                        
                        <div class="print-patient-info">
                            <div>${this.selectedPatient?.name || '-'} &nbsp;&nbsp;<b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}</div>
                            <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp;&nbsp;<b>AN:</b> ${this.selectedPatient?.an || '-'}</div>
                            <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp;&nbsp;<b>ตึก:</b> ${this.currentWard || '-'} &nbsp;&nbsp;<b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
                        </div>

                        <div class="print-global-footer">
                            เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                        </div>

                        ${printContent}
                        
                        <script>
                            window.onload = function() {
                                setTimeout(() => {
                                    window.print();
                                }, 600);
                            };
                        </script>
                    </body>
                </html>
            `);
            pri.document.close();
        },
        // ฟังก์ชันคำนวณคะแนนและประเภทอัตโนมัติ
        calcClassification() {
            let total = this.classForm.scores.reduce((a, b) => a + parseInt(b || 0), 0);
            let category = 1;
            
            // เกณฑ์ใหม่: 1=8, 2=9-14, 3=15-20, 4=21-26, 5=27-32
            if (total >= 27) category = 5;
            else if (total >= 21) category = 4;
            else if (total >= 15) category = 3;
            else if (total >= 9) category = 2;
            else category = 1; 
            
            return { total, category };
        },

        // โหลดข้อมูลประวัติทั้งหมดของ AN
        async loadClassifications(an) {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getClassifications&an=${an}`);
                this.classHistory = await res.json();
                
                // ล้างข้อมูลเก่า
                this.gridData = {}; 
                
                // นำข้อมูลจากฐานข้อมูลมาใส่ใน Grid
                this.classHistory.forEach(item => {
                    const dKey = this.getLocalYYYYMMDD(item.evalDate);
                    if (!this.gridData[dKey]) this.gridData[dKey] = {};
                    this.gridData[dKey][item.shift] = {
                        scores: [...item.scores],
                        assessor: item.assessor || ''
                    };
                });
            } catch (e) { console.error("Load Error:", e); }
            this.isLoading = false;
        },
        async saveGridPage() {
            const currentPage = this.classTimeline[this.currentPageIndex];
            if (!currentPage) return;
            
            const recordsToSave = [];
            currentPage.forEach(day => {
                const dKey = day.date;
                ['ดึก', 'เช้า', 'บ่าย'].forEach(s => {
                    const data = this.gridData[dKey]?.[s];
                    // บันทึกเฉพาะเวรที่กรอกคะแนนครบ 8 ข้อ
                    if (data && data.scores && data.scores.every(v => v !== null && v !== '')) {
                        const { total, category } = this.calcScores(data.scores);
                        recordsToSave.push({
                            an: this.selectedPatient.an,
                            hn: this.selectedPatient.hn,
                            ward: this.currentWard,
                            evalDate: dKey,
                            shift: s,
                            scores: data.scores,
                            total: total,
                            category: category,
                            assessor: data.assessor || ''
                        });
                    }
                });
            });

            if (recordsToSave.length === 0) {
                return this.showAlert('แจ้งเตือน', 'กรุณากรอกคะแนนให้ครบ 8 ข้อ ในอย่างน้อย 1 เวรเพื่อบันทึก');
            }

            this.isLoading = true;
            try {
                for (const payload of recordsToSave) {
                    await fetch(this.API_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: JSON.stringify({ action: 'saveClassification', payload })
                    });
                }
                this.successMsg = 'บันทึกข้อมูลเรียบร้อยแล้ว';
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 3000);
                await this.loadClassifications(this.selectedPatient.an);
            } catch (e) {
                this.showAlert('Error', 'บันทึกไม่สำเร็จ: ' + e.message);
            }
            this.isLoading = false;
        },
        // 🟢 1. ฟังก์ชันดึง/สร้างช่องข้อมูล (ช่วยให้ x-model ทำงานได้แม่นยำ)
        getGridCell(dateStr, shift) {
            if (!this.gridData[dateStr]) this.gridData[dateStr] = {};
            if (!this.gridData[dateStr][shift]) {
                this.gridData[dateStr][shift] = {
                    scores: Array(8).fill(''),
                    assessor: '', // เปลี่ยนเป็นค่าว่าง
                    isNew: true
                };
            }
            return this.gridData[dateStr][shift];
        },
        // ฟังก์ชันช่วยคำนวณคะแนนในตาราง
        calcScores(scores) {
            if (!scores || !Array.isArray(scores)) return { total: '', category: '' };
            // กรองเอาเฉพาะตัวเลข 1-4
            const valid = scores.filter(v => v !== null && v !== '' && !isNaN(v));
            if (valid.length === 0) return { total: '', category: '' };
            
            const total = valid.reduce((a, b) => a + parseInt(b), 0);
            let category = '';
            
            // แสดงประเภทเมื่อกรอกครบ 8 ข้อเท่านั้น
            if (valid.length === 8) {
                if (total >= 27) category = 5;
                else if (total >= 21) category = 4;
                else if (total >= 15) category = 3;
                else if (total >= 9) category = 2;
                else category = 1;
            }
            return { total, category };
        },
        editClassItem(item) {
            // ดึงวันที่จาก item.evalDate มาแบบสะอาดๆ ไม่ต้องผ่านการคำนวณใหม่
            const cleanDate = this.getLocalYYYYMMDD(item.evalDate);
            
            this.classForm = {
                evalDate: cleanDate, // วันที่ในฟอร์มจะเป็นวันที่ 10 ตามฐานข้อมูลเป๊ะๆ
                shift: item.shift,
                scores: [...item.scores],
                assessor: item.assessor
            };
            this.showClassModal = true;
        },
        // 🟢 แก้ไขฟังก์ชันเปลี่ยนหน้าตาราง (อ้างอิง Timeline ใหม่)
        nextPage() {
            // เปลี่ยนจาก chunkedClassHistory เป็น classTimeline
            if (this.currentPageIndex < this.classTimeline.length - 1) {
                this.currentPageIndex++;
            }
        },
        prevPage() {
            if (this.currentPageIndex > 0) {
                this.currentPageIndex--;
            }
        },

        // กรองรายชื่อพยาบาลสำหรับฟอร์มจำแนก
        get classFilteredNurses() {
            if (!this.nurses || !Array.isArray(this.nurses)) return [];
            const term = (this.classForm.assessor || '').toString().toLowerCase();
            if (!term) return this.nurses;
            return this.nurses.filter(n => n && n.name && n.name.toString().toLowerCase().includes(term));
        },
        // จัดกลุ่มประวัติการประเมินตามวันที่
        get groupedClassHistory() {
            if (!this.classHistory || this.classHistory.length === 0) return {};
            
            const groups = {};
            try {
                // เรียงจากใหม่ไปเก่าสำหรับหน้าเว็บ
                const sorted = [...this.classHistory].sort((a, b) => new Date(b.evalDate) - new Date(a.evalDate));
                sorted.forEach(item => {
                    const date = this.formatThaiDateShort(item.evalDate);
                    if (!groups[date]) groups[date] = [];
                    groups[date].push(item);
                });
            } catch (e) { console.error("Grouping error:", e); }
            return groups;
        },
        // 🟢 ฟังก์ชันดึงวันที่ YYYY-MM-DD แบบ Local Time (ไทย) 100%
        getLocalYYYYMMDD(date) {
            if (!date) return '';
            const d = new Date(date);
            // ถ้าเป็น String วันที่จาก Google Sheet ให้บังคับเวลาเป็นเที่ยงวันเพื่อป้องกันการปัดวัน
            if (typeof date === 'string' && !date.includes('T')) {
                const [y, m, day] = date.split('-').map(Number);
                return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        },
        get classTimeline() {
            if (!this.selectedPatient || !this.selectedPatient.date) return [];

            // 1. สร้างวันที่ Admit แบบ Local
            const [y, m, d] = this.selectedPatient.date.split('-').map(Number);
            const admitDate = new Date(y, m - 1, d, 12, 0, 0); // ตั้งเวลาเที่ยงวันกันพลาด

            const today = new Date();
            today.setHours(12, 0, 0, 0);
            
            const diffTime = Math.abs(today - admitDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            const totalPages = Math.ceil(Math.max(diffDays, 5) / 5);

            const pages = [];
            const shifts = ['ดึก', 'เช้า', 'บ่าย'];

            for (let p = 0; p < totalPages; p++) {
                const dayInPage = [];
                for (let i = 0; i < 5; i++) {
                    const currentIdx = (p * 5) + i;
                    const currentDate = new Date(admitDate);
                    currentDate.setDate(admitDate.getDate() + currentIdx);
                    
                    // ใช้ Helper ดึงค่า YYYY-MM-DD
                    const dateKey = this.getLocalYYYYMMDD(currentDate);
                    
                    const dayData = {
                        date: dateKey,
                        formattedDate: this.formatThaiDateShort(dateKey),
                        slots: {}
                    };

                    shifts.forEach(s => {
                        const record = this.classHistory.find(h => {
                            // 🟢 หัวใจสำคัญ: แปลงวันที่จากฐานข้อมูลเป็น YYYY-MM-DD ก่อนเทียบเสมอ
                            const hDate = this.getLocalYYYYMMDD(h.evalDate);
                            return hDate === dateKey && h.shift === s;
                        });
                        dayData.slots[s] = record || null;
                    });
                    dayInPage.push(dayData);
                }
                pages.push(dayInPage);
            }
            return pages;
        },

        // เปิด Popup ประเมินรอบใหม่ และเคลียร์ค่า
        openClassModal() {
            this.classForm = {
                // เปลี่ยนมาใช้ Helper ของเราแทนเพื่อให้ได้วันที่ไทยจริงๆ
                evalDate: this.getLocalYYYYMMDD(new Date()), 
                shift: 'เช้า',
                scores: [0, 0, 0, 0, 0, 0, 0, 0],
                assessor: ''
            };
            this.showClassModal = true;
        },

        // บันทึกข้อมูล 1 เวร
        async saveClassForm() {
            // เช็คว่าประเมินครบ 8 ข้อหรือไม่ (ถ้ามีข้อไหนเป็น 0 ถือว่ายังไม่ประเมิน)
            if (this.classForm.scores.includes(0)) {
                return this.showAlert('แจ้งเตือน', 'กรุณาประเมินให้ครบทั้ง 8 ข้อ');
            }
            if (!this.classForm.assessor) {
                return this.showAlert('แจ้งเตือน', 'กรุณาระบุชื่อพยาบาลผู้ประเมิน');
            }

            const { total, category } = this.calcClassification();
            const finalDate = (this.classForm.evalDate.includes('T')) 
                      ? this.classForm.evalDate.split('T')[0] 
                      : this.classForm.evalDate;
            const payload = {
                an: this.selectedPatient.an,
                hn: this.selectedPatient.hn,
                ward: this.currentWard,
                evalDate: finalDate, // ส่งวันที่แบบสะอาดไป
                shift: this.classForm.shift,
                scores: this.classForm.scores,
                total: total,
                category: category,
                assessor: this.classForm.assessor
            };

            this.isLoading = true;
            try {
                const res = await fetch(this.API_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'saveClassification', payload: payload })
                });
                this.successMsg = 'บันทึกข้อมูลประเมินรายเวรเรียบร้อยแล้ว';
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 3000);
                
                this.showClassModal = false; // ปิด Popup หลังบันทึกสำเร็จ
                await this.loadClassifications(this.selectedPatient.an);
            } catch (error) {
                this.showAlert('Error', 'เกิดข้อผิดพลาด: ' + error.message);
            } finally {
                this.isLoading = false;
            }
        },

        // วันที่แบบย่อสำหรับใส่หัวตาราง
        formatThaiDateShort(dateStr) {
            if (!dateStr) return '';
            const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return `${date.getDate()} ${months[date.getMonth()]} ${(date.getFullYear() + 543).toString().slice(-2)}`;
        },
        // ฟังก์ชันตัดคำนำหน้าและนามสกุล (เอาเฉพาะชื่อจริง)
        formatShortName(fullName) {
            if (!fullName) return '';
            let name = fullName.replace(/^(นาย|นางสาว|นาง|น\.ส\.|นพ\.|พญ\.|พว\.|ทพ\.|ทญ\.)/g, '').trim();
            return name.split(' ')[0]; // เอาเฉพาะชื่อจริงตัวแรก
        },

        // 🟢 ฟังก์ชันสั่งพิมพ์ของฟอร์มจำแนกผู้ป่วย (อัปเดตแก้ปัญหาหน้าว่าง)
        printClassification() {
            window.scrollTo(0, 0);
            
            // รอให้ Alpine.js เรนเดอร์ DOM เสร็จสมบูรณ์
            this.$nextTick(() => {
                const printArea = document.getElementById('patient-class-print-area');
                if (!printArea) {
                    return this.showAlert('แจ้งเตือน', 'ไม่พบพื้นที่สำหรับพิมพ์เอกสาร');
                }
                
                // 1. โคลน DOM เพื่อนำมาปรับแต่งก่อนพิมพ์ โดยไม่กระทบหน้าเว็บจริง
                const cloneDOM = printArea.cloneNode(true);
                
                // 2. ลบแท็ก <template> ทิ้งทั้งหมด! (หัวใจสำคัญ: ป้องกันตารางพังเวลาลง Iframe)
                const templates = cloneDOM.querySelectorAll('template');
                templates.forEach(t => t.remove());
                
                // 3. ดึง HTML ที่โครงสร้างสะอาดแล้วมาเก็บไว้
                const printContent = cloneDOM.innerHTML;
                
                // 4. สร้าง Iframe ใหม่ทุกครั้ง ป้องกันอาการค้างหรือหน้าขาว
                let iframe = document.getElementById('print-frame');
                if (iframe) {
                    iframe.remove(); 
                }
                iframe = document.createElement('iframe');
                iframe.id = 'print-frame';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                const pri = iframe.contentWindow;
                const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(s => s.outerHTML).join('');

                // ดึงข้อมูลคนไข้
                const pName = this.selectedPatient?.name || '-';
                const pAge = this.selectedPatient?.ageDisplay || '-';
                const pHn = this.selectedPatient?.hn || '-';
                const pAn = this.selectedPatient?.an || '-';
                const pDoc = this.selectedPatient?.doctor || '-';
                const pWard = this.currentWard || '-';
                const pBed = this.selectedPatient?.bed || '-';

                pri.document.open();
                pri.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>พิมพ์การจำแนกประเภทผู้ป่วย</title>
                            ${styles}
                            <style>
                                /* ตั้งค่าหน้ากระดาษ */
                                @page {size: A4 portrait; margin: 20mm 8mm 10mm 8mm;}
                                body { 
                                    background: white !important; 
                                    margin: 0; 
                                    padding: 0; 
                                    color: black !important; 
                                    -webkit-print-color-adjust: exact !important; 
                                    print-color-adjust: exact !important;
                                }
                                
                                .a4-page { 
                                    width: 100% !important; 
                                    margin: 0 auto !important; 
                                    position: relative;
                                    page-break-after: always; 
                                    overflow: visible !important;
                                    padding-bottom: 75px !important; 
                                    display: block !important; 
                                }
                                .a4-page:last-child { page-break-after: auto; }
                                
                                /* บังคับสไตล์ตาราง */
                                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                                th, td { border: 1px solid black !important; padding: 4px !important; font-size: 11px; color: black !important; }

                                /* Footer ท้ายกระดาษ */
                                .print-global-footer {
                                    position: fixed; bottom: 0; left: 0; width: 100%; text-align: center;
                                    font-size: 9px; color: #475569 !important; border-top: 1px solid #9ca3af; 
                                    padding-top: 4px; padding-bottom: 4px; background-color: white; z-index: 1000;
                                }
                                
                                /* กรอบข้อมูลผู้ป่วย */
                                .print-patient-info {
                                    position: fixed; bottom: 22px; right: 15px; width: 260px;
                                    border: 1px solid #000 !important; border-radius: 4px; padding: 6px 8px;
                                    font-size: 10px; background-color: white !important; z-index: 1000; 
                                    line-height: 1.4; color: black !important;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="print-patient-info">
                                <div><b>ชื่อ-สกุล:</b> ${pName} &nbsp;&nbsp;<b>อายุ:</b> ${pAge}</div>
                                <div><b>HN:</b> ${pHn} &nbsp;&nbsp;<b>AN:</b> ${pAn}</div>
                                <div><b>แพทย์:</b> ${pDoc} &nbsp;&nbsp;<b>ตึก:</b> ${pWard} &nbsp;&nbsp;<b>เตียง:</b> ${pBed}</div>
                            </div>
                            
                            <div class="print-global-footer">
                                เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | ระบบบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                            </div>

                            ${printContent}
                            
                            <script>
                                window.onload = function() { 
                                    setTimeout(() => { 
                                        window.print(); 
                                    }, 800); 
                                };
                            </script>
                        </body>
                    </html>
                `);
                pri.document.close();
            });
        },
        // ฟังก์ชันบันทึกวันที่จำหน่าย
        saveDischargeDateAction(an, date) {
            if (!date) return alert('กรุณาระบุวันที่จำหน่าย');
            
            this.isLoading = true;
            fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveDischargeDate',
                    payload: {
                        an: an,
                        dischargeDate: date
                    }
                })
            })
            .then(res => res.json())
            .then(result => {
                this.isLoading = false;
                if (result.status === 'success') {
                    alert('บันทึกวันจำหน่ายเรียบร้อยแล้ว');
                    // อัปเดตข้อมูลในหน้าเว็บทันทีโดยไม่ต้อง Refresh
                    if(this.selectedPatient) {
                        this.selectedPatient.dischargeDate = date;
                    }
                } else {
                    alert('เกิดข้อผิดพลาด: ' + result.message);
                }
            })
            .catch(err => {
                this.isLoading = false;
                console.error('Error:', err);
                alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            });
        },
        // โหลดข้อมูลประวัติ Morse/MAAS
        async loadFallRisk(an) {
            if (!an) return;
            this.isLoading = true;
            try {
                // เพิ่ม Cache Buster (?_=...) เพื่อป้องกัน Browser จำค่าเก่า
                const response = await fetch(`${this.API_URL}?action=getFallRisk&an=${an}&_=${new Date().getTime()}`);
                
                // ตรวจสอบว่า response โอเคไหม
                if (!response.ok) throw new Error('Network response was not ok');
                
                this.fallHistory = await response.json();
                
                this.fallGridData = {}; 
                this.fallHistory.forEach(item => {
                    // ใช้ฟังก์ชันแปลงวันที่ที่มีอยู่เดิม
                    const dKey = this.getLocalYYYYMMDD(item.evalDate);
                    if (!this.fallGridData[dKey]) this.fallGridData[dKey] = {};
                    this.fallGridData[dKey][item.shift] = {
                        scores: [item.m1, item.m2, item.m3, item.m4, item.m5, item.m6],
                        maas: item.maasScore,
                        assessor: item.assessor || ''
                    };
                });
            } catch (e) { 
                console.error("Load Fall Risk Error:", e); 
                this.fallGridData = {};
            } finally {
                this.isLoading = false;
            }
        },

        // ดึง/สร้างช่องข้อมูลสำหรับหน้าจอ Morse/MAAS
        getFallGridCell(dateStr, shift) {
            if (!this.fallGridData[dateStr]) this.fallGridData[dateStr] = {};
            if (!this.fallGridData[dateStr][shift]) {
                this.fallGridData[dateStr][shift] = {
                    scores: ['', '', '', '', '', ''], // 6 ข้อของ Morse
                    maas: '', // 1 ข้อของ MAAS
                    assessor: ''
                };
            }
            return this.fallGridData[dateStr][shift];
        },

        // คำนวณผลรวม Morse อัตโนมัติ
        calcMorseTotal(scores) {
            if (!scores || !Array.isArray(scores)) return '';
            const valid = scores.filter(v => v !== null && v !== '');
            if (valid.length === 0) return '';
            return valid.reduce((a, b) => a + parseInt(b), 0);
        },

        // บันทึกหน้าตาราง Morse/MAAS
        async saveFallRiskPage() {
            const currentPage = this.classTimeline[this.currentPageIndex];
            if (!currentPage) return;
            
            const recordsToSave = [];
            currentPage.forEach(day => {
                const dKey = day.date;
                ['ดึก', 'เช้า', 'บ่าย'].forEach(s => {
                    const data = this.fallGridData[dKey]?.[s];
                    // เช็คว่ามีการกรอกข้อมูลหรือไม่
                    if (data && (data.scores.some(v => v !== '') || data.maas !== '')) {
                        recordsToSave.push({
                            an: this.selectedPatient.an,
                            hn: this.selectedPatient.hn,
                            ward: this.currentWard,
                            evalDate: dKey,
                            shift: s,
                            m1: data.scores[0] || 0, 
                            m2: data.scores[1] || 0, 
                            m3: data.scores[2] || 0,
                            m4: data.scores[3] || 0, 
                            m5: data.scores[4] || 0, 
                            m6: data.scores[5] || 0,
                            morseTotal: this.calcMorseTotal(data.scores) || 0,
                            maasScore: data.maas || 0,
                            assessor: data.assessor || ''
                        });
                    }
                });
            });
        
            if (recordsToSave.length === 0) {
                return this.showAlert('แจ้งเตือน', 'กรุณากรอกข้อมูลอย่างน้อย 1 เวรเพื่อบันทึก');
            }
        
            this.isLoading = true;
            try {
                // แนะนำให้ส่งข้อมูลทีละ Record เพื่อความชัวร์ หรือปรับ API ให้รับ Array (แต่เบื้องต้นแก้ให้ส่งผ่านก่อน)
                for (const payload of recordsToSave) {
                    const response = await fetch(this.API_URL, {
                        method: 'POST',
                        // ห้ามใส่ mode: 'no-cors'
                        body: JSON.stringify({ action: 'saveFallRisk', payload: payload })
                    });
                    
                    // ตรวจสอบผลลัพธ์ (Google Script จะส่งเป็น Redirect/CORS มา ต้องระวังการอ่าน JSON)
                    // หากบันทึกแล้วนิ่ง ให้เช็คใน Sheet ว่าข้อมูลเข้าหรือไม่
                }
                
                this.successMsg = 'บันทึกข้อมูลพลัดตกหกล้มเรียบร้อยแล้ว';
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 3000);
                
                // โหลดข้อมูลใหม่มาแสดงในตาราง
                await this.loadFallRisk(this.selectedPatient.an);
                
            } catch (e) {
                console.error('Save Error:', e);
                this.showAlert('Error', 'บันทึกไม่สำเร็จ: ' + e.message);
            } finally {
                this.isLoading = false;
            }
        },

        // ฟังก์ชันสั่งพิมพ์ Morse/MAAS
        printFallRisk() {
            window.scrollTo(0, 0);
            this.$nextTick(() => {
                const printArea = document.getElementById('fall-risk-print-area');
                if (!printArea) return this.showAlert('แจ้งเตือน', 'ไม่พบพื้นที่สำหรับพิมพ์เอกสาร');           
                const cloneDOM = printArea.cloneNode(true);
                cloneDOM.querySelectorAll('template').forEach(t => t.remove());
                const printContent = cloneDOM.innerHTML;                
                let iframe = document.getElementById('print-frame');
                if (iframe) iframe.remove(); 
                iframe = document.createElement('iframe');
                iframe.id = 'print-frame';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);                
                const pri = iframe.contentWindow;
                const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(s => s.outerHTML).join('');
                pri.document.open();
                pri.document.write(`
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <title>พิมพ์แบบประเมิน Morse / MAAS</title>
                            ${styles}
                            <style>
                                @page {size: A4 portrait; margin: 8mm 8mm 8mm 8mm;}
                                body { font-size: 11px; color: black !important; }                             

                                /* บังคับตารางให้ขนาดคงที่ */
                                table { 
                                    width: 100%; 
                                    table-layout: fixed; /* สำคัญ: บังคับคอลัมน์ไม่ให้ขยาย */
                                    border-collapse: collapse; 
                                    word-break: break-word; /* ตัดคำถ้าเนื้อหาเกิน */
                                }                               

                                th, td { 
                                    border: 1px solid black !important; 
                                    padding: 2px !important; 
                                    overflow: hidden; /* ซ่อนเนื้อหาที่เกิน */
                                }                       

                                /* กำหนดความกว้างเฉพาะคอลัมน์ */
                                .w-label { width: 200px; }       /* คอลัมน์รายการประเมิน */
                                .w-guide { width: 85px; }        /* คอลัมน์เกณฑ์คะแนน */
                                .w-shift { width: 24px; }        /* คอลัมน์เวร (ด/ช/บ) */                               

                                .bg-gray { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                                .text-center { text-center: center; }
                                /* กรอบข้อมูลผู้ป่วย */
                                /* Footer ท้ายกระดาษ */
                                .print-global-footer {
                                    position: fixed; bottom: 0; left: 0; width: 100%; text-align: center;
                                    font-size: 9px; color: #475569 !important; border-top: 1px solid #9ca3af; 
                                    padding-top: 4px; padding-bottom: 4px; background-color: white; z-index: 1000;
                                }
                                
                                /* กรอบข้อมูลผู้ป่วย */
                                .print-patient-info {
                                    position: fixed; bottom: 22px; right: 15px; width: 260px;
                                    border: 1px solid #000 !important; border-radius: 4px; padding: 6px 8px;
                                    font-size: 10px; background-color: white !important; z-index: 1000; 
                                    line-height: 1.4; color: black !important;
                            }
                            </style>
                        </head>
                        <body>
                            <div class="print-patient-info">
                                <div>
                                    <b>ชื่อ-สกุล:</b> ${this.selectedPatient?.name || '-'} &nbsp;&nbsp;
                                    <b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}
                                </div>
                                <div>
                                    <b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp;&nbsp;
                                    <b>AN:</b> ${this.selectedPatient?.an || '-'}
                                </div>
                                <div>
                                    <b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp;&nbsp;
                                    <b>ตึก:</b> ${this.currentWard || '-'} &nbsp;&nbsp;
                                    <b>เตียง:</b> ${this.selectedPatient?.bed || '-'}
                                </div>
                            </div>                

                            ${printContent}            
                            <div class="print-global-footer">
                                เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                            </div>               
                            <script>
                                window.onload = function() {
                                    setTimeout(() => { window.print(); }, 800);
                                };
                            </script>
                        </body>
                    </html>
                `);
                pri.document.close();
            });
        }, 
        calcBradenFormScore() {
            let t = 0;
            if(this.bradenForm.s1_m1 && this.bradenForm.s1_m1 !== 'null') t += parseInt(this.bradenForm.s1_m1);
            if(this.bradenForm.s1_m2 && this.bradenForm.s1_m2 !== 'null') t += parseInt(this.bradenForm.s1_m2);
            if(this.bradenForm.s1_m3 && this.bradenForm.s1_m3 !== 'null') t += parseInt(this.bradenForm.s1_m3);
            if(this.bradenForm.s1_m4 && this.bradenForm.s1_m4 !== 'null') t += parseInt(this.bradenForm.s1_m4);
            if(this.bradenForm.s1_m5 && this.bradenForm.s1_m5 !== 'null') t += parseInt(this.bradenForm.s1_m5);
            if(this.bradenForm.s1_m6 && this.bradenForm.s1_m6 !== 'null') t += parseInt(this.bradenForm.s1_m6);
            this.bradenForm.totalScore = t;
        },
        openBradenModal(dateStr = null) {
            if (dateStr) {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    this.bradenForm.evalDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                }
            } else {
                const d = new Date();
                this.bradenForm.evalDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
            this.loadBradenByDate();
            this.showBradenModal = true;
        },
        async loadBraden(an) {
            this.isLoading = true;
            try {
                const r = await fetch(`${this.API_URL}?action=getBradenScale&an=${an}`);
                const data = await r.json();
                this.bradenHistory = data;
                
                // ฟังก์ชันแปลงวันที่ให้ตรงกับโซนเวลาไทย (แก้ปัญหาดึงข้อมูลมาแล้ววันเหลื่อม) และฟอร์แมตสำหรับ type="date"
                const toInputDate = (dStr) => {
                    if (!dStr) return '';
                    const d = new Date(dStr);
                    if (isNaN(d.getTime())) return dStr;
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                };
                
                // Set default ค่ารับใหม่
                if(this.selectedPatient) {
                    this.bradenForm.admitDate = toInputDate(this.selectedPatient.admitDate) || '';
                    this.bradenForm.diagnosis = this.selectedPatient.diagnosis || '';
                }
                
                // ถ้าเคยมีประวัติ ให้ดึงส่วนหัวและส่วนสรุปมาแสดงอัตโนมัติ
                if(data.length > 0) {
                    const last = data[data.length-1];
                    // ใช้ toInputDate() ครอบข้อมูลวันที่เพื่อจัด Format และแก้ Timezone
                    this.bradenForm.admitDate = toInputDate(last.AdmitDate) || this.bradenForm.admitDate;
                    this.bradenForm.transferDate = toInputDate(last.TransferDate) || '';
                    this.bradenForm.fromWard = last.FromWard || '';
                    this.bradenForm.firstEvalDate = toInputDate(last.FirstEvalDate) || '';
                    this.bradenForm.diagnosis = last.Diagnosis || this.bradenForm.diagnosis;
                    this.bradenForm.initialUlcer = last.InitialUlcer || 'ไม่มี';
                    this.bradenForm.initialUlcerDetail = last.InitialUlcerDetail || '';
                    this.bradenForm.albumin = last.Albumin || '';
                    this.bradenForm.hb = last.Hb || '';
                    this.bradenForm.hct = last.Hct || '';
                    this.bradenForm.bmi = last.BMI || '';
                    
                    this.bradenForm.s4_dischargeDate = toInputDate(last.S4_DischargeDate) || '';
                    this.bradenForm.s4_outcome = last.S4_Outcome || '';
                    this.bradenForm.s4_ulcerDate = toInputDate(last.S4_UlcerDate) || '';
                    this.bradenForm.s4_location = last.S4_Location || '';
                    this.bradenForm.s4_size = last.S4_Size || '';
                    this.bradenForm.s4_appearance = last.S4_Appearance || '';
                    this.bradenForm.s4_stage = last.S4_Stage || '';
                    this.bradenForm.s4_count = last.S4_Count || '';
                }
                this.loadBradenByDate();
            } catch(e) { console.error(e); }
            this.isLoading = false;
        },
        
        loadBradenByDate() {
            const existing = this.bradenHistory.find(r => {
                if(!r.EvalDate) return false;
                const d = new Date(r.EvalDate);
                if (isNaN(d.getTime())) return false;
                
                // สร้างรูปแบบ YYYY-MM-DD แบบเวลา Local ของไทย เพื่อป้องกันวันเหลื่อม
                const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return localDateStr === this.bradenForm.evalDate;
            });
            
            if(existing) {
                this.bradenForm.s1_m1 = existing.S1_M1 || null; 
                this.bradenForm.s1_m2 = existing.S1_M2 || null;
                this.bradenForm.s1_m3 = existing.S1_M3 || null; 
                this.bradenForm.s1_m4 = existing.S1_M4 || null;
                this.bradenForm.s1_m5 = existing.S1_M5 || null; 
                this.bradenForm.s1_m6 = existing.S1_M6 || null;
                this.bradenForm.totalScore = existing.TotalScore || 0;
                this.bradenForm.s3_location = existing.S3_Location || ''; 
                this.bradenForm.s3_stage = existing.S3_Stage || '';
                this.bradenForm.s3_appearance = existing.S3_Appearance || ''; 
                this.bradenForm.assessor = existing.Assessor || '';
            } else {
                this.bradenForm.s1_m1 = null; this.bradenForm.s1_m2 = null; this.bradenForm.s1_m3 = null;
                this.bradenForm.s1_m4 = null; this.bradenForm.s1_m5 = null; this.bradenForm.s1_m6 = null;
                this.bradenForm.totalScore = 0;
                this.bradenForm.s3_location = ''; this.bradenForm.s3_stage = ''; 
                this.bradenForm.s3_appearance = ''; this.bradenForm.assessor = '';
            }
        },
        async saveBraden() {
            this.isLoading = true;
            const payload = { ...this.bradenForm, an: this.selectedPatient.an, hn: this.selectedPatient.hn, ward: this.currentWard };
            try {
                const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveBradenScale', payload }) });
                const out = await res.json();
                if(out.status === 'success') {
                    this.showSuccess = true; 
                    this.successMsg = 'บันทึกข้อมูลแบบประเมินเรียบร้อย';
                    setTimeout(() => { this.showSuccess = false; }, 3000);
                    
                    this.loadBraden(this.selectedPatient.an);
                    this.showBradenModal = false; // ปิดแค่ฟอร์มบันทึก แล้วจบเลย
                }
            } catch(e) { alert('เกิดข้อผิดพลาดในการบันทึก'); }
            this.isLoading = false;
        },
        async saveBradenSummary() {
            this.isLoading = true;
            
            // ค้นหาวันที่ประเมินล่าสุดที่มีอยู่ (หรือถ้าไม่มีก็ใช้วันนี้) 
            // เพื่อใช้เป็นอ้างอิงส่งไปให้ Google Script บันทึกลงถูกบรรทัด
            try {
                if (this.bradenHistory && this.bradenHistory.length > 0) {
                    const last = this.bradenHistory[this.bradenHistory.length - 1];
                    const evalDateRaw = last.EvalDate || last.evalDate; 
                    if (evalDateRaw) {
                        const d = new Date(evalDateRaw);
                        if (!isNaN(d.getTime())) {
                            this.bradenForm.evalDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        }
                    }
                } else {
                    const d = new Date();
                    this.bradenForm.evalDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                }
            } catch (e) {
                console.error("Date Setup Error", e);
            }

            const payload = { ...this.bradenForm, an: this.selectedPatient.an, hn: this.selectedPatient.hn, ward: this.currentWard };
            try {
                const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveBradenScale', payload }) });
                const out = await res.json();
                if(out.status === 'success') {
                    this.showSuccess = true; 
                    this.successMsg = 'บันทึกสรุปการเกิดแผลกดทับเรียบร้อย';
                    setTimeout(() => { this.showSuccess = false; }, 3000);
                    this.loadBraden(this.selectedPatient.an);
                }
            } catch(e) { 
                alert('เกิดข้อผิดพลาดในการบันทึก'); 
            } finally {
                this.isLoading = false;
            }
        },
        printBraden() {
            let records = [...this.bradenHistory].sort((a, b) => new Date(a.EvalDate) - new Date(b.EvalDate));
            if(records.length === 0) { alert("ไม่พบข้อมูลการประเมินเพื่อพิมพ์ กรุณาบันทึกข้อมูลก่อน"); return; }
            
            // ฟังก์ชันจัดการวันที่และปี พ.ศ. (เขียนแยก Manual เพื่อป้องกันปัญหาเบราว์เซอร์บวกปี 543 ซ้ำซ้อน)
            const formatThaiDate = (dateStr) => {
                if (!dateStr) return '-';
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                const day = d.getDate();
                const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                const month = months[d.getMonth()];
                let year = d.getFullYear();
                if (year < 2400) year += 543; // บวก 543 เฉพาะในกรณีที่ยังเป็น ค.ศ.
                return `${day} ${month} ${year}`;
            };

            let chunks = [];
            for(let i=0; i<records.length; i+=10) chunks.push(records.slice(i, i+10));
            const lastRec = records[records.length-1];
            let html = '';

            chunks.forEach((chunk, index) => {
                const isLastChunk = index === chunks.length - 1;
                let dateHeaders = '';
                
                // วนลูปสร้างส่วนหัวคอลัมน์ของวันที่ประเมิน (10 วัน)
                for(let i=0; i<10; i++) {
                    if(i < chunk.length) {
                        let dObj = new Date(chunk[i].EvalDate);
                        let dStr = '';
                        if (!isNaN(dObj.getTime())) {
                            const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                            dStr = `${String(dObj.getDate()).padStart(2, '0')} ${months[dObj.getMonth()]}`;
                        }
                        dateHeaders += `<th style="writing-mode: vertical-lr; transform: rotate(180deg); width: 24px; text-align: center; padding: 2px;">${dStr}</th>`;
                    } else {
                        dateHeaders += `<th style="width: 24px;"></th>`;
                    }
                }

                const generateSubRow = (label, score, key) => {
                    let rowHtml = `<tr><td>${label}</td><td class="text-center">${score}</td>`;
                    for(let i=0; i<10; i++) rowHtml += `<td class="text-center">${chunk[i] && chunk[i][key] == score ? '✔' : ''}</td>`;
                    return rowHtml + '</tr>';
                };

                let totalRows = `<tr class="bg-gray"><td colspan="2" style="text-align:right; font-weight:bold; padding-right:10px;">คะแนนรวม</td>`;
                let assessorRows = `<tr><td colspan="2" style="text-align:right; font-weight:bold; padding-right:10px;">พยาบาลผู้ประเมิน</td>`;
                for(let i=0; i<10; i++) {
                    totalRows += `<td class="text-center font-bold text-blue-800">${chunk[i] ? chunk[i].TotalScore || 0 : ''}</td>`;
                    assessorRows += `<td class="text-center" style="font-size:10px; white-space:nowrap; overflow:hidden;">${chunk[i] ? chunk[i].Assessor || '' : ''}</td>`;
                }
                totalRows += '</tr>'; assessorRows += '</tr>';

                let section3Rows = '';
                for(let i=0; i<10; i++) {
                    let r = chunk[i] || {};
                    let dStr = '';
                    if (r.EvalDate) {
                        let dObj = new Date(r.EvalDate);
                        if (!isNaN(dObj.getTime())) {
                            let yy = dObj.getFullYear();
                            if (yy < 2400) yy += 543;
                            dStr = `${String(dObj.getDate()).padStart(2, '0')}/${String(dObj.getMonth()+1).padStart(2, '0')}/${yy.toString().slice(-2)}`;
                        }
                    }
                    
                    section3Rows += `
                        <tr style="height: 26px;">
                            ${i===0 ? `<td rowspan="10" style="text-align:center; width:22%; padding:0; vertical-align:middle;"><img src="https://www.weymouthphysiotherapy.com/wp-content/uploads/2018/02/Body-chart.jpg" style="width:100%; max-height:240px; object-fit:contain;"></td>` : ''}
                            <td class="text-center" style="width:12%;">${dStr}</td>
                            <td style="width:20%; padding-left:5px;">${r.S3_Location||''}</td>
                            <td class="text-center" style="width:10%;">${r.S3_Stage||''}</td>
                            <td style="width:21%; padding-left:5px;">${r.S3_Appearance||''}</td>
                            <td class="text-center" style="width:15%;">${r.Assessor||''}</td>
                        </tr>
                    `;
                }

                html += `
                <div class="a4-page">
                    <div style="text-align: right; font-size: 9px; font-weight: bold; line-height: 1.2; margin-bottom: 5px;">
                        Echart-ipd-nurse<br>Braden-Scale-Form หน้า ${(index * 2) + 1}
                    </div>

                    <h2 class="text-center font-bold" style="font-size: 13px; margin-bottom:5px;">แบบบันทึกการพยาบาลเพื่อป้องกันและการดูแลผู้ป่วยที่มีแผลกดทับ <br>โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน</h2>
                    
                    <table class="no-border" style="margin-bottom:5px;">
                        <tr>
                            <td><b>วันที่ Admit:</b> ${formatThaiDate(lastRec.AdmitDate)}</td>
                            <td><b>วันที่รับย้าย:</b> ${formatThaiDate(lastRec.TransferDate)} &nbsp; <b>จาก Ward:</b> ${lastRec.FromWard||'-'}</td>
                            <td><b>วันที่ประเมินครั้งแรก:</b> ${formatThaiDate(lastRec.FirstEvalDate)}</td>
                        </tr>
                        <tr><td colspan="3"><b>Diagnosis/Operation:</b> ${lastRec.Diagnosis||''}</td></tr>
                        <tr><td colspan="3"><b>แผลกดทับแรกรับ:</b> [ ${lastRec.InitialUlcer==='ไม่มี'?'✔':' '} ] ไม่มี &nbsp; [ ${lastRec.InitialUlcer==='มี'?'✔':' '} ] มี &nbsp; <b>ตำแหน่ง/ลักษณะ/ขนาด:</b> ${lastRec.InitialUlcerDetail||'-'}</td></tr>
                        <tr><td colspan="3"><b>Serum Albumin:</b> ${lastRec.Albumin||'-'} mg/dL (ค่าปกติ 3.5-5.4) &nbsp; <b>Hb:</b> ${lastRec.Hb||'-'} mg% &nbsp; <b>Hct:</b> ${lastRec.Hct||'-'} Vol% &nbsp; <b>BMI:</b> ${lastRec.BMI||'-'}</td></tr>
                    </table>

                    <div class="font-bold mb-1" style="font-size:13px;">ส่วนที่ 1 การประเมินความเสี่ยงต่อการเกิดแผลกดทับ</div>
                    <table class="tight-table">
                        <thead>
                            <tr class="bg-gray">
                                <th>ปัจจัยส่งเสริมการเกิดแผลกดทับ</th><th style="width:40px;">คะแนน</th>${dateHeaders}
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="bg-gray"><td colspan="12"><b>1. การรับความรู้สึก</b></td></tr>
                            ${generateSubRow('1.1 ไม่ตอบสนอง', 1, 'S1_M1')} ${generateSubRow('1.2 มี Pain Stimuli', 2, 'S1_M1')} ${generateSubRow('1.3 สับสน สื่อไม่ได้ทุกครั้ง', 3, 'S1_M1')} ${generateSubRow('1.4 ไม่มีความบกพร่อง ปกติ', 4, 'S1_M1')}
                            <tr class="bg-gray"><td colspan="12"><b>2. การเปียกชื้นของผิวหนัง</b></td></tr>
                            ${generateSubRow('2.1 เปียกชุ่มตลอดเวลา Diarrhea', 1, 'S1_M2')} ${generateSubRow('2.2 ปัสสาวะราด / อุจจาระราดบ่อยครั้ง', 2, 'S1_M2')} ${generateSubRow('2.3 ปัสสาวะราด / อุจจาระราดบางครั้ง', 3, 'S1_M2')} ${generateSubRow('2.4 ไม่เปียก/กลั้นปัสสาวะและอุจจาระได้/Retain Cath', 4, 'S1_M2')}
                            <tr class="bg-gray"><td colspan="12"><b>3. การทำกิจกรรม</b></td></tr>
                            ${generateSubRow('3.1 ต้องอยู่บนเตียงตลอดเวลา', 1, 'S1_M3')} ${generateSubRow('3.2 ทรงตัวไม่อยู่ / ต้องนั่งรถเข็น', 2, 'S1_M3')} ${generateSubRow('3.3 เดินได้ระยะสั้น ต้องช่วยพยุง', 3, 'S1_M3')} ${generateSubRow('3.4 เดินได้เอง / ทำกิจกรรมเองได้', 4, 'S1_M3')}
                            <tr class="bg-gray"><td colspan="12"><b>4. การเคลื่อนไหว</b></td></tr>
                            ${generateSubRow('4.1 เคลื่อนไหวเองไม่ได้', 1, 'S1_M4')} ${generateSubRow('4.2 เคลื่อนไหวเองได้น้อย / มีข้อติด / ต้องมีผู้ช่วยเหลือ', 2, 'S1_M4')} ${generateSubRow('4.3 เคลื่อนไหวเองได้ มีผู้ช่วยเหลือบางครั้ง', 3, 'S1_M4')} ${generateSubRow('4.4 เคลื่อนไหวเองได้ปกติ', 4, 'S1_M4')}
                            <tr class="bg-gray"><td colspan="12"><b>5. การรับอาหาร</b></td></tr>
                            ${generateSubRow('5.1 NPO / กินได้ 1/3 ถาด', 1, 'S1_M5')} ${generateSubRow('5.2 รับประทานได้บ้างเล็กน้อย / กินได้ ½ ถาด', 2, 'S1_M5')} ${generateSubRow('5.3 รับประทานได้พอควร / กินได้ > ½ ถาด', 3, 'S1_M5')} ${generateSubRow('5.4 รับประทานได้ปกติ/ Feed รับได้หมด', 4, 'S1_M5')}
                            <tr class="bg-gray"><td colspan="12"><b>6. การเสียดสี</b></td></tr>
                            ${generateSubRow('6.1 มีกล้ามเนื้อหดเกร็ง ต้องมีผู้ช่วยหลายคนในการเคลื่อนย้าย', 1, 'S1_M6')} ${generateSubRow('6.2 เวลานั่งลื่นไถลได้ / ใช้ผู้ช่วยน้อยคนในการเคลื่อนย้าย', 2, 'S1_M6')} ${generateSubRow('6.3 เคลื่อนย้ายบนเตียงได้อย่างอิสระ ไม่มีปัญหาการเสียดสี', 3, 'S1_M6')}
                            ${totalRows}
                            ${assessorRows}
                        </tbody>
                    </table>

                    <div class="note-section">
                        <b>หมายเหตุ</b> 1. คะแนน ≤ 16 ถือเป็นกลุ่มเสี่ยงต่อการเกิดแผลกดทับสูง , คะแนน ≥ 16 ถือเป็นกลุ่มเสี่ยงต่อการเกิดแผลกดทับต่ำ<br>
                        2. กรณีคะแนนน้อยกว่า 16 ให้ประเมินใหม่ทุก 3-5 วัน<br>
                        <b>ผู้ป่วยกลุ่มเสี่ยง</b> 1) ผู้ป่วยถูกจำกัดการเคลื่อนไหว / จำกัดกิจกรรม เช่น มีการดึงถ่วงน้ำหนัก, เข้าเฝือก, On Respirator &nbsp; 2) ผู้ป่วยไม่รู้สึกตัว / เป็นอัมพาต<br>
                        3) ผู้ป่วยที่มีปัญหาการบาดเจ็บของระบบประสาทและไขสันหลัง &nbsp; 4) ผู้ป่วยที่มีภาวะทุพโภชนาการ / มีระดับอัลบูมินในเลือดต่ำกว่า 304 mg/Dl<br>
                        5) ผู้สูงอายุ อายุตั้งแต่ 60 ปีขึ้นไป &nbsp; 6) ผู้ป่วยที่ถ่ายอุจจาระ ปัสสาวะราดบ่อยครั้ง/กลั้นปัสสาวะ อุจจาระไม่ได้ &nbsp; 7) ผู้ป่วยที่มีภาวะซีด<br>
                        8) ผู้ป่วยที่อ้วน/ผอมมาก &nbsp; 9) ผู้ป่วยที่ได้รับยาระงับความรู้สึกหลังการผ่าตัดภายใน 72 ชั่วโมง &nbsp; 10) ผู้ป่วยเรื้อรังที่ต้องนอนพักบนเตียงตลอด
                    </div>

                    <div style="page-break-before: always;"></div>
                    
                    <div style="text-align: right; font-size: 9px; font-weight: bold; line-height: 1.2; margin-bottom: 5px; padding-top: 5px;">
                        Echart-ipd-nurse<br>Braden-Scale-Form หน้า ${(index * 2) + 2}
                    </div>

                    <div class="font-bold mb-2" style="font-size:13px;">ส่วนที่ 2 การปฏิบัติเพื่อป้องกัน / ดูแลการเกิดแผลกดทับ (โดยเฉพาะผู้ป่วยที่มีความเสี่ยงสูง Braden Score < 16)</div>
                    <div style="border: 1px solid #000; padding: 10px; line-height: 1.4; width: 100%; box-sizing: border-box;">
                        <div style="display: flex; margin-bottom: 6px;">
                            <b style="min-width: 80px;">การป้องกัน</b>
                            <div style="flex-grow: 1;">
                                1. พลิกตะแคงตัวทุก 2 ชั่วโมง ตรงตามเวลาที่กำหนด<br>
                                2. ใช้ที่นอนลม<br>
                                3. จับคู่ช่วยกันพลิกตะแคงตัว / ไม่ดึงลากเวลาพลิกตะแคงตัว / ดึงผ้าปูที่นอนให้เรียบตึง<br>
                                4. ประเมินผิวหนังปุ่มกระดูกบริเวณกดทับทุกเวร<br>
                                5. บันทึกการเกิดแผลกดทับทุกครั้งที่พบแผลใหม่<br>
                                6. บันทึกเมื่อมีการเปลี่ยนแปลงของแผล (ตั้งแต่รอยแดง / ใหญ่ขึ้น / ลึกลง / แผลหาย)<br>
                                7. ส่งต่อข้อมูลการเกิดแผลกดทับในการส่งเวรแต่ละครั้ง
                            </div>
                        </div>
                    
                        <div style="display: flex;">
                            <b style="min-width: 80px;">การดูแลแผล</b>
                            <div style="flex-grow: 1;">
                                1. ทำความสะอาดแผลด้วย NSS หลังจากนั้นทาด้วย Zinc Paste<br>
                                2. แผลที่มีเนื้อตาย รายงานแพทย์ทราบเพื่อตัดเนื้อตายออก และ Wet Dressing ด้วย NSS<br>
                                3. ดูแลให้ผู้ป่วยมีภาวะโภชนาการที่เหมาะสม
                            </div>
                        </div>
                    </div>

                    <div class="font-bold mb-2 mt-4" style="font-size:13px;">ส่วนที่ 3 บันทึกแผลกดทับ</div>
                    <table class="table-fixed-layout">
                        <thead>
                            <tr class="bg-gray">
                                <th style="width:22%;">Body Chart</th><th style="width:12%;">ว/ด/ป</th><th style="width:20%;">ตำแหน่งแผล</th><th style="width:10%;">ระดับ</th><th style="width:21%;">ลักษณะแผล</th><th style="width:15%;">ผู้บันทึก</th>
                            </tr>
                        </thead>
                        <tbody>${section3Rows}</tbody>
                    </table>

                    ${isLastChunk ? `
                    <div class="font-bold mb-2 mt-4" style="font-size:13px;">ส่วนที่ 4 สรุปการเกิดแผลกดทับ</div>
                    <div style="border: 1px solid #000; padding: 12px 10px; line-height: 2.0; width: 100%; box-sizing: border-box; font-size: 12px;">
                        <b>วันที่จำหน่าย / ย้าย:</b> ${lastRec.S4_DischargeDate ? formatThaiDate(lastRec.S4_DischargeDate) : '.........................................................................'}<br>
                        
                        <b>ผลปรากฏ:</b> 
                        [ ${lastRec.S4_Outcome === 'ไม่เกิดแผลกดทับ' ? '✔' : '&nbsp;&nbsp;'} ] ไม่เกิดแผลกดทับ &nbsp;&nbsp;&nbsp;&nbsp; 
                        [ ${lastRec.S4_Outcome === 'เกิดแผลกดทับ' ? '✔' : '&nbsp;&nbsp;'} ] เกิดแผลกดทับ &nbsp;&nbsp;
                        <b>วันที่:</b> ${lastRec.S4_UlcerDate ? formatThaiDate(lastRec.S4_UlcerDate) : '................................................................'}<br>
                        
                        <b>ตำแหน่งที่เป็น:</b> ${lastRec.S4_Location || '.......................................................'} &nbsp;&nbsp; 
                        <b>ขนาด:</b> ${lastRec.S4_Size || '.......................................................'} &nbsp;&nbsp; 
                        <b>ลักษณะแผล:</b> ${lastRec.S4_Appearance || '.......................................................'}<br>
                        
                        <b>ระดับของแผลกดทับ:</b> ${lastRec.S4_Stage || '.......................................................'} &nbsp;&nbsp; 
                        <b>จำนวนแผลกดทับ:</b> ${lastRec.S4_Count || '......................................'} แผล
                    </div>` : ''}
                </div>`;
            });

            const fixedElements = `
                <div class="print-patient-info">
                    <div><b>ชื่อ-สกุล:</b> ${this.selectedPatient?.name || '-'} &nbsp;&nbsp;<b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}</div>
                    <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp;&nbsp;<b>AN:</b> ${this.selectedPatient?.an || '-'}</div>
                    <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp;&nbsp;<b>ตึก:</b> ${this.currentWard || '-'} &nbsp;&nbsp;<b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
                </div> 
                <div class="print-global-footer">
                    เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                </div>
            `;

            const pri = window.open('', '_blank');
            pri.document.write(`<html><head><title>พิมพ์แบบประเมินแผลกดทับ</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet"><style>
                body { font-family:'Sarabun',sans-serif; font-size:12px; margin:0; padding:0; line-height: 1.3; color: #000; } 
                .a4-page { width:210mm; min-height:297mm; padding:8mm 10mm 35mm 10mm; margin:auto; box-sizing:border-box; position:relative; } 
                table { width:100%; border-collapse:collapse; margin-bottom:5px; font-size:12px; } 
                th,td { border:1px solid #000; padding:3px 4px; } 
                .no-border { border:none; } 
                .no-border td { border:none; padding:2px; } 
                .text-center { text-align:center; } 
                .bg-gray { background-color:#f0f0f0; } 
                .font-bold { font-weight:bold; } 
                .mb-1 { margin-bottom:2px; } .mb-2 { margin-bottom:4px; } 
                .mt-4 { margin-top:10px; } 
                
                .tight-table td, .tight-table th { padding: 2px 4px; }
                .table-fixed-layout { table-layout: fixed; width: 100%; }
                
                .note-section { font-size: 9px; line-height: 1.3; margin-top: 4px; border: 1px dashed #ccc; padding: 5px; }

                /* Footer ท้ายกระดาษ */
                .print-global-footer {
                    position: fixed; bottom: 0; left: 0; width: 100%; text-align: center;
                    font-size: 8.5px; color: #475569 !important; border-top: 1px solid #9ca3af; 
                    padding-top: 4px; padding-bottom: 4px; background-color: white; z-index: 1000;
                }
                
                /* กรอบข้อมูลผู้ป่วย */
                .print-patient-info {
                    position: fixed; bottom: 25px; right: 15px; width: 260px;
                    border: 1px solid #000 !important; border-radius: 4px; padding: 4px 6px;
                    font-size: 10px; background-color: white !important; z-index: 1000; 
                    line-height: 1.3; color: black !important;
                }

                @media print { 
                    .a4-page { margin: 0; border: none; box-shadow: none; page-break-after: always; padding-bottom: 35mm; } 
                    @page { margin: 5mm; } 
                }
            </style></head><body>
            ${fixedElements}
            ${html}
            <script>window.onload=()=>{setTimeout(()=>{window.print();},800)};</script></body></html>`);
            pri.document.close();
        },
        async loadPatientEdu(an) {
                this.isLoading = true;
                this.isEduEditing = false; // ปิดโหมดแก้ไขไว้เสมอตอนเริ่มเปิด
                try {
                    const res = await fetch(`${this.API_URL}?action=getPatientEdu&an=${an}`);
                    const data = await res.json();
                    
                    // ใช้ค่า Default เป็นฐาน ป้องกัน error กรณีก่อนหน้ามีข้อบกพร่อง
                    const base = this.defaultEduForm();
                    if (Object.keys(data).length > 0) {
                        this.eduForm = { ...base, ...data };
                    } else {
                        this.eduForm = base;
                    }
                } catch (e) { 
                    console.error(e); 
                    this.eduForm = this.defaultEduForm();
                }
                this.isLoading = false;
            },
    
            async savePatientEdu() {
                this.isLoading = true;
                try {
                    const payload = {
                        an: this.selectedPatient.an,
                        hn: this.selectedPatient.hn,
                        ward: this.currentWard,
                        formData: this.eduForm
                    };
                    const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'savePatientEdu', payload }) });
                    const out = await res.json();
                    
                    if(out.status === 'success') {
                        this.showSuccess = true;
                        this.successMsg = 'บันทึกข้อมูลการให้คำแนะนำเรียบร้อย';
                        setTimeout(() => { this.showSuccess = false; }, 3000);
                        this.isEduEditing = false; // ปิดโหมดแก้ไขหลังบันทึกเสร็จ
                    }
                } catch(e) { 
                    alert('เกิดข้อผิดพลาดในการบันทึก'); 
                }
                this.isLoading = false;
            },
    
            printPatientEdu() {
                if (!this.eduForm) return;
            
                // ฟังก์ชันช่วยจัดการเครื่องหมายถูก (Checked) สำหรับ Array และ Boolean
                const getCheck = (id, optionValue = null) => {
                    const d = this.eduForm[id];
                    if (!d) return '☐';
                    // ถ้าส่ง optionValue มา แสดงว่าเป็นข้อที่เป็นตัวเลือกหลายข้อ
                    if (optionValue) {
                        return (d.options && d.options.includes(optionValue)) ? '☑' : '☐';
                    }
                    // ถ้าไม่มี optionValue แสดงว่าเป็น Checkbox หลักของแถวนั้น
                    return d.checked ? '☑' : '☐';
                };
            
                // ชุดข้อมูลสำหรับวนลูปสร้างตาราง (ตามเงื่อนไข 100%)
                const rowsDef = [
                    { id: 'D1', rs: 1, topic: '1.D=Diagnosis<br>การให้ความรู้เรื่องโรค', text: (d) => `ให้ความรู้เรื่องโรคที่เป็นอยู่ถึงสาเหตุ อาการ การปฏิบัติตัว ระบุ <span class="dot-line">${d.text1 || '-'}</span>` },
                    { id: 'M1', rs: 1, topic: '2.M=Medicine<br>การให้ความรู้เรื่องยา', text: (d) => `- ชนิดของยา <span class="dot-line">${d.text1 || '-'}</span><br>- ฤทธิ์ของยา / ผลข้างเคียง <span class="dot-line">${d.text2 || '-'}</span>` },
                    
                    // E Section
                    { id: 'E1', rs: 2, topic: '3.E=Environment & Economic<br>การให้ความรู้ด้านสิ่งแวดล้อมและสภาวะเศรษฐกิจ', text: (d) => `
                        - การดำรงชีวิตที่เหมาะสมกับสภาวะของโรค ได้แก่:<br>
                        ${['การจัดการโภชนาการที่เหมาะสม', 'การออกกำลังกายที่สม่ำเสมอ', 'การใช้ยาและการปฏิบัติตามแผนการรักษา', 'การป้องกันภาวะแทรกซ้อนและการดูแลตนเอง'].map(opt => `${getCheck('E1', opt)} ${opt}`).join(' ')}
                    ` },
                    { id: 'E1', rs: 0, text: (d) => `
                        - ผู้ป่วยจำเป็นที่จะต้องได้รับการดูแลช่วยเหลือในเรื่อง ได้แก่:<br>
                        ${['การสนับสนุนการมีส่วนร่วมของครอบครัวในการดูแลผู้ป่วย', 'การช่วยเหลือด้านสภาวะเศรษฐกิจ', 'ปัญหาด้านสิทธิ์การรักษา'].map(opt => `${getCheck('E2', opt)} ${opt}`).join(' ')}
                    ` },
            
                    // T Section
                    { id: 'T1', rs: 3, topic: '4.T=Treatment<br>แนวทางการรักษาพยาบาล', text: (d) => `
                        - แนวทางการรักษาพยาบาล ได้แก่:<br>
                        ${['การรักษาด้วยยา', 'การให้สารน้ำ', 'ให้เลือด'].map(opt => `${getCheck('T1', opt)} ${opt}`).join(' ')} 
                        ${getCheck('T1', 'การผ่าตัด/หัตถการ')} ผ่าตัด/หัตถการ ระบุ <span class="dot-line">${d.text1 || '-'}</span> 
                        ${getCheck('T1', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${d.text2 || '-'}</span>
                    ` },
                    { id: 'T1', rs: 0, text: (d) => `
                        - สาธิตวิธีการดูแลตนเองในเรื่อง:<br>
                        ${['การให้อาหารทางสายยาง', 'การดูแลแผล'].map(opt => `${getCheck('T2', opt)} ${opt}`).join(' ')} 
                        ${getCheck('T2', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${this.eduForm.T2.text1 || '................'}</span>
                    ` },
                    { id: 'T1', rs: 0, text: (d) => `
                        - ความสำคัญในการดูแลสุขภาพและการปฏิบัติตัวที่ถูกต้อง ได้แก่:<br>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                            ${['รับประทานยาให้ถูกขนาด ถูกเวลา และต่อเนื่อง', 'ควบคุมและเลือกทานอาหารตามคำแนะนำเฉพาะโรค', 'ออกกำลังกายอย่างสม่ำเสมอและเหมาะสมกับสภาพร่างกาย', 'ตรวจวัด น้ำตาล ความดัน และ สังเกตอาการผิดปกติ', 'งด การสูบบุหรี่ และเครื่องดื่มแอลกอฮอล์ทุกชนิด', 'สังเกตและ ดูแลบาดแผลหรืออาการผิดปกติ'].map(opt => `<span>${getCheck('T3', opt)} ${opt}</span>`).join('')}
                        </div>
                    ` },
            
                    // H Section
                    { id: 'H1', rs: 1, topic: '5.H=Health<br>ภาวะสุขภาพ โรคที่เจ็บป่วย การส่งเสริมด้านร่างกาย จิตใจ', text: (d) => `
                        - ความรู้เรื่องการลดปัจจัยเสี่ยงต่อการเกิดโรคของผู้ป่วย ได้แก่:<br>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 2px;">
                            ${['ควบคุมอาหารตามหลักโภชนาการ ออกกำลังกายสม่ำเสมอ', 'งด การสูบบุหรี่ และเครื่องดื่มแอลกอฮอล์ทุกชนิด', 'จัดการความเครียด/พักผ่อนให้เพียงพอ', 'ใช้ยาตามแผนการรักษา อย่างเคร่งครัด', 'หลีกเลี่ยงความเสี่ยงต่อการติดเชื้อ'].map(opt => `<span>${getCheck('H1', opt)} ${opt}</span>`).join('')}
                        </div>
                    ` },
            
                    // O Section
                    { id: 'O1', rs: 1, topic: '6. O=Out Patient<br>การดูแลต่อเนื่อง', text: (d) => `- การมาตรวจตามนัด วันที่ <span class="dot-line">${d.text1 || '-'}</span> <br>สถานที่ <span class="dot-line">${d.text2 || '-'}</span> <br>การเตรียมตัว <span class="dot-line">${d.text3 || '.............'}</span><br>
                        - แหล่งข้อมูลเครือข่ายหรือแหล่งสนับสนุนทางสังคม:<br>
                        ${['ผู้นำชุมชน', 'อสม.', 'รพ.สต.'].map(opt => `${getCheck('O2', opt)} ${opt}`).join(' ')} 
                        ${getCheck('O2', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${this.eduForm.O2?.text1 || '-'}</span><br>- การขอความช่วยเหลือ 1669
                    ` },            
                    
                    // Diet Section
                    { id: 'Diet1', rs: 1, topic: '7. D-Diet<br>การเลือกรับประทานอาหาร', text: (d) => `
                        ความรู้ความเข้าใจด้านอาหารที่เหมาะสมกับสภาวะของโรค:<br>
                        - อาหารเฉพาะโรค ระบุ <span class="dot-line">${d.text1 || '-'}</span><br>
                        - อาหารที่ควรหลีกเลี่ยง <span class="dot-line">${d.text2 || '-'}</span> อื่นๆ <span class="dot-line">${d.text3 || '-'}</span>
                    ` }
                ];
            
                let htmlRows = '';
                rowsDef.forEach(row => {
                    const d = this.eduForm[row.id];
                    const dateStr = d.date ? this.formatThaiDateShort(d.date) : '.................';
                    
                    // ลบ Inline-Style ที่ฟิกซ์ font-size/line-height ออก เพื่อให้ CSS คุมได้ทั้งหมด
                    htmlRows += `
                        <tr>
                            ${row.rs > 0 ? `<td rowspan="${row.rs}" style="font-weight:bold; width: 15%; background-color:#f8fafc;">${row.topic}</td>` : ''}
                            <td style="width: 45%;">${row.text(d)}</td>
                            <td style="width: 8%; text-align:center;">${dateStr}</td>
                            <td style="width: 22%; text-align:center; font-size: 6px;">
                                ${d.provider || '.................'}<br>
                                <span style="color:#666;">${d.pos ? '(' + d.pos + ')' : ''}</span>
                            </td>
                            <td style="width: 10%; text-align:center;">${d.receiver || '.................'}</td>
                        </tr>
                    `;
                });
            
                const pri = window.open('', '_blank');
                pri.document.write(`
                <html>
                <head>
                    <title>Print D-M-E-T-H-O-D</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                        
                        body { 
                            font-family: 'Sarabun', sans-serif; 
                            margin: 0; padding: 0; color: #000; 
                            font-size: 9pt; /* บังคับขนาดอักษรพื้นฐาน */
                        } 
            
                        .a4-page { 
                            width: 100%; 
                            max-width: 210mm;
                            margin: auto; 
                            padding: 5mm 10mm; 
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            min-height: 285mm; /* ตั้งความสูงจำลองหน้า A4 เพื่อดัน Footer ลงล่างสุด */
                        } 
            
                        /* จัดการรหัสเอกสารให้อยู่ฝั่งขวา */
                        .header-right {
                            text-align: right;
                            font-size: 8pt;
                            line-height: 1.2;
                            margin-bottom: 5px;
                        }
            
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 5px; 
                            table-layout: fixed; 
                        } 
                        
                        th, td { 
                            border: 1px solid #000; 
                            padding: 3px 4px; /* ลด padding ลงเล็กน้อยเพื่อประหยัดพื้นที่ */
                            font-size: 9pt !important; /* ปรับให้เท่ากับ body หรือเล็กกว่าตามต้องการ */
                            vertical-align: top;
                            word-wrap: break-word;
                            line-height: 1.2; /* ปรับระยะห่างระหว่างบรรทัดให้แคบลง */
                        }
                        
                        th { 
                            background-color: #eee !important; 
                            text-align: center;
                            -webkit-print-color-adjust: exact; 
                        } 
                        /* 2. บังคับให้กล่องข้อมูลผู้ป่วยและ Footer อยู่ล่างสุดของทุกหน้า */
                        .fixed-footer-container {
                            position: fixed;
                            bottom: 5mm; /* ระยะห่างจากขอบล่างของกระดาษ */
                            left: 10mm;
                            right: 10mm;
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }
            
                        /* กล่องข้อมูลผู้ป่วย - เปลี่ยนจาก Fixed เป็น Flex ปกติ เพื่อไม่ให้ทับเนื้อหา */
                        .patient-box-container {
                            display: flex;
                            justify-content: flex-end;
                            width: 100%;
                        }
                                    
                        .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
            
                        /* Footer ท้ายกระดาษ - เปลี่ยนจาก Fixed เป็น Margin Auto เพื่อให้อยู่ท้ายเนื้อหาพอดี */
                        .print-footer { 
                            width: 100%; 
                            text-align: center;
                            font-size: 8pt !important; /* ขนาดอักษรเท่าตาราง */
                            color: #444; 
                            border-top: 1px solid #ccc; 
                            padding-top: 8px; 
                            margin-top: auto; /* ดันไปอยู่ล่างสุดของ container เสมอ */
                        }
            
                        .dot-line { border-bottom: 1px dotted #000; min-width: 40px; display: inline-block; }
            
                        @media print {
                            @page {size: A4; margin: 5mm 5mm 0mm 5mm; }
                            body { -webkit-print-color-adjust: exact; }
                            tr { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <div class="a4-page">
                        <div class="header-right">
                            <div>Echart-ipd-nurse</div>
                            <div>Discharge-Plan-Form</div>
                        </div>
            
                        <h2 style="text-align:center; font-size:13pt; margin: 5px 0 10px 0;">การให้คำแนะนำการปฏิบัติตัวระหว่างเข้ารับการรักษาในโรงพยาบาลและเมื่อผู้ป่วยกลับบ้าน</h2>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:15%">เรื่อง</th>
                                    <th style="width:45%">คำแนะนำ</th>
                                    <th style="width:8%">ว/ด/ป</th>
                                    <th style="width:22%">ผู้ให้คำแนะนำ</th>
                                    <th style="width:10%">ผู้รับคำแนะนำ</th>
                                </tr>
                            </thead>
                            <tbody>${htmlRows}</tbody>
                        </table>
            
                        <div class="fixed-footer-container">
                            <div class="patient-box-container">
                                <div class="print-patient-box">
                                    <div><b>ชื่อ-สกุล:</b> ${this.selectedPatient?.name || '-'} &nbsp; <b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}</div>
                                    <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp; <b>AN:</b> ${this.selectedPatient?.an || '-'}</div>                
                                    <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp; <b>ตึก:</b> ${this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
                                </div>
                            </div>
                        
                            <div class="print-footer">
                                เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                            </div>
                        </div>
                    </div>
            
                    <script>
                        window.onload = () => { 
                            setTimeout(() => { window.print(); window.close(); }, 500); 
                        }
                    </script>
                </body>
                </html>
                `);
                pri.document.close();
            },
        // ==========================================
        // ฟังก์ชันสำหรับ Focus List
        // ==========================================
        // ฟังก์ชันช่วยเหลือสำหรับแสดง Modal
        focusAlert(msg) {
            this.focusModal = { show: true, type: 'alert', msg: msg, input: '', index: -1 };
        },
        // เมื่อกดปุ่ม "ตกลง" ใน Modal
        async executeFocusModal() {
            if (this.focusModal.type === 'confirm') {
                this.focusList.splice(this.focusModal.index, 1);
                this.focusModal.show = false;
                await this.saveFocusToDB();
                
            } else if (this.focusModal.type === 'confirm_progress') {
                this.progressNotes.splice(this.focusModal.index, 1);
                this.focusModal.show = false;
                await this.saveProgressToDB();
                
            } else if (this.focusModal.type === 'prompt') {
                // กรณี: บันทึกของ Focus List
                if (!this.focusModal.input || !this.focusModal.input.trim()) {
                    this.focusAlert('กรุณาระบุชื่อ Template'); return;
                }
                const pName = this.focusModal.input.trim();
                this.focusModal.show = false;
                this.isLoading = true;
                
                try {
                    const payload = { problemName: pName, focus: this.focusForm.focus, goal: this.focusForm.goal };
                    const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveFocusTemplate', payload }) });
                    const out = await res.json();
                    
                    if(out.status === 'success') {
                        this.focusTemplates.push({...payload, id: new Date().getTime()});
                        await this.addOrUpdateFocus(); // สั่งลงตารางและฐานข้อมูลคนไข้
                        this.focusAlert('บันทึกและจัดเก็บเป็น Template เรียบร้อยแล้ว');
                    }
                } catch(e) { this.focusAlert('เกิดข้อผิดพลาดในการบันทึก Template'); }
                this.isLoading = false;
                
            } else if (this.focusModal.type === 'prompt_progress') {
                // กรณี: บันทึกของ Progress Note
                if (!this.focusModal.input || !this.focusModal.input.trim()) {
                    this.focusAlert('กรุณาระบุชื่อ Template'); return;
                }
                const pName = this.focusModal.input.trim();
                this.focusModal.show = false;
                this.isLoading = true;
                
                try {
                    const payload = { 
                        templateName: pName, 
                        focus: this.pnForm.focus, 
                        s: this.pnForm.s, o: this.pnForm.o, i: this.pnForm.i, e: this.pnForm.e 
                    };
                    const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveNursingTemplate', payload }) });
                    const out = await res.json();
                    
                    if(out.status === 'success') {
                        this.nursingTemplates.push({...payload, id: new Date().getTime()});
                        await this.addOrUpdateProgressNote(); // สั่งลงตารางและฐานข้อมูลคนไข้
                        this.focusAlert('บันทึกและจัดเก็บเป็น Template เรียบร้อยแล้ว');
                    }
                } catch(e) { this.focusAlert('เกิดข้อผิดพลาดในการบันทึก Template Progress Note'); }
                this.isLoading = false;
                
            } else {
                this.focusModal.show = false;
            }
        },
        async loadFocusListInit() {
            this.isLoading = true;
            try {
                // โหลด List ของคนไข้
                const res = await fetch(`${this.API_URL}?action=getFocusList&an=${this.selectedPatient.an}`);
                this.focusList = await res.json() || [];
                
                // โหลด Template ทั้งหมด
                const resT = await fetch(`${this.API_URL}?action=getFocusTemplates`);
                this.focusTemplates = await resT.json() || [];
                
                this.clearFocusForm();
            } catch (e) { console.error(e); }
            this.isLoading = false;
        },

        clearFocusForm() {
            this.focusForm = { id: '', focus: '', goal: '', startDate: this.getTodayDateInput(), endDate: '' };
            this.editingFocusIndex = -1;
        },

        getTodayDateInput() {
            const d = new Date();
            return d.toISOString().split('T')[0];
        },

        async addOrUpdateFocus() {
            if (!this.focusForm.focus || !this.focusForm.goal) {
                this.focusAlert('กรุณากรอกปัญหาและเป้าหมายให้ครบถ้วน'); return;
            }
            
            const newItem = {
                id: this.focusForm.id || new Date().getTime().toString(),
                focus: this.focusForm.focus, goal: this.focusForm.goal,
                startDate: this.focusForm.startDate, endDate: this.focusForm.endDate
            };

            if (this.editingFocusIndex > -1) { this.focusList[this.editingFocusIndex] = newItem; } 
            else { this.focusList.push(newItem); }
            
            this.clearFocusForm();
            await this.saveFocusToDB();
        },
        // ฟังก์ชันสำหรับกดสิ้นสุดปัญหาแบบรวดเร็ว
        async endFocus(index) {
            // ดึงวันที่ปัจจุบันมาใส่ในช่อง endDate ของรายการที่เลือก
            this.focusList[index].endDate = this.getTodayDateInput();
            
            // สั่งซิงค์ข้อมูลขึ้นฐานข้อมูลทันที
            await this.saveFocusToDB();
            
            // แสดงแจ้งเตือนสำเร็จ
            this.focusAlert('ลงวันที่สิ้นสุดปัญหาเป็นวันนี้เรียบร้อยแล้ว');
        },

        editFocus(index) {
            this.focusForm = { ...this.focusList[index] };
            this.editingFocusIndex = index;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async deleteFocus(index) {
            // เรียก Modal ยืนยันการลบ
            this.focusModal = { show: true, type: 'confirm', msg: 'ยืนยันการลบรายการปัญหานี้?', input: '', index: index };
        },

        async saveFocusToDB() {
            // เอา this.isLoading = true ออก เพื่อให้หน้าเว็บไม่กระตุกเวลาบันทึกเบื้องหลัง
            try {
                const payload = {
                    an: this.selectedPatient.an,
                    hn: this.selectedPatient.hn,
                    ward: this.currentWard,
                    focusData: this.focusList
                };
                const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveFocusList', payload }) });
                const out = await res.json();
                
                if(out.status === 'success') {
                    // แสดงแจ้งเตือนสีเขียวมุมขวาบนเบาๆ ว่าบันทึกสำเร็จ
                    this.showSuccess = true;
                    this.successMsg = 'ซิงค์ข้อมูลลงฐานข้อมูลเรียบร้อย';
                    setTimeout(() => { this.showSuccess = false; }, 3000);
                }
            } catch(e) { 
                console.error('เกิดข้อผิดพลาดในการบันทึก', e); 
            }
        },

        // --- ระบบ Template ---
        saveAsNewTemplate() {
            if (!this.focusForm.focus || !this.focusForm.goal) {
                this.focusAlert('กรุณากรอกปัญหาและเป้าหมายเพื่อสร้าง Template'); return;
            }
            this.focusModal = { show: true, type: 'prompt', msg: 'ตั้งชื่อให้รายการปัญหานี้ (Problem Name):', input: '', index: -1 };
        },

        selectFocusTemplate(t) {
            this.focusForm.focus = t.focus;
            this.focusForm.goal = t.goal;
            this.showFocusTemplateModal = false;
        },

        // --- ระบบพิมพ์ Focus List ---
        printFocusList() {
            if (!this.focusList || this.focusList.length === 0) {
                this.focusAlert('ยังไม่มีข้อมูลสำหรับพิมพ์'); return;
            }

            // จัดกลุ่มรายการหน้าละ 8 ข้อ เพื่อไม่ให้ล้นหน้ากระดาษ
            const itemsPerPage = 8; 
            const pages = [];
            for (let i = 0; i < this.focusList.length; i += itemsPerPage) {
                pages.push(this.focusList.slice(i, i + itemsPerPage));
            }
            const totalPages = pages.length;

            let htmlPages = '';
            
            // วนลูปสร้างหน้ากระดาษทีละหน้า
            pages.forEach((pageItems, pageIndex) => {
                let htmlRows = '';
                pageItems.forEach((item, idx) => {
                    const actualIndex = (pageIndex * itemsPerPage) + idx + 1;
                    const startStr = item.startDate ? this.formatThaiDateShort(item.startDate) : '-';
                    const endStr = item.endDate ? this.formatThaiDateShort(item.endDate) : '-';
                    htmlRows += `
                        <tr>
                            <td style="text-align:center;">${actualIndex}</td>
                            <td style="white-space: pre-line;">${item.focus || '-'}</td>
                            <td style="white-space: pre-line;">${item.goal || '-'}</td>
                            <td style="text-align:center;">${startStr}</td>
                            <td style="text-align:center;">${endStr}</td>
                        </tr>
                    `;
                });

                htmlPages += `
                    <div class="a4-page">
                        <div class="print-header-top-right">
                            <div>Echart-ipd-nurse</div>
                            <div>Focus-List-Form หน้า ${pageIndex + 1}/${totalPages}</div>
                        </div>

                        <div class="main-title">
                            <div>โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน</div>
                            <div>รายการปัญหาสุขภาพทางการพยาบาลของผู้ป่วยตั้งแต่แรกรับจนจำหน่าย (FOCUS LIST)</div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 8%;">ลำดับที่<br>ปัญหา</th>
                                    <th style="width: 34%;">ปัญหา<br>(Focus/Problem)</th>
                                    <th style="width: 34%;">เป้าหมาย<br>(Goal/Out comes)</th>
                                    <th style="width: 12%;">วันที่พบ<br>ปัญหา</th>
                                    <th style="width: 12%;">วันที่สิ้นสุด<br>ปัญหา</th>
                                </tr>
                            </thead>
                            <tbody>${htmlRows}</tbody>
                        </table>

                        <div class="fixed-footer-container">
                            <div class="patient-box-container">
                                <div class="print-patient-box">
                                    <div><b>ชื่อ-สกุล:</b> ${this.selectedPatient?.name || '-'} &nbsp; <b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}</div>
                                    <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp; <b>AN:</b> ${this.selectedPatient?.an || '-'}</div>                
                                    <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp; <b>ตึก:</b> ${this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
                                </div>
                            </div>
                            <div class="print-footer">
                                เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                            </div>
                        </div>
                    </div>
                `;
            });

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <html>
            <head>
                <title>Print Focus List</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                    
                    body { font-family: 'Sarabun', sans-serif; font-size: 11pt; margin: 0; padding: 0; color: #000; background: #525659; }
                    
                    /* สร้างกรอบ A4 จำลองที่จับความสูงตายตัว */
                    .a4-page { 
                        width: 210mm; 
                        height: 296mm; /* บังคับความสูงเป็น 1 หน้า A4 เสมอ */
                        margin: 10mm auto; 
                        padding: 25mm 10mm 45mm 10mm; 
                        position: relative; /* สำคัญมาก เพื่อให้ header/footer เกาะตามหน้านี้ */
                        box-sizing: border-box; 
                        background: #fff;
                        page-break-after: always; /* บังคับขึ้นหน้าใหม่เสมอเมื่อหมดหน้า */
                        overflow: hidden;
                    }
                    
                    /* หัวกระดาษขวาบน (เกาะขอบหน้า .a4-page) */
                    .print-header-top-right {
                        position: absolute;
                        top: 10mm;
                        right: 10mm;
                        text-align: right;
                        font-size: 8pt;
                        font-weight: bold;
                        line-height: 1.2;
                    }

                    .main-title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 15px; line-height: 1.4; }

                    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt !important; vertical-align: top; word-wrap: break-word; }
                    th { background-color: #eee !important; text-align: center; font-weight: bold; -webkit-print-color-adjust: exact; }

                    /* กรอบท้ายกระดาษ (เกาะขอบล่างของหน้า .a4-page) */
                    .fixed-footer-container {
                        position: absolute; /* เปลี่ยนเป็น absolute ทำให้ไม่ทับตาราง */
                        bottom: 5mm; 
                        left: 10mm;
                        right: 10mm;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                    .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
                    .print-footer { 
                        width: 100%; text-align: center; font-size: 8pt !important; color: #444; 
                        border-top: 1px solid #ccc; padding-top: 8px; margin-top: auto; 
                    }

                    /* ตอนปริ้นให้ตัดขอบเทาออก */
                    @media print {
                        @page { size: A4; margin: 0; }
                        body { background: #fff; -webkit-print-color-adjust: exact; }
                        .a4-page { margin: 0; box-shadow: none; border: none; }
                        .a4-page:last-child { page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                ${htmlPages}

                <script>
                    window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
                </script>
            </body>
            </html>
            `);
            printWindow.document.close();
        },
        // ==========================================
        // ฟังก์ชันสำหรับ Nursing Progress Note
        // ==========================================
        async loadProgressNotesInit() {
            this.isLoading = true;
            try {
                // ดึง Note ของผู้ป่วย
                const res = await fetch(`${this.API_URL}?action=getNursingNotes&an=${this.selectedPatient.an}`);
                let notes = await res.json() || [];
                
                // สั่งเรียงลำดับจาก "ใหม่ล่าสุด" ไป "เก่า" (อิงจาก ID ที่ตั้งเป็น Timestamp ไว้)
                this.progressNotes = notes.sort((a, b) => Number(b.id) - Number(a.id));
                
                // ดึง Template กลาง
                const resT = await fetch(`${this.API_URL}?action=getNursingTemplates`);
                this.nursingTemplates = await resT.json() || [];
                
                // ตรวจสอบ Focus List เผื่อมีการสั่งซิงค์ข้ามไฟล์
                if (!this.focusList || this.focusList.length === 0) {
                    const resF = await fetch(`${this.API_URL}?action=getFocusList&an=${this.selectedPatient.an}`);
                    this.focusList = await resF.json() || [];
                }

                this.clearProgressForm();
            } catch (e) { console.error(e); }
            this.isLoading = false;
        },

        clearProgressForm() {
            this.pnForm = { 
                id: '', date: this.getTodayDateInput(), shift: 'เช้า (08.00-16.00)', 
                time: new Date().toTimeString().slice(0, 5), 
                focus: '', s: '', o: '', i: '', e: '', eTime: '',
                nurse: this.nurseName, pos: this.nursePosition, 
                addToFocusList: false 
            };
            this.editingProgressIndex = -1;
        },

        async addOrUpdateProgressNote() {
            if (!this.pnForm.focus || (!this.pnForm.s && !this.pnForm.o && !this.pnForm.i && !this.pnForm.e)) {
                this.focusAlert('กรุณากรอก FOCUS และรายละเอียดอย่างน้อย 1 ช่อง (S,O,I,E)'); return;
            }
            
            const newItem = { ...this.pnForm, id: this.pnForm.id || new Date().getTime().toString() };
            
            if (this.editingProgressIndex > -1) {
                this.progressNotes[this.editingProgressIndex] = newItem;
            } else {
                this.progressNotes.unshift(newItem);
            }

            // --- ซิงค์เข้า Focus List อัตโนมัติ ---
            if (this.pnForm.addToFocusList) {
                // เช็คว่ามีปัญหาชื่อเดียวกันใน Focus List ไหม
                const exist = this.focusList.find(f => f.focus === this.pnForm.focus);
                if (!exist) {
                    this.focusList.push({
                        id: new Date().getTime().toString(),
                        focus: this.pnForm.focus,
                        goal: '-',
                        startDate: this.pnForm.date,
                        endDate: ''
                    });
                    // เซฟ Focus List ขึ้น DB ทันที
                    const pF = { an: this.selectedPatient.an, hn: this.selectedPatient.hn, ward: this.currentWard, focusData: this.focusList };
                    fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveFocusList', payload: pF }) });
                }
            }

            this.clearProgressForm();
            await this.saveProgressToDB();
        },

        async deleteProgressNote(index) {
            this.focusModal = { show: true, type: 'confirm_progress', msg: 'ยืนยันการลบบันทึกพยาบาลนี้?', input: '', index: index };
        },

        async saveProgressToDB() {
            try {
                const payload = { an: this.selectedPatient.an, hn: this.selectedPatient.hn, ward: this.currentWard, noteData: this.progressNotes };
                await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveNursingNotes', payload }) });
                
                this.showSuccess = true; this.successMsg = 'ซิงค์ข้อมูลลงฐานข้อมูลเรียบร้อย';
                setTimeout(() => { this.showSuccess = false; }, 3000);
            } catch(e) { console.error(e); }
        },

        editProgressNote(index) {
            this.pnForm = { ...this.progressNotes[index], addToFocusList: false };
            this.editingProgressIndex = index;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        // --- ระบบ Template & Re-Problem ---
        saveProgressAsTemplate() {
            if (!this.pnForm.focus) { 
                this.focusAlert('กรุณากรอก FOCUS ก่อนสร้าง Template'); return; 
            }
            this.focusModal = { show: true, type: 'prompt_progress', msg: 'ตั้งชื่อ Template นี้ (เช่น ชื่อโรค/อาการ):', input: '', index: -1 };
        },

        openProgressTemplateModal() { this.searchProgressTemplate = ''; this.showProgressTemplateModal = true; },
        selectProgressTemplate(t) {
            this.pnForm.focus = t.focus; this.pnForm.s = t.s; this.pnForm.o = t.o; this.pnForm.i = t.i; this.pnForm.e = t.e;
            this.showProgressTemplateModal = false;
        },

        openReProblemModal() { this.searchReProblem = ''; this.showReProblemModal = true; },
        selectReProblem(p) {
            this.pnForm.focus = p.focus; this.pnForm.s = p.s; this.pnForm.o = p.o; this.pnForm.i = p.i; this.pnForm.e = p.e;
            this.showReProblemModal = false;
        },
        // เปิดหน้าต่างสร้าง Template ใหม่ (ฟอร์มเปล่า)
        openCreateTemplateModal() {
            this.newTemplateForm = { templateName: '', focus: '', s: '', o: '', i: '', e: '' };
            this.showCreateTemplateModal = true;
        },

        // เซฟ Template ใหม่เข้าคลังอย่างเดียว (ไม่ลงตารางคนไข้)
        async saveIndependentTemplate() {
            if (!this.newTemplateForm.templateName || !this.newTemplateForm.focus) {
                this.focusAlert('กรุณากรอกชื่อ Template และ FOCUS ให้ครบถ้วน'); 
                return;
            }
            
            this.isLoading = true;
            try {
                const payload = { ...this.newTemplateForm };
                const res = await fetch(this.API_URL, { method: 'POST', body: JSON.stringify({ action: 'saveNursingTemplate', payload }) });
                const out = await res.json();
                
                if (out.status === 'success') {
                    // ยัดลง Array เพื่อให้กดใช้ได้เลยไม่ต้องรีเฟรช
                    this.nursingTemplates.push({...payload, id: new Date().getTime()});
                    this.showCreateTemplateModal = false;
                    this.focusAlert('สร้าง Template ใหม่สำเร็จ (บันทึกเข้าคลังเรียบร้อยแล้ว)');
                }
            } catch (e) { 
                this.focusAlert('เกิดข้อผิดพลาดในการบันทึก Template'); 
            }
            this.isLoading = false;
        },
        
        printProgressNote() {
            if (!this.progressNotes || this.progressNotes.length === 0) {
                this.focusAlert('ยังไม่มีข้อมูลสำหรับพิมพ์'); return;
            }

            // 1. คัดลอกข้อมูลและสั่งเรียงลำดับใหม่เฉพาะสำหรับพิมพ์
            const sortedNotesForPrint = [...this.progressNotes].sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
                const dateTimeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
                
                // หากวันที่และเวลา Actual Time เท่ากันเป๊ะ
                if (dateTimeA === dateTimeB) {
                    // ให้เรียงตาม ID (ซึ่งก็คือเวลาที่กดบันทึกข้อมูล) จากเก่าไปใหม่
                    return Number(a.id) - Number(b.id);
                }
                
                // เรียงตามวันที่และเวลา Actual Time (เก่าไปใหม่)
                return dateTimeA - dateTimeB; 
            });

            const itemsPerPage = 2; // บังคับหน้าละ 2 รายการตามข้อกำหนด
            const pages = [];
            
            // 2. ใช้ sortedNotesForPrint แทน this.progressNotes ในการจัดหน้า
            for (let i = 0; i < sortedNotesForPrint.length; i += itemsPerPage) {
                pages.push(sortedNotesForPrint.slice(i, i + itemsPerPage));
            }
            const totalPages = pages.length;

            let htmlPages = '';
            
            pages.forEach((pageItems, pageIndex) => {
                let htmlRows = '';
                pageItems.forEach((item, idx) => {
                    const dateStr = item.date ? this.formatThaiDateShort(item.date) : '';
                    // ตัดเอาเฉพาะเวลาเวร
                    const shiftMatch = item.shift.match(/\(([^)]+)\)/);
                    const shiftTime = shiftMatch ? shiftMatch[1] : item.shift;
                    
                    // 1. แยกเนื้อหา S, O, I ออกมาไว้ชุดแรก
                    let soiHtml = '';
                    if(item.s) soiHtml += `<b>S:</b> ${item.s.replace(/\n/g, '<br>')}<br>`;
                    if(item.o) soiHtml += `<b>O:</b> ${item.o.replace(/\n/g, '<br>')}<br>`;
                    if(item.i) soiHtml += `<b>I:</b> ${item.i.replace(/\n/g, '<br>')}<br>`;
                    
                    // 2. แยกเนื้อหา E ออกมาไว้ชุดสอง
                    let eHtml = '';
                    if(item.e) eHtml += `<b>E:</b> ${item.e.replace(/\n/g, '<br>')}<br>`;
                    
                    // เส้นขีดคั่นระหว่างปัญหา (หนาขึ้นเพื่อแบ่งให้ชัดเจน)
                    const borderBottom = (idx === 0 && pageItems.length === 2) ? 'border-bottom: 2px solid #000 !important;' : '';

                    // 3. สร้าง HTML โดยแบ่งเป็น 2 แถว (ใช้ Rowspan)
                    htmlRows += `
                        <tr>
                            <td rowspan="2" style="text-align:center; ${borderBottom}">${dateStr}<br>${shiftTime}</td>
                            <td style="text-align:center; border-bottom: 0 !important; padding-bottom: 2px;">${item.time || ''}</td>
                            <td rowspan="2" style="font-weight:bold; ${borderBottom}">${item.focus ? item.focus.replace(/\n/g, '<br>') : '-'}</td>
                            <td style="border-bottom: 0 !important; padding-bottom: 2px;">
                                ${soiHtml}
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center; border-top: 0 !important; padding-top: 4px; ${borderBottom}"><b>${item.eTime || ''}</b></td>
                            <td style="border-top: 0 !important; padding-top: 4px; ${borderBottom}">
                                ${eHtml}
                                <br>
                                <div style="text-align:right; padding-right: 20px;">
                                    ลงชื่อ ${item.nurse} ผู้บันทึก<br>
                                    ${item.pos}
                                </div>
                            </td>
                        </tr>
                    `;
                });

                htmlPages += `
                    <div class="a4-page">
                        <div class="print-header-top-right">
                            <div>Echart-ipd-nurse</div>
                            <div>FR-IPD-006 หน้า ${pageIndex + 1}/${totalPages}</div>
                        </div>
                        <div class="main-title">
                            <div>โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน</div>
                            <div>ใบบันทึกความก้าวหน้าทางการพยาบาล (Nursing Progress Note)</div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 15%;">DATE /<br> SHIFT</th>
                                    <th style="width: 8%;">Actual Time</th>
                                    <th style="width: 22%;">FOCUS / PROBLEM</th>
                                    <th style="width: 55%;">Nursing Progress Note</th>
                                </tr>
                            </thead>
                            <tbody>${htmlRows}</tbody>
                        </table>
                        <div class="fixed-footer-container">
                            <div class="patient-box-container">
                                <div class="print-patient-box">
                                    <div><b>ชื่อ-สกุล:</b> ${this.selectedPatient?.name || '-'} &nbsp; <b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}</div>
                                    <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp; <b>AN:</b> ${this.selectedPatient?.an || '-'}</div>                
                                    <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp; <b>ตึก:</b> ${this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
                                </div>
                            </div>
                            <div class="print-footer">
                                เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                            </div>
                        </div>
                    </div>
                `;
            });

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <html>
            <head>
                <title>Print Nursing Progress Note</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                    body { font-family: 'Sarabun', sans-serif; font-size: 11pt; margin: 0; padding: 0; color: #000; background: #525659; }
                    .a4-page { 
                        width: 210mm; height: 296mm; margin: 8mm auto; 
                        padding: 25mm 10mm 45mm 10mm; position: relative; box-sizing: border-box; 
                        background: #fff; page-break-after: always; overflow: hidden;
                    }
                    .print-header-top-right { position: absolute; top: 10mm; right: 10mm; text-align: right; font-size: 8pt; font-weight: bold; line-height: 1.2; }
                    .main-title { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 15px; line-height: 1.4; }
                    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    th, td { border: 1px solid #000; padding: 8px; font-size: 10pt !important; vertical-align: top; word-wrap: break-word; }
                    th { background-color: #eee !important; text-align: center; font-weight: bold; -webkit-print-color-adjust: exact; }
                    
                    /* CSS Footer Fixed Container 100% ตามที่ให้มา */
                    .fixed-footer-container { position: absolute; bottom: 5mm; left: 10mm; right: 10mm; display: flex; flex-direction: column; gap: 10px; }
                    .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                    .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
                    .print-footer { width: 100%; text-align: center; font-size: 8pt !important; color: #444; border-top: 1px solid #ccc; padding-top: 8px; margin-top: auto; }

                    @media print {
                        @page { size: A4; margin: 0; }
                        body { background: #fff; -webkit-print-color-adjust: exact; }
                        .a4-page { margin: 0; box-shadow: none; border: none; }
                        .a4-page:last-child { page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                ${htmlPages}
                <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
            </body>
            </html>
            `);
            printWindow.document.close();
        },
        // ------------------------------------------
        // แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย
        // ------------------------------------------
        defaultDischargeForm() {
            return {
                date: this.getTodayDateInput(), exitDate: this.getTodayDateInput(), time: new Date().toTimeString().slice(0, 5),
                type: '', condition: '', symptom: '',
                bt: '', pr: '', rr: '', bp: '',
                d1: false, d2: false, d3: false, d4: false, d_other: false, d_other_text: '',
                e1: false, e_other: false, e_other_text: '',
                t1: false, t2: false, t_other: false, t_other_text: '',
                h_other: false, h_other_text: '',
                diet1: false, diet2: false, diet3: false, diet4: false, diet5: false, diet6: false, diet7: false, diet7_text: '', diet_other: false, diet_text: '',
                med_status: '', med_text: '',
                fu_status: '', fu_text: '', wound_care: false, wound_date: '', cont_other: false, cont_text: '',
                care_loc: '', care_loc_text1: '', care_loc_text2: '', care_loc_text3: '', care_loc_text4: '', care_loc_text5: '',
                receiverName: '', relation: '', nurseName: this.nurseName || '', pos: this.nursePosition || ''
            };
        },
        async loadDischargeRecordInit() {
            this.isLoading = true;
            try {
                const res = await fetch(`${this.API_URL}?action=getDischargeRecord&an=${this.selectedPatient.an}`);
                const data = await res.json();
                // ถ้ามีข้อมูลเดิมให้ดึงมาแสดง ถ้าไม่มีให้ใช้ฟอร์มเปล่า
                this.dischargeForm = (data && Object.keys(data).length > 0) ? data : this.defaultDischargeForm();
            } catch (e) { 
                console.error(e); 
                this.dischargeForm = this.defaultDischargeForm(); 
            }
            this.isLoading = false;
        },
        async saveDischargeManual() {
            if (!this.selectedPatient) return;
            
            this.isLoading = true;
            try {
                // จัดรูปแบบให้ตรงกับโครงสร้าง data.action และ data.payload ใน doPost ของคุณ
                const requestData = {
                    action: 'saveDischargeRecord', // ตรงกับ case ใน switch
                    payload: {                     // มัดรวมตัวแปรใส่ payload
                        an: this.selectedPatient.an,
                        hn: this.selectedPatient.hn,
                        ward: this.currentWard,
                        formData: this.dischargeForm
                    }
                };

                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify(requestData)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    // แสดงแจ้งเตือนสำเร็จ
                    this.dialog = {
                        show: true,
                        type: 'success',
                        title: 'บันทึกสำเร็จ',
                        msg: 'ข้อมูลแบบบันทึกการพยาบาลผู้ป่วยจำหน่ายถูกจัดเก็บเรียบร้อยแล้ว'
                    };
                }
            } catch (e) {
                console.error("Save Error:", e);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            } finally {
                this.isLoading = false;
            }
        },
        autoSaveDischarge() {
            // ไม่ต้องทำงานอัตโนมัติแล้ว
        },

        printDischargeRecord() {
            const d = this.dischargeForm;
            const ck = (val) => val ? '☑' : '☐';
            const rd = (val, target) => val === target ? '☑' : '☐';
            const d1Str = d.date ? this.formatThaiDateShort(d.date) : '..............................';
            const d2Str = d.exitDate ? this.formatThaiDateShort(d.exitDate) : '..............................';
            const tStr = d.time || '..............';

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <html>
            <head>
                <title>แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                    body { font-family: 'Sarabun', sans-serif; font-size: 11pt; margin: 0; padding: 0; color: #000; background: #525659; }
                    .a4-page { 
                        width: 210mm; height: 296mm; margin: 10mm auto; 
                        padding: 15mm 12mm 45mm 12mm; position: relative; box-sizing: border-box; 
                        background: #fff; page-break-after: always; overflow: hidden;
                    }
                    .print-header-top-right { position: absolute; top: 10mm; right: 10mm; text-align: right; font-size: 8px; line-height: 1.2; }
                    .main-title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 10px; line-height: 1.4; }
                    
                    .content-section { font-size: 11pt; line-height: 1.5; margin-bottom: 8px; }
                    .indent { padding-left: 20px; }
                    .dot-line { border-bottom: 1px dotted #000; display: inline-block; min-width: 40px; }
                    
                    .vs-box { display: flex; justify-content: space-around; font-weight: bold; margin: 5px 0 10px 0; }
                    .edu-box { border: 1px solid #000; padding: 10px; margin-top: 5px; margin-bottom: 10px; }
                    .edu-title { text-align: center; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }

                    /* CSS Footer Fixed Container */
                    .fixed-footer-container { position: absolute; bottom: 5mm; left: 10mm; right: 10mm; display: flex; flex-direction: column; gap: 10px; }
                    .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                    .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
                    .print-footer { width: 100%; text-align: center; font-size: 8pt !important; color: #444; border-top: 1px solid #ccc; padding-top: 8px; margin-top: auto; }

                    @media print {
                        @page { size: A4; margin: 0; }
                        body { background: #fff; -webkit-print-color-adjust: exact; }
                        .a4-page { margin: 0; box-shadow: none; border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="a4-page">
                    <div class="print-header-top-right">
                        <div>Echart-ipd-nurse</div>
                        <div>FR-IPD-007</div>
                    </div>

                    <div class="main-title">
                        แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย<br>
                        โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                    </div>

                    <div class="content-section">
                        <b>วันที่จำหน่าย</b> <span class="dot-line" style="min-width:80px;">${d1Str}</span> <b>วันที่ออกจากโรงพยาบาล</b> <span class="dot-line" style="min-width:80px;">${d2Str}</span> <b>เวลา</b> <span class="dot-line">${tStr}</span> น.
                    </div>

                    <div class="content-section flex" style="display:flex;">
                        <div style="width: 140px;"><b>ประเภทการจำหน่าย</b></div>
                        <div style="flex: 1;">
                            ${rd(d.type, 'แพทย์อนุญาต')} แพทย์อนุญาต &nbsp;&nbsp;
                            ${rd(d.type, 'ปฏิเสธการรักษา')} ปฏิเสธการรักษา &nbsp;&nbsp;
                            ${rd(d.type, 'หนีกลับ')} หนีกลับ &nbsp;&nbsp;
                            ${rd(d.type, 'REFER')} REFER &nbsp;&nbsp;<br>
                            ${rd(d.type, 'ตายไม่มีการชันสูตร')} ตายไม่มีการชันสูตร &nbsp;&nbsp;
                            ${rd(d.type, 'ตายมีการชันสูตร')} ตายมีการชันสูตร
                        </div>
                    </div>

                    <div class="content-section flex" style="display:flex;">
                        <div style="width: 140px;"><b>สภาพการจำหน่าย</b></div>
                        <div style="flex: 1;">
                            ${rd(d.condition, 'หายสนิท')} หายสนิท &nbsp;&nbsp;
                            ${rd(d.condition, 'ดีขึ้น')} ดีขึ้น &nbsp;&nbsp;
                            ${rd(d.condition, 'ไม่ดีขึ้น')} ไม่ดีขึ้น
                        </div>
                    </div>

                    <div class="content-section">
                        <b>สรุปอาการและอาการแสดงผู้ป่วยจำหน่าย</b><br>
                        <div style="min-height: 35px; border-bottom: 1px dotted #ccc; line-height: 1.6;">${d.symptom ? d.symptom.replace(/\n/g, '<br>') : ''}</div>
                    </div>

                    <div class="vs-box content-section">
                        <span>BT <span class="dot-line" style="min-width:30px; text-align:center;">${d.bt || ''}</span> °C</span>
                        <span>PR <span class="dot-line" style="min-width:30px; text-align:center;">${d.pr || ''}</span> /min</span>
                        <span>RR <span class="dot-line" style="min-width:30px; text-align:center;">${d.rr || ''}</span> /min</span>
                        <span>BP <span class="dot-line" style="min-width:50px; text-align:center;">${d.bp || ''}</span> mmHg</span>
                    </div>

                    <div class="edu-box">
                        <div class="edu-title">การสอนสุขศึกษา / คำแนะนำ / การให้ข้อมูล</div>
                        
                        <b>1. D (Disease)</b> ความรู้เรื่องโรค การสังเกต อาการผิดปกติที่ควรมาพบแพทย์<br>
                        <div class="indent">
                            ${ck(d.d1)} มีไข้สูง &nbsp;&nbsp; ${ck(d.d2)} แผลบวมแดง มีหนอง &nbsp;&nbsp; ${ck(d.d3)} ซึม ความรู้สึกตัวเปลี่ยน &nbsp;&nbsp; ${ck(d.d4)} หายใจหอบมากขึ้น &nbsp;&nbsp; ${ck(d.d_other)} อื่นๆ <span class="dot-line">${d.d_other_text || ''}</span>
                        </div>

                        <b>2. M (Medication)</b> <span style="font-weight:normal;">ความรู้เกี่ยวกับยา ฤทธิ์ของยา วัตถุประสงค์การใช้ยา วิธีการใช้ ขนาด ปริมาณ จำนวนครั้ง ระยะเวลาที่ใช้ ข้อระวังในการใช้ยา ภาวะแทรกซ้อนต่าง ๆ ข้อห้ามสำหรับการใช้ยา การเก็บรักษายา อาการแพ้ยาถ้ามีผื่น บวม ให้หยุดยา แล้วกลับมาพบแพทย์</span><br>

                        <b>3. E (Environment)</b><br>
                        <div class="indent">${ck(d.e1)} การจัดสิ่งแวดล้อมสถานที่สะอาด อากาศถ่ายเทได้สะดวก &nbsp;&nbsp; ${ck(d.e_other)} อื่นๆ <span class="dot-line">${d.e_other_text || ''}</span></div>

                        <b>4. T (Treatment)</b> แนะนำเรื่อง<br>
                        <div class="indent">${ck(d.t1)} การทำความสะอาดร่างกาย &nbsp;&nbsp; ${ck(d.t2)} การทำแผล &nbsp;&nbsp; ${ck(d.t_other)} อื่นๆ <span class="dot-line">${d.t_other_text || ''}</span></div>

                        <b>5. H (Health)</b> แนะนำการออกกำลังกายอย่างเหมาะสม การพักผ่อนให้เพียงพอ<br>
                        <div class="indent">${ck(d.h_other)} อื่นๆ <span class="dot-line">${d.h_other_text || ''}</span></div>

                        <b>6. O (Outpatient refer)</b> <span style="font-weight:normal;">การมาตรวจตามนัด แหล่งประโยชน์ในชุมชน เช่น รพ.สต. โรงพยาบาล และการใช้บริการ 1669</span><br>

                        <b>7. D (Diet)</b> อาหารที่เหมาะสม มีประโยชน์<br>
                        <div class="indent">
                            ${ck(d.diet1)} อาหารครบ 5 หมู่ &nbsp;&nbsp; ${ck(d.diet2)} อาหารอ่อน &nbsp;&nbsp; ${ck(d.diet3)} สุกสะอาด &nbsp;&nbsp; ${ck(d.diet4)} เนื้อ นม ไข่ ผักผลไม้<br>
                            ${ck(d.diet5)} หลีกเลี่ยงอาหารที่มีไขมันสูง &nbsp;&nbsp; ${ck(d.diet6)} งดผักผลไม้ &nbsp;&nbsp; ${ck(d.diet7)} อาหารเฉพาะโรค <span class="dot-line">${d.diet7_text || ''}</span> &nbsp;&nbsp; ${ck(d.diet_other)} อื่นๆ <span class="dot-line">${d.diet_text || ''}</span>
                        </div>
                    </div>

                    <div class="content-section">
                        <b>ยา / เวชภัณฑ์ / และอุปกรณ์ที่ใช้ในการดูแลตนเองหลังจำหน่าย</b><br>
                        <div class="indent">
                            ${rd(d.med_status, 'ได้ครบ')} ได้ครบ &nbsp;&nbsp; 
                            ${rd(d.med_status, 'ได้ไม่ครบ')} ได้ไม่ครบ กรณีได้ไม่ครบ ระบุ <span class="dot-line">${d.med_text || ''}</span>
                        </div>
                    </div>

                    <div class="content-section">
                        <b>ปัญหาที่ต้องดูแลต่อเนื่อง</b><br>
                        <div class="indent" style="line-height: 1.8;">
                            ${rd(d.fu_status, 'ไม่มี F/U')} ไม่มี F/U &nbsp;&nbsp; 
                            ${rd(d.fu_status, 'มีนัด F/U')} มีนัด F/U <span class="dot-line">${d.fu_text || ''}</span><br>
                            ${ck(d.wound_care)} ล้างแผลสถานพยาบาลใกล้บ้านทุกวัน ตัดไหมสถานพยาบาลใกล้บ้านวันที่ <span class="dot-line">${d.wound_date || ''}</span><br>
                            ${ck(d.cont_other)} อื่นๆ <span class="dot-line">${d.cont_text || ''}</span>
                        </div>
                    </div>

                    <div class="content-section">
                        <b>สถานที่รับดูแลต่อ</b><br>
                        <div class="indent">
                            ${rd(d.care_loc, 'รพศ.')} รพศ. <span class="dot-line">${d.care_loc_text1 || ''}</span> &nbsp;&nbsp;
                            ${rd(d.care_loc, 'รพท.')} รพท. <span class="dot-line">${d.care_loc_text2 || ''}</span> &nbsp;&nbsp;
                            ${rd(d.care_loc, 'รพช.')} รพช. <span class="dot-line">${d.care_loc_text3 || ''}</span> &nbsp;&nbsp;
                            ${rd(d.care_loc, 'รพ.สต.')} รพ.สต. <span class="dot-line">${d.care_loc_text4 || ''}</span> &nbsp;&nbsp;
                            ${rd(d.care_loc, 'อื่นๆ')} อื่นๆ <span class="dot-line">${d.care_loc_text5 || ''}</span>
                        </div>
                    </div>

                    <div class="content-section" style="margin-top: 15px; display: flex; justify-content: space-between;">
                        <div>
                            <b>ชื่อผู้รับผู้ป่วยกลับ</b> <span class="dot-line" style="min-width: 300px; text-align: center;">${d.receiverName || ''}</span> 
                            <b>เกี่ยวข้องเป็น</b> <span class="dot-line" style="min-width: 100px; text-align: center;">${d.relation || ''}</span>
                        </div>
                    </div>

                    <div class="content-section" style="margin-top: 5px; display: flex; justify-content: space-between;">
                        <div>
                            <b>พยาบาลผู้จำหน่าย</b> <span class="dot-line" style="min-width: 300px; text-align: center;">${d.nurseName || ''}</span> 
                            <b>ตำแหน่ง</b> <span class="dot-line" style="min-width: 120px; text-align: center;">${d.pos || ''}</span>
                        </div>
                    </div>

                    <div class="fixed-footer-container">
                        <div class="patient-box-container">
                            <div class="print-patient-box">
                                <div><b>ชื่อ-สกุล:</b> ${this.selectedPatient?.name || '-'} &nbsp; <b>อายุ:</b> ${this.selectedPatient?.ageDisplay || '-'}</div>
                                <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp; <b>AN:</b> ${this.selectedPatient?.an || '-'}</div>                
                                <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'} &nbsp; <b>ตึก:</b> ${this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
                            </div>
                        </div>
                        <div class="print-footer">
                            เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                        </div>
                    </div>
                </div>
                <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
            </body>
            </html>
            `);
            printWindow.document.close();
        },
    };
}
