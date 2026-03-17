
        // --- 1. DARK MODE LOGIC ---
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;

        // Kiểm tra localStorage
        const currentTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', currentTheme);
        updateIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            let theme = body.getAttribute('data-theme');
            let newTheme = theme === 'light' ? 'dark' : 'light';
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });

        function updateIcon(theme) {
            themeToggle.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }

        // --- 2. STICKY HEADER ---
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            header.classList.toggle('sticky', window.scrollY > 50);
        });

        // --- 3. MOBILE MENU ---
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Đóng menu khi click link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });

        // --- 4. FLOATING CHATBOT WIDGET ---
        loadFAQForChatbot();
        initFloatingChatbot();

        // Load FAQ data for chatbot
        function loadFAQForChatbot() {
            fetch('data/faq.json')
                .then(res => res.json())
                .then(data => {
                    window.faqDataWidget = data;
                })
                .catch(err => console.log('FAQ không load được:', err));
        }

        function initFloatingChatbot() {
            // Create chatbot HTML
            const chatbotHTML = `
                <div id="chatbotWidget" class="chatbot-widget">
                    <!-- Floating Button -->
                    <button class="chatbot-toggle" id="chatbotToggle" title="Hỗ trợ sinh viên">
                        <i class="fas fa-comments"></i>
                        <span class="chatbot-badge">?</span>
                    </button>

                    <!-- Chat Container -->
                    <div class="chatbot-container" id="chatbotContainer">
                        <div class="chatbot-header">
                            <h3>🤖 Hỗ Trợ Nhanh</h3>
                            <button class="chatbot-close" id="chatbotClose">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="chatbot-messages" id="chatbotMessages">
                            <div class="msg-bot">
                                <div class="msg-bubble">Xin chào! 👋 Bạn cần hỗ trợ gì?</div>
                            </div>
                        </div>

                        <div class="chatbot-suggestions" id="chatbotSuggestions">
                            <button class="suggestion-btn" onclick="selectQuickQuestion('Tra cứu điểm ở đâu?')">
                                📊 Tra cứu điểm
                            </button>
                            <button class="suggestion-btn" onclick="selectQuickQuestion('Học phí bao nhiêu?')">
                                💰 Học phí
                            </button>
                            <button class="suggestion-btn" onclick="selectQuickQuestion('Có học bổng được không?')">
                                🎁 Học bổng
                            </button>
                            <button class="suggestion-btn" onclick="selectQuickQuestion('Hotline hỗ trợ là gì?')">
                                ☎️ Liên hệ
                            </button>
                        </div>

                        <div class="chatbot-input-area">
                            <input 
                                type="text" 
                                class="chatbot-input" 
                                id="chatbotInput" 
                                placeholder="Gõ câu hỏi..."
                            >
                            <button class="chatbot-send" onclick="sendChatbotMessage()">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <style>
                    /* Floating Chatbot Widget */
                    .chatbot-widget {
                        position: fixed;
                        right: 20px;
                        bottom: 20px;
                        z-index: 9999;
                        font-family: 'Segoe UI', sans-serif;
                    }

                    .chatbot-toggle {
                        width: 60px;
                        height: 60px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: white;
                        border: none;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(237, 28, 36, 0.4);
                        font-size: 1.5rem;
                        position: relative;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .chatbot-toggle:hover {
                        transform: scale(1.1);
                        box-shadow: 0 6px 20px rgba(237, 28, 36, 0.5);
                    }

                    .chatbot-toggle.active {
                        display: none;
                    }

                    .chatbot-badge {
                        position: absolute;
                        top: -5px;
                        right: -5px;
                        background: #e74c3c;
                        color: white;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.75rem;
                        font-weight: bold;
                    }

                    .chatbot-container {
                        position: absolute;
                        bottom: 80px;
                        right: 0;
                        width: 380px;
                        height: 550px;
                        background: var(--glass-bg);
                        border-radius: 15px;
                        box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
                        display: flex;
                        flex-direction: column;
                        opacity: 0;
                        transform: scale(0.8) translateY(20px);
                        transition: all 0.3s ease;
                        pointer-events: none;
                        border: 1px solid rgba(0, 84, 165, 0.1);
                    }

                    .chatbot-container.open {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                        pointer-events: all;
                    }

                    .chatbot-header {
                        padding: 15px;
                        border-bottom: 1px solid rgba(0, 84, 165, 0.1);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: white;
                        border-radius: 15px 15px 0 0;
                    }

                    .chatbot-header h3 {
                        margin: 0;
                        font-size: 1rem;
                    }

                    .chatbot-close {
                        background: transparent;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 1.2rem;
                    }

                    .chatbot-messages {
                        flex: 1;
                        overflow-y: auto;
                        padding: 15px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .msg-bot, .msg-user {
                        display: flex;
                        animation: slideIn 0.3s ease;
                    }

                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .msg-user {
                        justify-content: flex-end;
                    }

                    .msg-bubble {
                        max-width: 80%;
                        padding: 10px 14px;
                        border-radius: 10px;
                        font-size: 0.9rem;
                        line-height: 1.4;
                    }

                    .msg-bot .msg-bubble {
                        background: rgba(0, 84, 165, 0.1);
                        color: var(--text-dark);
                        border-bottom-left-radius: 4px;
                    }

                    .msg-user .msg-bubble {
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: white;
                        border-bottom-right-radius: 4px;
                    }

                    .chatbot-suggestions {
                        padding: 10px 15px;
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 8px;
                        border-top: 1px solid rgba(0, 84, 165, 0.1);
                        max-height: 200px;
                        overflow-y: auto;
                    }

                    .chatbot-suggestions.hidden {
                        display: none;
                    }

                    .suggestion-btn {
                        padding: 8px 12px;
                        background: rgba(0, 84, 165, 0.08);
                        border: 1px solid rgba(0, 84, 165, 0.2);
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 0.85rem;
                        color: var(--text-dark);
                        transition: all 0.2s ease;
                    }

                    .suggestion-btn:hover {
                        background: rgba(0, 84, 165, 0.15);
                        border-color: var(--accent);
                    }

                    .chatbot-input-area {
                        padding: 12px;
                        border-top: 1px solid rgba(0, 84, 165, 0.1);
                        display: flex;
                        gap: 8px;
                    }

                    .chatbot-input {
                        flex: 1;
                        padding: 8px 12px;
                        border: 1px solid rgba(0, 84, 165, 0.2);
                        border-radius: 8px;
                        background: rgba(255, 255, 255, 0.5);
                        font-size: 0.85rem;
                        outline: none;
                        color: var(--text-dark);
                    }

                    [data-theme="dark"] .chatbot-input {
                        background: rgba(15, 23, 42, 0.5);
                    }

                    .chatbot-input:focus {
                        border-color: var(--accent);
                        box-shadow: 0 0 5px rgba(237, 28, 36, 0.2);
                    }

                    .chatbot-send {
                        width: 35px;
                        height: 35px;
                        border: none;
                        background: linear-gradient(135deg, var(--primary), var(--accent));
                        color: white;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .chatbot-send:hover {
                        transform: translateY(-2px);
                    }

                    /* Mobile Responsive */
                    @media (max-width: 480px) {
                        .chatbot-widget {
                            right: 10px;
                            bottom: 10px;
                        }

                        .chatbot-toggle {
                            width: 50px;
                            height: 50px;
                            font-size: 1.2rem;
                        }

                        .chatbot-container {
                            width: 95vw;
                            height: 70vh;
                            max-width: 380px;
                            max-height: 550px;
                        }
                    }
                </style>
            `;

            // Inject HTML into body
            document.body.insertAdjacentHTML('beforeend', chatbotHTML);

            // Event Listeners
            const toggle = document.getElementById('chatbotToggle');
            const container = document.getElementById('chatbotContainer');
            const closeBtn = document.getElementById('chatbotClose');
            const input = document.getElementById('chatbotInput');

            toggle.addEventListener('click', () => {
                container.classList.add('open');
                toggle.classList.add('active');
                input.focus();
            });

            closeBtn.addEventListener('click', () => {
                container.classList.remove('open');
                toggle.classList.remove('active');
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendChatbotMessage();
            });
        }

        // Chatbot Message Handler
        window.selectQuickQuestion = function(question) {
            const messages = document.getElementById('chatbotMessages');
            const suggestions = document.getElementById('chatbotSuggestions');
            const input = document.getElementById('chatbotInput');

            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'msg-user';
            userMsg.innerHTML = `<div class="msg-bubble">${question}</div>`;
            messages.appendChild(userMsg);

            // Load FAQ and find answer
            if (window.faqDataWidget) {
                const faq = findSimilarFAQWidget(question);
                if (faq) {
                    setTimeout(() => {
                        const botMsg = document.createElement('div');
                        botMsg.className = 'msg-bot';
                        botMsg.innerHTML = `<div class="msg-bubble">${faq.answer}</div>`;
                        messages.appendChild(botMsg);
                        messages.scrollTop = messages.scrollHeight;
                    }, 300);
                }
            }

            messages.scrollTop = messages.scrollHeight;
            input.value = '';
        };

        window.sendChatbotMessage = function() {
            const input = document.getElementById('chatbotInput');
            const message = input.value.trim();

            if (!message) return;

            const messages = document.getElementById('chatbotMessages');
            const suggestions = document.getElementById('chatbotSuggestions');

            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'msg-user';
            userMsg.innerHTML = `<div class="msg-bubble">${message}</div>`;
            messages.appendChild(userMsg);
            messages.scrollTop = messages.scrollHeight;

            // Hide suggestions after first message
            if (suggestions) suggestions.classList.add('hidden');

            // Load FAQ if not loaded
            if (!window.faqDataWidget) {
                fetch('data/faq.json')
                    .then(r => r.json())
                    .then(data => {
                        window.faqDataWidget = data;
                        processChatbotMessage(message);
                    });
            } else {
                processChatbotMessage(message);
            }

            input.value = '';
        };

        function processChatbotMessage(message) {
            const messages = document.getElementById('chatbotMessages');
            const faq = findSimilarFAQWidget(message);

            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'msg-bot';
                
                if (faq) {
                    botMsg.innerHTML = `<div class="msg-bubble">${faq.answer}</div>`;
                } else {
                    botMsg.innerHTML = `<div class="msg-bubble">Xin lỗi, tôi chưa có câu trả lời cho câu hỏi này. Vui lòng liên hệ:<br>📞 (028) 3816 1673<br>📧 khoa.cntt@huit.edu.vn</div>`;
                }
                
                messages.appendChild(botMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 300);
        }

        function findSimilarFAQWidget(query) {
            if (!window.faqDataWidget) return null;

            const queryLower = query.toLowerCase();
            
            // Exact match
            let matching = window.faqDataWidget.filter(faq =>
                faq.question.toLowerCase().includes(queryLower) ||
                faq.answer.toLowerCase().includes(queryLower)
            );

            if (matching.length > 0) return matching[0];

            // Keyword match
            const keywords = queryLower.split(' ').filter(w => w.length > 2);
            matching = window.faqDataWidget.filter(faq => {
                const text = (faq.question + ' ' + faq.answer).toLowerCase();
                return keywords.some(keyword => text.includes(keyword));
            });

            return matching.length > 0 ? matching[0] : null;
        }

    