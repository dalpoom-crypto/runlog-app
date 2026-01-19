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
function initializeAllDateSelects() {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    
    // Competition date
    const compYear = document.getElementById('comp-year');
    if (compYear) {
        for (let year = currentYear; year >= currentYear - 10; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            compYear.appendChild(option);
        }
    }
    
    const compMonth = document.getElementById('comp-month');
    if (compMonth) {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = String(month).padStart(2, '0');
            option.textContent = String(month).padStart(2, '0');
            compMonth.appendChild(option);
        }
    }
    
    const compDay = document.getElementById('comp-day');
    if (compDay) {
        for (let day = 1; day <= 31; day++) {
            const option = document.createElement('option');
            option.value = String(day).padStart(2, '0');
            option.textContent = String(day).padStart(2, '0');
            compDay.appendChild(option);
        }
    }
    
    // Special running date (default to today)
    const specialYear = document.getElementById('special-year');
    if (specialYear) {
        for (let year = currentYear; year >= currentYear - 10; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            specialYear.appendChild(option);
        }
        specialYear.value = currentYear;
    }
    
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

// Handle multi photo upload with accumulation
function setupPhotoUpload(inputId, gridId, photosArray) {
    const input = document.getElementById(inputId);
    const grid = document.getElementById(gridId);
    
    if (!input || !grid) return;
    
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // Get reference to the actual array
            const currentArray = inputId === 'comp-photos' ? compOnboardingPhotos : specialOnboardingPhotos;
            
            if (currentArray.length >= 3) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                currentArray.push(e.target.result);
                renderPhotoGrid(grid, currentArray, inputId);
            };
            reader.readAsDataURL(file);
        });
        
        input.value = '';
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
    competitionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const country = document.getElementById('country').value;
        const year = document.getElementById('year').value;
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
        
        // Save to localStorage
        const comp = {
            country,
            name: competitionName,
            distance,
            timeString,
            totalSeconds,
            date: `${compYear}-${compMonth}-${compDay}`,
            memo: '',
            photos: [...compOnboardingPhotos]
        };
        
        const comps = JSON.parse(localStorage.getItem('competitions') || '[]');
        comps.push(comp);
        localStorage.setItem('competitions', JSON.stringify(comps));
        
        // 성공 모달 표시
        showSuccessModal(timeString, `${competitionName} (${distance})`);
        
        closeModal();
    });
}

// 특별한 러닝 폼 제출
const specialForm = document.getElementById('specialForm');
if (specialForm) {
    specialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
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
        
        // Save to localStorage
        const special = {
            location,
            withPerson,
            distance: distanceVal ? `${distanceVal}km` : null,
            timeString,
            totalSeconds,
            date: `${specialYear}-${specialMonth}-${specialDay}`,
            memo,
            photos: [...specialOnboardingPhotos]
        };
        
        const specials = JSON.parse(localStorage.getItem('specialRuns') || '[]');
        specials.push(special);
        localStorage.setItem('specialRuns', JSON.stringify(specials));
        
        // 성공 모달 표시
        const info = distanceVal ? `${location} (${distanceVal}km)` : location;
        showSuccessModal(timeString || '✨', info);
        
        closeModal();
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
    localStorage.setItem('currentUser', nickname);
    window.location.href = 'index.html';
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
