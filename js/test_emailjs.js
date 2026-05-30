// Test EmailJS Configuration
// Chạy file này trong Console (F12) để kiểm tra EmailJS

console.log('🧪 Testing EmailJS Configuration...');

// Test 1: Check if EmailJS is loaded
if (typeof emailjs !== 'undefined') {
    console.log('✅ EmailJS SDK loaded successfully');
} else {
    console.error('❌ EmailJS SDK not loaded. Check script tag in HTML');
}

// Test 2: Check Public Key
try {
    // This will throw error if public key is not set
    emailjs.init("test");
    console.log('✅ EmailJS initialized (but with test key)');
} catch (error) {
    console.error('❌ EmailJS initialization failed:', error.message);
}

// Test 3: Check form elements
const form = document.getElementById('contactForm');
const nameInput = document.getElementById('contactName');
const emailInput = document.getElementById('contactEmail');
const messageInput = document.getElementById('contactMessage');

if (form) console.log('✅ Contact form found');
else console.error('❌ Contact form not found');

if (nameInput) console.log('✅ Name input found');
else console.error('❌ Name input not found');

if (emailInput) console.log('✅ Email input found');
else console.error('❌ Email input not found');

if (messageInput) console.log('✅ Message input found');
else console.error('❌ Message input not found');

// Test 4: Simulate form submission (without actually sending)
console.log('📝 To test actual sending:');
console.log('1. Fill out the form');
console.log('2. Open Console (F12)');
console.log('3. Click submit button');
console.log('4. Check for success/error messages');

console.log('🎯 If you see errors above, check EMAILJS_SETUP.md for fixes');