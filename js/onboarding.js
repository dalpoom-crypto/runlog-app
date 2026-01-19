// Firebase Configuration
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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// URL에서 닉네임 가져오기
const urlParams = new URLSearchParams(window.location.search);
const nickname = urlParams.get('nickname') || '러너';

// 환영 메시지에 닉네임 표시
const welcomeNickname = document.getElementById('welcomeNickname');
if (welcomeNickname) {
    welcomeNickname.textContent = nickname;
}

// Global photo storage
let compOnboardingPhotos = [];
let specialOnboardingPhotos = [];

// Initialize all date selects

// Handle multi photo upload with accumulation
function setupPhotoUpload(inputId, gridId, photosArray) {
    const input = document.getElementById(inputId);
    const grid = document.getElementById(gridId);
    
    if (!input || !grid) return;
    
    input.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        const currentArray = inputId === 'comp-photos' ? compOnboardingPhotos : specialOnboardingPhotos;
        
        // 남은 슬롯 개수 계산
        const remainingSlots = 3 - currentArray.length;
        
        // 남은 슬롯만큼만 파일 처리
        const filesToProcess = files.slice(0, remainingSlots);
        
        let processedCount = 0;
        
        for (const file of filesToProcess) {
            try {
                // 이미지 압축 (최대 1200px, 품질 80%)
                const compressedImage = await compressImage(file, 1200, 0.8);
                currentArray.push(compressedImage);
                processedCount++;
                
                // 모든 파일이 처리되면 그리드 업데이트
                if (processedCount === filesToProcess.length) {
                    renderPhotoGrid(grid, currentArray, inputId);
                }
            } catch (error) {
                console.error('이미지 압축 오류:', error);
            }
        }
        
        input.value = '';
    });
}

