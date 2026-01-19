// 로그인 폼
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        console.log('로그인:', email);
        
        showNotification('로그인 성공! 🎉');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

// 소셜 로그인 버튼들
const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const type = e.currentTarget.classList.contains('kakao') ? '카카오' : '구글';
        showNotification(`${type} 로그인 기능은 준비중입니다`);
    });
});

// 비밀번호 찾기
const forgotPassword = document.querySelector('.forgot-password');
if (forgotPassword) {
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('비밀번호 찾기 기능은 준비중입니다');
    });
}

// Password Toggle Function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('.eye-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '👁️‍🗨️';
    } else {
        input.type = 'password';
        icon.textContent = '👁️';
    }
}

// Step 전환 함수들
function goToStep2() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const nickname = document.getElementById('signup-nickname').value;
    
    if (!email || !password || !passwordConfirm || !nickname) {
        showNotification('모든 필수 항목을 입력해주세요');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('비밀번호가 일치하지 않습니다');
        return;
    }
    
    if (password.length < 8) {
        showNotification('비밀번호는 8자 이상이어야 합니다');
        return;
    }
    
    document.getElementById('signupStep1').classList.remove('active');
    document.getElementById('signupStep2').classList.add('active');
    
    document.querySelectorAll('.progress-step')[0].classList.remove('active');
    document.querySelectorAll('.progress-step')[1].classList.add('active');
    
    localStorage.setItem('temp_email', email);
    localStorage.setItem('temp_nickname', nickname);
}

function goToStep1() {
    document.getElementById('signupStep2').classList.remove('active');
    document.getElementById('signupStep1').classList.add('active');
    
    document.querySelectorAll('.progress-step')[1].classList.remove('active');
    document.querySelectorAll('.progress-step')[0].classList.add('active');
}

function skipToOnboarding() {
    completeSignup();
}

// Step 2 폼 제출
const signupStep2 = document.getElementById('signupStep2');
if (signupStep2) {
    signupStep2.addEventListener('submit', (e) => {
        e.preventDefault();
        completeSignup();
    });
}

function completeSignup() {
    const nickname = localStorage.getItem('temp_nickname') || '러너';
    
    showNotification('회원가입 완료! 🎉');
    
    setTimeout(() => {
        window.location.href = `onboarding.html?nickname=${encodeURIComponent(nickname)}`;
    }, 1000);
}

// Initialize date selects
function initializeDateSelects() {
    const birthYear = document.getElementById('birth-year');
    if (birthYear) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 1940; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            birthYear.appendChild(option);
        }
    }
    
    const birthMonth = document.getElementById('birth-month');
    if (birthMonth) {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = String(month).padStart(2, '0');
            option.textContent = String(month).padStart(2, '0');
            birthMonth.appendChild(option);
        }
    }
    
    const birthDay = document.getElementById('birth-day');
    if (birthDay) {
        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            const dayStr = String(day).padStart(2, '0');
            option.value = dayStr;
            option.textContent = dayStr;
            birthDay.appendChild(option);
        }
    }
}

// Profile photo preview - Clickable circular
const profilePhotoInput = document.getElementById('profile-photo');
if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('photoPreviewModern');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// 알림 함수
function showNotification(message) {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s;
        font-weight: 600;
        color: #333;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2500);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeDateSelects();
});
