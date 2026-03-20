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

// ================= 4. CHATBOT SYSTEM =================
document.addEventListener('DOMContentLoaded', () => {
    loadFAQForChatbot();
    initChatbot();
});

/* --- LOAD FAQ DATA --- */
function loadFAQForChatbot() {
    fetch('./data/faq.json')
        .then(res => res.json())
        .then(data => {
            window.faqDataWidget = data;
        })
        .catch(() => console.log('FAQ lỗi hoặc chưa có file data/faq.json'));
}

/* --- INIT CHATBOT UI & LOGIC --- */
function initChatbot() {
    const html = `
        <div class="chatbot-widget">
            <button class="chatbot-toggle" id="chatbotToggle" style="position: fixed; z-index: 1000;">
                <i class="fas fa-comments"></i>
                <span class="chatbot-badge">?</span>
            </button>

            <div class="chatbot-container" id="chatbotContainer">
                <div class="chatbot-header">
                    <span>🤖 Hỗ Trợ HUIT IT</span>
                    <button id="chatbotClose">✖</button>
                </div>

                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="msg-bot">
                        <div class="msg-bubble">Chào bạn! Vị trí của mình sẽ được lưu lại khi bạn chuyển trang. 👋</div>
                    </div>
                </div>

                <div id="chatbotSuggestions">
                    <button onclick="quick('Tra cứu điểm')">📊 Điểm</button>
                    <button onclick="quick('Học phí')">💰 Học phí</button>
                </div>

                <div class="chatbot-input-area">
                    <input id="chatbotInput" placeholder="Nhập câu hỏi..." />
                    <button onclick="send()">➤</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const btn = document.getElementById('chatbotToggle');
    const box = document.getElementById('chatbotContainer');
    const closeBtn = document.getElementById('chatbotClose');
    const input = document.getElementById('chatbotInput');

    // --- KHÔI PHỤC VỊ TRÍ TỪ LOCALSTORAGE ---
    const savedPos = JSON.parse(localStorage.getItem('chatbotPos'));
    if (savedPos) {
        btn.style.left = savedPos.left;
        btn.style.top = savedPos.top;
    } else {
        // Vị trí mặc định ban đầu
        btn.style.right = "25px";
        btn.style.bottom = "80px";
    }

    // --- BIẾN ĐIỀU KHIỂN KÉO THẢ ---
    let isDragging = false;
    let moved = false;
    let offsetX, offsetY;

    btn.addEventListener("mousedown", (e) => {
        isDragging = true;
        moved = false;
        const rect = btn.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        btn.style.cursor = "grabbing";
        btn.style.transition = "none"; 
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        moved = true;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Giới hạn trong màn hình
        const maxX = window.innerWidth - btn.offsetWidth;
        const maxY = window.innerHeight - btn.offsetHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        btn.style.left = x + "px";
        btn.style.top = y + "px";
        btn.style.right = "auto";
        btn.style.bottom = "auto";
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        btn.style.cursor = "pointer";
        btn.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"; 

        const middle = window.innerWidth / 2;
        const rect = btn.getBoundingClientRect();
        const safePadding = 25; 

        let finalLeft;
        if (rect.left < middle) {
            finalLeft = `${safePadding}px`;
        } else {
            finalLeft = (window.innerWidth - btn.offsetWidth - safePadding) + "px";
        }

        btn.style.left = finalLeft;

        // 🔥 LƯU VỊ TRÍ VÀO LOCALSTORAGE
        localStorage.setItem('chatbotPos', JSON.stringify({
            left: finalLeft,
            top: btn.style.top
        }));
    });

    // --- ĐÓNG/MỞ ---
    btn.addEventListener('click', () => {
        if (!moved) { 
            box.classList.add('open');
            btn.style.visibility = 'hidden';
            btn.style.opacity = '0';
        }
    });

    closeBtn.addEventListener('click', () => {
        box.classList.remove('open');
        btn.style.visibility = 'visible';
        btn.style.opacity = '1';
    });

    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') send();
    });
}

/* --- LOGIC CHAT --- */
function send() {
    const input = document.getElementById('chatbotInput');
    const text = input.value.trim();
    if (!text) return;

    addUser(text);
    reply(text);
    input.value = '';
}

function quick(q) {
    addUser(q);
    reply(q);
}

function addUser(text) {
    const box = document.getElementById('chatbotMessages');
    box.innerHTML += `<div class="msg-user"><div class="msg-bubble">${text}</div></div>`;
    box.scrollTop = box.scrollHeight;
}

function reply(text) {
    const box = document.getElementById('chatbotMessages');
    const faq = findFAQ(text);

    setTimeout(() => {
        box.innerHTML += `
            <div class="msg-bot">
                <div class="msg-bubble">${faq || 'Khoa chưa có thông tin này, bạn thử hỏi về Học phí hoặc Điểm nhé!'}</div>
            </div>`;
        box.scrollTop = box.scrollHeight;
    }, 400);
}

function findFAQ(q) {
    if (!window.faqDataWidget) return null;
    q = q.toLowerCase();
    const f = window.faqDataWidget.find(x => x.question.toLowerCase().includes(q));
    return f ? f.answer : null;
}