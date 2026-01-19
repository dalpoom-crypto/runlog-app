// ==================== Firebase Configuration ====================

const firebaseConfig = {
  apiKey: "AIzaSyAzss6DFA8akLhMxk021_y3yzgx9JjePbA",
  authDomain: "runlog-app-e8c5b.firebaseapp.com",
  projectId: "runlog-app-e8c5b",
  storageBucket: "runlog-app-e8c5b.firebasestorage.app",
  messagingSenderId: "566492833658",
  appId: "1:566492833658:web:0322dbf01d72752d8b98c3",
  measurementId: "G-H6Q9W0JE31"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const authService = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log('✅ Firebase initialized');

// ==================== Login ====================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await authService.signInWithEmailAndPassword(email, password);
            showNotification('로그인 성공! 🎉');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            let message = '로그인 실패';
            if (error.code === 'auth/user-not-found') {
                message = '등록되지 않은 이메일입니다.';
            } else if (error.code === 'auth/wrong-password') {
                message = '비밀번호가 올바르지 않습니다.';
            } else if (error.code === 'auth/invalid-email') {
                message = '올바른 이메일 형식이 아닙니다.';
            }
            showNotification(message);
        }
    });
}

// ==================== Signup Step 1 ====================

async function goToStep2() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const nickname = document.getElementById('signup-nickname').value;
    
    // 1. 기본 유효성 체크
    if (!email || !password || !passwordConfirm || !nickname) {
        showCustomAlert('모든 필수 항목을 입력해주세요');
        return;
    }
    
    // 2. 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showCustomAlert('올바른 이메일 형식이 아닙니다');
        return;
    }
    
    // 3. 비밀번호 일치 체크
    if (password !== passwordConfirm) {
        showCustomAlert('비밀번호가 일치하지 않습니다');
        return;
    }
    
    // 4. 비밀번호 길이 체크
    if (password.length < 8) {
        showCustomAlert('비밀번호는 8자 이상이어야 합니다');
        return;
    }
    
    // 5. Firebase 이메일 중복 체크
    showNotification('이메일 확인 중...');
    
    try {
        const methods = await authService.fetchSignInMethodsForEmail(email);
        
        if (methods && methods.length > 0) {
            showCustomAlert('⚠️ 이미 사용 중인 이메일입니다.\n\n다른 이메일 주소를 입력해주세요.');
            return;
        }
        
        // localStorage에 저장
        localStorage.setItem('temp_email', email);
        localStorage.setItem('temp_password', password);
        localStorage.setItem('temp_nickname', nickname);
        
        // Step 2로 이동
        document.getElementById('signupStep1').classList.remove('active');
        document.getElementById('signupStep2').classList.add('active');
        
        document.querySelectorAll('.progress-step')[0].classList.remove('active');
        document.querySelectorAll('.progress-step')[1].classList.add('active');
        
        showNotification('✅ 다음 단계로 이동합니다');
        
    } catch (error) {
        console.error('이메일 체크 오류:', error);
        showCustomAlert('이메일 확인 중 오류가 발생했습니다');
    }
}

function goToStep1() {
    document.getElementById('signupStep2').classList.remove('active');
    document.getElementById('signupStep1').classList.add('active');
    
    document.querySelectorAll('.progress-step')[1].classList.remove('active');
    document.querySelectorAll('.progress-step')[0].classList.add('active');
}

// ==================== Signup Step 2 ====================

const signupStep2 = document.getElementById('signupStep2');
if (signupStep2) {
    signupStep2.addEventListener('submit', async (e) => {
        e.preventDefault();
        await completeSignup();
    });
}

function skipToOnboarding() {
    completeSignup();
}


// ==================== Utilities ====================

// 이미지 압축 함수
async function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 최대 너비로 리사이즈
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // JPEG로 압축 (quality: 0.7 = 70% 품질)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

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

const profilePhotoInput = document.getElementById('profile-photo');
if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('photoPreviewModern');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

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

