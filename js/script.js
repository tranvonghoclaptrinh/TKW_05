// ================= 1. DARK MODE =================
const body = document.body;
const THEME_KEY = 'theme';
const CHATBOT_STORAGE_KEY = 'chatbotPos';

function getStoredTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
}

function updateIcon(toggle, theme) {
    if (!toggle) return;
    toggle.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle || themeToggle.dataset.themeInit === 'true') return;

    themeToggle.dataset.themeInit = 'true';
    const currentTheme = getStoredTheme();
    applyTheme(currentTheme);
    updateIcon(themeToggle, currentTheme);

    themeToggle.addEventListener('click', () => {
        const nextTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
        updateIcon(themeToggle, nextTheme);
    });
}

applyTheme(getStoredTheme());

// ================= 2. HEADER SCROLL & MOBILE LOGIC =================
document.addEventListener('DOMContentLoaded', () => {
    const headerGroup = document.querySelector('.header-fixed-group');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('.has-dropdown');

    // Xử lý hiệu ứng cuộn (Scroll)
    window.addEventListener('scroll', () => {
        if (!headerGroup) return;

        // Khi cuộn quá 80px sẽ kích hoạt trạng thái thu gọn
        if (window.scrollY > 80) {
            headerGroup.classList.add('scrolled');
        } else {
            headerGroup.classList.remove('scrolled');
        }
    });

    // Toggle Mobile Menu
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // Xử lý click dropdown trên mobile
    dropdowns.forEach(dd => {
        const link = dd.querySelector('.nav-link');
        const list = dd.querySelector('.dropdown-list');

        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    // Đóng các dropdown khác đang mở
                    dropdowns.forEach(item => {
                        if (item !== dd) {
                            item.querySelector('.dropdown-list').style.display = 'none';
                        }
                    });
                    // Toggle dropdown hiện tại
                    const isOpen = list.style.display === 'flex';
                    list.style.display = isOpen ? 'none' : 'flex';
                }
            });
        }
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (navMenu && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            navMenu.classList.remove('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        }
    });
});
// ================= 3. MOBILE MENU =================
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    if (!hamburger || !navMenu || hamburger.dataset.mobileInit === 'true') return;

    hamburger.dataset.mobileInit = 'true';

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
}

document.addEventListener('component:loaded', (event) => {
    if (event?.detail?.elementId === 'header') {
        initThemeToggle();
        initMobileMenu();
    }
    if (event?.detail?.elementId === 'chatbot') {
        initChatbotWidget();
    }
});

function toNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function getPointerEvent(evt) {
    if (!evt) return null;
    return evt.touches ? evt.touches[0] : evt;
}

function initChatbotWidget() {
    const widget = document.getElementById('chatbot');
    if (!widget) return;
    const toggle = widget.querySelector('#chatbotToggle');
    const container = widget.querySelector('#chatbotContainer');
    const closeBtn = widget.querySelector('#chatbotClose');
    const input = widget.querySelector('#chatbotInput');
    const sendBtn = widget.querySelector('#chatbotSendBtn');
    const messages = widget.querySelector('#chatbotMessages');

    if (!toggle || !container || !closeBtn || !input || !sendBtn || !messages) return;
    if (toggle.dataset.chatbotInit === 'true') return;
    toggle.dataset.chatbotInit = 'true';

    const updateContainerPosition = (pos) => {
        const leftValue = toNumber(pos?.left ?? toggle.style.left);
        const topValue = toNumber(pos?.top ?? toggle.style.top);
        if (leftValue === null || topValue === null) return;
        const center = leftValue + toggle.offsetWidth / 2;
        const alignLeft = center < window.innerWidth / 2;
        if (alignLeft) {
            container.style.left = leftValue + 'px';
            container.style.right = 'auto';
        } else {
            container.style.left = 'auto';
            container.style.right = (window.innerWidth - leftValue - toggle.offsetWidth) + 'px';
        }
        container.style.bottom = (window.innerHeight - topValue + 15) + 'px';
        container.style.top = 'auto';
    };

    const savedPos = JSON.parse(localStorage.getItem(CHATBOT_STORAGE_KEY) || 'null');
    if (savedPos?.left && savedPos?.top) {
        toggle.style.left = savedPos.left;
        toggle.style.top = savedPos.top;
        toggle.style.right = 'auto';
        toggle.style.bottom = 'auto';
        updateContainerPosition(savedPos);
    }

    let isDragging = false;
    let dragMoved = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    const startDrag = (event) => {
        const pointer = getPointerEvent(event);
        if (!pointer) return;
        isDragging = true;
        dragMoved = false;
        const rect = toggle.getBoundingClientRect();
        startX = pointer.clientX;
        startY = pointer.clientY;
        initialLeft = rect.left;
        initialTop = rect.top;
        toggle.style.transition = 'none';
        toggle.style.cursor = 'grabbing';
    };

    const doDrag = (event) => {
        if (!isDragging) return;
        const pointer = getPointerEvent(event);
        if (!pointer) return;
        dragMoved = true;

        const dx = pointer.clientX - startX;
        const dy = pointer.clientY - startY;

        let newX = initialLeft + dx;
        let newY = initialTop + dy;

        newX = Math.max(10, Math.min(newX, window.innerWidth - toggle.offsetWidth - 10));
        newY = Math.max(10, Math.min(newY, window.innerHeight - toggle.offsetHeight - 10));

        toggle.style.left = newX + 'px';
        toggle.style.top = newY + 'px';
        toggle.style.right = 'auto';
        toggle.style.bottom = 'auto';

        updateContainerPosition({ left: toggle.style.left, top: toggle.style.top });
        event.preventDefault();
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        toggle.style.cursor = 'pointer';
        toggle.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        const rect = toggle.getBoundingClientRect();
        const middle = window.innerWidth / 2;
        const finalLeft = (rect.left + toggle.offsetWidth / 2 < middle)
            ? '25px'
            : (window.innerWidth - toggle.offsetWidth - 25) + 'px';
        toggle.style.left = finalLeft;
        const position = { left: finalLeft, top: toggle.style.top };
        localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(position));
        updateContainerPosition(position);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('touchmove', (event) => doDrag(event), { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    const appendMessage = (role, text) => {
        messages.insertAdjacentHTML('beforeend', `<div class="msg-${role}"><div class="msg-bubble">${text}</div></div>`);
        messages.scrollTop = messages.scrollHeight;
    };

    window.quickReply = function (text) {
        appendMessage('user', text);
        setTimeout(() => {
            let reply = 'Khoa đang kiểm tra thông tin về ' + text + '. Bạn chờ chút nhé!';
            if (text.includes('Điểm')) reply = 'Bạn có thể tra cứu điểm tại cổng sinh viên HUIT.';
            appendMessage('bot', reply);
        }, 700);
    };

    const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        appendMessage('user', text);
        input.value = '';
        setTimeout(() => appendMessage('bot', 'Cảm ơn câu hỏi của bạn. Tư vấn viên sẽ sớm trả lời!'), 800);
    };

    toggle.addEventListener('mousedown', startDrag);
    toggle.addEventListener('touchstart', startDrag, { passive: true });
    toggle.addEventListener('click', () => {
        if (dragMoved) return;
        container.classList.add('open');
        toggle.style.opacity = '0';
        toggle.style.pointerEvents = 'none';
        input.focus();
    });

    closeBtn.addEventListener('click', () => {
        container.classList.remove('open');
        toggle.style.opacity = '1';
        toggle.style.pointerEvents = 'auto';
    });

    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}