// 이미지 압축 함수
async function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
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
                
                // JPEG로 압축
                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function renderPhotoGrid(grid, photosArray, inputId) {
    grid.innerHTML = '';
    
    photosArray.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item has-image';
        
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `Photo ${index + 1}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'photo-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.type = 'button';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteOnboardingPhoto(inputId, index);
        };
        
        photoItem.appendChild(img);
        photoItem.appendChild(deleteBtn);
        grid.appendChild(photoItem);
    });
    
    if (photosArray.length < 3) {
        const addButton = document.createElement('div');
        addButton.className = 'photo-item add-photo';
        addButton.innerHTML = '<span class="add-icon">+</span>';
        addButton.onclick = () => document.getElementById(inputId).click();
        grid.appendChild(addButton);
    }
}

function deleteOnboardingPhoto(inputId, index) {
    showConfirm('사진을 삭제하시겠습니까?', () => {
        if (inputId === 'comp-photos') {
            compOnboardingPhotos.splice(index, 1);
            renderPhotoGrid(document.getElementById('compPhotoGrid'), compOnboardingPhotos, inputId);
        } else if (inputId === 'special-photos') {
            specialOnboardingPhotos.splice(index, 1);
            renderPhotoGrid(document.getElementById('specialPhotoGrid'), specialOnboardingPhotos, inputId);
        }
    });
}

// Validate numeric input for time
function validateNumericInput(input) {
    input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        const max = e.target.id.includes('hours') ? 23 : 59;
        if (parseInt(e.target.value) > max) {
            e.target.value = String(max);
        }
    });
}

// 기록 타입 선택
let selectedType = null;

function selectRecordType(type) {
    selectedType = type;
    
    if (type === 'competition') {
        document.getElementById('competitionModal').style.display = 'block';
    } else if (type === 'special') {
        document.getElementById('specialModal').style.display = 'block';
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('competitionModal').style.display = 'none';
    document.getElementById('specialModal').style.display = 'none';
}

// 온보딩 스킵
function skipOnboarding() {
    if (confirm('나중에 기록을 등록하시겠습니까?')) {
        goToMain();
    }
}

// 대회 기록 폼 제출
const competitionForm = document.getElementById('competitionForm');
if (competitionForm) {
    competitionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return;
        }
        
        const country = document.getElementById('country').value;
        // year 필드는 숨김 처리됨
        const competitionName = document.getElementById('competition-name').value;
        const distance = document.getElementById('distance').value;
        const hours = parseInt(document.getElementById('comp-hours').value) || 0;
        const minutes = parseInt(document.getElementById('comp-minutes').value);
        const seconds = parseInt(document.getElementById('comp-seconds').value);
        const compYear = document.getElementById('comp-year').value;
        const compMonth = document.getElementById('comp-month').value;
        const compDay = document.getElementById('comp-day').value;
        
        const timeString = hours > 0 
            ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : `${minutes}:${String(seconds).padStart(2, '0')}`;
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        try {
            // Save to Firestore
            const comp = {
                userId: currentUser.uid,
                country,
                name: competitionName,
                distance,
                timeString,
                totalSeconds,
                date: `${compYear}-${compMonth}-${compDay}`,
                memo: '',
                photos: [...compOnboardingPhotos],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('competitions').add(comp);
            console.log('✅ 대회 기록 저장 완료');
            
            // 성공 모달 표시
            const info = `${competitionName} (${distance})`;
            showSuccessModal(timeString, info);
            
            closeModal();
        } catch (error) {
            console.error('대회 기록 저장 오류:', error);
            alert('기록 저장 중 오류가 발생했습니다.');
        }
    });
}

// 특별한 러닝 폼 제출
const specialForm = document.getElementById('specialForm');
if (specialForm) {
    specialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return;
        }
        
        const location = document.getElementById('special-location').value;
        const withPerson = document.getElementById('special-with').value;
        const distanceVal = document.getElementById('special-distance-val').value;
        const hours = parseInt(document.getElementById('special-hours').value) || 0;
        const minutes = parseInt(document.getElementById('special-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('special-seconds').value) || 0;
        const specialYear = document.getElementById('special-year').value;
        const specialMonth = document.getElementById('special-month').value;
        const specialDay = document.getElementById('special-day').value;
        const memo = document.getElementById('special-memo').value;
        
        const timeString = (hours || minutes || seconds) 
            ? (hours > 0 
                ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
                : `${minutes}:${String(seconds).padStart(2, '0')}`)
            : null;
        
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        try {
            // Save to Firestore
            const special = {
                userId: currentUser.uid,
                location,
                withPerson,
                distance: distanceVal ? `${distanceVal}km` : null,
                timeString,
                totalSeconds,
                date: `${specialYear}-${specialMonth}-${specialDay}`,
                memo,
                photos: [...specialOnboardingPhotos],
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('specialRuns').add(special);
            console.log('✅ 특별 러닝 저장 완료');
            
            // 성공 모달 표시
            const info = distanceVal ? `${location} (${distanceVal}km)` : location;
            showSuccessModal(timeString || '✨', info);
            
            closeModal();
        } catch (error) {
            console.error('특별 러닝 저장 오류:', error);
            alert('기록 저장 중 오류가 발생했습니다.');
        }
    });
}

// 성공 모달 표시
function showSuccessModal(time, info) {
    const successModal = document.getElementById('successModal');
    const successTime = document.getElementById('successTime');
    const successInfo = document.getElementById('successInfo');
    
    successTime.textContent = time;
    successInfo.textContent = info;
    
    successModal.style.display = 'block';
    
    setTimeout(() => {
        successTime.style.animation = 'pulse 0.5s ease-in-out';
    }, 300);
}

// 메인으로 이동
function goToMain() {
    window.location.href = 'index.html#runlog';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initializeAllDateSelects();
    setupPhotoUpload('comp-photos', 'compPhotoGrid', compOnboardingPhotos);
    setupPhotoUpload('special-photos', 'specialPhotoGrid', specialOnboardingPhotos);
    
    // Validate all time inputs
    ['comp-hours', 'comp-minutes', 'comp-seconds', 'special-hours', 'special-minutes', 'special-seconds'].forEach(id => {
        const input = document.getElementById(id);
        if (input) validateNumericInput(input);
    });
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);

// 모달 외부 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Custom Confirm Dialog
function showConfirm(message, onConfirm) {
    const modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const confirmContent = document.createElement('div');
    confirmContent.className = 'modal-content confirm-content';
    
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    
    const messageP = document.createElement('p');
    messageP.textContent = message;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'confirm-actions';
    
    const yesBtn = document.createElement('button');
    yesBtn.className = 'btn-confirm-yes';
    yesBtn.textContent = '예';
    yesBtn.onclick = () => {
        closeConfirm();
        onConfirm();
    };
    
    const noBtn = document.createElement('button');
    noBtn.className = 'btn-confirm-no';
    noBtn.textContent = '아니오';
    noBtn.onclick = closeConfirm;
    
    actionsDiv.appendChild(yesBtn);
    actionsDiv.appendChild(noBtn);
    
    confirmDialog.appendChild(messageP);
    confirmDialog.appendChild(actionsDiv);
    confirmContent.appendChild(confirmDialog);
    modal.appendChild(confirmContent);
    
    document.body.appendChild(modal);
}

function closeConfirm() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.remove();
}
// Initialize all date selects
function initializeAllDateSelects() {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    
    // Competition year - 2000년부터 현재까지
    const compYear = document.getElementById('comp-year');
    if (compYear) {
        // 기본값으로 현재 연도 선택
        const defaultOption = document.createElement('option');
        defaultOption.value = currentYear;
        defaultOption.textContent = currentYear;
        defaultOption.selected = true;
        compYear.appendChild(defaultOption);
        
        // 2000년부터 현재 연도까지
        for (let year = currentYear - 1; year >= 2000; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            compYear.appendChild(option);
        }
    }
    
    // Competition month - 기본값 1월
    const compMonth = document.getElementById('comp-month');
    if (compMonth) {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            const monthStr = String(month).padStart(2, '0');
            option.value = monthStr;
            option.textContent = monthStr;
            compMonth.appendChild(option);
        }
        compMonth.value = '01'; // 기본값 1월
    }
    
    // Competition day - 기본값 1일
    const compDay = document.getElementById('comp-day');
    if (compDay) {
        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            const dayStr = String(day).padStart(2, '0');
            option.value = dayStr;
            option.textContent = dayStr;
            compDay.appendChild(option);
        }
        compDay.value = '01'; // 기본값 1일
    }
    
    // Special running year - 2000년부터 현재까지, 기본값 현재
    const specialYear = document.getElementById('special-year');
    if (specialYear) {
        // 기본값으로 현재 연도 선택
        const defaultOption = document.createElement('option');
        defaultOption.value = currentYear;
        defaultOption.textContent = currentYear;
        defaultOption.selected = true;
        specialYear.appendChild(defaultOption);
        
        for (let year = currentYear - 1; year >= 2000; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            specialYear.appendChild(option);
        }
    }
    
    // Special running month - 현재 월
    const specialMonth = document.getElementById('special-month');
    if (specialMonth) {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            const monthStr = String(month).padStart(2, '0');
            option.value = monthStr;
            option.textContent = monthStr;
            specialMonth.appendChild(option);
        }
        specialMonth.value = String(today.getMonth() + 1).padStart(2, '0');
    }
    
    // Special running day - 현재 일
    const specialDay = document.getElementById('special-day');
    if (specialDay) {
        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            const dayStr = String(day).padStart(2, '0');
            option.value = dayStr;
            option.textContent = dayStr;
            specialDay.appendChild(option);
        }
        specialDay.value = String(today.getDate()).padStart(2, '0');
    }
}
