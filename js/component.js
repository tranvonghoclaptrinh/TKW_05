/**
 * 1. Hàm tính toán tiền tố đường dẫn (Chỉ lùi tối đa 2 cấp)
 */
function getPathPrefix() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s.length > 0);
    
    // Tìm các thư mục con trong dự án của bạn
    const subFolders = ['gioithieu', 'js', 'css', 'component'];
    const foundIndex = segments.findIndex(s => subFolders.includes(s.toLowerCase()));

    if (foundIndex !== -1) {
        const depth = segments.length - 1 - foundIndex;
        // Giới hạn tối đa lùi 2 cấp để tránh rà thừa
        const finalDepth = Math.min(depth, 2); 
        return "../".repeat(finalDepth);
    }
    return "";
}

/**
 * 2. Hàm quét và sửa đường dẫn "Vừa đủ"
 */
function fixPathsSmartly(containerId) {
    const prefix = getPathPrefix();
    const container = document.getElementById(containerId);
    if (!container || prefix === "") return;

    // Chỉ tập trung vào 2 loại thẻ quan trọng nhất thường gây lỗi 404
    const selectors = {
        'a': 'href',
        'img': 'src'
    };

    for (const [tag, attr] of Object.entries(selectors)) {
        const elements = container.querySelectorAll(tag);
        elements.forEach(el => {
            const originalVal = el.getAttribute(attr);
            
            // Điều kiện lọc: Không phải link tuyệt đối, không phải ID (#), không phải mail/tel
            if (originalVal && 
                !originalVal.startsWith('http') && 
                !originalVal.startsWith('#') && 
                !originalVal.startsWith('mailto:') &&
                !originalVal.startsWith('data:')) {
                
                // Xóa các dấu ./ hoặc / ở đầu để chuẩn hóa
                const cleanVal = originalVal.replace(/^\.?\//, "");
                
                // Gán lại giá trị mới đã bù cấp bậc
                el.setAttribute(attr, prefix + cleanVal);
            }
        });
    }
}

/**
 * 3. Hàm Load Component chính
 */
async function loadComponent(elementId, fileName) {
    const prefix = getPathPrefix();
    const filePath = `${prefix}component/${fileName}`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`404 Not Found: ${filePath}`);
        
        const html = await response.text();
        const target = document.getElementById(elementId);
        
        if (target) {
            target.innerHTML = html;
            // Rà và sửa đường dẫn ngay sau khi nạp HTML
            fixPathsSmartly(elementId);
        }

        // Kích hoạt lại các tính năng phụ nếu có
        document.dispatchEvent(new CustomEvent('component:loaded', { detail: { elementId } }));

    } catch (error) {
        console.error(`[Lỗi Load] ${fileName}:`, error);
    }
}

/**
 * 4. Khởi chạy khi trang sẵn sàng
 */
document.addEventListener("DOMContentLoaded", () => {
    const config = [
        { id: 'top-bar', file: 'top-bar.html' },
        { id: 'header', file: 'menu.html' },
        { id: 'footer-placeholder', file: 'footer.html' },
        { id: 'right-pannel-placeholder', file: 'right-pannel.html' },
        { id: 'chatbot', file: 'chatbot.html' }
    ];

    config.forEach(item => loadComponent(item.id, item.file));
});