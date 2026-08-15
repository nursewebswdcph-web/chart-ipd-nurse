/**
 * CANDI AI Assistant - Frontend Logic
 * IPD Nurse Workbench
 */

(function () {
    // Wait for the DOM and Alpine to load
    document.addEventListener('DOMContentLoaded', () => {
        initCandi();
    });

    // Helper to get AlpineJS State
    function getAlpineApp() {
        const appElement = document.querySelector('[x-data="nurseApp()"]') || document.body;
        return window.Alpine ? window.Alpine.$data(appElement) : null;
    }

    /**
     * Get active patient context from Alpine.js state
     * Returns a structured object
     */
    function getPatientContext() {
        const app = getAlpineApp();
        if (!app || !app.selectedPatient) {
            return null;
        }

        const patient = app.selectedPatient;

        // 1. Get active Focus List items
        let focusList = [];
        if (typeof app.getActiveFocusList === 'function') {
            focusList = app.getActiveFocusList();
        } else if (Array.isArray(app.focusList)) {
            focusList = app.focusList.filter(item => 
                item && item.focus && (!item.endDate || String(item.endDate).trim() === '')
            );
        }

        // Format focus list for AI comprehension
        const formattedFocusList = focusList.map(item => ({
            focus: item.focus || '',
            goal: item.goal || '',
            startDate: item.startDate || ''
        }));

        // 2. Get latest Nursing Note (S-O-I-E)
        let noteS = '';
        let noteO = '';
        let noteI = '';
        let noteE = '';
        if (app.progressNotes && app.progressNotes.length > 0) {
            // progressNotes is pre-sorted with latest note at index 0
            const latestNote = app.progressNotes[0];
            noteS = latestNote.s || '';
            noteO = latestNote.o || '';
            noteI = latestNote.i || '';
            noteE = latestNote.e || '';
        }

        return {
            patientName: patient.name || patient.PatientName || '',
            hn: patient.hn || patient.HN || '',
            an: patient.an || patient.AN || '',
            bed: patient.bed || patient.Bed || '',
            focusList: formattedFocusList,
            noteS: noteS,
            noteO: noteO,
            noteI: noteI,
            noteE: noteE
        };
    }

    /**
     * PDPA De-identification Filter
     * Scrubs name, HN, and AN before transmittal
     */
    function deIdentifyContext(context) {
        if (!context) return null;
        const anonymized = { ...context };

        // 1. Mask Patient Name (Keep prefix and first letters, e.g. "นางสมศรี ดีใจ" -> "นาง ส** ด**")
        if (anonymized.patientName) {
            const rawName = String(anonymized.patientName).trim();
            const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'ด.ช.', 'ด.ญ.', 'นพ.', 'พญ.', 'พว.', 'ทพ.', 'ทญ.'];
            let prefix = '';
            let nameWithoutPrefix = rawName;

            for (const p of prefixes) {
                if (rawName.startsWith(p)) {
                    prefix = p;
                    nameWithoutPrefix = rawName.substring(p.length).trim();
                    break;
                }
            }

            const nameParts = nameWithoutPrefix.split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts[1] || '';

            const maskedFirst = firstName ? firstName.charAt(0) + '*'.repeat(Math.max(1, firstName.length - 1)) : '';
            const maskedLast = lastName ? lastName.charAt(0) + '*'.repeat(Math.max(1, lastName.length - 1)) : '';

            anonymized.patientName = `${prefix} ${maskedFirst} ${maskedLast}`.trim() || 'ผู้ป่วย (ปกปิดตาม PDPA)';
        } else {
            anonymized.patientName = 'ผู้ป่วย (ปกปิดตาม PDPA)';
        }

        // 2. Mask HN (Keep first 3 characters, mask the rest)
        if (anonymized.hn) {
            const rawHn = String(anonymized.hn).trim();
            if (rawHn.length > 3) {
                anonymized.hn = rawHn.substring(0, 3) + '*'.repeat(rawHn.length - 3);
            } else {
                anonymized.hn = '***';
            }
        }

        // 3. Mask AN (Keep first 4 characters, mask the rest)
        if (anonymized.an) {
            const rawAn = String(anonymized.an).trim();
            if (rawAn.length > 4) {
                anonymized.an = rawAn.substring(0, 4) + '*'.repeat(rawAn.length - 4);
            } else {
                anonymized.an = '****';
            }
        }

        return anonymized;
    }

    /**
     * Parse SOIE from a plain text block
     */
    function extractSOIE(text) {
        let s = '', o = '', i = '', e = '';
        const lines = text.split('\n');
        let currentSection = null;

        for (let line of lines) {
            const cleanLine = line.trim();
            
            // Check for S: Subjective
            if (/^(?:-|\*)*\s*S\s*[:\-\u2013\u2014]/i.test(cleanLine)) {
                currentSection = 's';
                s += cleanLine.replace(/^(?:-|\*)*\s*S\s*[:\-\u2013\u2014]\s*/i, '') + '\n';
            } 
            // Check for O: Objective
            else if (/^(?:-|\*)*\s*O\s*[:\-\u2013\u2014]/i.test(cleanLine)) {
                currentSection = 'o';
                o += cleanLine.replace(/^(?:-|\*)*\s*O\s*[:\-\u2013\u2014]\s*/i, '') + '\n';
            } 
            // Check for I: Intervention
            else if (/^(?:-|\*)*\s*I\s*[:\-\u2013\u2014]/i.test(cleanLine)) {
                currentSection = 'i';
                i += cleanLine.replace(/^(?:-|\*)*\s*I\s*[:\-\u2013\u2014]\s*/i, '') + '\n';
            } 
            // Check for E: Evaluation
            else if (/^(?:-|\*)*\s*E\s*[:\-\u2013\u2014]/i.test(cleanLine)) {
                currentSection = 'e';
                e += cleanLine.replace(/^(?:-|\*)*\s*E\s*[:\-\u2013\u2014]\s*/i, '') + '\n';
            } 
            // Append to current section
            else if (currentSection) {
                if (currentSection === 's') s += line + '\n';
                else if (currentSection === 'o') o += line + '\n';
                else if (currentSection === 'i') i += line + '\n';
                else if (currentSection === 'e') e += line + '\n';
            }
        }

        return {
            s: s.trim(),
            o: o.trim(),
            i: i.trim(),
            e: e.trim()
        };
    }

    // Global copy to form handler
    window.candiCopyToForm = function (btn) {
        const wrapper = btn.closest('.candi-msg-content-wrapper');
        if (!wrapper) return;

        const textContentEl = wrapper.querySelector('.candi-msg-content');
        if (!textContentEl) return;

        const text = textContentEl.innerText;
        const parsed = extractSOIE(text);

        // Check if there is actual content
        if (!parsed.s && !parsed.o && !parsed.i && !parsed.e) {
            alert('ไม่พบข้อมูลบันทึกในรูปแบบ S-O-I-E จากคำตอบของน้อง CANDI ค่ะ');
            return;
        }

        const app = getAlpineApp();
        if (app && app.pnForm) {
            // Assign to Alpine models
            app.pnForm.s = parsed.s || '';
            app.pnForm.o = parsed.o || '';
            app.pnForm.i = parsed.i || '';
            app.pnForm.e = parsed.e || '';

            // Trigger Alpine success notification if configured
            if (app.showSuccess !== undefined) {
                app.successMsg = 'คัดลอกบันทึก S-O-I-E ลงช่องป้อนการพยาบาลแล้วค่ะ 📝';
                app.showSuccess = true;
                setTimeout(() => { app.showSuccess = false; }, 3000);
            } else {
                alert('คัดลอกบันทึก S-O-I-E ลงช่องป้อนข้อมูลการพยาบาลเรียบร้อยแล้วค่ะ');
            }
        } else {
            alert('ไม่พบแบบฟอร์มบันทึกการพยาบาล (Nursing Note) กรุณาเปิดเมนู ข้อ 7. Nursing Progress Note ก่อนนะคะ');
        }
    };

    /**
     * Initialize DOM elements and event listeners
     */
    function initCandi() {
        const fab = document.getElementById('candi-fab');
        const closeBtn = document.getElementById('candi-close-btn');
        const clearBtn = document.getElementById('candi-clear-btn');
        const chatPanel = document.getElementById('candi-chat-panel');
        const inputForm = document.getElementById('candi-input-form');
        const inputField = document.getElementById('candi-input');
        const messagesContainer = document.getElementById('candi-messages');
        const loadingIndicator = document.getElementById('candi-loading');
        const quickChips = document.querySelectorAll('.candi-chip');

        if (!fab || !chatPanel || !closeBtn || !inputForm || !inputField || !messagesContainer) {
            console.error('CANDI Elements not found in DOM.');
            return;
        }

        // Clear panel / reset conversation
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('คุณต้องการจบการสนทนานี้ และล้างความจำเพื่อเริ่มประเมินผู้ป่วยรายใหม่ใช่หรือไม่คะ?')) {
                    // Reset messagesContainer content to just the welcome message
                    messagesContainer.innerHTML = `
                        <!-- Welcome message from CANDI -->
                        <div class="candi-message-row flex items-start gap-2 max-w-[85%] candi-fade-in">
                            <div class="w-7 h-7 rounded-full bg-white border border-teal-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src="https://lh3.googleusercontent.com/d/1cymwqVSDoNg2zSoyFTCpIvLjePjEAJkL" alt="CANDI" class="w-full h-full object-cover p-0.5 rounded-full">
                            </div>
                            <div class="bg-white text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 leading-relaxed">
                                สวัสดีค่ะ พี่พยาบาล! หนูคือ <span class="text-[#00a896] font-bold">น้อง CANDI</span> AI ประจำตึกผู้ป่วยในค่ะ 🩺
                                <br><br>
                                เมื่อพี่กดเลือกเตียงผู้ป่วยแล้ว พี่สามารถพิมพ์ปรึกษาเกี่ยวกับกรณีนั้น หรือเลือกใช้ปุ่มทางลัดด้านล่างนี้ได้เลยนะคะ 👇
                            </div>
                        </div>
                    `;
                    inputField.value = '';
                    
                    const app = getAlpineApp();
                    if (app && app.showSuccess !== undefined) {
                        app.successMsg = 'ล้างความจำและการสนทนาเรียบร้อยแล้วค่ะ 🧹';
                        app.showSuccess = true;
                        setTimeout(() => { app.showSuccess = false; }, 2500);
                    } else {
                        alert('ล้างความจำและการสนทนาเรียบร้อยแล้วค่ะ');
                    }
                }
            });
        }

        // Toggle panel display
        fab.addEventListener('click', () => {
            chatPanel.classList.toggle('hidden');
            // Allow DOM display rendering before adding active class for transition
            setTimeout(() => {
                chatPanel.classList.toggle('active');
                if (chatPanel.classList.contains('active')) {
                    inputField.focus();
                    scrollToBottom();
                }
            }, 20);
        });

        // Close panel
        closeBtn.addEventListener('click', () => {
            chatPanel.classList.remove('active');
            setTimeout(() => {
                chatPanel.classList.add('hidden');
            }, 300); // match transition speed
        });

        // Quick action chips click handler
        quickChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const question = chip.getAttribute('data-question');
                if (question) {
                    submitQuestion(question);
                }
            });
        });

        // Form submit handler
        inputForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const question = inputField.value.trim();
            if (question) {
                submitQuestion(question);
                inputField.value = '';
            }
        });

        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        /**
         * Render message bubble
         */
        function appendMessage(sender, text) {
            const row = document.createElement('div');
            row.className = `candi-message-row flex items-start gap-2 max-w-[85%] candi-bounce-in ${
                sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`;

            // Avatar
            const avatar = document.createElement('div');
            avatar.className = `w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 border overflow-hidden ${
                sender === 'user' 
                    ? 'bg-slate-200 border-slate-300' 
                    : 'bg-white border-teal-200'
            }`;
            avatar.innerHTML = sender === 'user' ? '🧑‍⚕️' : '<img src="https://lh3.googleusercontent.com/d/1cymwqVSDoNg2zSoyFTCpIvLjePjEAJkL" alt="CANDI" class="w-full h-full object-cover p-0.5 rounded-full">';

            // Bubble wrapper
            const bubbleWrapper = document.createElement('div');
            bubbleWrapper.className = 'candi-msg-content-wrapper flex flex-col items-start';

            // Bubble
            const bubble = document.createElement('div');
            bubble.className = `text-xs font-semibold px-3 py-2.5 shadow-sm leading-relaxed border ${
                sender === 'user'
                    ? 'candi-msg-user border-teal-600 rounded-tr-none'
                    : 'candi-msg-assistant border-slate-100 rounded-tl-none'
            }`;

            // Message text container
            const textSpan = document.createElement('div');
            textSpan.className = 'candi-msg-content';
            textSpan.innerText = text;
            bubble.appendChild(textSpan);
            bubbleWrapper.appendChild(bubble);

            // Add "Copy to Form" button if SOIE pattern matches on assistant bubble
            if (sender === 'assistant') {
                const parsed = extractSOIE(text);
                if (parsed.s || parsed.o || parsed.i || parsed.e) {
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'candi-action-btn';
                    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> คัดลอกลงฟอร์ม Note';
                    copyBtn.setAttribute('onclick', 'candiCopyToForm(this)');
                    bubbleWrapper.appendChild(copyBtn);
                }
            }

            row.appendChild(avatar);
            row.appendChild(bubbleWrapper);
            messagesContainer.appendChild(row);
            scrollToBottom();
        }

        /**
         * Submit user query to GAS backend
         */
        async function submitQuestion(question) {
            const app = getAlpineApp();
            
            // Validate authentication and selection
            if (app && !app.isAuthenticated) {
                appendMessage('assistant', 'กรุณาเข้าสู่ระบบก่อนปรึกษาน้อง CANDI นะคะ');
                return;
            }

            // Extract context
            const rawContext = getPatientContext();
            
            // Check if patient selected
            if (!rawContext) {
                appendMessage('user', question);
                appendMessage('assistant', 'โปรดเลือกเตียงหรือเลือกผู้ป่วยที่แท็บคนไข้ปัจจุบันก่อนปรึกษาข้อมูลคลินิกของเคสนี้ค่ะ');
                return;
            }

            // De-identify context (PDPA compliance)
            const deIdentifiedContext = deIdentifyContext(rawContext);

            // Append user question bubble
            appendMessage('user', question);

            // Show loading animation
            loadingIndicator.classList.remove('hidden');
            scrollToBottom();

            // Resolve GAS Web App URL from Alpine config
            const defaultUrl = 'https://script.google.com/macros/s/AKfycbz09TV4Y0_-4HHd3OuyuYsjzqM8ei_NSXOdxRzhNrQzxX4UN-3XxwB-Z12BOv6bNx-c4w/exec';
            const apiUrl = app ? app.API_URL : defaultUrl;

            try {
                // Post payload. Note: Simple request pattern matches saveFocusList in script.js (no content-type header)
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        question: question,
                        context: deIdentifiedContext
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Hide loading animation
                loadingIndicator.classList.add('hidden');

                if (data.status === 'success' && data.reply) {
                    appendMessage('assistant', data.reply);
                } else {
                    const errorMsg = data.message || 'เกิดข้อผิดพลาดในการประมวลผลคำตอบชั่วคราวค่ะ';
                    const prefix = errorMsg.includes('CANDI กำลังอยู่ในช่วงพัฒนาค่ะ') ? '' : 'CANDI กำลังอยู่ในช่วงพัฒนาค่ะ ';
                    appendMessage('assistant', prefix + errorMsg);
                }

            } catch (error) {
                console.error('CANDI connection error:', error);
                loadingIndicator.classList.add('hidden');
                appendMessage('assistant', 'CANDI กำลังอยู่ในช่วงพัฒนาค่ะ (ไม่สามารถเชื่อมต่อหา น้อง CANDI ได้ชั่วคราว ตรวจพบข้อผิดพลาด: ' + error.message + ')');
            }
        }
    }
})();
