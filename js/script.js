// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
    loadFAQForChatbot();
    initFloatingChatbot();
});

// ================= 1. DARK MODE =================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);
updateIcon(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = body.getAttribute('data-theme');
        let newTheme = theme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });
}

function updateIcon(theme) {
    if (!themeToggle) return;
    themeToggle.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ================= 2. HEADER SCROLL =================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;

    const isScroll = window.scrollY > 50;
    header.classList.toggle('sticky', isScroll);
    header.style.padding = isScroll ? '5px 0' : '12px 0';
});

// ================= 3. MOBILE MENU =================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
}

// ================= 4. LOAD FAQ =================
function loadFAQForChatbot() {
    fetch('./data/faq.json') // FIX PATH
        .then(res => res.json())
        .then(data => {
            window.faqDataWidget = data;
        })
        .catch(err => console.log('FAQ không load được:', err));
}

// ================= 5. CHATBOT =================
function initFloatingChatbot() {
    const chatbotHTML = `
        <div id="chatbotWidget" class="chatbot-widget">
            <button class="chatbot-toggle" id="chatbotToggle">
                <i class="fas fa-comments"></i>
                <span class="chatbot-badge">?</span>
            </button>

            <div class="chatbot-container" id="chatbotContainer">
                <div class="chatbot-header">
                    <h3>🤖 Hỗ Trợ Nhanh</h3>
                    <button id="chatbotClose"><i class="fas fa-times"></i></button>
                </div>

                <div id="chatbotMessages" class="chatbot-messages">
                    <div class="msg-bot">
                        <div class="msg-bubble">Xin chào! 👋 Bạn cần hỗ trợ gì?</div>
                    </div>
                </div>

                <div id="chatbotSuggestions">
                    <button onclick="selectQuickQuestion('Tra cứu điểm ở đâu?')">📊 Tra cứu điểm</button>
                    <button onclick="selectQuickQuestion('Học phí bao nhiêu?')">💰 Học phí</button>
                </div>

                <div>
                    <input id="chatbotInput" placeholder="Gõ câu hỏi..." />
                    <button onclick="sendChatbotMessage()">➤</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const toggle = document.getElementById('chatbotToggle');
    const container = document.getElementById('chatbotContainer');
    const closeBtn = document.getElementById('chatbotClose');
    const input = document.getElementById('chatbotInput');

    toggle.addEventListener('click', () => {
        container.classList.add('open');
        toggle.style.display = 'none';
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        container.classList.remove('open');
        toggle.style.display = 'flex';
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatbotMessage();
    });
}

// ================= CHATBOT LOGIC =================
window.selectQuickQuestion = function(question) {
    addUserMessage(question);
    processChatbotMessage(question);
};

window.sendChatbotMessage = function() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    if (!message) return;

    addUserMessage(message);
    processChatbotMessage(message);
    input.value = '';
};

function addUserMessage(text) {
    const messages = document.getElementById('chatbotMessages');

    const msg = document.createElement('div');
    msg.className = 'msg-user';
    msg.innerHTML = `<div class="msg-bubble">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function processChatbotMessage(message) {
    const messages = document.getElementById('chatbotMessages');
    const faq = findSimilarFAQWidget(message);

    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'msg-bot';

        botMsg.innerHTML = `
            <div class="msg-bubble">
                ${faq ? faq.answer : 'Không tìm thấy câu trả lời 😢'}
            </div>
        `;

        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 300);
}

function findSimilarFAQWidget(query) {
    if (!window.faqDataWidget) return null;

    const q = query.toLowerCase();

    return window.faqDataWidget.find(faq =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    );
}

// ================= 6. SCROLL ANIMATION =================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

const lecturerCards = document.querySelectorAll('.lecturer-card');
if (lecturerCards.length > 0) {
    lecturerCards.forEach(card => observer.observe(card));
}