function showCustomAlert(message) {
    const existing = document.getElementById('customAlertModal');
    if (existing) {
        existing.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'customAlertModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 25px;
        color: #333;
        white-space: pre-line;
    `;
    
    const button = document.createElement('button');
    button.textContent = '확인';
    button.style.cssText = `
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
    `;
    button.onclick = () => modal.remove();
    
    popup.appendChild(messageEl);
    popup.appendChild(button);
    modal.appendChild(popup);
    document.body.appendChild(modal);
}

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

// ==================== Password Reset ====================

function openPasswordResetModal() {
    document.getElementById('passwordResetModal').style.display = 'block';
}

function closePasswordResetModal() {
    document.getElementById('passwordResetModal').style.display = 'none';
    document.getElementById('reset-email').value = '';
}

async function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    if (!email) {
        showNotification('이메일을 입력해주세요');
        return;
    }
    
    showNotification('처리 중...');
    
    try {
        const methods = await authService.fetchSignInMethodsForEmail(email);
        
        if (!methods || methods.length === 0) {
            showNotification('등록되지 않은 이메일입니다');
            return;
        }
        
        await authService.sendPasswordResetEmail(email);
        showNotification('✅ 비밀번호 재설정 이메일을 보냈습니다!\n이메일을 확인해주세요.');
        
        setTimeout(() => {
            closePasswordResetModal();
        }, 2000);
        
    } catch (error) {
        let message = '오류가 발생했습니다';
        
        if (error.code === 'auth/user-not-found') {
            message = '등록되지 않은 이메일입니다';
        } else if (error.code === 'auth/invalid-email') {
            message = '올바른 이메일 형식이 아닙니다';
        }
        
        showNotification(message);
    }
}

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeDateSelects();
    
    const forgotLink = document.querySelector('.forgot-password');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPasswordResetModal();
        });
    }
});

const socialButtons = document.querySelectorAll('.btn-social');
socialButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const type = e.currentTarget.classList.contains('kakao') ? '카카오' : '구글';
        showNotification(`${type} 로그인 기능은 준비중입니다`);
    });
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('passwordResetModal');
    if (e.target === modal) {
        closePasswordResetModal();
    }
});
async function completeSignup() {
    const email = localStorage.getItem('temp_email');
    const password = localStorage.getItem('temp_password');
    const nickname = localStorage.getItem('temp_nickname');
    
    if (!email || !password || !nickname) {
        showNotification('이전 단계의 정보가 없습니다. 다시 시도해주세요.');
        goToStep1();
        return;
    }
    
    const gender = document.getElementById('gender')?.value || '';
    const birthYear = document.getElementById('birth-year')?.value || '';
    const birthMonth = document.getElementById('birth-month')?.value || '';
    const birthDay = document.getElementById('birth-day')?.value || '';
    const region = document.getElementById('region')?.value || '';
    
    // 프로필 사진 가져오기 및 압축
    const profilePhotoInput = document.getElementById('profile-photo');
    let profilePhotoData = null;
    
    if (profilePhotoInput && profilePhotoInput.files && profilePhotoInput.files[0]) {
        const file = profilePhotoInput.files[0];
        profilePhotoData = await compressImage(file, 800, 0.7);  // 최대 800px, 품질 70%
    }
    
    showNotification('회원가입 처리 중...');
    
    try {
        // Firebase 회원가입
        const userCredential = await authService.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        console.log('✅ Firebase 계정 생성 완료:', user.uid);
        
        // Firestore에 사용자 정보 저장 (프로필 사진 포함)
        await db.collection('users').doc(user.uid).set({
            email: email,
            nickname: nickname,
            gender: gender,
            birthDate: birthYear && birthMonth && birthDay ? `${birthYear}-${birthMonth}-${birthDay}` : null,
            region: region,
            profilePhoto: profilePhotoData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Firestore 저장 완료');
        
        // 임시 데이터 삭제
        localStorage.removeItem('temp_email');
        localStorage.removeItem('temp_password');
        localStorage.removeItem('temp_nickname');
        
        // 성공 알림
        showNotification('🎉 회원가입이 완료되었습니다!');
        
        // onboarding.html로 이동
        setTimeout(() => {
            window.location.href = `onboarding.html?nickname=${encodeURIComponent(nickname)}`;
        }, 1000);
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        
        let message = '회원가입 실패';
        
        if (error.code === 'auth/email-already-in-use') {
            message = '이미 사용 중인 이메일입니다.';
            localStorage.removeItem('temp_email');
            localStorage.removeItem('temp_password');
            localStorage.removeItem('temp_nickname');
            showCustomAlert(message + '\n\n이전 단계로 돌아가서 다른 이메일을 입력해주세요.');
            setTimeout(() => {
                goToStep1();
            }, 2000);
            return;
        } else if (error.code === 'auth/weak-password') {
            message = '비밀번호가 너무 약합니다.';
        }
        
        showCustomAlert(message);
    }
}
