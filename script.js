function nurseApp() {
    return {
        // --- 1. CONFIG & STATE ---
        API_URL: 'https://script.google.com/macros/s/AKfycbxqaydhsgGZKV8hz28qYUzsTVDl7c-DzgFZD9FDzcWE_uCnwIaJryjqiNQ2ggxOYn49/exec',
        isLoading: false,
        isPrintingPed: false,
        realTimeClock: '',
        currentWard: null,
        
        viewMode: 'list', 
        isEditing: false,
        nurses: [],
        showNurseListFor: null,
        nurseName: '', 
        nursePosition: '',
        showPrintDropdown: false,
        selectedPrintForms: [],
        showDischargeConfirm: false,
        searchHistoryType: 'date', 
        searchHistoryDate: new Date().toISOString().split('T')[0], // วันนี้
        searchHistoryMonth: new Date().toISOString().slice(0, 7),  // เดือนนี้
        dischargedPatients: [],
        showUndoDischargeConfirm: false, // สำหรับเปิด/ปิด Popup ยกเลิกจำหน่าย

        selectedPatient: null,
        isAdult: true,
        currentForm: null, 
        showAssessmentPreview: false, 
        savedAssessment: null,
        savedAssessmentPed: null,
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
            { id: 'assess_initial', title: '1. แบบประเมินประวัติและสมรรถนะผู้ป่วยแรกรับ (Adult)', icon: 'fa-clipboard-user', isMain: true },
            { id: 'assess_initial_ped', title: '1. แบบประเมินสภาพผู้ป่วยเด็กแรกรับ (PED)', icon: 'fa-baby', isMain: true },
            
            { id: 'patient_class', title: '2. แบบบันทึกการจำแนกประเภทผู้ป่วย (Adult)', icon: 'fa-user-tag', isMain: true },
            { id: 'patient_class_ped', title: '2. แบบบันทึกการจำแนกประเภทผู้ป่วยเด็ก', icon: 'fa-children', isMain: true },
            
            { id: 'fall_risk', title: '3. แบบประเมินความเสี่ยงพลัดตกหกล้ม Morse / MAAS (Adult)', icon: 'fa-person-falling', isMain: true },
            { id: 'braden_scale', title: '4. แบบบันทึกการป้องกันดูแลแผลกดทับ Braden Scale (Adult)', icon: 'fa-bed', isMain: true },
            
            { id: 'patient_edu', title: '5. แบบบันทึกการให้คำแนะนำ', icon: 'fa-chalkboard-user', isMain: true },
            { id: 'focus_list', title: '6. Focus List', icon: 'fa-list-check', isMain: true },
            { id: 'progress_note', title: '7. Nursing Progress Note', icon: 'fa-notes-medical', isMain: true },
            { id: 'discharge_record', title: '8. แบบบันทึกการพยาบาลผู้ป่วยจำหน่าย', icon: 'fa-door-open', isMain: true }
        ],
        classForm: {
            evalDate: new Date().toISOString().split('T')[0],
            shift: 'เช้า',
            scores: [0, 0, 0, 0, 0, 0, 0, 0], // ค่าเริ่มต้นเป็น 0 (ยังไม่ประเมิน)
            assessor: ''
        },
        showPedShiftModal: false,
        pedShiftForm: {
            evalDate: new Date().toISOString().split('T')[0],
            shift: 'เช้า',
            scores: Array(10).fill(''),
            assessor: ''
        },
        showFallShiftModal: false,
        fallShiftForm: {
            evalDate: new Date().toISOString().split('T')[0],
            shift: 'เช้า',
            scores: Array(6).fill(''),
            maas: '',
            assessor: ''
        },
        classHistory: [],
        classHistoryPed: [],
        pedClassForm: {
            date: new Date().toISOString().split('T')[0],
            shift: 'เช้า',
            scores: {},
            total: 0,
            type: '',
            assessor: ''
        },
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
        shiftOrder: ['ดึก', 'เช้า', 'บ่าย'],
        shiftPriorityMap: { 'ดึก': 1, 'เช้า': 2, 'บ่าย': 3 },

        dateKeyToLocalDate(dateKey) {
            if (!dateKey) return null;
            const cleanDate = String(dateKey).trim();
            const match = cleanDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!match) return null;
            return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
        },
        normalizeDateKey(value) {
            if (!value) return '';
            if (value instanceof Date) {
                return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
            }

            const raw = String(value).trim();
            if (!raw) return '';

            const isoMatch = raw.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

            const slashMatch = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (slashMatch) {
                return `${slashMatch[3]}-${String(slashMatch[2]).padStart(2, '0')}-${String(slashMatch[1]).padStart(2, '0')}`;
            }

            if (raw.includes('T')) return raw.split('T')[0];

            const parsed = new Date(raw);
            if (!isNaN(parsed.getTime())) {
                return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
            }

            return '';
        },
        normalizeShiftLabel(value) {
            const shift = String(value || '').trim();
            if (!shift) return '';
            if (shift.includes('ดึก') || shift.includes('ตึก')) return 'ดึก';
            if (shift.includes('เช้า') || shift.includes('เข้า')) return 'เช้า';
            if (shift.includes('บ่าย')) return 'บ่าย';
            return shift;
        },
        normalizeTimestampValue(value, fallbackDate = '') {
            if (value) {
                const parsed = new Date(value);
                if (!isNaN(parsed.getTime())) return parsed.getTime();
            }

            const dateKey = this.normalizeDateKey(fallbackDate || value);
            const localDate = this.dateKeyToLocalDate(dateKey);
            return localDate ? localDate.getTime() : 0;
        },
        parseJsonSafely(value, fallback = {}) {
            if (!value) return fallback;
            if (typeof value === 'object') return value;
            try {
                return JSON.parse(value);
            } catch (error) {
                return fallback;
            }
        },
        buildPedScores(formData = {}) {
            return [
                formData.item1 || '', formData.item2 || '', formData.item3 || '', formData.item4 || '',
                formData.item5 || '', formData.item6 || '', formData.item7 || '', formData.item8 || '',
                formData.item9 || '', formData.item10 || ''
            ];
        },
        normalizeShiftData(records, options = {}) {
            const { buildRecord = null } = options;
            if (!Array.isArray(records)) return [];

            const latestBySlot = new Map();

            records.forEach((record, index) => {
                const baseRecord = typeof buildRecord === 'function' ? buildRecord(record, index) : { ...record };
                if (!baseRecord) return;

                const evalDate = this.normalizeDateKey(baseRecord.evalDate || baseRecord.date);
                const shift = this.normalizeShiftLabel(baseRecord.shift);
                if (!evalDate || !shift || !this.shiftPriorityMap[shift]) return;

                const timestampValue = this.normalizeTimestampValue(baseRecord.timestamp, evalDate);
                const candidate = {
                    ...baseRecord,
                    evalDate,
                    shift,
                    _sortTimestamp: timestampValue,
                    _sourceIndex: Number(baseRecord._sourceIndex ?? index)
                };
                const key = `${evalDate}__${shift}`;
                const current = latestBySlot.get(key);

                if (!current ||
                    timestampValue > current._sortTimestamp ||
                    (timestampValue === current._sortTimestamp && candidate._sourceIndex > current._sourceIndex)) {
                    latestBySlot.set(key, candidate);
                }
            });

            return Array.from(latestBySlot.values())
                .sort((a, b) => {
                    if (a.evalDate !== b.evalDate) return a.evalDate.localeCompare(b.evalDate);
                    const shiftDiff = this.shiftPriorityMap[a.shift] - this.shiftPriorityMap[b.shift];
                    if (shiftDiff !== 0) return shiftDiff;
                    if (a._sortTimestamp !== b._sortTimestamp) return a._sortTimestamp - b._sortTimestamp;
                    return a._sourceIndex - b._sourceIndex;
                })
                .map(({ _sortTimestamp, _sourceIndex, ...record }) => record);
        },
        rebuildClassificationGrid(records = []) {
            this.gridData = {};
            records.forEach(record => {
                const cell = this.getGridCell(record.evalDate, record.shift);
                cell.scores = Array.from({ length: 10 }, (_, index) => record.scores?.[index] ?? '');
                cell.assessor = record.assessor || '';
                cell.timestamp = record.timestamp || '';
            });
        },
        rebuildFallGrid(records = []) {
            this.fallGridData = {};
            records.forEach(record => {
                const cell = this.getFallGridCell(record.evalDate, record.shift);
                cell.scores = [
                    record.m1 ?? '', record.m2 ?? '', record.m3 ?? '',
                    record.m4 ?? '', record.m5 ?? '', record.m6 ?? ''
                ];
                cell.maas = record.maasScore ?? '';
                cell.assessor = record.assessor || '';
                cell.timestamp = record.timestamp || '';
            });
        },
        getTimelineSourceRecords() {
            if (this.currentForm?.id === 'fall_risk') return this.fallHistory || [];
            if (this.currentForm?.id === 'patient_class_ped') return this.classHistoryPed || [];
            return this.classHistory || [];
        },
        get currentShiftPage() {
            return this.classTimeline[this.currentPageIndex] || [];
        },
        get adultClassificationQuestions() {
            return [
                { type: 'section', title: 'สภาวะสุขภาพ' },
                { type: 'question', scoreIndex: 0, label: '1. สัญญาณชีพ' },
                { type: 'question', scoreIndex: 1, label: '2. อาการและอาการแสดงทางระบบประสาท' },
                { type: 'question', scoreIndex: 2, label: '3. การได้รับการตรวจรักษา/ผ่าตัดหรือหัตถการ' },
                { type: 'question', scoreIndex: 3, label: '4. พฤติกรรมที่ผิดปกติอารมณ์ จิตสังคม' },
                { type: 'section', title: 'ความต้องการการดูแลขั้นต่ำ' },
                { type: 'question', scoreIndex: 4, label: '5. ความสามารถในการปฏิบัติกิจวัตรประจำวัน' },
                { type: 'question', scoreIndex: 5, label: '6. ความต้องการด้านจิตใจและอารมณ์' },
                { type: 'question', scoreIndex: 6, label: '7. ความต้องการยา/การรักษาทำหัตถการ/ฟื้นฟู' },
                { type: 'question', scoreIndex: 7, label: '8. ความต้องการการบรรเทาอาการรบกวน' }
            ];
        },
        get pedClassificationQuestions() {
            return [
                { type: 'section', title: '1. การดูแลเกี่ยวกับกิจวัตรประจำวัน' },
                { type: 'question', scoreIndex: 0, label: '1.1 การดูดนมและรับประทานอาหาร' },
                { type: 'question', scoreIndex: 1, label: '1.2 การดูแลสุขอนามัยส่วนบุคคล' },
                { type: 'question', scoreIndex: 2, label: '1.3 การขับถ่าย' },
                { type: 'question', scoreIndex: 3, label: '1.4 การเคลื่อนไหวร่างกายและการออกกำลังกาย' },
                { type: 'section', title: '2. การได้รับยาและการปฏิบัติการพยาบาล' },
                { type: 'question', scoreIndex: 4, label: '2.1 การได้รับยาและ/หรือ สารน้ำ สารอาหาร' },
                { type: 'question', scoreIndex: 5, label: '2.2 การปฏิบัติการรักษาพยาบาล' },
                { type: 'question', scoreIndex: 6, label: '2.3 การช่วยเหลือด้านการหายใจ' },
                { type: 'section', title: '3. การประเมินสภาพอาการการสังเกตสัญญาณชีพและเครื่องตรวจวัดต่างๆ' },
                { type: 'question', scoreIndex: 7, label: '3.1 สภาพอาการทั่วไป' },
                { type: 'question', scoreIndex: 8, label: '3.2 การสังเกตสัญญาณชีพและเครื่องวัดอื่นๆ' },
                { type: 'question', scoreIndex: 9, label: '4. การสอนและการประคับประคองจิตใจ (ผู้ป่วยเด็กและครอบครัว)', emphasis: true }
            ];
        },
        get fallRiskMorseQuestions() {
            return [
                {
                    label: '1. มีการหกล้มกะทันหัน หรือพลัดตกหกล้ม 3 เดือนก่อนมา รพ.',
                    opts: [{ v: 0, t: 'ไม่ใช่ = 0' }, { v: 25, t: 'ใช่ = 25' }]
                },
                {
                    label: '2. มีการวินิจฉัยโรคมากกว่า 1 รายการ',
                    opts: [{ v: 0, t: 'ไม่ใช่ = 0' }, { v: 15, t: 'ใช่ = 15' }]
                },
                {
                    label: '3. การช่วยในการเคลื่อนย้าย',
                    opts: [
                        { v: 0, t: 'เดินได้เอง/ใช้รถเข็น/นอนพักบนเตียงหรือทำกิจกรรมบนเตียง = 0' },
                        { v: 15, t: 'ใช้ไม้ค้ำ/ไม้เท้า = 15' },
                        { v: 30, t: 'เดินโดยเกาะอีกคนไปตามเตียง / โต๊ะ / เก้าอี้ = 30' }
                    ]
                },
                {
                    label: '4. ให้สารละลายทางหลอดเลือด / คา Heparin lock',
                    opts: [{ v: 0, t: 'ไม่ใช่ = 0' }, { v: 20, t: 'ใช่ = 20' }]
                },
                {
                    label: '5. การเดิน / การเคลื่อนย้าย',
                    opts: [
                        { v: 0, t: 'ปกติ / นอนพักบนเตียงโดยไม่ได้ถูกจำกัดเคลื่อนไหว = 0' },
                        { v: 10, t: 'อ่อนแรงเล็กน้อยหรืออ่อนเพลีย = 10' },
                        { v: 20, t: 'มีความบกพร่อง เช่น ลุกจากเก้าอี้ด้วยความลำบาก / ไม่สามารถเดินได้โดยปราศจากการช่วยเหลือ = 20' }
                    ]
                },
                {
                    label: '6. สภาพจิตใจ',
                    opts: [
                        { v: 0, t: 'รับรู้บุคคล เวลา สถานที่ = 0' },
                        { v: 15, t: 'ตอบสนองไม่ตรงกับความเป็นจริง ไม่รับรู้ข้อจำกัดของตนเอง = 15' }
                    ]
                }
            ];
        },
        get fallRiskMaasOptions() {
            return [
                { value: '0', label: '0 - ไม่ตอบสนอง' },
                { value: '1', label: '1 - ตอบสนองต่อการกระตุ้นแรงๆ' },
                { value: '2', label: '2 - ตอบสนองต่อการสัมผัส/เรียก' },
                { value: '3', label: '3 - สงบและให้ความร่วมมือ' },
                { value: '4', label: '4 - พักได้น้อย/ไม่ร่วมมือ' },
                { value: '5', label: '5 - ต่อต้านการรักษา' },
                { value: '6', label: '6 - ต่อต้าน/อันตรายต่อผู้อื่น' }
            ];
        },
        formatShiftTimestamp(value) {
            if (!value) return 'ยังไม่บันทึก';
            const date = new Date(value);
            if (isNaN(date.getTime())) return 'ยังไม่บันทึก';
            return date.toLocaleString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        hasClassificationShiftData(date, shift) {
            const cell = this.getGridCell(date, shift);
            return cell.scores.some(value => value !== '' && value !== null && value !== 0);
        },
        hasFallShiftData(date, shift) {
            const cell = this.getFallGridCell(date, shift);
            return cell.scores.some(value => value !== '' && value !== null) || (cell.maas !== '' && cell.maas !== null);
        },
        getAdultShiftSummary(date, shift) {
            const cell = this.getGridCell(date, shift);
            const result = this.calcScores(cell.scores);
            return {
                filled: this.hasClassificationShiftData(date, shift),
                total: result.total || '',
                category: result.category ? `ประเภท ${result.category}` : '',
                assessor: cell.assessor || '',
                evalDateText: this.formatThaiDateShort(date)
            };
        },
        getPedShiftSummary(date, shift) {
            const cell = this.getGridCell(date, shift);
            const result = this.calcPedScores(cell.scores);
            return {
                filled: this.hasClassificationShiftData(date, shift),
                total: result.total || '',
                category: result.category || '',
                assessor: cell.assessor || '',
                evalDateText: this.formatThaiDateShort(date)
            };
        },
        getFallShiftSummary(date, shift) {
            const cell = this.getFallGridCell(date, shift);
            return {
                filled: this.hasFallShiftData(date, shift),
                morse: this.calcMorseTotal(cell.scores) || '',
                maas: cell.maas || '',
                assessor: cell.assessor || '',
                evalDateText: this.formatThaiDateShort(date)
            };
        },
        openAdultShiftModal(date, shift) {
            const cell = this.getGridCell(date, shift);
            this.classForm = {
                evalDate: date,
                shift,
                scores: Array.from({ length: 8 }, (_, index) => cell.scores[index] ?? ''),
                assessor: cell.assessor || ''
            };
            this.showClassModal = true;
        },
        openPedShiftModal(date, shift) {
            const cell = this.getGridCell(date, shift);
            this.pedShiftForm = {
                evalDate: date,
                shift,
                scores: Array.from({ length: 10 }, (_, index) => cell.scores[index] ?? ''),
                assessor: cell.assessor || ''
            };
            this.showPedShiftModal = true;
        },
        openFallShiftModal(date, shift) {
            const cell = this.getFallGridCell(date, shift);
            this.fallShiftForm = {
                evalDate: date,
                shift,
                scores: Array.from({ length: 6 }, (_, index) => cell.scores[index] ?? ''),
                maas: cell.maas ?? '',
                assessor: cell.assessor || ''
            };
            this.showFallShiftModal = true;
        },
        deleteAdultShift(date, shift) {
            if (!this.selectedPatient?.an) {
                return this.showAlert('Error', 'ไม่พบเลข AN ของผู้ป่วย');
            }
            if (!this.hasClassificationShiftData(date, shift)) {
                return this.showAlert('แจ้งเตือน', 'เวรนี้ยังไม่มีข้อมูลให้ลบ');
            }

            this.showConfirm(
                'ยืนยันการลบ',
                `ต้องการลบข้อมูลแบบจำแนกผู้ป่วย วันที่ ${this.formatThaiDateShort(date)} เวร${shift} ใช่หรือไม่?`,
                async () => {
                    this.isLoading = true;
                    try {
                        const response = await fetch(this.API_URL, {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'deleteClassification',
                                payload: {
                                    an: this.selectedPatient.an,
                                    evalDate: date,
                                    shift
                                }
                            })
                        });
                        const res = await response.json();
                        if (res.status !== 'success') throw new Error(res.message);
                        this.showClassModal = false;
                        this.successMsg = `ลบเวร${shift} วันที่ ${this.formatThaiDateShort(date)} เรียบร้อยแล้ว`;
                        this.showSuccess = true;
                        setTimeout(() => this.showSuccess = false, 2500);
                        await this.loadClassifications(this.selectedPatient.an);
                    } catch (error) {
                        this.showAlert('Error', 'ลบข้อมูลไม่สำเร็จ: ' + error.message);
                    } finally {
                        this.isLoading = false;
                    }
                }
            );
        },
        deletePedShift(date, shift) {
            const currentAN = this.selectedPatient?.an || this.selectedPatient?.AN;
            if (!currentAN) {
                return this.showAlert('Error', 'ไม่พบเลข AN ของผู้ป่วย');
            }
            if (!this.hasClassificationShiftData(date, shift)) {
                return this.showAlert('แจ้งเตือน', 'เวรนี้ยังไม่มีข้อมูลให้ลบ');
            }

            this.showConfirm(
                'ยืนยันการลบ',
                `ต้องการลบข้อมูลแบบจำแนกผู้ป่วยเด็ก วันที่ ${this.formatThaiDateShort(date)} เวร${shift} ใช่หรือไม่?`,
                async () => {
                    this.isLoading = true;
                    try {
                        const response = await fetch(this.API_URL, {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'deleteClassificationPed',
                                payload: {
                                    an: currentAN,
                                    evalDate: date,
                                    shift
                                }
                            })
                        });
                        const res = await response.json();
                        if (res.status !== 'success') throw new Error(res.message);

                        this.showPedShiftModal = false;
                        this.successMsg = `ลบเวร${shift} วันที่ ${this.formatThaiDateShort(date)} เรียบร้อยแล้ว`;
                        this.showSuccess = true;
                        setTimeout(() => this.showSuccess = false, 2500);
                        await this.loadClassifications(currentAN);
                    } catch (error) {
                        this.showAlert('Error', 'ลบข้อมูลไม่สำเร็จ: ' + error.message);
                    } finally {
                        this.isLoading = false;
                    }
                }
            );
        },
        deleteFallShift(date, shift) {
            if (!this.selectedPatient?.an) {
                return this.showAlert('Error', 'ไม่พบเลข AN ของผู้ป่วย');
            }
            if (!this.hasFallShiftData(date, shift)) {
                return this.showAlert('แจ้งเตือน', 'เวรนี้ยังไม่มีข้อมูลให้ลบ');
            }

            this.showConfirm(
                'ยืนยันการลบ',
                `ต้องการลบข้อมูลประเมินพลัดตกหกล้ม วันที่ ${this.formatThaiDateShort(date)} เวร${shift} ใช่หรือไม่?`,
                async () => {
                    this.isLoading = true;
                    try {
                        const response = await fetch(this.API_URL, {
                            method: 'POST',
                            body: JSON.stringify({
                                action: 'deleteFallRisk',
                                payload: {
                                    an: this.selectedPatient.an,
                                    evalDate: date,
                                    shift
                                }
                            })
                        });
                        const res = await response.json();
                        if (res.status !== 'success') throw new Error(res.message);

                        this.showFallShiftModal = false;
                        this.successMsg = `ลบเวร${shift} วันที่ ${this.formatThaiDateShort(date)} เรียบร้อยแล้ว`;
                        this.showSuccess = true;
                        setTimeout(() => this.showSuccess = false, 2500);
                        await this.loadFallRisk(this.selectedPatient.an);
                    } catch (error) {
                        this.showAlert('Error', 'ลบข้อมูลไม่สำเร็จ: ' + error.message);
                    } finally {
                        this.isLoading = false;
                    }
                }
            );
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

        // 1. ฟังก์ชันตรวจสอบกลุ่มอายุ (เด็ก 0-15 ปี)
        checkAgeGroup(ageStr) {
            if (!ageStr) return true; // ถ้าไม่มีข้อมูล ให้ถือว่าเป็นผู้ใหญ่ไว้ก่อน
            
            const ageString = String(ageStr);
            // ดึงตัวเลขชุดแรกที่เจอ (เช่นจาก "15 ปี 2 เดือน" จะได้ 15)
            const match = ageString.match(/\d+/);
            const ageNum = match ? parseInt(match[0], 10) : 0;
        
            const hasYear = ageString.includes('ปี');
            const hasMonth = ageString.includes('เดือน');
            const hasDay = ageString.includes('วัน');
        
            // กรณีเด็กทารก/เด็กเล็ก (หน่วยเป็นเดือนหรือวัน และไม่มีหน่วยปี)
            if ((hasMonth || hasDay) && !hasYear) {
                return false; // เป็นกลุ่มเด็ก
            }
        
            // ตามโจทย์: ผู้ป่วยเด็กคืออายุ 0-15 ปี (รวมอายุ 15 ด้วย)
            // ดังนั้นถ้าอายุมากกว่า 15 ถึงจะเป็นผู้ใหญ่ (isAdult = true)
            return ageNum > 15;
        },
        
        // 2. ฟังก์ชันเลือกผู้ป่วย (แทนที่ openPatientDetail เดิม)
        selectPatient(patient) {
            if (!patient) return;
            this.selectedPatient = patient;
            
            // ตรวจสอบอายุและตั้งค่า isAdult
            const patientAge = patient.age || patient.Age || "";
            this.isAdult = this.checkAgeGroup(patientAge);
            
            // Debug ตรวจสอบใน Console (กด F12 ดูได้)
            console.log(`เลือกผู้ป่วย: ${patient.name}, อายุ: ${patientAge}, กลุ่ม: ${this.isAdult ? 'ผู้ใหญ่' : 'เด็ก'}`);
        
            this.viewMode = 'detail';
            this.currentForm = null;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        
            // โหลดข้อมูลประวัติเบื้องต้น
            const an = patient.an || patient.AN;
            if (an) {
                this.loadAssessmentData(an);
                this.loadClassifications(an);
                this.loadFallRisk(an);
                this.loadBraden(an);
                this.loadPatientEdu(an);
            }
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
                String(p.hn || '').toLowerCase().includes(String(this.searchHN || '').toLowerCase()) &&
                String(p.an || '').toLowerCase().includes(String(this.searchAN || '').toLowerCase()) &&
                String(p.name || '').toLowerCase().includes(String(this.searchName || '').toLowerCase()) &&
                String(p.doctor || '').toLowerCase().includes(String(this.searchDoc || '').toLowerCase())
            ).sort((a, b) => {
                // เพิ่มการจัดเรียงตามหมายเลขเตียงจากน้อยไปมาก
                const bedA = String(a.bed || '').trim();
                const bedB = String(b.bed || '').trim();
                return bedA.localeCompare(bedB, undefined, { numeric: true, sensitivity: 'base' });
            });
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
            // 1. ถ้าช่องค้นหาว่างเปล่า ให้ "แสดงรายการทั้งหมด"
            if (!this.searchProgressTemplate || this.searchProgressTemplate.trim() === '') {
                return this.nursingTemplates; 
            }
            
            // 2. ถ้ามีการพิมพ์ ให้แปลงเป็นตัวพิมพ์เล็กแล้วค้นหา
            const q = this.searchProgressTemplate.toLowerCase();
            return this.nursingTemplates.filter(t => 
                (t.templateName && t.templateName.toLowerCase().includes(q)) || 
                (t.focus && t.focus.toLowerCase().includes(q)) ||
                (t.s && t.s.toLowerCase().includes(q)) ||
                (t.o && t.o.toLowerCase().includes(q))
            );
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
            
            // 1. ตรวจสอบกลุ่มอายุทันทีที่กดปุ่ม Chart
            const patientAge = patient.age || patient.Age || patient.ageDisplay || patient.agedisplay || "";
            this.isAdult = this.checkAgeGroup(patientAge);
            
            // 2. ล้างข้อมูลเก่าของคนไข้คนก่อนหน้าทิ้งให้หมด
            this.savedAssessment = null;
            this.savedAssessmentPed = null; // ✅ ล้างค่าฟอร์มเด็กด้วย
            this.classHistory = []; 
            this.currentPageIndex = 0;
            
            // 3. ตั้งค่าหน้าเริ่มต้นให้ตรงกับอายุ
            const defaultFormId = this.isAdult ? 'assess_initial' : 'assess_initial_ped';
            this.currentForm = this.activeForms.find(f => f.id === defaultFormId);
            
            this.viewMode = 'chart';
            window.scrollTo(0, 0);

            try {
                // ✅ โหลดข้อมูล Form มารอไว้ (แยกผู้ใหญ่กับเด็ก)
                const promisesToLoad = [this.loadClassifications(patient.an)];
                if (this.isAdult) {
                    promisesToLoad.push(this.loadAssessmentData(patient.an));
                } else {
                    promisesToLoad.push(this.loadAssessmentPedData(patient.an));
                }

                await Promise.all(promisesToLoad);
                
                this.$nextTick(() => {
                    // ✅ ระบบ Auto-fill ข้อมูลแรกรับ (ให้ทำงานเฉพาะผู้ใหญ่ เพราะของเด็กเราใส่ไว้ใน loadAssessmentPedData แล้ว)
                    if (this.isAdult) {
                        const formElement = document.getElementById('assessment-form-v2');
                        if (formElement && !this.savedAssessment) {
                            formElement.reset(); 
                            
                            // --- ดักจับแก้ปัญหาตัวพิมพ์เล็ก-ใหญ่ และ Error 1899-12-30 ---
                            const p = patient;
                            let rawTime = p.time || p.Time || p.admitTime || p.AdmitTime || '';
                            let rawDate = p.date || p.Date || p.admitDate || p.AdmitDate || '';
                            let rFrom = p.receivedFrom || p.ReceivedFrom || p.received_from || p.admittedFrom || '';
                            let refFrom = p.referFrom || p.ReferFrom || p.refer_from || p.Refer || '';
                            let ccStr = p.cc || p.CC || p.chiefComplaint || '';
                            let piStr = p.pi || p.PI || p.presentIllness || '';
    
                            let cleanTime = rawTime;
                            if (String(cleanTime).includes('T')) {
                                cleanTime = String(cleanTime).split('T')[1].substring(0, 5);
                            } else if (String(cleanTime).includes('1899')) {
                                cleanTime = ''; 
                            }
    
                            let cleanDate = rawDate;
                            if (String(cleanDate).includes('T')) cleanDate = String(cleanDate).split('T')[0];
    
                            const fields = {
                                'AdmitDate': cleanDate,
                                'AdmitTime': cleanTime,
                                'AdmittedFrom': rFrom,
                                'Refer': refFrom,
                                'ChiefComplaint': ccStr,
                                'PresentIllness': piStr
                            };
                            
                            Object.entries(fields).forEach(([id, val]) => {
                                if (formElement.elements[id]) formElement.elements[id].value = val || '';
                            });
                        }
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
        async loadAssessmentPedData(an) {
            this.isLoading = true;
            try {
                const response = await fetch(`${this.API_URL}?action=getAssessmentPed&an=${an}`);
                const data = await response.json();
        
                if (data && Object.keys(data).length > 0) {
                    this.savedAssessmentPed = data;
                    this.searchNurse = data['ped_AssessorName'] || '';
                    this.nursePosition = data['ped_AssessorPosition'] || '';
                    this.$nextTick(() => {
                        setTimeout(() => {
                            const form = document.getElementById('assessment-form-ped');
                            if (form) {
                                Object.keys(data).forEach(key => {
                                    const el = form.elements[key];
                                    if (!el) return;
                                    
                                    if (el.length && el.tagName !== 'SELECT') {
                                        Array.from(el).forEach(inputNode => {
                                            if (inputNode.type === 'radio') {
                                                inputNode.checked = (inputNode.value === data[key]);
                                            } else if (inputNode.type === 'checkbox') {
                                                const savedValues = data[key] ? data[key].toString().split(',').map(v => v.trim()) : [];
                                                inputNode.checked = savedValues.includes(inputNode.value);
                                            }
                                        });
                                    } else {
                                        if (el.type === 'checkbox') {
                                            el.checked = (data[key] === 'on' || data[key] === true || data[key] === el.value);
                                        } else {
                                            el.value = data[key];
                                            if (typeof el.dispatchEvent === 'function') el.dispatchEvent(new Event('input')); 
                                        }
                                    }
                                });
                            }
                        }, 100);
                    });
                } else {
                    this.savedAssessmentPed = null;
                    // Auto-fill ข้อมูลแรกรับและที่อยู่ตาม Requirement
                    this.$nextTick(() => {
                        const formElement = document.getElementById('assessment-form-ped');
                        if (formElement) {
                            formElement.reset(); 
                            
                            // --- ดักจับตัวพิมพ์เล็ก/ใหญ่ เพื่อให้ดึงข้อมูลได้ 100% ---
                            const p = this.selectedPatient;
                            let rawTime = p.time || p.Time || p.admitTime || p.AdmitTime || '';
                            let rawDate = p.date || p.Date || p.admitDate || p.AdmitDate || '';
                            let rFrom = p.receivedFrom || p.ReceivedFrom || p.received_from || p.admittedFrom || p.AdmittedFrom || '';
                            let refFrom = p.referFrom || p.ReferFrom || p.refer_from || p.Refer || '';
                            let ccStr = p.cc || p.CC || p.chiefComplaint || '';
                            let piStr = p.pi || p.PI || p.presentIllness || '';

                            let cleanTime = rawTime;
                            if (String(cleanTime).includes('T')) cleanTime = String(cleanTime).split('T')[1].substring(0, 5); 
                            else if (String(cleanTime).includes('1899')) cleanTime = ''; 
                            
                            let cleanDate = rawDate;
                            if (String(cleanDate).includes('T')) cleanDate = String(cleanDate).split('T')[0];
                            
                            const fields = {
                                'ped_AdmitDate': cleanDate,
                                'ped_AdmitTime': cleanTime,
                                'ped_AdmittedFrom': rFrom,
                                'ped_Refer': refFrom,
                                'ped_CC': ccStr,
                                'ped_PI': piStr,
                                'ped_AddressHome': p.address || p.Address || p.addressHome || '' 
                            };
                            Object.entries(fields).forEach(([id, val]) => {
                                if (formElement.elements[id]) formElement.elements[id].value = val || '';
                            });
                        }
                    });
                }
            } catch (err) {
                console.error("Error loading ped assessment:", err);
                this.savedAssessmentPed = null;
            } finally {
                this.isLoading = false;
            }
        },

        async saveAssessmentPedData() {
            const formElement = document.getElementById('assessment-form-ped');
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
                const payload = { an: this.selectedPatient?.an, formData: data, ward: this.currentWard, bed: this.selectedPatient?.bed };
                const res = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveAssessmentPed', payload: payload })
                });
                const result = await res.json();
                
                if (result.status === 'success') {
                    this.successMsg = result.message;
                    this.showSuccess = true;
                    setTimeout(() => this.showSuccess = false, 3000);
                    this.savedAssessmentPed = { ...data };
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
                                            // --- ส่วนที่แก้ไขเพื่อดักจับ Error 1899-12-30 ---
                                            let val = data[key];
                                            
                                            // ถ้าเป็นช่องเวลา (Time) แล้วเจอค่า 1899 ให้ล้างออก หรือตัดเอาเฉพาะเวลา
                                            if (el.type === 'time' && val && String(val).includes('1899-12-30')) {
                                                const parts = String(val).split('T');
                                                val = parts.length > 1 ? parts[1].substring(0, 5) : ''; 
                                            } 
                                            // ถ้าเป็นช่องวันที่ (Date) แล้วมี T ต่อท้าย ให้ตัดเอาแค่ YYYY-MM-DD
                                            else if (el.type === 'date' && val && String(val).includes('T')) {
                                                val = String(val).split('T')[0];
                                            }
                                            
                                            el.value = val;
                                            // ---------------------------------------------
                                    
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
                const p = this.selectedPatient;
                
                // 1. ดักจับตัวพิมพ์เล็ก-ใหญ่ และจัดการรูปแบบข้อมูล
                let rawTime = p.time || p.Time || p.admitTime || p.AdmitTime || '';
                let rawDate = p.date || p.Date || p.admitDate || p.AdmitDate || '';
                let bedVal = p.bed || p.Bed || '';
                
                // 2. จัดการรูปแบบเวลาให้อยู่ในฟอร์แมต HH:mm เพื่อให้ช่อง type="time" แสดงผลได้
                if (String(rawTime).includes('1899')) {
                    rawTime = '';
                } else if (String(rawTime).includes('T')) {
                    rawTime = String(rawTime).split('T')[1].substring(0, 5);
                }

                // 3. จัดการรูปแบบวันที่ให้อยู่ในฟอร์แมต YYYY-MM-DD
                if (String(rawDate).includes('T')) {
                    rawDate = String(rawDate).split('T')[0];
                }

                // 4. คัดลอกข้อมูลและบังคับแปลงชื่อคอลัมน์ให้ตรงกับ x-model ใน HTML
                this.form = { 
                    ...p,
                    bed: bedVal,
                    time: rawTime,
                    date: rawDate,
                    receivedFrom: p.receivedFrom || p.ReceivedFrom || p.received_from || '',
                    referFrom: p.referFrom || p.ReferFrom || p.refer_from || p.Refer || '',
                    address: p.address || p.Address || p.addressHome || '',
                    cc: p.cc || p.CC || p.chiefComplaint || '',
                    pi: p.pi || p.PI || p.presentIllness || ''
                };
                
                // 5. จัดการรูปแบบวันเกิดให้แสดงผลในช่องกรอก (แปลงเป็น พ.ศ.)
                if (p.dob || p.DOB) {
                    const dateObj = new Date(p.dob || p.DOB);
                    if (!isNaN(dateObj)) {
                        const d = String(dateObj.getDate()).padStart(2, '0');
                        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const y = dateObj.getFullYear() + 543;
                        this.form.dobInput = `${d}/${m}/${y}`;
                    }
                }
        
                // 6. โหลดเตียงว่าง และเพิ่มเตียงปัจจุบันของคนไข้เข้าไปในตัวเลือก
                const res = await fetch(`${this.API_URL}?action=getBeds&ward=${this.currentWard}`);
                let fetchedBeds = await res.json();
                this.availableBeds = Array.isArray(fetchedBeds) ? fetchedBeds : [];
                
                if (bedVal && !this.availableBeds.includes(bedVal)) {
                    this.availableBeds.unshift(bedVal);
                }
                
                this.showAdmitModal = true;
            } catch (e) {
                console.error("Edit Form Error:", e);
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
        
        // 1. เพิ่มฟังก์ชันเช็คอายุเด็ก/ผู้ใหญ่
        checkAgeGroup(ageStr) {
            if (!ageStr || ageStr === "undefined") return true; // ถ้าไม่มีข้อมูล ให้ถือว่าเป็นผู้ใหญ่
            
            const StringAge = String(ageStr);
            const match = StringAge.match(/\d+/);
            const ageNum = match ? parseInt(match[0], 10) : 0;
        
            const hasYear = StringAge.includes('ปี');
            const hasMonth = StringAge.includes('เดือน');
            const hasDay = StringAge.includes('วัน');
        
            // ถ้ามีคำว่า "เดือน" หรือ "วัน" แต่ไม่มีคำว่า "ปี" ถือว่าเป็นเด็กแน่นอน
            if ((hasMonth || hasDay) && !hasYear) return false; 
        
            // ตามที่คุณระบุ: เด็กคือ 0-15 ปี ดังนั้น > 15 คือผู้ใหญ่
            return ageNum > 15; 
        },

        // 2. ปรับปรุงฟังก์ชันเลือกผู้ป่วยให้เช็คอายุก่อนแสดงผล
        openPatientDetail(p) {
            if (!p) return;
            this.selectedPatient = p;
            
            // --- ตรวจสอบอายุทุกครั้งที่คลิกดูรายละเอียด ---
            const patientAge = p.age || p.Age || p.ageDisplay || p.agedisplay || "";
            this.isAdult = this.checkAgeGroup(patientAge);
            
            console.log(`ดูรายละเอียด: ${p.name}, อายุ: ${patientAge}, เป็น: ${this.isAdult ? 'ผู้ใหญ่' : 'เด็ก'}`);
            // --------------------------------------------------------
        
            this.viewMode = 'detail';
            this.currentForm = null; 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        
            // โหลดข้อมูลประวัติเบื้องต้น
            const an = p.an || p.AN;
            if (an) {
                // ✅ แยกการโหลดข้อมูลแรกรับ ตามอายุ (ผู้ใหญ่ / เด็ก)
                if (this.isAdult) {
                    this.loadAssessmentData(an);
                } else {
                    this.loadAssessmentPedData(an);
                }
                
                this.loadClassifications(an);
                this.loadFallRisk(an);
                this.loadBraden(an);
                this.loadPatientEdu(an);
            }
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
            const dateKey = this.normalizeDateKey(dateStr);
            const date = this.dateKeyToLocalDate(dateKey);
            
            // ตรวจสอบว่าเป็นรูปแบบวันที่ที่ถูกต้องหรือไม่
            if (!date || isNaN(date.getTime())) return dateStr; 
            
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
                this.gridData = {};
        
                if (this.isAdult) {
                    const res = await fetch(`${this.API_URL}?action=getClassifications&an=${an}&_=${new Date().getTime()}`);
                    const rawHistory = await res.json();
                    this.classHistory = this.normalizeShiftData(rawHistory, {
                        buildRecord: (item, index) => ({
                            ...item,
                            evalDate: item.evalDate,
                            shift: item.shift,
                            timestamp: item.timestamp,
                            scores: Array.isArray(item.scores) ? item.scores.slice(0, 8) : Array(8).fill(''),
                            total: item.total ?? '',
                            category: item.category ?? '',
                            assessor: item.assessor || '',
                            _sourceIndex: index
                        })
                    });
                    this.rebuildClassificationGrid(this.classHistory);
                } else {
                    const res = await fetch(`${this.API_URL}?action=getClassificationsPed&an=${an}&_=${new Date().getTime()}`);
                    const rawHistory = await res.json();
                    this.classHistoryPed = this.normalizeShiftData(rawHistory, {
                        buildRecord: (item, index) => {
                            const formData = item.formData || this.parseJsonSafely(item.formdata, {});
                            return {
                                ...item,
                                evalDate: item.evalDate || item.date,
                                shift: item.shift,
                                timestamp: item.timestamp,
                                formData,
                                scores: Array.isArray(item.scores) ? item.scores.slice(0, 10) : this.buildPedScores(formData),
                                score: item.score ?? '',
                                classType: item.classType || item.classtype || '',
                                assessor: item.assessor || '',
                                _sourceIndex: index
                            };
                        }
                    });
                    this.rebuildClassificationGrid(this.classHistoryPed);
                }
                this.currentPageIndex = Math.min(this.currentPageIndex, Math.max(this.classTimeline.length - 1, 0));
            } catch (e) { 
                console.error("Load Classifications Error:", e); 
            } finally {
                this.isLoading = false;
            }
        },
        // คำนวณคะแนนเด็กจาก Array 10 ช่อง
        calcPedScores(scoreArr) {
            if (!scoreArr || !Array.isArray(scoreArr)) return { total: '', category: '' };
            let total = 0;
            let count = 0;
            scoreArr.forEach(val => {
                const num = parseInt(val);
                if (!isNaN(num)) {
                    total += num;
                    count++;
                }
            });
            
            if (count === 0) return { total: '', category: '' };
            
            let cat = '';
            if (total >= 34) cat = 'ประเภท 5';
            else if (total >= 28) cat = 'ประเภท 4';
            else if (total >= 22) cat = 'ประเภท 3';
            else if (total >= 16) cat = 'ประเภท 2';
            else if (total > 0) cat = 'ประเภท 1';
            
            return { total: total, category: cat };
        },

        // บันทึกคะแนนเด็ก (แยก Shift)
        async savePedShiftClassification(date, shift) {
            // 1. เช็คความปลอดภัยก่อนว่ามีคนไข้ที่เลือกอยู่จริงไหม
            if (!this.selectedPatient || (!this.selectedPatient.an && !this.selectedPatient.AN)) {
                this.showAlert('Error', 'ไม่พบข้อมูลเลข AN ของผู้ป่วย กรุณาปิดและเปิดชาร์ตใหม่อีกครั้ง');
                return;
            }

            // ดึงค่า AN ออกมาแบบชัวร์ๆ (รองรับทั้งตัวเล็กตัวใหญ่)
            const currentAN = this.selectedPatient.an || this.selectedPatient.AN;

            // 2. เช็คข้อมูลใน Grid
            const cell = this.gridData[date]?.[shift];
            if (!cell || !cell.scores || !cell.scores.some(s => s !== '' && s !== null)) {
                this.showAlert('แจ้งเตือน', 'กรุณากรอกคะแนนอย่างน้อย 1 ช่องในเวร' + shift);
                return;
            }
            
            const result = this.calcPedScores(cell.scores);
            if (!result.total) {
                this.showAlert('แจ้งเตือน', 'ข้อมูลคะแนนไม่ถูกต้อง');
                return;
            }
            
            // 3. จัดการชื่อผู้ประเมิน
            let finalAssessor = cell.assessor || this.searchNurse || this.nurseName || '';
            if (!finalAssessor) {
                finalAssessor = prompt("กรุณาลงชื่อพยาบาลผู้ประเมิน สำหรับเวร " + shift + ":");
                if (!finalAssessor) return;
                cell.assessor = finalAssessor;
            }

            // 4. เตรียมข้อมูลส่งไป Backend (แปลง Array เป็น Object ตามที่ชีตต้องการ)
            const formDataObj = {
                item1: cell.scores[0] || '', item2: cell.scores[1] || '', item3: cell.scores[2] || '', item4: cell.scores[3] || '',
                item5: cell.scores[4] || '', item6: cell.scores[5] || '', item7: cell.scores[6] || '',
                item8: cell.scores[7] || '', item9: cell.scores[8] || '', item10: cell.scores[9] || ''
            };

            const payload = {
                an: currentAN,
                ward: this.currentWard || this.selectedPatient.ward || '',
                bed: this.selectedPatient.bed || '',
                evalDate: date,
                date: date,
                shift: shift,
                score: result.total,
                classType: result.category,
                assessor: finalAssessor,
                formData: formDataObj
            };
            
            this.isLoading = true;
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveClassificationPed', payload: payload }) // 
                });
                
                const res = await response.json();
                if (res.status === 'success') {
                    this.showSuccess = true;
                    this.successMsg = `บันทึกเวร${shift} วันที่ ${this.formatThaiDateShort(date)} สำเร็จ`;
                    setTimeout(() => this.showSuccess = false, 2000);
                    await this.loadClassifications(currentAN);
                } else {
                    this.showAlert('Error', res.message);
                }
            } catch (e) {
                console.error("Save Ped Class Error:", e);
                this.showAlert('Error', 'การส่งข้อมูลล้มเหลว: ' + e.message);
            } finally {
                this.isLoading = false;
            }
        },
        // 1. คำนวณคะแนนเด็ก
        calcPedClass() {
            let total = 0;
            for (let i = 1; i <= 10; i++) {
                total += parseInt(this.pedClassForm.scores['item' + i]) || 0;
            }
            this.pedClassForm.total = total;
            
            let type = '';
            if (total >= 34) type = 'ประเภท 5 หนักมาก (Need ICU)';
            else if (total >= 28) type = 'ประเภท 4 หนัก (Modified Intensive Care)';
            else if (total >= 22) type = 'ประเภท 3 หนักปานกลาง (Intensive Care)';
            else if (total >= 16) type = 'ประเภท 2 เจ็บป่วยเล็กน้อย (Minimum Care)';
            else if (total > 0) type = 'ประเภท 1 ผู้ป่วยพักฟื้น (Self Care)';
            
            this.pedClassForm.type = type;
        },

        // 2. บันทึกข้อมูลเด็ก
        async savePedClass() {
            if (this.pedClassForm.total === 0) return this.showAlert('แจ้งเตือน', 'กรุณาประเมินคะแนนอย่างน้อย 1 หัวข้อ');
            if (!this.searchNurse) return this.showAlert('แจ้งเตือน', 'กรุณาลงชื่อพยาบาลผู้ประเมิน');
            
            this.isLoading = true;
            try {
                const payload = {
                    an: this.selectedPatient?.an,
                    ward: this.currentWard,
                    bed: this.selectedPatient?.bed,
                    evalDate: this.pedClassForm.date,
                    date: this.pedClassForm.date,
                    shift: this.pedClassForm.shift,
                    score: this.pedClassForm.total,
                    classType: this.pedClassForm.type,
                    assessor: this.searchNurse,
                    formData: this.pedClassForm.scores
                };
                
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveClassificationPed', payload: payload }) 
                });
                
                const res = await response.json();
                if (res.status === 'success') {
                    this.showSuccess = true;
                    this.successMsg = res.message;
                    setTimeout(() => this.showSuccess = false, 3000);
                    this.loadClassifications(this.selectedPatient.an); // โหลดประวัติใหม่มาแสดง
                    // รีเซ็ตฟอร์มคะแนน
                    this.pedClassForm.scores = {};
                    this.calcPedClass();
                }
            } catch (e) {
                this.showAlert('Error', e.message);
            } finally {
                this.isLoading = false;
            }
        },

        // 3. ระบบพิมพ์เอกสารเด็ก A4
        printPedClassRecord() {
            const pages = this.classTimeline;
            const hasAnyData = Array.isArray(this.classHistoryPed) && this.classHistoryPed.length > 0;
            if (!hasAnyData || pages.length === 0) {
                return this.showAlert('แจ้งเตือน', 'ยังไม่มีประวัติการประเมินเพื่อพิมพ์');
            }
        
            const p = this.selectedPatient;
            const SHIFT_ORDER = this.shiftOrder;
            const daysPerPage = 5;
        
            const topics = [
                { scoreIndex: 0, title: '1.1 การดูดนมและรับประทานอาหาร', header: '1. การดูแลเกี่ยวกับกิจวัตรประจำวัน' },
                { scoreIndex: 1, title: '1.2 การดูแลสุขอนามัยส่วนบุคคล' },
                { scoreIndex: 2, title: '1.3 การขับถ่าย' },
                { scoreIndex: 3, title: '1.4 การเคลื่อนไหวร่างกายและการออกกำลังกาย' },
                { scoreIndex: 4, title: '2.1 การได้รับยาและ/หรือ สารน้ำ สารอาหาร', header: '2. การได้รับยาและการปฏิบัติการพยาบาล' },
                { scoreIndex: 5, title: '2.2 การปฏิบัติการรักษาพยาบาล' },
                { scoreIndex: 6, title: '2.3 การช่วยเหลือด้านการหายใจ' },
                { scoreIndex: 7, title: '3.1 สภาพอาการทั่วไป', header: '3. การประเมินสภาพอาการการสังเกตสัญญาณชีพและเครื่องตรวจวัดต่างๆ' },
                { scoreIndex: 8, title: '3.2 การสังเกตสัญญาณชีพและเครื่องวัดอื่นๆ' },
                { scoreIndex: 9, title: '4. การสอนและการประคับประคองจิตใจ (ผู้ป่วยเด็กและครอบครัว)', isMain: true }
            ];
        
            const admitDateStr = p?.date && typeof this.formatThaiDateLong === 'function' ? this.formatThaiDateLong(p.date) : '-';
            const dischargeDateStr = p?.dischargeDate && typeof this.formatThaiDateLong === 'function' ? this.formatThaiDateLong(p.dischargeDate) : '-';
        
            let printContent = `
            <html>
            <head>
                <title>แบบบันทึกการจำแนกประเภทผู้ป่วยเด็ก</title>
                <style>
                    @import url('[https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700;900&display=swap](https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700;900&display=swap)');
                    body { font-family: 'Sarabun', sans-serif; font-size: 9pt; margin: 0; padding: 0; color: #000; }
                    /* เปลี่ยนเป็น A4 แนวตั้ง (Portrait) */
                    .a4-page { width: 210mm; height: 296mm; margin: 0 auto; padding: 10mm 10mm 15mm 10mm; position: relative; box-sizing: border-box; page-break-after: always; }
                    .header-right { position: absolute; top: 8mm; right: 10mm; text-align: right; font-size: 8pt; font-weight: bold; line-height: 1.2; }
                    
                    /* หัวเรื่อง */
                    .main-title { text-align: center; font-weight: 900; font-size: 13pt; margin-top: 50px; margin-bottom: 2px; }
                    .sub-title { text-align: center; font-weight: 700; font-size: 11pt; margin-bottom: 8px; }
                    .date-info { text-align: center; font-size: 10pt; margin-bottom: 8px; }
                    
                    /* ตารางบีบให้เข้ากับแนวตั้ง */
                    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8pt; table-layout: fixed; }
                    th, td { border: 1px solid #000; padding: 2px; text-align: center; vertical-align: middle; word-wrap: break-word; }
                    th { font-weight: bold; }
                    .text-left { text-align: left; padding-left: 4px; }
                    
                    /* ปรับขนาดคอลัมน์ให้ยัดลงแนวตั้งได้ */
                    .col-topic { width: 26%; } 
                    .col-shift { width: calc(74% / 15); } 
                    
                    .bg-gray { background-color: #f1f5f9; font-weight: bold; text-align: left; padding-left: 4px; }
                    .bg-light { background-color: #f8fafc; }
                    
                    /* กรอบคนไข้และท้ายกระดาษ */
                    .fixed-footer-container { position: absolute; bottom: 8mm; left: 10mm; right: 10mm; display: flex; flex-direction: column; gap: 5px; }
                    .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                    .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 4px 8px; font-size: 8.5pt !important; background: #fff; }
                    .print-footer { width: 100%; text-align: center; font-size: 7.5pt !important; color: #666; border-top: 1px solid #ccc; padding-top: 4px; }
                    
                    .criteria-box { font-size: 8pt; line-height: 1.3; margin-top: 5px; border: 1px solid #000; padding: 4px; display: inline-block; width: 100%; box-sizing: border-box;}
        
                    @media print {
                        @page { size: A4 portrait; margin: 0; }
                        body { background: #fff; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>`;
        
            pages.forEach((pageData, pageIndex) => {
                printContent += `
                <div class="a4-page">
                    <div class="header-right">
                        <div>Echart-ipd-nurse</div>
                        <div>Classification-PED-Form หน้า ${pageIndex + 1}</div>
                    </div>
                    
                    <div class="main-title">แบบบันทึกการจำแนกประเภทผู้ป่วยเด็ก หอผู้ป่วย${this.currentWard || '-'}</div>
                    <div class="sub-title">กลุ่มการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน</div>
                    
                    <div class="date-info">
                        <b>วันที่รับใหม่:</b> ${admitDateStr} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>วันที่จำหน่าย:</b> ${dischargeDateStr}
                    </div>
                    
                    <table>
                        <thead>
                            <tr class="bg-light">
                                <th class="col-topic">ว/ด/ป</th>
                                ${pageData.map(day => `<th colspan="3">${this.formatThaiDateShort(day.date)}</th>`).join('')}
                                ${Array(daysPerPage - pageData.length).fill('<th colspan="3"></th>').join('')}
                            </tr>
                            <tr class="bg-light">
                                <th class="text-left text-gray-500" style="font-size:7pt;">เวร</th>
                                ${pageData.map(() => `
                                    <th class="col-shift">ดึก</th>
                                    <th class="col-shift">เช้า</th>
                                    <th class="col-shift" style="font-size:7pt;">บ่าย</th>
                                `).join('')}
                                ${Array(daysPerPage - pageData.length).fill('<th class="col-shift"></th><th class="col-shift"></th><th class="col-shift"></th>').join('')}
                            </tr>
                        </thead>
                        <tbody>`;
        
                topics.forEach(t => {
                    if (t.header) {
                        printContent += `<tr><td colspan="${(daysPerPage * 3) + 1}" class="bg-gray">${t.header}</td></tr>`;
                    }
                    printContent += `<tr><td class="text-left" ${t.isMain ? 'style="font-weight:bold; background-color:#f1f5f9;"' : ''}>${t.title}</td>`;
                            
                    pageData.forEach(day => {
                        SHIFT_ORDER.forEach(shift => {
                            const scoreVal = this.getGridCell(day.date, shift).scores[t.scoreIndex] || '';
                            printContent += `<td ${t.isMain ? 'class="bg-gray"' : ''}>${scoreVal}</td>`;
                        });
                    });
                    
                    printContent += Array((daysPerPage - pageData.length) * 3).fill('<td></td>').join('');
                    printContent += `</tr>`;
                });
        
                printContent += `
                        <tr style="background-color:#f8fafc;">
                            <th class="text-left">รวมคะแนน</th>
                            ${pageData.map(day => SHIFT_ORDER.map(shift => `<th>${this.calcPedScores(this.getGridCell(day.date, shift).scores).total || ''}</th>`).join('')).join('')}
                            ${Array((daysPerPage - pageData.length) * 3).fill('<th></th>').join('')}
                        </tr>
                        <tr>
                            <th class="text-left" style="font-size:7.5pt;">ประเภทผู้ป่วย</th>
                            ${pageData.map(day => SHIFT_ORDER.map(shift => {
                                const typeStr = this.calcPedScores(this.getGridCell(day.date, shift).scores).category || '';
                                const typeMatch = String(typeStr).match(/ประเภท\s*(\d)/);
                                return `<th style="font-size:7pt;">${typeMatch ? '' + typeMatch[1] : ''}</th>`;
                            }).join('')).join('')}
                            ${Array((daysPerPage - pageData.length) * 3).fill('<th></th>').join('')}
                        </tr>
                        <tr>
                            <th class="text-left">ผู้ประเมิน</th>
                            ${pageData.map(day => SHIFT_ORDER.map(shift => {
                                const rawAssessor = this.getGridCell(day.date, shift).assessor || '';
                                const assessor = this.formatPrintAssessorName(rawAssessor);
                                return `<td style="${this.getPrintAssessorStyle(rawAssessor, 5.5, 3.8, 7)}">${assessor}</td>`;
                            }).join('')).join('')}
                            ${Array((daysPerPage - pageData.length) * 3).fill('<td></td>').join('')}
                        </tr>
                    </tbody>
                </table>
        
                <div class="criteria-box">
                    <b>เกณฑ์การจำแนกประเภท:</b> &nbsp;&nbsp; <br>
                        <b>ประเภท 5 หนักมาก (Need ICU):</b> 34-40 คะแนน <br>
                        <b>ประเภท 4 หนัก (Modified Intensive Care) :</b> 28-33 คะแนน<br>
                        <b>ประเภท 3 หนักปานกลาง (Intensive Care):</b> 22-27 คะแนน <br>
                        <b>ประเภท 2 เจ็บป่วยเล็กน้อย (Minimum Care) :</b> 16-21 คะแนน <br>
                        <b>ประเภท 1 ผู้ป่วยพักฟื้น (Self Care) :</b> ไม่เกิน 15 คะแนน
                </div>
        
                <div class="fixed-footer-container">
                    <div class="patient-box-container">
                        <div class="print-patient-box">
                            <div><b>ชื่อ-สกุล:</b> ${p?.name || '-'} &nbsp; <b>อายุ:</b> ${p?.ageDisplay || '-'}</div>  
                            <div><b>HN:</b> ${p?.hn || '-'} &nbsp; <b>AN:</b> ${p?.an || '-'}</div>                
                            <div><b>แพทย์เจ้าของไข้:</b> ${p?.doctor || '-'} &nbsp; <b>ตึก:</b> ${p?.ward || this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${p?.bed || '-'}</div>
                        </div>
                    </div>
                    <div class="print-footer">
                        เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | ระบบบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                    </div>
                </div>
            </div>`;
            });
        
            printContent += `
                <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
            </body>
            </html>`;
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
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
            if (!dateStr || !shift) return { scores: Array(10).fill(''), assessor: '', timestamp: '' };
            if (!this.gridData[dateStr]) this.gridData[dateStr] = {};
            if (!this.gridData[dateStr][shift]) this.gridData[dateStr][shift] = { scores: Array(10).fill(''), assessor: '', timestamp: '' };
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
            return this.normalizeDateKey(date);
        },
        get classTimeline() {
            if (!this.selectedPatient) return [];

            const anchorDates = [];
            const admitDate = this.normalizeDateKey(this.selectedPatient.date || this.selectedPatient.admitDate);
            const dischargeDate = this.normalizeDateKey(this.selectedPatient.dischargeDate);
            const todayDate = this.getLocalYYYYMMDD(new Date());

            if (admitDate) anchorDates.push(admitDate);
            if (dischargeDate) anchorDates.push(dischargeDate);
            if (todayDate) anchorDates.push(todayDate);

            this.getTimelineSourceRecords().forEach(record => {
                const recordDate = this.normalizeDateKey(record?.evalDate || record?.date);
                if (recordDate) anchorDates.push(recordDate);
            });

            if (anchorDates.length === 0) return [];

            const sortedAnchorDates = anchorDates
                .map(dateKey => this.dateKeyToLocalDate(dateKey))
                .filter(Boolean)
                .sort((a, b) => a.getTime() - b.getTime());

            const startDate = new Date(sortedAnchorDates[0]);
            const endDate = new Date(sortedAnchorDates[sortedAnchorDates.length - 1]);
            const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const totalDays = Math.max(diffDays, 5);

            const pages = [];
            for (let offset = 0; offset < totalDays; offset += 5) {
                const dayInPage = [];
                for (let i = 0; i < 5 && offset + i < totalDays; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + offset + i);
                    const dateKey = this.getLocalYYYYMMDD(currentDate);
                    dayInPage.push({
                        date: dateKey,
                        formattedDate: this.formatThaiDateShort(dateKey)
                    });
                }
                pages.push(dayInPage);
            }
            return pages;
        },
        get printTimelinePages() {
            return this.classTimeline.map((page, pageIndex) => {
                const paddedPage = page.map((day, dayIndex) => ({
                    ...day,
                    slotKey: day.date || `page-${pageIndex}-day-${dayIndex}`,
                    isPlaceholder: false
                }));

                while (paddedPage.length < 5) {
                    paddedPage.push({
                        date: '',
                        formattedDate: '',
                        slotKey: `page-${pageIndex}-placeholder-${paddedPage.length}`,
                        isPlaceholder: true
                    });
                }

                return paddedPage;
            });
        },

        // เปิด Popup ประเมินรอบใหม่ และเคลียร์ค่า
        openClassModal() {
            this.classForm = {
                // เปลี่ยนมาใช้ Helper ของเราแทนเพื่อให้ได้วันที่ไทยจริงๆ
                evalDate: this.getLocalYYYYMMDD(new Date()), 
                shift: 'เช้า',
                scores: Array(8).fill(''),
                assessor: ''
            };
            this.showClassModal = true;
        },

        // บันทึกข้อมูล 1 เวร
        async saveClassForm() {
            if (this.classForm.scores.some(score => ![1, 2, 3, 4].includes(Number(score)))) {
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
                scores: this.classForm.scores.map(score => Number(score)),
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
        async savePedShiftForm() {
            const form = this.pedShiftForm;
            if (form.scores.some(score => ![1, 2, 3, 4].includes(Number(score)))) {
                return this.showAlert('แจ้งเตือน', 'กรุณาประเมินให้ครบทั้ง 10 ข้อ');
            }
            if (!form.assessor) {
                return this.showAlert('แจ้งเตือน', 'กรุณาระบุชื่อพยาบาลผู้ประเมิน');
            }

            const currentAN = this.selectedPatient?.an || this.selectedPatient?.AN;
            if (!currentAN) return this.showAlert('Error', 'ไม่พบเลข AN ของผู้ป่วย');

            const formDataObj = {
                item1: Number(form.scores[0]), item2: Number(form.scores[1]), item3: Number(form.scores[2]), item4: Number(form.scores[3]),
                item5: Number(form.scores[4]), item6: Number(form.scores[5]), item7: Number(form.scores[6]), item8: Number(form.scores[7]),
                item9: Number(form.scores[8]), item10: Number(form.scores[9])
            };
            const result = this.calcPedScores(form.scores);
            const payload = {
                an: currentAN,
                ward: this.currentWard || this.selectedPatient?.ward || '',
                bed: this.selectedPatient?.bed || '',
                evalDate: form.evalDate,
                date: form.evalDate,
                shift: form.shift,
                score: result.total,
                classType: result.category,
                assessor: form.assessor,
                formData: formDataObj
            };

            this.isLoading = true;
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'saveClassificationPed', payload })
                });
                const res = await response.json();
                if (res.status !== 'success') throw new Error(res.message);

                this.showPedShiftModal = false;
                this.successMsg = `บันทึกเวร${form.shift} วันที่ ${this.formatThaiDateShort(form.evalDate)} สำเร็จ`;
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 2500);
                await this.loadClassifications(currentAN);
            } catch (error) {
                this.showAlert('Error', error.message);
            } finally {
                this.isLoading = false;
            }
        },
        async saveFallShiftForm() {
            const form = this.fallShiftForm;
            const hasMorse = form.scores.some(score => score !== '' && score !== null);
            const hasMaas = form.maas !== '' && form.maas !== null;
            if (!hasMorse && !hasMaas) {
                return this.showAlert('แจ้งเตือน', 'กรุณากรอกข้อมูลอย่างน้อย 1 รายการ');
            }
            if (!form.assessor) {
                return this.showAlert('แจ้งเตือน', 'กรุณาระบุชื่อพยาบาลผู้ประเมิน');
            }

            const payload = {
                action: 'saveFallRiskSingle',
                an: this.selectedPatient.an,
                hn: this.selectedPatient.hn,
                ward: this.currentWard,
                evalDate: form.evalDate,
                shift: form.shift,
                m1: form.scores[0], m2: form.scores[1], m3: form.scores[2],
                m4: form.scores[3], m5: form.scores[4], m6: form.scores[5],
                morseTotal: this.calcMorseTotal(form.scores),
                maasScore: form.maas,
                assessor: form.assessor
            };

            this.isLoading = true;
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                const res = await response.json();
                if (res.status !== 'success') throw new Error(res.message);

                this.showFallShiftModal = false;
                this.successMsg = `บันทึกเวร${form.shift} วันที่ ${this.formatThaiDateShort(form.evalDate)} สำเร็จ`;
                this.showSuccess = true;
                setTimeout(() => this.showSuccess = false, 2500);
                await this.loadFallRisk(this.selectedPatient.an);
            } catch (error) {
                this.showAlert('Error', error.message);
            } finally {
                this.isLoading = false;
            }
        },
        async saveShiftClassification(date, shift) {
            const cell = this.getGridCell(date, shift);
            
            // ตรวจสอบว่ามีการกรอกข้อมูลหรือยัง
            if (!cell.scores.some(s => s !== "" && s !== null)) {
                this.dialog = { show: true, type: 'alert', title: 'แจ้งเตือน', msg: 'กรุณากรอกคะแนนก่อนบันทึก' };
                return;
            }
        
            this.isLoading = true;
            try {
                const scoresResult = this.calcScores(cell.scores);
                const payload = {
                    action: 'saveClassificationSingle', // เรียกฟังก์ชันใหม่ที่บันทึกแถวเดียว
                    an: this.selectedPatient.an,
                    hn: this.selectedPatient.hn,
                    ward: this.currentWard,
                    evalDate: date,
                    shift: shift,
                    q1: cell.scores[0], q2: cell.scores[1], q3: cell.scores[2], q4: cell.scores[3],
                    q5: cell.scores[4], q6: cell.scores[5], q7: cell.scores[6], q8: cell.scores[7],
                    total: scoresResult.total,
                    category: scoresResult.category,
                    assessor: cell.assessor
                };
        
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                const res = await response.json();
        
            if (res.status === 'success') {
                this.dialog = { show: true, type: 'alert', title: 'สำเร็จ', msg: `บันทึกข้อมูลเวร ${shift} ของวันที่ ${date} เรียบร้อยแล้ว` };
                await this.loadClassifications(this.selectedPatient.an);
            } else {
                throw new Error(res.message);
            }
            } catch (e) {
                this.dialog = { show: true, type: 'alert', title: 'เกิดข้อผิดพลาด', msg: e.message };
            } finally {
                this.isLoading = false;
            }
        },

        // วันที่แบบย่อสำหรับใส่หัวตาราง
        formatThaiDateShort(dateStr) {
            if (!dateStr) return '';
            const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const dateKey = this.normalizeDateKey(dateStr);
            const date = this.dateKeyToLocalDate(dateKey);
            if (!date || isNaN(date.getTime())) return dateStr;
            return `${date.getDate()} ${months[date.getMonth()]} ${(date.getFullYear() + 543).toString().slice(-2)}`;
        },
        // ฟังก์ชันแปลงวันที่เป็นรูปแบบเต็ม (เช่น 1 มกราคม 2569)
        formatThaiDateLong(dateString) {
            if (!dateString) return '-';
            const thaiMonths = [
                "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
                "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
            ];
            try {
                const dateKey = this.normalizeDateKey(dateString);
                const d = this.dateKeyToLocalDate(dateKey);
                if (!d || isNaN(d.getTime())) return '-';
                const day = d.getDate();
                const month = thaiMonths[d.getMonth()];
                const year = d.getFullYear() + 543;
                return `${day} ${month} ${year}`;
            } catch (e) {
                return '-';
            }
        },
        // ฟังก์ชันตัดคำนำหน้าและนามสกุล (เอาเฉพาะชื่อจริง)
        formatShortName(fullName) {
            if (!fullName) return '';
            let name = String(fullName)
                .replace(/^(นายแพทย์|แพทย์หญิง|ทันตแพทย์หญิง|ทันตแพทย์|นาย|นางสาว|นาง|น\.ส\.|นพ\.|พญ\.|พว\.|ทพ\.|ทญ\.)\s*/g, '')
                .trim();
            name = name.replace(/\s+/g, ' ');
            return name ? name.split(' ')[0].trim() : '';
        },
        formatPrintAssessorName(fullName) {
            return this.formatShortName(fullName);
        },
        getPrintAssessorStyle(fullName, basePt = 6, minPt = 4.2, fitChars = 7) {
            const shortName = this.formatPrintAssessorName(fullName);
            const extraChars = Math.max(shortName.length - fitChars, 0);
            const fontSize = Math.max(minPt, Number((basePt - (extraChars * 0.3)).toFixed(2)));
            return `font-size:${fontSize}pt; line-height:1; white-space:nowrap; overflow:hidden;`;
        },
        escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },
        getClassificationPrintCell(dateStr, shift) {
            if (!dateStr || !shift) {
                return { scores: Array(8).fill(''), assessor: '' };
            }
            const normalizedDate = this.normalizeDateKey(dateStr);
            const normalizedShift = this.normalizeShiftLabel(shift);
            const cell = this.gridData?.[normalizedDate]?.[normalizedShift];
            return {
                scores: Array.from({ length: 8 }, (_, index) => cell?.scores?.[index] ?? ''),
                assessor: cell?.assessor || ''
            };
        },
        getFallPrintCell(dateStr, shift) {
            if (!dateStr || !shift) {
                return { scores: Array(6).fill(''), maas: '', assessor: '' };
            }
            const normalizedDate = this.normalizeDateKey(dateStr);
            const normalizedShift = this.normalizeShiftLabel(shift);
            const cell = this.fallGridData?.[normalizedDate]?.[normalizedShift];
            return {
                scores: Array.from({ length: 6 }, (_, index) => cell?.scores?.[index] ?? ''),
                maas: cell?.maas ?? '',
                assessor: cell?.assessor || ''
            };
        },

        // 🟢 ฟังก์ชันสั่งพิมพ์ของฟอร์มจำแนกผู้ป่วย (อัปเดตแก้ปัญหาหน้าว่าง)
        printClassification() {
            window.scrollTo(0, 0);

            const pages = this.printTimelinePages || [];
            if (!pages.length) {
                return this.showAlert('แจ้งเตือน', 'ยังไม่มีประวัติการประเมินเพื่อพิมพ์');
            }

            const shifts = this.shiftOrder;
            const questionRows = [
                { type: 'section', label: 'สภาวะสุขภาพ' },
                { type: 'question', label: '1. สัญญาณชีพ', scoreIndex: 0 },
                { type: 'question', label: '2. อาการและอาการแสดงทางระบบประสาท', scoreIndex: 1 },
                { type: 'question', label: '3. การได้รับการตรวจรักษา/ผ่าตัดหรือหัตถการ', scoreIndex: 2 },
                { type: 'question', label: '4. พฤติกรรมที่ผิดปกติ อารมณ์ จิตสังคม', scoreIndex: 3 },
                { type: 'section', label: 'ความต้องการการดูแลขั้นต่ำ' },
                { type: 'question', label: '5. ความสามารถในการปฏิบัติกิจวัตรประจำวัน', scoreIndex: 4 },
                { type: 'question', label: '6. ความต้องการด้านจิตใจและอารมณ์ของผู้ป่วย', scoreIndex: 5 },
                { type: 'question', label: '7. ความต้องการยา/การรักษาทำหัตถการ/ฟื้นฟู', scoreIndex: 6 },
                { type: 'question', label: '8. ความต้องการการบรรเทาอาการรบกวน', scoreIndex: 7 }
            ];

            const buildShiftCells = (page, renderCell) => page.map(day => shifts.map(shift => renderCell(day, shift)).join('')).join('');

            const pageMarkup = pages.map((page, pageIndex) => {
                const tableRows = questionRows.map(row => {
                    if (row.type === 'section') {
                        return `<tr><th colspan="16" class="border border-black text-left px-2 py-1.5 bg-gray-50 font-bold">${this.escapeHtml(row.label)}</th></tr>`;
                    }

                    const cells = buildShiftCells(page, (day, shift) => {
                        const cell = this.getClassificationPrintCell(day.date, shift);
                        const score = cell.scores[row.scoreIndex] ?? '';
                        return `<td class="border border-black font-bold text-[12px]">${this.escapeHtml(score)}</td>`;
                    });

                    return `<tr><td class="border border-black text-left px-2 py-1.5 font-medium">${this.escapeHtml(row.label)}</td>${cells}</tr>`;
                }).join('');

                const totalRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getClassificationPrintCell(day.date, shift);
                    return `<td class="border border-black text-blue-800">${this.escapeHtml(this.calcScores(cell.scores).total)}</td>`;
                });

                const categoryRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getClassificationPrintCell(day.date, shift);
                    return `<td class="border border-black text-red-700">${this.escapeHtml(this.calcScores(cell.scores).category)}</td>`;
                });

                const assessorRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getClassificationPrintCell(day.date, shift);
                    return `<td class="border border-black text-gray-800 font-normal leading-tight" style="${this.getPrintAssessorStyle(cell.assessor, 5.8, 4.1, 7)}">${this.escapeHtml(this.formatPrintAssessorName(cell.assessor))}</td>`;
                });

                const dayHeaders = page.map(day => `<th colspan="3" class="border border-black font-bold py-1">${this.escapeHtml(day.formattedDate)}</th>`).join('');
                const shiftHeaders = page.map(() => shifts.map(shift => `<th class="border border-black w-[42px] font-bold">${this.escapeHtml(shift)}</th>`).join('')).join('');

                return `
                    <div class="a4-page relative bg-white shadow-xl mx-auto rounded-lg p-6 max-w-[210mm] text-black">
                        <div class="text-right text-[8px] font-bold mb-2">
                            Echart-ipd-nurse<br>Classification-Form หน้า ${pageIndex + 1}
                        </div>
                        <div class="text-center font-bold text-[15px] leading-relaxed mb-4">
                            แบบบันทึกการจำแนกผู้ป่วย หอผู้ป่วย ${this.escapeHtml(this.currentWard || '')}<br>
                            กลุ่มการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                        </div>

                        <div class="flex justify-center gap-8 text-[12px] font-bold mb-3">
                            <div>วันที่รับใหม่ <span class="border-b border-dotted border-black inline-block min-w-[140px] text-center">${this.escapeHtml(this.formatThaiDate(this.selectedPatient?.date))}</span></div>
                            <div>วันที่จำหน่าย <span class="border-b border-dotted border-black inline-block min-w-[140px] text-center">${this.escapeHtml(this.selectedPatient?.dischargeDate ? this.formatThaiDate(this.selectedPatient.dischargeDate) : '')}</span></div>
                        </div>

                        <table class="w-full border-collapse border border-black text-center text-[11px] leading-tight" style="table-layout: fixed;">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border border-black text-left px-2 py-1.5 w-[180px]">ว/ด/ป</th>
                                    ${dayHeaders}
                                </tr>
                                <tr class="bg-gray-100">
                                    <th class="border border-black text-left px-2 py-1">เวร</th>
                                    ${shiftHeaders}
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                                <tr class="font-bold bg-gray-50">
                                    <td class="border border-black text-left px-2 py-2">รวมคะแนน</td>
                                    ${totalRow}
                                </tr>
                                <tr class="font-bold">
                                    <td class="border border-black text-left px-2 py-2">ประเภทผู้ป่วย</td>
                                    ${categoryRow}
                                </tr>
                                <tr class="font-bold">
                                    <td class="border border-black text-left px-2 py-2">ผู้ประเมิน</td>
                                    ${assessorRow}
                                </tr>
                            </tbody>
                        </table>

                        <div class="mt-4 text-[11px] text-black font-medium leading-relaxed">
                            เกณฑ์การจำแนก นับรวมตั้งแต่ข้อ 1 ถึง ข้อ 8<br>
                            ประเภทที่ 1  ผู้ป่วยพักฟื้นดูแลตัวเองได้     (8 คะแนน)<br>
                            ประเภทที่ 2  ผู้ป่วยเจ็บป่วยเล็กน้อย        (9-14 คะแนน)<br>
                            ประเภทที่ 3  ผู้ป่วยเจ็บป่วยปานกลาง      (15-20 คะแนน)<br>
                            ประเภทที่ 4  ผู้ป่วยหนัก                (21-26 คะแนน)<br>
                            ประเภทที่ 5 ผู้ป่วยหนักมาก/วิกฤติ         (27-32 คะแนน)
                        </div>
                    </div>
                `;
            }).join('');

            let iframe = document.getElementById('print-frame');
            if (iframe) iframe.remove();
            iframe = document.createElement('iframe');
            iframe.id = 'print-frame';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const pri = iframe.contentWindow;
            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(s => s.outerHTML).join('');
            const pName = this.escapeHtml(this.selectedPatient?.name || '-');
            const pAge = this.escapeHtml(this.selectedPatient?.ageDisplay || '-');
            const pHn = this.escapeHtml(this.selectedPatient?.hn || '-');
            const pAn = this.escapeHtml(this.selectedPatient?.an || '-');
            const pDoc = this.escapeHtml(this.selectedPatient?.doctor || '-');
            const pWard = this.escapeHtml(this.currentWard || '-');
            const pBed = this.escapeHtml(this.selectedPatient?.bed || '-');

            pri.document.open();
            pri.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>พิมพ์การจำแนกประเภทผู้ป่วย</title>
                        ${styles}
                        <style>
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
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid black !important; padding: 4px !important; font-size: 11px; color: black !important; }
                            .print-global-footer {
                                position: fixed; bottom: 0; left: 0; width: 100%; text-align: center;
                                font-size: 9px; color: #475569 !important; border-top: 1px solid #9ca3af;
                                padding-top: 4px; padding-bottom: 4px; background-color: white; z-index: 1000;
                            }
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

                        ${pageMarkup}

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
        },
        // ฟังก์ชันบันทึกวันที่จำหน่าย
        async saveDischargeDateAction(an, dateStr) {
            // ดักจับกรณีไม่มีข้อมูล AN
            if (!an) {
                return this.showAlert('Error', 'ไม่พบเลข AN ของผู้ป่วย กรุณาโหลดข้อมูลใหม่');
            }
            if (!dateStr) {
                return this.showAlert('แจ้งเตือน', 'กรุณาระบุวันที่จำหน่าย');
            }

            this.isLoading = true;
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({ 
                        action: 'saveDischargeDate', 
                        an: an, 
                        date: dateStr 
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const res = await response.json();
                if (res.status === 'success') {
                    this.showAlert('สำเร็จ', 'บันทึกวันจำหน่ายเรียบร้อยแล้ว');
                } else {
                    this.showAlert('เกิดข้อผิดพลาด', res.message);
                }
            } catch (error) {
                console.error("Save Discharge Date Error:", error);
                // แจ้งเตือนผู้ใช้กรณีเน็ตหลุดหรือถูกบล็อก
                this.showAlert('ข้อผิดพลาดการเชื่อมต่อ', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง');
            } finally {
                this.isLoading = false;
            }
        },
        // โหลดข้อมูลประวัติ Morse/MAAS
        async loadFallRisk(an) {
            if (!an) return;
            this.isLoading = true;
            try {
                const response = await fetch(`${this.API_URL}?action=getFallRisk&an=${an}&_=${new Date().getTime()}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const rawHistory = await response.json();
                this.fallHistory = this.normalizeShiftData(rawHistory, {
                    buildRecord: (item, index) => ({
                        ...item,
                        evalDate: item.evalDate,
                        shift: item.shift,
                        timestamp: item.timestamp,
                        m1: item.m1 ?? '',
                        m2: item.m2 ?? '',
                        m3: item.m3 ?? '',
                        m4: item.m4 ?? '',
                        m5: item.m5 ?? '',
                        m6: item.m6 ?? '',
                        morseTotal: item.morseTotal ?? '',
                        maasScore: item.maasScore ?? '',
                        assessor: item.assessor || '',
                        _sourceIndex: index
                    })
                });
                this.rebuildFallGrid(this.fallHistory);
                this.currentPageIndex = Math.min(this.currentPageIndex, Math.max(this.classTimeline.length - 1, 0));
            } catch (e) { 
                console.error("Load Fall Risk Error:", e); 
                this.fallGridData = {};
            } finally {
                this.isLoading = false;
            }
        },

        // ดึง/สร้างช่องข้อมูลสำหรับหน้าจอ Morse/MAAS
        getFallGridCell(dateStr, shift) {
            if (!dateStr || !shift) return { scores: Array(6).fill(''), maas: '', assessor: '', timestamp: '' };
            if (!this.fallGridData[dateStr]) this.fallGridData[dateStr] = {};
            if (!this.fallGridData[dateStr][shift]) this.fallGridData[dateStr][shift] = { scores: Array(6).fill(''), maas: '', assessor: '', timestamp: '' };
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
    async saveShiftFallRisk(date, shift) {
        const cell = this.getFallGridCell(date, shift);
        
        // ตรวจสอบว่ามีการกรอกคะแนน Morse หรือ MAAS หรือยัง
        const hasMorse = cell.scores.some(s => s !== "" && s !== null);
        const hasMaas = cell.maas !== "" && cell.maas !== null;
    
        if (!hasMorse && !hasMaas) {
            this.dialog = { show: true, type: 'alert', title: 'แจ้งเตือน', msg: 'กรุณากรอกข้อมูลการประเมินก่อนบันทึก' };
            return;
        }
    
        this.isLoading = true;
        try {
            const payload = {
                action: 'saveFallRiskSingle',
                an: this.selectedPatient.an,
                hn: this.selectedPatient.hn,
                ward: this.currentWard,
                evalDate: date,
                shift: shift,
                m1: cell.scores[0], m2: cell.scores[1], m3: cell.scores[2],
                m4: cell.scores[3], m5: cell.scores[4], m6: cell.scores[5],
                morseTotal: this.calcMorseTotal(cell.scores),
                maasScore: cell.maas,
                assessor: cell.assessor
            };
    
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const res = await response.json();
    
            if (res.status === 'success') {
                this.dialog = { show: true, type: 'alert', title: 'สำเร็จ', msg: `บันทึกประเมิน Fall Risk เวร ${shift} เรียบร้อย` };
                await this.loadFallRisk(this.selectedPatient.an);
            } else {
                throw new Error(res.message);
            }
        } catch (e) {
            this.dialog = { show: true, type: 'alert', title: 'เกิดข้อผิดพลาด', msg: e.message };
        } finally {
            this.isLoading = false;
        }
    },

        // ฟังก์ชันสั่งพิมพ์ Morse/MAAS
        printFallRisk() {
            window.scrollTo(0, 0);
            const pages = this.printTimelinePages || [];
            if (!pages.length) {
                return this.showAlert('แจ้งเตือน', 'ยังไม่มีประวัติการประเมินเพื่อพิมพ์');
            }

            const shifts = this.shiftOrder;
            const morseRows = [
                { label: '1. มีการหกล้มกะทันหัน หรือพลัดตกหกล้ม 3 เดือนก่อนมา รพ.', guide: 'ไม่ใช่ = 0<br>ใช่ = 25', scoreIndex: 0 },
                { label: '2. มีการวินิจฉัยโรคมากกว่า 1 รายการ', guide: 'ไม่ใช่ = 0<br>ใช่ = 15', scoreIndex: 1 },
                { label: '3. การช่วยในการเคลื่อนย้าย<br>- เดินได้เอง/ใช้รถเข็น/นอนพักบนเตียงหรือทำกิจกรรมบนเตียง<br>- ใช้ไม้ค้ำ/ไม้เท้า<br>- เดินโดยเกาะอีกคนไปตามเตียง / โต๊ะ / เก้าอี้', guide: 'ใช่ = 0<br>ใช่ = 15<br>ใช่ = 30', scoreIndex: 2 },
                { label: '4. ให้สารละลายทางหลอดเลือด / คา Heparin lock', guide: 'ไม่ใช่ = 0<br>ใช่ = 20', scoreIndex: 3 },
                { label: '5. การเดิน / การเคลื่อนย้าย<br>- ปกติ / นอนพักบนเตียงโดยไม่ได้ถูกจำกัดเคลื่อนไหว<br>- อ่อนแรงเล็กน้อยหรืออ่อนเพลีย<br>- มีความบกพร่อง เช่น ลุกจากเก้าอี้ด้วยความลำบาก / ไม่สามารถเดินได้โดยปราศจากการช่วยเหลือ', guide: 'ใช่ = 0<br>ใช่ = 10<br>ใช่ = 20', scoreIndex: 4 },
                { label: '6. สภาพจิตใจ<br>- รับรู้บุคคล เวลา สถานที่<br>- ตอบสนองไม่ตรงกับความเป็นจริง ไม่รับรู้ข้อจำกัดของตนเอง', guide: 'ใช่ = 0<br>ใช่ = 15', scoreIndex: 5 }
            ];
            const maasRows = [
                { value: '0', label: 'ไม่ตอบสนอง (0)' },
                { value: '1', label: 'ตอบสนองต่อการกระตุ้นแรงๆ (1)' },
                { value: '2', label: 'ตอบสนองการสัมผัส/เรียกชื่อ (2)' },
                { value: '3', label: 'สงบ/ให้ความร่วมมือ (3)' },
                { value: '4', label: 'พักน้อย/ไม่ร่วมมือ (4)' },
                { value: '5', label: 'ต่อต้านการรักษา (5)' },
                { value: '6', label: 'ต่อต้านการรักษา/อันตราย (6)' }
            ];

            const buildShiftCells = (page, renderCell) => page.map(day => shifts.map(shift => renderCell(day, shift)).join('')).join('');

            const pageMarkup = pages.map((page, pageIndex) => {
                const dayHeaders = page.map(day => `<th colspan="3" class="border border-black p-1 text-center">${this.escapeHtml(day.formattedDate)}</th>`).join('');
                const shiftHeaders = page.map(() => shifts.map(shift => `<th class="w-shift border border-black p-1 text-center">${this.escapeHtml(shift)}</th>`).join('')).join('');

                const morseBody = morseRows.map(row => {
                    const cells = buildShiftCells(page, (day, shift) => {
                        const cell = this.getFallPrintCell(day.date, shift);
                        return `<td class="border border-black text-center font-bold">${this.escapeHtml(cell.scores[row.scoreIndex])}</td>`;
                    });
                    return `
                        <tr>
                            <td class="border border-black p-1">${row.label}</td>
                            <td class="border border-black p-1 text-center">${row.guide}</td>
                            ${cells}
                        </tr>
                    `;
                }).join('');

                const morseTotalRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getFallPrintCell(day.date, shift);
                    return `<td class="border border-black text-center">${this.escapeHtml(this.calcMorseTotal(cell.scores))}</td>`;
                });

                const morseAssessorRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getFallPrintCell(day.date, shift);
                    return `<td class="border border-black text-center" style="${this.getPrintAssessorStyle(cell.assessor, 5.4, 3.9, 7)}">${this.escapeHtml(this.formatPrintAssessorName(cell.assessor))}</td>`;
                });

                const maasBody = maasRows.map(row => {
                    const cells = buildShiftCells(page, (day, shift) => {
                        const cell = this.getFallPrintCell(day.date, shift);
                        return `<td class="border border-black text-center font-bold">${String(cell.maas) === String(row.value) ? '&#10003;' : ''}</td>`;
                    });
                    return `<tr><td class="border border-black p-1">${row.label}</td><td class="border border-black text-center">${this.escapeHtml(row.value)}</td>${cells}</tr>`;
                }).join('');

                const maasScoreRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getFallPrintCell(day.date, shift);
                    return `<td class="border border-black text-center">${this.escapeHtml(cell.maas)}</td>`;
                });

                const maasAssessorRow = buildShiftCells(page, (day, shift) => {
                    const cell = this.getFallPrintCell(day.date, shift);
                    return `<td class="border border-black text-center" style="${this.getPrintAssessorStyle(cell.assessor, 5.4, 3.9, 7)}">${this.escapeHtml(this.formatPrintAssessorName(cell.assessor))}</td>`;
                });

                return `
                    <div class="a4-page bg-white text-black p-4 mb-4" style="page-break-after: always;">
                        <div class="text-right text-[10px] font-bold">
                            Echart-ipd-nurse<br>Morse-MAAS-Form หน้า ${pageIndex + 1}
                        </div>
                        <div class="text-center font-bold text-[13px] mt-1 mb-2">
                            การประเมินความเสี่ยงต่อการพลัดตกหกล้ม Morse / การดึงอุปกรณ์ที่สอดใส่ในร่างกายผู้ป่วย (MAAS)<br>โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                        </div>
                        <div class="font-bold text-[11px] mt-1 mb-1 text-start">1.การประเมินความเสี่ยงต่อการพลัดตกหกล้ม Morse Fall Risk  Score</div>
                        <table class="w-full text-[9px] border-collapse text-left mb-2">
                            <thead>
                                <tr class="bg-gray">
                                    <th rowspan="2" class="w-label border border-black p-1">ประเด็น</th>
                                    <th rowspan="2" class="w-guide border border-black p-1 text-center">คะแนน/<br>เวร</th>
                                    ${dayHeaders}
                                </tr>
                                <tr class="bg-gray">
                                    ${shiftHeaders}
                                </tr>
                            </thead>
                            <tbody>
                                ${morseBody}
                                <tr class="bg-gray font-bold">
                                    <td colspan="2" class="border border-black text-right pr-2">รวมคะแนน</td>
                                    ${morseTotalRow}
                                </tr>
                                <tr>
                                    <td colspan="2" class="border border-black text-right pr-2 font-bold">พยาบาลผู้ประเมิน</td>
                                    ${morseAssessorRow}
                                </tr>
                            </tbody>
                        </table>

                        <div class="font-bold text-[11px] mt-1 mb-1 text-start">2.แบบประเมินความเสี่ยงต่อการดึงอุปกรณ์ที่สอดใส่ในร่างกายผู้ป่วย (MAAS)</div>
                        <table class="w-full text-[9px] border-collapse text-left mb-2">
                            <thead>
                                <tr class="bg-gray">
                                    <th rowspan="2" class="w-label border border-black p-1">ประเด็น</th>
                                    <th rowspan="2" class="w-guide border border-black p-1 text-center">คะแนน</th>
                                    ${dayHeaders}
                                </tr>
                                <tr class="bg-gray">
                                    ${shiftHeaders}
                                </tr>
                            </thead>
                            <tbody>
                                ${maasBody}
                                <tr class="bg-gray font-bold">
                                    <td colspan="2" class="border border-black text-right pr-2">คะแนนที่ได้</td>
                                    ${maasScoreRow}
                                </tr>
                                <tr>
                                    <td colspan="2" class="border border-black text-right pr-2 font-bold">พยาบาลผู้ประเมิน</td>
                                    ${maasAssessorRow}
                                </tr>
                            </tbody>
                        </table>

                        <div class="mt-2 border-t border-dashed border-gray-400 pt-2">
                            <div class="font-bold text-[10px] mb-1 text-center">แนวปฏิบัติการป้องกันการพลัดตกหกล้ม</div>
                            <table class="w-full text-[8px] border-collapse mb-2">
                                <thead>
                                    <tr class="bg-gray">
                                        <th class="border border-black p-1 w-1/3">No Risk 0-24</th>
                                        <th class="border border-black p-1 w-1/3">Low Risk 25-50</th>
                                        <th class="border border-black p-1 w-1/3">High Risk ≥ 51</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td class="border border-black p-1 align-top">
                                            1. จัดเตียงให้เหมาะสมกับสภาพผู้ป่วย<br>
                                            2. ประเมินความสามารถในการช่วยเหลือตนเอง<br>
                                            3. ให้ข้อมูลผู้ป่วย/ญาติป้องกันการพลัดตกหกล้ม<br>
                                            4. จัดสิ่งแวดล้อมให้ปลอดภัย<br>
                                            5. ให้ญาติเฝ้า<br>
                                            6. ยกเหล็กกั้นเตียง<br>
                                            7. ตรวจเยี่ยมเวรละ 1 ครั้ง
                                        </td>
                                        <td class="border border-black p-1 align-top">
                                            1. จัดเตียงให้เหมาะสมกับสภาพผู้ป่วย<br>
                                            2. ประเมินความสามารถในการช่วยเหลือตนเอง<br>
                                            3. ให้ข้อมูลผู้ป่วย/ญาติป้องกันการพลัดตกหกล้ม<br>
                                            4. จัดสิ่งแวดล้อมให้ปลอดภัย<br>
                                            5. ให้ญาติเฝ้า<br>
                                            6. ยกเหล็กกั้นเตียง<br>
                                            7. ตรวจเยี่ยมผู้ป่วยทุก 4 ชั่วโมง<br>
                                            8. ติดสัญลักษณ์ความเสี่ยงการพลัดตกหกล้ม
                                        </td>
                                        <td class="border border-black p-1 align-top">
                                            1. จัดเตียงให้เหมาะสมกับสภาพผู้ป่วย<br>
                                            2. ประเมินความสามารถในการช่วยเหลือตนเอง<br>
                                            3. ให้ข้อมูลผู้ป่วย/ญาติป้องกันการพลัดตกหกล้ม<br>
                                            4. จัดสิ่งแวดล้อมให้ปลอดภัย<br>
                                            5. ให้ญาติเฝ้า / 6. ยกเหล็กกั้นเตียง<br>
                                            7. ตรวจเยี่ยมผู้ป่วยทุก 2 ชม.<br>
                                            8. ติดสัญลักษณ์ความเสี่ยงการพลัดตกหกล้ม<br>
                                            9. ผูกมัดตามสภาพ<br>
                                            10. ส่งเวรเกี่ยวกับอากาผู้ป่วย / 11. ปรึกษาสหวิชาชีพ
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="avoid-break maas-guide-box">
                                <div class="font-bold text-[10px] mb-1 text-center">แนวปฏิบัติการป้องกันการดึงอุปกรณ์ (MAAS)</div>
                                <table class="w-full text-[8px] border-collapse maas-guide-table">
                                    <thead>
                                        <tr class="bg-gray">
                                            <th class="border border-black p-1 w-[60px]">คะแนน</th>
                                            <th class="border border-black p-1 text-left">รายการปฏิบัติ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="border border-black text-center font-bold">0-3</td>
                                            <td class="border border-black p-1">ไม่ต้องผูกมัด</td>
                                        </tr>
                                        <tr>
                                            <td class="border border-black text-center font-bold">4-6</td>
                                            <td class="border border-black p-1 font-bold maas-guide-single-line">ต้องผูกมัดผู้ป่วยและเฝ้าระวังอย่างใกล้ชิด ***ก่อนผูกมัดต้องแจ้งญาติทราบก่อนทุกครั้ง*** ***กรณีไม่มีญาติผูกมัดได้เลย***</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            let iframe = document.getElementById('print-frame');
            if (iframe) iframe.remove();
            iframe = document.createElement('iframe');
            iframe.id = 'print-frame';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            const pri = iframe.contentWindow;
            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(s => s.outerHTML).join('');
            const pName = this.escapeHtml(this.selectedPatient?.name || '-');
            const pAge = this.escapeHtml(this.selectedPatient?.ageDisplay || '-');
            const pHn = this.escapeHtml(this.selectedPatient?.hn || '-');
            const pAn = this.escapeHtml(this.selectedPatient?.an || '-');
            const pDoc = this.escapeHtml(this.selectedPatient?.doctor || '-');
            const pWard = this.escapeHtml(this.currentWard || '-');
            const pBed = this.escapeHtml(this.selectedPatient?.bed || '-');

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
                            table {
                                width: 100%;
                                table-layout: fixed;
                                border-collapse: collapse;
                                word-break: break-word;
                            }
                            th, td {
                                border: 1px solid black !important;
                                padding: 2px !important;
                                overflow: hidden;
                            }
                            .w-label { width: 200px; }
                            .w-guide { width: 85px; }
                            .w-shift { width: 24px; }
                            .bg-gray { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                            .text-center { text-align: center; }
                            .avoid-break { break-inside: avoid; page-break-inside: avoid; }
                            .maas-guide-box { margin-top: 2px; }
                            .maas-guide-table { margin-top: 0; }
                            .maas-guide-table td, .maas-guide-table th { font-size: 8px; }
                            .maas-guide-single-line { white-space: nowrap; font-size: 7px; }
                            .print-global-footer {
                                position: fixed; bottom: 0; left: 0; width: 100%; text-align: center;
                                font-size: 9px; color: #475569 !important; border-top: 1px solid #9ca3af;
                                padding-top: 4px; padding-bottom: 4px; background-color: white; z-index: 1000;
                            }
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

                        ${pageMarkup}
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

            // ✅ เพิ่ม isSummaryOnly: true เพื่อสั่งให้ Backend นำข้อมูลไปอัปเดตบรรทัดล่าสุดของ AN นี้
            const payload = { 
                ...this.bradenForm, 
                an: this.selectedPatient?.an || this.selectedPatient?.AN, 
                hn: this.selectedPatient?.hn || this.selectedPatient?.HN, 
                ward: this.currentWard,
                isSummaryOnly: true 
            };

            try {
                const res = await fetch(this.API_URL, { 
                    method: 'POST', 
                    body: JSON.stringify({ action: 'saveBradenScale', payload }) 
                });
                const out = await res.json();
                
                if(out.status === 'success') {
                    this.showSuccess = true; 
                    this.successMsg = 'บันทึกสรุปการเกิดแผลกดทับลงในข้อมูลล่าสุดเรียบร้อย';
                    setTimeout(() => { this.showSuccess = false; }, 3000);
                    
                    // โหลดข้อมูลใหม่เพื่อให้หน้าประวัติอัปเดต
                    if(typeof this.loadBraden === 'function') {
                        this.loadBraden(payload.an);
                    } else if(typeof this.loadBradenHistory === 'function') {
                        this.loadBradenHistory(payload.an);
                    }
                } else {
                    alert('เกิดข้อผิดพลาด: ' + (out.message || 'ไม่สามารถบันทึกได้'));
                }
            } catch(e) { 
                console.error("Save Summary Error:", e);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'); 
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
                
                if (data && Object.keys(data).length > 0) {
                    this.eduForm = { ...base, ...data };
                    
                    // --- เพิ่มการเช็คและแปลง String กลับเป็น Array สำหรับ Checkbox ---
                    const ensureArray = (val) => {
                        if (!val) return [];
                        if (Array.isArray(val)) return val;
                        // ถ้าเป็นข้อความ ให้แยกด้วยลูกน้ำ (,) ตัดช่องว่าง และลบค่าว่างทิ้ง
                        return String(val).split(',').map(item => item.trim()).filter(Boolean);
                    };
        
                    // บังคับให้ options ของทุกข้อเป็น Array เสมอ
                    if(this.eduForm.E1) this.eduForm.E1.options = ensureArray(this.eduForm.E1.options);
                    if(this.eduForm.E2) this.eduForm.E2.options = ensureArray(this.eduForm.E2.options);
                    if(this.eduForm.T1) this.eduForm.T1.options = ensureArray(this.eduForm.T1.options);
                    if(this.eduForm.T2) this.eduForm.T2.options = ensureArray(this.eduForm.T2.options);
                    if(this.eduForm.T3) this.eduForm.T3.options = ensureArray(this.eduForm.T3.options);
                    if(this.eduForm.H1) this.eduForm.H1.options = ensureArray(this.eduForm.H1.options);
                    if(this.eduForm.O2) this.eduForm.O2.options = ensureArray(this.eduForm.O2.options);
                    // ---------------------------------------------------------
                    
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
            
                // ฟังก์ชันช่วยจัดการเครื่องหมายถูก (Checked) ปรับปรุงใหม่
                const getCheck = (id, optionValue = null) => {
                    const d = this.eduForm[id];
                    if (!d) return '☐';
                    
                    // 1. ถ้าส่ง optionValue มา แสดงว่าเป็นข้อที่เป็นตัวเลือกหลายข้อ (Checkbox Group) ที่อยู่ใน options
                    if (optionValue) {
                        // ตรวจสอบว่า d.options มีค่าและเป็น Array หรือไม่
                        if (d.options && Array.isArray(d.options)) {
                            // ใช้ .some() เช็คว่ามีค่า optionValue อยู่ใน Array หรือไม่ (แปลงเป็น String และ trim ป้องกันช่องว่าง)
                            return d.options.some(opt => String(opt).trim() === String(optionValue).trim()) ? '☑' : '☐';
                        } 
                        // ถ้า d.options เป็น String (กรณีข้อมูลถูกบันทึกมาแบบแปลกๆ)
                        else if (typeof d.options === 'string') {
                            return d.options.includes(String(optionValue).trim()) ? '☑' : '☐';
                        }
                        return '☐';
                    }
                    
                    // 2. ถ้าไม่มี optionValue แสดงว่าเป็น Checkbox หลักของหัวข้อนั้นๆ (เช่น D1.checked)
                    // ตรวจสอบค่า d.checked ว่าเป็น true หรือ 'true' (เผื่อถูกแปลงเป็น string)
                    return (d.checked === true || String(d.checked) === 'true') ? '☑' : '☐';
                };
            
                // ชุดข้อมูลสำหรับวนลูปสร้างตาราง (ส่วนนี้คงเดิม)
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
                        ${getCheck('T2', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${this.eduForm?.T2?.text1 || '................'}</span>
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
                    { id: 'O1', rs: 1, topic: '6. O=Out Patient<br>การดูแลต่อเนื่อง', text: (d) => `
                        - การมาตรวจตามนัด วันที่ <span class="dot-line">${d.text1 || '-'}</span> <br>
                        สถานที่ <span class="dot-line">${d.text2 || '-'}</span> <br>
                        การเตรียมตัว <span class="dot-line">${d.text3 || '.............'}</span><br>
                        - แหล่งข้อมูลเครือข่ายหรือแหล่งสนับสนุนทางสังคม:<br>
                        ${['ผู้นำชุมชน', 'อสม.', 'รพ.สต.'].map(opt => `${getCheck('O2', opt)} ${opt}`).join(' ')} 
                        ${getCheck('O2', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${this.eduForm?.O2?.text1 || '-'}</span><br>
                        - การขอความช่วยเหลือ 1669
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
                    const d = this.eduForm[row.id] || {};
                    const dateStr = d.date ? this.formatThaiDateShort(d.date) : '.................';
                    
                    htmlRows += `
                        <tr>
                            ${row.rs > 0 ? `<td rowspan="${row.rs}" style="font-weight:bold; width: 15%; background-color:#f8fafc;">${row.topic}</td>` : ''}
                            <td style="width: 45%;">${row.text(d)}</td>
                            <td style="width: 8%; text-align:center;">${dateStr}</td>
                            <td style="width: 22%; text-align:center; font-size: 8pt;">
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
                            font-size: 9pt; 
                        } 
            
                        .a4-page { 
                            width: 100%; 
                            max-width: 210mm;
                            margin: auto; 
                            padding: 5mm 10mm; 
                            box-sizing: border-box;
                            display: flex;
                            flex-direction: column;
                            min-height: 285mm; 
                        } 
            
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
                            padding: 3px 4px; 
                            font-size: 9pt !important; 
                            vertical-align: top;
                            word-wrap: break-word;
                            line-height: 1.2; 
                        }
                        
                        th { 
                            background-color: #eee !important; 
                            text-align: center;
                            -webkit-print-color-adjust: exact; 
                        } 
                        
                        .fixed-footer-container {
                            position: fixed;
                            bottom: 5mm; 
                            left: 10mm;
                            right: 10mm;
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                        }
            
                        .patient-box-container {
                            display: flex;
                            justify-content: flex-end;
                            width: 100%;
                        }
                                    
                        .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
            
                        .print-footer { 
                            width: 100%; 
                            text-align: center;
                            font-size: 8pt !important; 
                            color: #444; 
                            border-top: 1px solid #ccc; 
                            padding-top: 8px; 
                            margin-top: auto; 
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
                                    <div><b>HN:</b> ${this.selectedPatient?.hn || '-'} &nbsp; <b>AN:</b> ${this.selectedPatient?.an || '-'} </div>                
                                    <div><b>แพทย์:</b> ${this.selectedPatient?.doctor || '-'}<b>&nbsp;ตึก:</b> ${this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${this.selectedPatient?.bed || '-'}</div>
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
                            <div>FR-IPD-005 หน้า ${pageIndex + 1}/${totalPages}</div>
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
                // จัดการกรณีเวลาเป็นค่าว่างให้เป็น 00:00 เพื่อไม่ให้ Date Error
                const timeA = a.time || '00:00';
                const timeB = b.time || '00:00';
                
                const dateTimeA = new Date(`${a.date}T${timeA}`).getTime();
                const dateTimeB = new Date(`${b.date}T${timeB}`).getTime();
                
                // หากวันที่และเวลา Actual Time เท่ากันเป๊ะ
                if (dateTimeA === dateTimeB) {
                    // ให้เรียงตาม ID (เวลาที่กดบันทึก) จากเก่าไปใหม่ (ค่าน้อยไปค่ามาก)
                    return Number(a.id) - Number(b.id);
                }
                
                // เรียงตามวันที่และเวลา Actual Time (เก่าไปใหม่)
                return dateTimeA - dateTimeB; 
            });
        
            let htmlRows = '';
            
            // 2. ไม่ต้องบังคับ 2 รายการต่อหน้าแล้ว ปล่อยให้มันรันไปเรื่อยๆ
            sortedNotesForPrint.forEach((item, idx) => {
                const dateStr = item.date ? this.formatThaiDateShort(item.date) : '';
                const shiftMatch = item.shift.match(/\(([^)]+)\)/);
                const shiftTime = shiftMatch ? shiftMatch[1] : item.shift;
                
                let soiHtml = '';
                if(item.s) soiHtml += `<b>S:</b> ${item.s.replace(/\n/g, '<br>')}<br>`;
                if(item.o) soiHtml += `<b>O:</b> ${item.o.replace(/\n/g, '<br>')}<br>`;
                if(item.i) soiHtml += `<b>I:</b> ${item.i.replace(/\n/g, '<br>')}<br>`;
                
                let eHtml = '';
                if(item.e) eHtml += `<b>E:</b> ${item.e.replace(/\n/g, '<br>')}<br>`;
                
                // เส้นขีดคั่นระหว่างปัญหา (ใช้ตลอดทุกรายการเพื่อความชัดเจน)
                const borderBottom = 'border-bottom: 2px solid #000 !important;';
        
                htmlRows += `
                    <tr style="page-break-inside: avoid;">
                        <td rowspan="2" style="text-align:center; ${borderBottom}">${dateStr}<br>${shiftTime}</td>
                        <td style="text-align:center; border-bottom: 0 !important; padding-bottom: 2px;">${item.time || ''}</td>
                        <td rowspan="2" style="font-weight:bold; ${borderBottom}">${item.focus ? item.focus.replace(/\n/g, '<br>') : '-'}</td>
                        <td style="border-bottom: 0 !important; padding-bottom: 2px;">
                            ${soiHtml}
                        </td>
                    </tr>
                    <tr style="page-break-inside: avoid;">
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
        
            // 3. สร้าง HTML แบบชิ้นเดียว
            const htmlPage = `
                <div class="print-container">
                    <table>
                        <colgroup>
                            <col style="width: 15%;">
                            <col style="width: 8%;">
                            <col style="width: 22%;">
                            <col style="width: 55%;">
                        </colgroup>
                        <thead>
                            <tr>
                                <th colspan="4" style="border: none; padding: 0 0 15px 0;">
                                    <div class="print-header-top-right">
                                        <div>Echart-ipd-nurse</div>
                                        <div>FR-IPD-006</div>
                                    </div>
                                    <div class="main-title">
                                        <div>โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน</div>
                                        <div>ใบบันทึกความก้าวหน้าทางการพยาบาล (Nursing Progress Note)</div>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th>DATE /<br> SHIFT</th>
                                <th>Actual Time</th>
                                <th>FOCUS / PROBLEM</th>
                                <th>Nursing Progress Note</th>
                            </tr>
                        </thead>
                        
                        <tbody>${htmlRows}</tbody>
                        
                        <tfoot>
                            <tr>
                                <td colspan="4" style="border: none; padding: 15px 0 0 0;">
                                    <div style="height: 60px;"></div>
                                </td>
                            </tr>
                        </tfoot>
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
        
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <html>
            <head>
                <title>Print Nursing Progress Note</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                    
                    body { 
                        font-family: 'Sarabun', sans-serif; 
                        font-size: 11pt; 
                        margin: 0; 
                        padding: 0; 
                        color: #000; 
                        background: #fff; 
                    }
                    
                    .print-container { 
                        width: 100%; 
                        max-width: 210mm; /* ความกว้างกระดาษ A4 */
                        margin: 0 auto; 
                        padding: 10mm; 
                        box-sizing: border-box; 
                        position: relative;
                    }
                    
                    .print-header-top-right { text-align: right; font-size: 8pt; font-weight: bold; line-height: 1.2; position: absolute; right: 10mm; top: 10mm; }
                    .main-title { text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 5px; line-height: 1.4; }
                    
                    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                    th, td { border: 1px solid #000; padding: 8px; font-size: 10pt !important; vertical-align: top; word-wrap: break-word; }
                    /* ✅ นำพื้นหลังสีเทาออก ให้เหลือแค่ตรงกลางและตัวหนา */
                    th { text-align: center; font-weight: bold; }
                    
                    /* CSS ป้องกันการตัดหน้ากลางแถว */
                    tr { page-break-inside: avoid; }
                    
                    /* CSS Footer Fixed Container - ถูกตั้งค่าให้ปริ้นต์อยู่ล่างสุดเสมอ */
                    .fixed-footer-container { 
                        position: fixed; 
                        bottom: 5mm; 
                        left: 5mm; 
                        right: 5mm; 
                        display: flex; 
                        flex-direction: column; 
                        gap: 10px; 
                    }
                    
                    .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                    .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
                    .print-footer { width: 100%; text-align: center; font-size: 8pt !important; color: #444; border-top: 1px solid #ccc; padding-top: 8px; margin-top: auto; }
        
                    @media print {
                        @page { size: A4; margin: 8mm; } /* ปรับ Margin ของกระดาษ A4 */
                        body { -webkit-print-color-adjust: exact; }
                        .print-container { padding: 0; }
                        /* ซ่อนส่วนบนขวาที่ซ้ำซ้อน ถ้าระบบพรินต์ใส่ Header มาให้แล้ว */
                        .print-header-top-right { position: static; text-align: right; margin-bottom: 10px; }
                    }
                </style>
            </head>
            <body>
                ${htmlPage}
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
        // ==========================================
        // ฟังก์ชัน พิมพ์เอกสารรวมหลายฟอร์ม
        // ==========================================
        async printCombinedDocuments() {
            if (!this.selectedPatient) return;
            if (this.selectedPrintForms.length === 0) {
                this.dialog = { show: true, type: 'alert', title: 'แจ้งเตือน', msg: 'กรุณาเลือกเอกสารอย่างน้อย 1 รายการเพื่อพิมพ์' };
                return;
            }

            this.isLoading = true;
            this.showPrintDropdown = false; // ปิดกล่องเมนู
            let combinedHtml = '';

            try {
                // 1. สั่งโหลดข้อมูลเบื้องหลังเตรียมไว้ (เฉพาะฟอร์มที่ถูกติ๊กเลือก)
                if (this.selectedPrintForms.includes('assess_initial')) await this.loadAssessmentData(this.selectedPatient.an);
                if (this.selectedPrintForms.includes('patient_class')) await this.loadClassifications(this.selectedPatient.an);
                if (this.selectedPrintForms.includes('fall_risk')) await this.loadFallRisk(this.selectedPatient.an);
                if (this.selectedPrintForms.includes('braden_scale')) await this.loadBraden(this.selectedPatient.an);
                if (this.selectedPrintForms.includes('patient_edu')) await this.loadPatientEdu(this.selectedPatient.an);
                if (this.selectedPrintForms.includes('focus_list')) {
                    const resF = await fetch(`${this.API_URL}?action=getFocusList&an=${this.selectedPatient.an}`);
                    this.focusList = await resF.json() || [];
                }
                if (this.selectedPrintForms.includes('progress_note')) {
                    const resN = await fetch(`${this.API_URL}?action=getNursingNotes&an=${this.selectedPatient.an}`);
                    let notes = await resN.json() || [];
                    this.progressNotes = notes.sort((a, b) => Number(b.id) - Number(a.id));
                }
                if (this.selectedPrintForms.includes('discharge_record')) {
                    const resD = await fetch(`${this.API_URL}?action=getDischargeRecord&an=${this.selectedPatient.an}`);
                    const data = await resD.json();
                    this.dischargeForm = (data && Object.keys(data).length > 0) ? data : this.defaultDischargeForm();
                }

                // 2. เทคนิค Intercept: สกัดเอาเฉพาะเนื้อหา HTML จากฟังก์ชันพิมพ์ย่อยมารวมกัน
                const originalOpen = window.open;
                let interceptedHtml = '';
                
                window.open = function() {
                    return {
                        document: {
                            write: function(htmlStr) {
                                const bodyMatch = htmlStr.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                                if (bodyMatch && bodyMatch[1]) {
                                    let cleanHtml = bodyMatch[1].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                                    interceptedHtml += cleanHtml;
                                }
                            },
                            close: function() {}
                        }
                    };
                };

                // 3. รันฟังก์ชันพิมพ์เรียงตามลำดับฟอร์มมาตรฐาน
                for (let i = 0; i < this.activeForms.length; i++) {
                    const formId = this.activeForms[i].id;
                    if (this.selectedPrintForms.includes(formId)) {
                        
                        if (formId === 'assess_initial') this.printAssessment();
                        else if (formId === 'patient_class') this.printClassification();
                        else if (formId === 'fall_risk') this.printFallRisk();
                        else if (formId === 'braden_scale') this.printBraden();
                        else if (formId === 'patient_edu') this.printPatientEdu();
                        else if (formId === 'focus_list') this.printFocusList();
                        else if (formId === 'progress_note') this.printProgressNote();
                        else if (formId === 'discharge_record') this.printDischargeRecord();
                        
                        combinedHtml += interceptedHtml; // เอาหน้ากระดาษมาต่อกัน
                        interceptedHtml = ''; 
                    }
                }

                // 4. คืนค่าการทำงานของ window ให้เป็นปกติ
                window.open = originalOpen;

                if (!combinedHtml.trim()) {
                    this.dialog = { show: true, type: 'alert', title: 'ไม่พบข้อมูล', msg: 'ไม่พบข้อมูลในเอกสารที่เลือกสำหรับพิมพ์' };
                    return;
                }

                // 5. สร้างหน้าต่าง Print รวม
                const finalPrintWindow = window.open('', '_blank');
                
                // ===== ดักจับเบราว์เซอร์บล็อค Pop-up =====
                if (!finalPrintWindow || finalPrintWindow === null) {
                    this.dialog = { 
                        show: true, 
                        type: 'alert', 
                        title: 'หน้าต่างถูกบล็อค', 
                        msg: 'เบราว์เซอร์บล็อคหน้าต่างเอกสาร! กรุณาคลิก "อนุญาตป๊อปอัป (Pop-ups allowed)" ที่มุมขวาบนของช่อง URL (รูปกากบาทสีแดง) แล้วกดพิมพ์ใหม่อีกครั้ง' 
                    };
                    return; // <--- ใส่ return ตรงนี้สำคัญมาก เพื่อหยุดไม่ให้มันทำงานโค้ดด้านล่างต่อ
                }
                // =======================================

                const docTitle = `EChartIPD_${this.selectedPatient.an}`;
                
                finalPrintWindow.document.write(`
                <html>
                <head>
                    <title>${docTitle}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                        body { font-family: 'Sarabun', sans-serif; font-size: 11pt; margin: 0; padding: 0; color: #000; background: #525659; }
                        
                        .a4-page { 
                            width: 210mm; height: 296mm; margin: 10mm auto; 
                            padding: 15mm 12mm 45mm 12mm; position: relative; box-sizing: border-box; 
                            background: #fff; page-break-after: always; overflow: hidden;
                        }
                        .print-header-top-right { position: absolute; top: 10mm; right: 10mm; text-align: right; font-size: 8pt; font-weight: bold; line-height: 1.2; }
                        .main-title { text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 15px; line-height: 1.4; }
                        
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                        th, td { border: 1px solid #000; padding: 8px; font-size: 11pt !important; vertical-align: top; word-wrap: break-word; }
                        th { background-color: #eee !important; text-align: center; font-weight: bold; -webkit-print-color-adjust: exact; }
                        
                        .fixed-footer-container { position: absolute; bottom: 5mm; left: 10mm; right: 10mm; display: flex; flex-direction: column; gap: 10px; }
                        .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                        .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 8pt !important; background: #fff; }
                        .print-footer { width: 100%; text-align: center; font-size: 8pt !important; color: #444; border-top: 1px solid #ccc; padding-top: 8px; margin-top: auto; }
                        
                        .content-section { font-size: 11pt; line-height: 1.5; margin-bottom: 8px; }
                        .indent { padding-left: 20px; }
                        .dot-line { border-bottom: 1px dotted #000; display: inline-block; min-width: 40px; }
                        .vs-box { display: flex; justify-content: space-around; font-weight: bold; margin: 5px 0 10px 0; }
                        .edu-box { border: 1px solid #000; padding: 10px; margin-top: 5px; margin-bottom: 10px; }
                        .edu-title { text-align: center; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px; }

                        @media print {
                            @page { size: A4; margin: 0; }
                            body { background: #fff; -webkit-print-color-adjust: exact; }
                            .a4-page { margin: 0; box-shadow: none; border: none; }
                            .a4-page:last-child { page-break-after: auto; }
                        }
                    </style>
                </head>
                <body>
                    ${combinedHtml}
                    <script>
                        document.title = "${docTitle}";
                        window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 800); }
                    </script>
                </body>
                </html>
                `);
                finalPrintWindow.document.close();

            } catch (error) {
                console.error("Combined Print Error:", error);
                this.dialog = { show: true, type: 'alert', title: 'เกิดข้อผิดพลาด', msg: 'ระบบขัดข้องขณะรวมเอกสาร กรุณาลองใหม่อีกครั้ง' };
            } finally {
                this.isLoading = false;
            }
        },
        async executeDischargePatient() {
            if (!this.selectedPatient) return;

            this.isLoading = true;
            try {
                // ลบ headers ออกเพื่อแก้ปัญหา CORS
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'dischargePatient',
                        an: this.selectedPatient.an
                    })
                });
                
                const res = await response.json();

                if (res.status === 'success') {
                    // 1. ปิด Popup ยืนยันการจำหน่าย
                    this.showDischargeConfirm = false; 
                    
                    // 2. เคลียร์ผู้ป่วยที่เลือกไว้ เพื่อให้หน้าเว็บริเซ็ตออกจากหน้ารายละเอียด
                    this.selectedPatient = null;
                    
                    // 3. บังคับเปลี่ยนโหมดการแสดงผลกลับไปเป็นหน้ารายการ (ตารางรายชื่อ)
                    this.viewMode = 'list'; 
                    
                    // 4. โหลดข้อมูลตารางผู้ป่วยใหม่จาก Backend
                    // **หมายเหตุ: หากฟังก์ชันดึงข้อมูลของคุณไม่ได้ชื่อ fetchPatients() ให้เปลี่ยนชื่อตรงนี้ให้ตรงกับของคุณ เช่น loadPatients() หรือ getPatients()**
                    if (typeof this.fetchPatients === 'function') {
                        await this.fetchPatients(); 
                    } else if (typeof this.loadPatients === 'function') {
                        await this.loadPatients();
                    } else if (typeof this.getPatients === 'function') {
                        await this.getPatients();
                    }
                    
                    // 5. แสดงข้อความแจ้งเตือนว่าสำเร็จ
                    this.dialog = { show: true, type: 'alert', title: 'สำเร็จ', msg: 'จำหน่ายผู้ป่วยเรียบร้อยแล้ว' };
                } else {
                    this.dialog = { show: true, type: 'alert', title: 'ข้อผิดพลาดจากระบบ', msg: res.message };
                }
            } catch (error) {
                console.error("Discharge Error:", error);
                this.dialog = { show: true, type: 'alert', title: 'เกิดข้อผิดพลาด', msg: 'ไม่สามารถติดต่อเซิร์ฟเวอร์เพื่อจำหน่ายผู้ป่วยได้ (CORS / Network Error)' };
            } finally {
                this.isLoading = false;
            }
        },
        async fetchDischargedPatients() {
            this.isLoading = true;
            this.dischargedPatients = [];
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'searchDischargedPatients',
                        payload: { 
                            ward: this.currentWard,
                            searchType: this.searchHistoryType,
                            searchDate: this.searchHistoryDate,
                            searchMonth: this.searchHistoryMonth
                        }
                    })
                });
                const res = await response.json();
                if (res.status === 'success') {
                    // ปรับแต่งข้อมูลให้ตรงกับที่หน้า Detail ต้องการ
                    this.dischargedPatients = res.data.map(p => {
                        return {
                            ...p,
                            // บังคับให้เป็นตัวพิมพ์เล็กตามชื่อคอลัมน์ในชีต
                            an: p.an || p.AN,
                            hn: p.hn || p.HN,
                            name: p.name || p.Name,
                            bed: p.bed || p.Bed || 'จำหน่ายแล้ว',
                            dx: p.dx || p.DX || p.diagnosis || p.Diagnosis || '-', 
                            isDischarged: true 
                        };
                    });
                    
                    if (this.dischargedPatients.length === 0) {
                        this.dialog = { show: true, type: 'alert', title: 'ไม่พบข้อมูล', msg: 'ไม่มีผู้ป่วยจำหน่ายในวันที่/เดือนที่เลือก' };
                    }
                }
            } catch (error) {
                console.error("Fetch History Error:", error);
            } finally {
                this.isLoading = false;
            }
        },

        async executeUndoDischarge() {
            if (!this.selectedPatient) return;
            
            // ลบส่วน const isConfirm = confirm(...) ออก
            this.isLoading = true;
            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'undoDischargePatient',
                        an: this.selectedPatient.an || this.selectedPatient.AN
                    })
                });
                const res = await response.json();
        
                if (res.status === 'success') {
                    this.showUndoDischargeConfirm = false; // ปิด Modal ยืนยัน
                    this.selectedPatient = null;
                    this.viewMode = 'list'; 
                    
                    if (typeof this.fetchPatients === 'function') await this.fetchPatients(); 
                    else if (typeof this.loadPatients === 'function') await this.loadPatients();
        
                    this.dialog = { show: true, type: 'alert', title: 'สำเร็จ', msg: 'ยกเลิกจำหน่ายผู้ป่วยเรียบร้อย นำชื่อกลับเข้าทะเบียนแล้ว' };
                } else {
                    this.dialog = { show: true, type: 'alert', title: 'เกิดข้อผิดพลาด', msg: res.message };
                }
            } catch (error) {
                console.error("Undo Discharge Error:", error);
            } finally {
                this.isLoading = false;
            }
        },
        
        printPedAssessment() {
            if (!this.savedAssessmentPed) {
                this.dialog = { show: true, type: 'alert', title: 'แจ้งเตือน', msg: 'กรุณาบันทึกข้อมูลแบบประเมินอย่างน้อย 1 ครั้งก่อนสั่งพิมพ์' };
                return;
            }

            const p = this.selectedPatient;
            const d = this.savedAssessmentPed;

            // ตัวช่วยดึงข้อมูล (ถ้าไม่มีข้อมูล จะคืนค่าเป็นช่องว่าง ไม่ใส่จุดไข่ปลาแล้ว)
            const v = (field, defaultText = '') => (d[field] ? d[field] : defaultText);

            // ตัวช่วยสำหรับ Checkbox/Radio (แสดงไอคอน ☑ หรือ ☐)
            const ck = (field, val) => {
                if (!d[field]) return '☐';
                let isChecked = false;
                if (Array.isArray(d[field])) isChecked = d[field].includes(val);
                else if (typeof d[field] === 'string') isChecked = d[field].split(',').map(s=>s.trim()).includes(val);
                else isChecked = (d[field] === val);
                return isChecked ? '☑' : '☐';
            };

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
            <html>
            <head>
                <title>แบบประเมินสภาพผู้ป่วยเด็กแรกรับ (FR-PED-001)</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700;900&display=swap');
                    body { font-family: 'Sarabun', sans-serif; margin: 0; padding: 0; color: #000; background: #525659; }
                    .a4-page { 
                        width: 210mm; height: 296mm; margin: 10mm auto; 
                        padding: 15mm 12mm 45mm 12mm; position: relative; box-sizing: border-box; 
                        background: #fff; page-break-after: always; overflow: hidden;
                    }
                    .print-header-top-right { position: absolute; top: 10mm; right: 10mm; text-align: right; font-size: 8pt; font-weight: bold; line-height: 1.2; }
                    .main-title { text-align: center; font-weight: 900; font-size: 15pt; margin-top: 5mm; margin-bottom: 5mm; }
                    
                    /* ปรับขนาดตัวอักษรลง และเพิ่มระยะบรรทัดตามที่ขอ */
                    .content-section { font-size: 10pt; line-height: 1.6; margin-bottom: 6px; }
                    .indent { padding-left: 20px; }
                    
                    /* เส้นประสำหรับกรอกข้อมูล ถ้าไม่มีข้อมูลจะเว้นว่างไว้บนเส้นประ */
                    .dot-line { border-bottom: 1px dotted #000; display: inline-block; min-width: 30px; min-height: 1em; }
                    
                    /* ตารางสำหรับข้อ 12 */
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10.5pt; }
                    th, td { border: 1px solid #000; padding: 4px; text-align: left; }
                    th { text-align: center; font-weight: bold; }
                    .tc { text-align: center; }

                    /* CSS Footer Fixed Container (กรอบคนไข้และส่วนท้าย) */
                    .fixed-footer-container { position: absolute; bottom: 5mm; left: 10mm; right: 10mm; display: flex; flex-direction: column; gap: 8px; }
                    .patient-box-container { display: flex; justify-content: flex-end; width: 100%; }
                    .print-patient-box { width: max-content; border: 1px solid #000; border-radius: 4px; padding: 6px 12px; font-size: 9pt !important; background: #fff; }
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
                        <div>FR-PED-001</div>
                    </div>

                    <div class="main-title">แบบประเมินสภาพผู้ป่วยเด็กแรกรับ</div>

                    <div class="content-section">
                        <b>1. วันที่รับผู้ป่วย:</b> <span class="dot-line">${v('ped_AdmitDate')}</span> 
                        <b>เวลา:</b> <span class="dot-line">${v('ped_AdmitTime')}</span> น. 
                        <b>รับผู้ป่วยจาก:</b> <span class="dot-line" style="min-width:100px;">${v('ped_AdmittedFrom')}</span> 
                        <b>รับ Refer จาก:</b> <span class="dot-line" style="min-width:100px;">${v('ped_Refer')}</span>
                    </div>

                    <div class="content-section">
                        <b>2. มาถึงหอผู้ป่วยโดย:</b> 
                        ${ck('ped_ArriveBy', 'เดิน')} เดิน &nbsp;
                        ${ck('ped_ArriveBy', 'รถนั่ง')} รถนั่ง &nbsp;
                        ${ck('ped_ArriveBy', 'เปลนอน')} เปลนอน &nbsp;
                        ${ck('ped_ArriveBy', 'อุ้ม')} อุ้ม &nbsp;&nbsp;&nbsp;
                        <b>ผู้นำส่งโรงพยาบาล:</b> <span class="dot-line" style="min-width:150px;">${v('ped_DeliverBy')}</span>
                    </div>

                    <div class="content-section">
                        <b>3. ผู้ให้ข้อมูล:</b> 
                        ${ck('ped_Informant', 'ผู้ป่วย')} ผู้ป่วย &nbsp;
                        ${ck('ped_Informant', 'ญาติ')} ญาติ &nbsp;
                        ${ck('ped_Informant', 'ผู้นำส่ง')} ผู้นำส่ง &nbsp;
                        ${ck('ped_Informant', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${v('ped_InformantOther')}</span>
                    </div>

                    <div class="content-section"><b>4. อาการสำคัญ:</b> <span class="dot-line" style="width: 80%;">${v('ped_CC')}</span></div>
                    <div class="content-section"><b>5. ประวัติการเจ็บป่วยปัจจุบัน:</b> <span class="dot-line" style="width: 70%;">${v('ped_PI')}</span></div>
                    <div class="content-section indent"><b>สภาพผู้ป่วยแรกรับ:</b> <span class="dot-line" style="width: 70%;">${v('ped_InitialState')}</span></div>
                    <div class="content-section indent">
                        <b>สัญญาณชีพแรกรับ:</b> 
                        BT <span class="dot-line text-center">${v('ped_BT')}</span> °C &nbsp;
                        PR <span class="dot-line text-center">${v('ped_PR')}</span> /min &nbsp;
                        RR <span class="dot-line text-center">${v('ped_RR')}</span> /min &nbsp;
                        BP <span class="dot-line text-center">${v('ped_BP')}</span> mmHg &nbsp;
                        O2sat <span class="dot-line text-center">${v('ped_O2sat')}</span> %
                    </div>

                    <div class="content-section" style="margin-top: 10px;"><b>6. การตรวจร่างกาย</b></div>
                    <div class="content-section indent">
                        <b>6.1 ระดับความรู้สึกตัว:</b> 
                        ${ck('ped_Consciousness', 'ดี')} ดี &nbsp;
                        ${ck('ped_Consciousness', 'สับสน')} สับสน &nbsp;
                        ${ck('ped_Consciousness', 'ซึม')} ซึม &nbsp;
                        ${ck('ped_Consciousness', 'ไม่รู้สึกตัว')} ไม่รู้สึกตัว<br>
                        
                        <b>6.2 การหายใจ:</b> 
                        ${ck('ped_Breathing', 'ปกติ')} ปกติ &nbsp;
                        ${ck('ped_Breathing', 'หอบ')} หอบ &nbsp;
                        ${ck('ped_Breathing', 'จมูกบาน')} จมูกบาน &nbsp;
                        ${ck('ped_Breathing', 'อกบุ๋ม')} อกบุ๋ม &nbsp;
                        ${ck('ped_Breathing', 'หายใจลำบาก')} หายใจลำบาก &nbsp;
                        ${ck('ped_Breathing', 'ไม่หายใจ')} ไม่หายใจ &nbsp;
                        ${ck('ped_Breathing', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_BreathingOther')}</span><br>

                        <b>6.3 การไหลเวียนโลหิต:</b><br>
                        <span class="indent">- สีผิว:</span> 
                        ${ck('ped_SkinColor', 'ปกติ')} ปกติ &nbsp;
                        ${ck('ped_SkinColor', 'ซีด')} ซีด &nbsp;
                        ${ck('ped_SkinColor', 'ปลายมือปลายเท้าเขียว')} ปลายมือเท้าเขียว &nbsp;
                        ${ck('ped_SkinColor', 'รอบปากเขียว')} รอบปากเขียว &nbsp;
                        ${ck('ped_SkinColor', 'เขียวทั้งตัว')} เขียวทั้งตัว &nbsp;
                        ${ck('ped_SkinColor', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_SkinColorOther')}</span><br>
                        <span class="indent">- อาการบวม:</span> 
                        ${ck('ped_Edema', 'ไม่มี')} ไม่มี &nbsp;
                        ${ck('ped_Edema', 'มี')} มี บริเวณ <span class="dot-line">${v('ped_EdemaWhere')}</span><br>

                        <b>6.4 ผิวหนัง:</b> 
                        ${ck('ped_Skin', 'ปกติ')} ปกติ &nbsp;
                        ${ck('ped_Skin', 'แห้งแตก')} แห้งแตก &nbsp;
                        ${ck('ped_Skin', 'เขียวช้ำ')} เขียวช้ำ &nbsp;
                        ${ck('ped_Skin', 'ผื่นคัน')} ผื่นคัน &nbsp;
                        ${ck('ped_Skin', 'ผื่นแดง')} ผื่นแดง &nbsp;
                        ${ck('ped_Skin', 'เหลือง')} เหลือง<br>

                        <b>6.5 การติดต่อสื่อสาร:</b><br>
                        <span class="indent">- หู:</span> 
                        ${ck('ped_Ear', 'ได้ยิน')} ได้ยิน &nbsp;
                        ${ck('ped_Ear', 'ไม่ได้ยิน')} ไม่ได้ยิน &nbsp;
                        ${ck('ped_Ear', 'ใช้อุปกรณ์ช่วยฟัง')} ใช้อุปกรณ์ช่วยฟัง &nbsp;
                        ${ck('ped_Ear', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_EarOther')}</span><br>
                        <span class="indent">- ตา:</span> 
                        ${ck('ped_Eye', 'เห็น')} เห็น &nbsp;
                        ${ck('ped_Eye', 'ไม่เห็น')} ไม่เห็น &nbsp;
                        ${ck('ped_Eye', 'ตาปลอม')} ตาปลอม &nbsp;
                        ${ck('ped_Eye', 'สวมแว่นตา')} สวมแว่นตา &nbsp;
                        ${ck('ped_Eye', 'สั้น')} สั้น &nbsp;
                        ${ck('ped_Eye', 'เอียง')} เอียง
                    </div>

                    <div class="content-section" style="margin-top: 10px;"><b>7. สภาพจิตใจผู้ป่วยแรกรับ</b></div>
                    <div class="content-section indent">
                        <b>7.1 การแสดงออกทางพฤติกรรม:</b> 
                        ${ck('ped_Behavior', 'กระวนกระวาย')} กระวนกระวาย &nbsp;
                        ${ck('ped_Behavior', 'เฉยๆ')} เฉยๆ &nbsp;
                        ${ck('ped_Behavior', 'ไม่สนใจผู้อื่น')} ไม่สนใจผู้อื่น &nbsp;
                        ${ck('ped_Behavior', 'ถอนหายใจบ่อย')} ถอนหายใจบ่อย<br>
                        <span class="indent"></span>
                        ${ck('ped_Behavior', 'ก้าวร้าว')} ก้าวร้าว &nbsp;
                        ${ck('ped_Behavior', 'ร้องไห้')} ร้องไห้ &nbsp;
                        ${ck('ped_Behavior', 'เอะอะโวยวาย')} เอะอะโวยวาย &nbsp;
                        ${ck('ped_Behavior', 'ไม่ให้ความร่วมมือ')} ไม่ให้ความร่วมมือ &nbsp;
                        ${ck('ped_Behavior', 'ติดหมอน/ผ่าห่ม/ขวดนม/จุกนม')} ติดหมอน/ผ้าห่ม/ขวดนม<br>
                        <span class="indent"></span>
                        ${ck('ped_Behavior', 'นอนเปล')} นอนเปล &nbsp;
                        ${ck('ped_Behavior', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_BehaviorOther')}</span><br>

                        <b>7.2 การแสดงออกทางอารมณ์:</b> 
                        ${ck('ped_Emotion', 'โกรธ')} โกรธ &nbsp;
                        ${ck('ped_Emotion', 'หงุดหงิด')} หงุดหงิด &nbsp;
                        ${ck('ped_Emotion', 'สีหน้ากังวล')} สีหน้ากังวล &nbsp;
                        ${ck('ped_Emotion', 'กลัว')} กลัว &nbsp;
                        ${ck('ped_Emotion', 'ซึม')} ซึม &nbsp;
                        ${ck('ped_Emotion', 'ไม่แสดงอารมณ์')} ไม่แสดงอารมณ์ &nbsp;
                        ${ck('ped_Emotion', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_EmotionOther')}</span><br>

                        <b>7.3 บุคคลที่ต้องการใกล้ชิดมากที่สุด:</b> 
                        ${ck('ped_ClosestPerson', 'บิดา')} บิดา &nbsp;
                        ${ck('ped_ClosestPerson', 'มารดา')} มารดา &nbsp;
                        ${ck('ped_ClosestPerson', 'ญาติ')} ญาติ ระบุ <span class="dot-line">${v('ped_ClosestPersonRelative')}</span> &nbsp;
                        ${ck('ped_ClosestPerson', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_ClosestPersonOther')}</span>
                    </div>

                    <div class="content-section" style="margin-top: 10px;"><b>8. แบบแผนการดำรงชีวิตประจำวัน</b></div>
                    <div class="content-section indent">
                        <b>8.1 การเคลื่อนไหวและพัฒนาการ:</b><br>
                        <span class="indent">- เด็กเล็ก:</span> 
                        ${ck('ped_MoveSmallChild', 'ชันคอ')} ชันคอ &nbsp;
                        ${ck('ped_MoveSmallChild', 'คว่ำ')} คว่ำ &nbsp;
                        ${ck('ped_MoveSmallChild', 'คืบ')} คืบ &nbsp;
                        ${ck('ped_MoveSmallChild', 'คลาน')} คลาน &nbsp;
                        ${ck('ped_MoveSmallChild', 'นั่ง')} นั่ง &nbsp;
                        ${ck('ped_MoveSmallChild', 'ยืน')} ยืน<br>
                        <span class="indent">- เด็กโต:</span> 
                        ${ck('ped_MoveBigChild', 'เดินได้เอง')} เดินได้เอง &nbsp;
                        ${ck('ped_MoveBigChild', 'เดินไม่ได้')} เดินไม่ได้ &nbsp;
                        ${ck('ped_MoveBigChild', 'ใช้อุปกรณ์ช่วย')} ใช้อุปกรณ์ช่วย ระบุ <span class="dot-line">${v('ped_MoveBigChildTool')}</span><br>

                        <b>8.2 การนอนหลับ:</b> 
                        - กลางคืน วันละ <span class="dot-line text-center">${v('ped_SleepNight')}</span> ชั่วโมง &nbsp;&nbsp;&nbsp;
                        - กลางวัน เวลา: 
                        ${ck('ped_SleepDay', 'เช้า')} เช้า &nbsp;
                        ${ck('ped_SleepDay', 'บ่าย')} บ่าย &nbsp;
                        ${ck('ped_SleepDay', 'ไม่นอน')} ไม่นอน<br>

                        <b>8.3 การรับประทานอาหาร:</b> 
                        ${ck('ped_EatType', 'รับประทานอาหารเอง')} รับประทานอาหารเอง &nbsp;
                        ${ck('ped_EatType', 'ป้อน')} ป้อน จำนวน <span class="dot-line text-center">${v('ped_EatFeedCount')}</span> มื้อ/วัน<br>
                        <span class="indent">- ประเภทอาหาร:</span> 
                        ${ck('ped_EatFoodType', 'นมแม่')} นมแม่ &nbsp;
                        ${ck('ped_EatFoodType', 'นมผสม')} นมผสม &nbsp;
                        ${ck('ped_EatFoodType', 'ข้าวต้ม')} ข้าวต้ม &nbsp;
                        ${ck('ped_EatFoodType', 'โจ๊ก')} โจ๊ก &nbsp;
                        ${ck('ped_EatFoodType', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_EatFoodTypeOther')}</span><br>
                        <span class="indent">- ปัญหาในการรับประทานอาหาร:</span> 
                        ${ck('ped_EatProblem', 'ไม่มี')} ไม่มี &nbsp;
                        ${ck('ped_EatProblem', 'มี')} มี (
                            ${ck('ped_EatProblemDetail', 'เคี้ยวลำบาก')} เคี้ยวลำบาก &nbsp;
                            ${ck('ped_EatProblemDetail', 'กลืนลำบาก')} กลืนลำบาก &nbsp;
                            ${ck('ped_EatProblemDetail', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_EatProblemOther')}</span>
                        )<br>
                        <span class="indent">- อาหารที่ชอบ ระบุ:</span> <span class="dot-line" style="min-width: 150px;">${v('ped_EatFavorite')}</span> &nbsp;
                        <span class="indent">- อาหารเฉพาะโรค:</span> 
                        ${ck('ped_EatSpecific', 'ไม่มี')} ไม่มี &nbsp;
                        ${ck('ped_EatSpecific', 'มี')} มี ระบุ <span class="dot-line">${v('ped_EatSpecificDetail')}</span><br>

                        <b>8.4 การขับถ่าย:</b> 
                        ${ck('ped_Excretion', 'ทุกวัน')} ทุกวัน วันละ <span class="dot-line text-center">${v('ped_ExcretionEveryDay')}</span> ครั้ง &nbsp;
                        ${ck('ped_Excretion', 'ไม่ทุกวัน')} ไม่ทุกวัน <span class="dot-line text-center">${v('ped_ExcretionNotEveryDay')}</span> วัน/ครั้ง<br>
                        <span class="indent">- การใช้ยาระบาย:</span> 
                        ${ck('ped_Laxative', 'ใช้')} ใช้ &nbsp;
                        ${ck('ped_Laxative', 'ไม่ใช้')} ไม่ใช้ &nbsp;&nbsp;&nbsp;
                        <span class="indent">- รูเปิดทางหน้าท้อง:</span> 
                        ${ck('ped_Stoma', 'มี')} มี &nbsp;
                        ${ck('ped_Stoma', 'ไม่มี')} ไม่มี<br>
                        <span class="indent">- ปัสสาวะ:</span> 
                        ${ck('ped_Urine', 'ปกติ')} ปกติ &nbsp;
                        ${ck('ped_Urine', 'กลั้นไม่ได้')} กลั้นไม่ได้ &nbsp;
                        ${ck('ped_Urine', 'ใส่สายสวนปัสสาวะ')} ใส่สายสวนปัสสาวะ &nbsp;
                        ${ck('ped_Urine', 'รูเปิดทางหน้าท้อง')} รูเปิดทางหน้าท้อง
                    </div>

                    <div class="fixed-footer-container">
                        <div class="patient-box-container">
                            <div class="print-patient-box">
                                <div><b>ชื่อ-สกุล:</b> ${p?.name || '-'} &nbsp; <b>อายุ:</b> ${p?.ageDisplay || '-'}</div>
                                <div><b>HN:</b> ${p?.hn || '-'} &nbsp; <b>AN:</b> ${p?.an || '-'}</div>                
                                <div><b>แพทย์เจ้าของไข้:</b> ${p?.doctor || '-'} &nbsp; <b>ตึก:</b> ${p?.ward || this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${p?.bed || '-'}</div>
                            </div>
                        </div>
                        <div class="print-footer">
                            เอกสารฉบับนี้พิมพ์จากระบบอิเล็กทรอนิกส์ IPD Nurse Workbench | โปรแกรมบันทึกเวชระเบียนทางการพยาบาล โรงพยาบาลสมเด็จพระยุพราชสว่างแดนดิน
                        </div>
                    </div>
                </div>


                <div class="a4-page">
                    <div class="print-header-top-right">
                        <div>Echart-ipd-nurse</div>
                        <div>FR-PED-001</div>
                    </div>

                    <div style="height: 15mm;"></div>

                    <div class="content-section"><b>9. ประวัติในอดีต</b></div>
                    <div class="content-section indent">
                        <b>9.1 ประวัติการตั้งครรภ์และการคลอด:</b> 
                        บุตรคนที่ <span class="dot-line text-center">${v('ped_PregChildNo')}</span> 
                        จำนวนพี่น้อง <span class="dot-line text-center">${v('ped_PregSiblingCount')}</span> คน 
                        ANC <span class="dot-line text-center">${v('ped_PregANC')}</span> ครั้ง<br>
                        <span class="indent">ผลตรวจโลหิต:</span> 
                        ${ck('ped_PregBlood', 'ปกติ')} ปกติ &nbsp;
                        ${ck('ped_PregBlood', 'ไม่ปกติ')} ไม่ปกติ ระบุ <span class="dot-line">${v('ped_PregBloodAbnormal')}</span><br>
                        
                        <span class="indent">การตั้งครรภ์:</span> 
                        ${ck('ped_Pregnancy', 'ครบกำหนด')} ครบกำหนด &nbsp;
                        ${ck('ped_Pregnancy', 'ไม่ครบกำหนด')} ไม่ครบกำหนด ระบุ <span class="dot-line">${v('ped_PregnancyAbnormal')}</span><br>

                        <span class="indent">การคลอด:</span> 
                        ${ck('ped_Delivery', 'ปกติ')} ปกติ &nbsp;
                        ${ck('ped_Delivery', 'ผิดปกติ')} ผิดปกติ ระบุ <span class="dot-line">${v('ped_DeliveryAbnormal')}</span><br>

                        <span class="indent">สถานที่คลอด:</span> <span class="dot-line" style="min-width: 200px;">${v('ped_DeliveryPlace')}</span> &nbsp;&nbsp;
                        <span>น้ำหนักแรกเกิด:</span> <span class="dot-line text-center">${v('ped_BirthWeight')}</span> กรัม<br>

                        <div style="margin-top:5px;">
                            <b>9.2 ภูมิคุ้มกันโรค:</b> 
                            ${ck('ped_Immunity', 'BCG')} BCG &nbsp;
                            ${ck('ped_Immunity', 'DTP+OPV')} DTP+OPV ครั้งที่ <span class="dot-line text-center">${v('ped_ImmunityDTP')}</span> &nbsp;
                            ${ck('ped_Immunity', 'ญาติจำไม่ได้')} ญาติจำไม่ได้ &nbsp;
                            ${ck('ped_Immunity', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${v('ped_ImmunityOther')}</span>
                        </div>

                        <div style="margin-top:5px;">
                            <b>9.3 การเจ็บป่วย:</b> 
                            ${ck('ped_IllnessHistory', 'ไม่มี')} ไม่มี &nbsp;
                            ${ck('ped_IllnessHistory', 'มี')} มี ระบุ <span class="dot-line">${v('ped_IllnessHistoryDetail')}</span> &nbsp;
                            ${ck('ped_IllnessHistory', 'ญาติจำไม่ได้')} ญาติจำไม่ได้
                        </div>

                        <div style="margin-top:5px;">
                            <b>9.4 การรักษาในโรงพยาบาล:</b> 
                            ${ck('ped_AdmitHistory', 'ไม่เคย')} ไม่เคย &nbsp;
                            ${ck('ped_AdmitHistory', 'เคย')} เคย <span class="dot-line text-center">${v('ped_AdmitHistoryCount')}</span> ครั้ง<br>
                            <span class="indent">- การผ่าตัด:</span> 
                            ${ck('ped_SurgeryHistory', 'ไม่เคย')} ไม่เคย &nbsp;
                            ${ck('ped_SurgeryHistory', 'ญาติจำไม่ได้')} ญาติจำไม่ได้ &nbsp;
                            ${ck('ped_SurgeryHistory', 'เคย')} เคย ระบุ <span class="dot-line">${v('ped_SurgeryHistoryDetail')}</span> เมื่อ <span class="dot-line">${v('ped_SurgeryHistoryWhen')}</span>
                        </div>

                        <div style="margin-top:5px;">
                            <b>9.5 การแพ้ยา หรือสารต่างๆ:</b> 
                            ${ck('ped_Allergy', 'ไม่ทราบ')} ไม่ทราบ &nbsp;
                            ${ck('ped_Allergy', 'ไม่มี')} ไม่มี &nbsp;
                            ${ck('ped_Allergy', 'มี')} มี ระบุ <span class="dot-line" style="min-width: 200px;">${v('ped_AllergyDetail')}</span>
                        </div>
                    </div>

                    <div class="content-section" style="margin-top: 10px;"><b>10. สภาพสังคม เศรษฐกิจ และสภาพแวดล้อม</b></div>
                    <div class="content-section indent">
                        <b>10.1 อารมณ์ทั่วไป:</b> 
                        ${ck('ped_SocialEmotion', 'ร่าเริง')} ร่าเริง &nbsp;
                        ${ck('ped_SocialEmotion', 'เงียบขรึม')} เงียบขรึม &nbsp;
                        ${ck('ped_SocialEmotion', 'ขี้โมโห')} ขี้โมโห &nbsp;
                        ${ck('ped_SocialEmotion', 'ขี้อาย')} ขี้อาย &nbsp;
                        ${ck('ped_SocialEmotion', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_SocialEmotionOther')}</span><br>

                        <b>10.2 การศึกษา:</b> 
                        ${ck('ped_Education', 'ยังไม่ได้ศึกษา')} ยังไม่ได้ศึกษา &nbsp;
                        ${ck('ped_Education', 'อนุบาล')} อนุบาล &nbsp;
                        ${ck('ped_Education', 'ประถมศึกษา')} ประถมศึกษา &nbsp;
                        ${ck('ped_Education', 'มัธยมศึกษา')} มัธยมศึกษา &nbsp;
                        ${ck('ped_Education', 'อื่นๆ')} อื่นๆ <span class="dot-line">${v('ped_EducationOther')}</span><br>

                        <b>10.3 สิ่งแวดล้อม:</b> 
                        ${ck('ped_Environment', 'ใกล้โรงงาน')} ใกล้โรงงาน &nbsp;
                        ${ck('ped_Environment', 'ชุมชนแออัด')} ชุมชนแออัด &nbsp;
                        ${ck('ped_Environment', 'พื้นที่ก่อสร้าง')} พื้นที่ก่อสร้าง &nbsp;
                        ${ck('ped_Environment', 'ใกล้ตลาด')} ใกล้ตลาด &nbsp;
                        ${ck('ped_Environment', 'บุคคลในบ้านสูบบุหรี่')} บุคคลในบ้านสูบบุหรี่<br>
                        <span class="indent"></span>
                        ${ck('ped_Environment', 'สัตว์เลี้ยง')} สัตว์เลี้ยง ระบุ <span class="dot-line">${v('ped_EnvironmentPet')}</span> &nbsp;
                        ${ck('ped_Environment', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${v('ped_EnvironmentOther')}</span><br>

                        <b>10.4 ที่อยู่ของผู้ป่วยในทะเบียนบ้าน:</b> <span class="dot-line" style="width: 70%;">${v('ped_AddressHome')}</span><br>

                        <b>10.5 ที่อยู่ปัจจุบันที่ติดต่อได้ของบิดา มารดา หรือผู้ปกครอง:</b> 
                        ${ck('ped_AddressCurrent', 'ตามที่อยู่ในทะเบียนบ้าน')} ตามที่อยู่ในทะเบียนบ้าน 
                        <span class="dot-line" style="min-width: 200px;">${d.ped_AddressCurrent === 'ตามที่อยู่ในทะเบียนบ้าน' ? v('ped_AddressHome') : ''}</span> &nbsp;
                        ${ck('ped_AddressCurrent', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line" style="min-width: 150px;">${v('ped_AddressCurrentOther')}</span><br>
                        <span class="indent"></span>รายได้บิดา <span class="dot-line text-center">${v('ped_IncomeFather')}</span> บาท/เดือน &nbsp;&nbsp;&nbsp;
                        รายได้มารดา <span class="dot-line text-center">${v('ped_IncomeMother')}</span> บาท/เดือน
                    </div>

                    <div class="content-section" style="margin-top: 10px;">
                        <b>11. คำแนะนำ:</b> 
                        ${ck('ped_AdviceTarget', 'ผู้ป่วย')} ผู้ป่วย &nbsp;
                        ${ck('ped_AdviceTarget', 'ญาติ/บิดา/มารดา')} ญาติ/บิดา/มารดา &nbsp;
                        ${ck('ped_AdviceTarget', 'ไม่ได้ให้คำแนะนำ')} ไม่ได้ให้คำแนะนำ<br>
                        <span class="indent">เรื่อง:</span> 
                        ${ck('ped_AdviceTopics', 'การใช้อุปกรณ์ สถานที่')} การใช้อุปกรณ์ สถานที่ &nbsp;
                        ${ck('ped_AdviceTopics', 'ระเบียบการเยี่ยม')} ระเบียบการเยี่ยม &nbsp;
                        ${ck('ped_AdviceTopics', 'การขอความช่วยเหลือ')} การขอความช่วยเหลือ<br>
                        <span class="indent"></span> 
                        ${ck('ped_AdviceTopics', 'การลงนามยินยอม')} การลงนามยินยอม &nbsp;
                        ${ck('ped_AdviceTopics', 'การเก็บของมีค่า')} การเก็บของมีค่า &nbsp;
                        ${ck('ped_AdviceTopics', 'อื่นๆ')} อื่นๆ ระบุ <span class="dot-line">${v('ped_AdviceTopicsOther')}</span>
                    </div>

                    <div class="content-section" style="margin-top: 10px;"><b>12. ความสามารถในการปฏิบัติ</b></div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 30%;">ชื่อกิจกรรม</th>
                                <th style="width: 15%;">ทำได้ทั้งหมด</th>
                                <th style="width: 15%;">ทำได้บางส่วน</th>
                                <th style="width: 15%;">ทำไม่ได้เลย</th>
                                <th style="width: 25%;">ใช้อุปกรณ์ช่วย ระบุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${['การรับประทานอาหาร', 'การทำความสะอาดปาก/ฟัน', 'การทำความสะอาดร่างกาย', 'การแต่งตัว', 'การขับถ่าย'].map((act, i) => `
                            <tr>
                                <td>${i+1}. ${act}</td>
                                <td class="tc">${ck('ped_Act'+(i+1), 'ทำได้ทั้งหมด')}</td>
                                <td class="tc">${ck('ped_Act'+(i+1), 'ทำได้บางส่วน')}</td>
                                <td class="tc">${ck('ped_Act'+(i+1), 'ทำไม่ได้เลย')}</td>
                                <td>${ck('ped_Act'+(i+1), 'ใช้อุปกรณ์ช่วย')} ${v('ped_Act'+(i+1)+'Tool', '')}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="fixed-footer-container">
                        
                        <div style="text-align: right; margin-bottom: 10px; font-size: 10.5pt; padding-right: 5mm;">
                            พยาบาลผู้ประเมิน <b>${v('ped_AssessorName')}</b> &nbsp; ตำแหน่ง <b>${v('ped_AssessorPosition')}</b>
                        </div>
                        
                        <div class="patient-box-container">
                            <div class="print-patient-box">
                                <div><b>ชื่อ-สกุล:</b> ${p?.name || '-'} &nbsp; <b>อายุ:</b> ${p?.ageDisplay || '-'}</div>
                                <div><b>HN:</b> ${p?.hn || '-'} &nbsp; <b>AN:</b> ${p?.an || '-'}</div>                
                                <div><b>แพทย์เจ้าของไข้:</b> ${p?.doctor || '-'} &nbsp; <b>ตึก:</b> ${p?.ward || this.currentWard || '-'} &nbsp; <b>เตียง:</b> ${p?.bed || '-'}</div>
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
