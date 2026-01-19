/**
 * Runlog Module
 * 
 * 런로그 관련 모든 기능
 * - 대회 기록 저장/조회
 * - 특별한 러닝 저장/조회
 * - 런로그 목록 표시
 */

const RunlogModule = {
    // 현재 선택된 사진들
    currentPhotos: [],
    
    /**
     * 모듈 초기화
     */
    init: function() {
        console.log('🏃 RunlogModule 초기화');
        this.loadRunlogPage();
    },
    
    /**
     * 런로그 페이지 로드
     */
    loadRunlogPage: async function() {
        try {
            Helpers.showLoading();
            
            const currentUser = DataService.getCurrentUser();
            
            if (!currentUser) {
                console.error('❌ 로그인된 사용자 없음');
                window.location.href = 'login.html';
                return;
            }
            
            // 사용자 프로필 로드
            const userProfile = await DataService.getUserProfile(currentUser.uid);
            
            if (userProfile) {
                this.displayUserProfile(userProfile);
            }
            
            // 런로그 데이터 로드
            await this.loadRunlogs();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error('❌ 런로그 페이지 로드 오류:', error);
            Helpers.hideLoading();
            Helpers.showToast('데이터를 불러오는데 실패했습니다');
        }
    },
    
    /**
     * 사용자 프로필 표시
     */
    displayUserProfile: function(profile) {
        const profileSection = document.querySelector('.runlog-profile');
        
        if (!profileSection) return;
        
        // 프로필 사진
        const profilePhoto = profileSection.querySelector('.profile-photo');
        if (profilePhoto && profile.profilePhoto) {
            profilePhoto.src = profile.profilePhoto;
        }
        
        // 닉네임
        const nickname = profileSection.querySelector('.profile-nickname');
        if (nickname) {
            nickname.textContent = profile.nickname || '러너';
        }
        
        // 지역
        const region = profileSection.querySelector('.profile-region');
        if (region && profile.region) {
            region.textContent = profile.region;
        }
        
        // 크루
        const crew = profileSection.querySelector('.profile-crew');
        if (crew && profile.crew) {
            crew.textContent = profile.crew;
        }
    },
    
    /**
     * 런로그 데이터 로드
     */
    loadRunlogs: async function() {
        try {
            const currentUser = DataService.getCurrentUser();
            
            // 대회 기록 & 특별한 러닝 동시 로드
            const [competitions, specialRuns] = await Promise.all([
                DataService.getCompetitions(currentUser.uid),
                DataService.getSpecialRuns(currentUser.uid)
            ]);
            
            // 통합하여 표시
            this.displayRunlogs(competitions, specialRuns);
            
        } catch (error) {
            console.error('❌ 런로그 로드 오류:', error);
        }
    },
    
    /**
     * 런로그 목록 표시
     */
    displayRunlogs: function(competitions, specialRuns) {
        const container = document.getElementById('runlogList');
        
        if (!container) return;
        
        // 전체 런로그 합치기
        const allRunlogs = [
            ...competitions.map(c => ({...c, type: 'competition'})),
            ...specialRuns.map(s => ({...s, type: 'special'}))
        ];
        
        // 날짜순 정렬
        allRunlogs.sort((a, b) => {
            const dateA = new Date(a.date || a.createdAt);
            const dateB = new Date(b.date || b.createdAt);
            return dateB - dateA;
        });
        
        if (allRunlogs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>아직 런로그가 없습니다</p>
                    <p>+ 버튼을 눌러 첫 기록을 추가해보세요!</p>
                </div>
            `;
            return;
        }
        
        // 런로그 카드 생성
        container.innerHTML = allRunlogs.map(runlog => this.createRunlogCard(runlog)).join('');
    },
    
    /**
     * 런로그 카드 생성
     */
    createRunlogCard: function(runlog) {
        const isCompetition = runlog.type === 'competition';
        
        // 대회 기록 카드
        if (isCompetition) {
            return `
                <div class="runlog-card competition-card">
                    <div class="card-badge">🏆 대회 기록</div>
                    ${runlog.photos && runlog.photos.length > 0 ? `
                        <div class="card-photo" style="background-image: url('${runlog.photos[0]}')"></div>
                    ` : ''}
                    <div class="card-content">
                        <h3>${runlog.name}</h3>
                        <div class="card-info">
                            <span>📍 ${runlog.country}</span>
                            <span>📏 ${runlog.distance}</span>
                        </div>
                        <div class="card-time">⏱️ ${runlog.timeString || runlog.time}</div>
                        <div class="card-date">📅 ${runlog.date}</div>
                        ${runlog.memo ? `<div class="card-memo">${Helpers.escapeHtml(runlog.memo)}</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        // 특별한 러닝 카드
        return `
            <div class="runlog-card special-card">
                <div class="card-badge">⭐ 특별한 러닝</div>
                ${runlog.photos && runlog.photos.length > 0 ? `
                    <div class="card-photo" style="background-image: url('${runlog.photos[0]}')"></div>
                ` : ''}
                <div class="card-content">
                    <h3>${runlog.location}</h3>
                    ${runlog.with ? `<div class="card-info"><span>👥 ${runlog.with}</span></div>` : ''}
                    ${runlog.distance ? `<div class="card-info"><span>📏 ${runlog.distance}km</span></div>` : ''}
                    <div class="card-time">⏱️ ${runlog.timeString || runlog.time}</div>
                    <div class="card-date">📅 ${runlog.date}</div>
                    ${runlog.memo ? `<div class="card-memo">${Helpers.escapeHtml(runlog.memo)}</div>` : ''}
                </div>
            </div>
        `;
    },
    
    /**
     * 런로그 작성 모달 열기
     */
    openRunlogModal: function(type = 'competition') {
        const modal = document.getElementById('writeModalRunlog');
        
        if (!modal) return;
        
        // 사진 초기화
        this.currentPhotos = [];
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>기록 추가</h2>
                    <button onclick="RunlogModule.closeRunlogModal()" class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="record-type-switch">
                        <button class="record-type-btn ${type === 'competition' ? 'active' : ''}" 
                                onclick="RunlogModule.switchRecordType('competition')">
                            🏆 대회 기록
                        </button>
                        <button class="record-type-btn ${type === 'special' ? 'active' : ''}" 
                                onclick="RunlogModule.switchRecordType('special')">
                            ⭐ 특별한 러닝
                        </button>
                    </div>
                    <form id="runlogForm">
                        <div id="formFields"></div>
                        <button type="submit" class="submit-btn">저장하기</button>
                    </form>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // 폼 필드 업데이트
        setTimeout(() => {
            this.updateFormFields(type);
            this.setupFormHandlers();
        }, 100);
    },
    
    /**
     * 기록 타입 전환
     */
    switchRecordType: function(type) {
        // 버튼 활성화 전환
        document.querySelectorAll('.record-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // 폼 필드 업데이트
        this.updateFormFields(type);
    },
    
    /**
     * 폼 필드 업데이트
     */
    updateFormFields: function(type) {
        const container = document.getElementById('formFields');
        
        if (!container) return;
        
        if (type === 'competition') {
            container.innerHTML = `
                <div class="form-group">
                    <label for="comp-country">국가</label>
                    <input type="text" id="comp-country" placeholder="예: 대한민국" required>
                </div>
                
                <div class="form-group">
                    <label for="comp-name">대회명</label>
                    <input type="text" id="comp-name" placeholder="예: 춘천 국제 마라톤" required>
                </div>
                
                <div class="form-group">
                    <label for="comp-distance">거리</label>
                    <select id="comp-distance" required>
                        <option value="">선택하세요</option>
                        <option value="5K">5K</option>
                        <option value="10K">10K</option>
                        <option value="Half">Half (21.0975km)</option>
                        <option value="Full">Full (42.195km)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>기록 (시간)</label>
                    <div class="time-input-group">
                        <input type="number" id="comp-hours" placeholder="시" min="0" max="23">
                        <span>:</span>
                        <input type="number" id="comp-minutes" placeholder="분" min="0" max="59" required>
                        <span>:</span>
                        <input type="number" id="comp-seconds" placeholder="초" min="0" max="59" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="comp-date">날짜</label>
                    <input type="date" id="comp-date" required>
                </div>
                
                <div class="form-group">
                    <label for="comp-memo">메모 (선택)</label>
                    <textarea id="comp-memo" rows="3" placeholder="대회에 대한 메모를 입력하세요"></textarea>
                </div>
                
                <div class="form-group">
                    <label>사진 추가 (선택)</label>
                    <div class="photo-upload-modern">
                        <div class="photo-preview-grid" id="photoPreview">
                            <div class="photo-add-btn" onclick="RunlogModule.selectPhotos()">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>사진 추가</span>
                            </div>
                        </div>
                        <input type="file" id="photoInput" accept="image/*" multiple style="display: none;">
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="form-group">
                    <label for="special-location">장소</label>
                    <input type="text" id="special-location" placeholder="예: 한강 반포대교" required>
                </div>
                
                <div class="form-group">
                    <label for="special-with">함께한 사람 (선택)</label>
                    <input type="text" id="special-with" placeholder="예: 친구, 가족">
                </div>
                
                <div class="form-group">
                    <label for="special-distance">거리 (선택)</label>
                    <input type="number" id="special-distance" placeholder="km 단위로 입력" step="0.1" min="0">
                </div>
                
                <div class="form-group">
                    <label>기록 (시간)</label>
                    <div class="time-input-group">
                        <input type="number" id="special-hours" placeholder="시" min="0" max="23">
                        <span>:</span>
                        <input type="number" id="special-minutes" placeholder="분" min="0" max="59" required>
                        <span>:</span>
                        <input type="number" id="special-seconds" placeholder="초" min="0" max="59" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="special-date">날짜</label>
                    <input type="date" id="special-date" required>
                </div>
                
                <div class="form-group">
                    <label for="special-memo">메모 (선택)</label>
                    <textarea id="special-memo" rows="3" placeholder="특별한 러닝에 대한 메모를 입력하세요"></textarea>
                </div>
                
                <div class="form-group">
                    <label>사진 추가 (선택)</label>
                    <div class="photo-upload-modern">
                        <div class="photo-preview-grid" id="photoPreview">
                            <div class="photo-add-btn" onclick="RunlogModule.selectPhotos()">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>사진 추가</span>
                            </div>
                        </div>
                        <input type="file" id="photoInput" accept="image/*" multiple style="display: none;">
                    </div>
                </div>
            `;
        }
        
        // 사진 업로드 이벤트 등록
        this.setupPhotoUpload();
    },
    
    /**
     * 폼 핸들러 설정
     */
    setupFormHandlers: function() {
        const form = document.getElementById('runlogForm');
        
        if (!form) return;
        
        // 기존 이벤트 제거 후 새로 등록
        EventManager.add(form, 'submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        }, 'runlog-form-submit');
    },
    
    /**
     * 사진 선택
     */
    selectPhotos: function() {
        const input = document.getElementById('photoInput');
        if (input) {
            input.click();
        }
    },
    
    /**
     * 사진 업로드 설정
     */
    setupPhotoUpload: function() {
        const input = document.getElementById('photoInput');
        const preview = document.getElementById('photoPreview');
        
        if (!input || !preview) return;
        
        EventManager.add(input, 'change', async (e) => {
            const files = Array.from(e.target.files);
            
            // 3장 제한
            const remainingSlots = 3 - this.currentPhotos.length;
            
            if (remainingSlots <= 0) {
                Helpers.showToast('사진은 최대 3장까지 등록 가능합니다');
                e.target.value = '';
                return;
            }
            
            const filesToAdd = files.slice(0, remainingSlots);
            
            Helpers.showToast('사진 압축 중...');
            
            // 이미지 압축
            for (const file of filesToAdd) {
                try {
                    const compressed = await ImageCompressor.compress(file, 1200, 0.8);
                    this.currentPhotos.push(compressed);
                    this.addPhotoPreview(compressed);
                } catch (error) {
                    console.error('❌ 이미지 압축 오류:', error);
                    Helpers.showToast('이미지 처리 중 오류가 발생했습니다');
                }
            }
            
            e.target.value = '';
            
            // 3장이면 추가 버튼 숨김
            if (this.currentPhotos.length >= 3) {
                const addBtn = preview.querySelector('.photo-add-btn');
                if (addBtn) {
                    addBtn.style.display = 'none';
                }
            }
        }, 'photo-upload');
    },
    
    /**
     * 사진 미리보기 추가
     */
    addPhotoPreview: function(imageData) {
        const preview = document.getElementById('photoPreview');
        
        if (!preview) return;
        
        const div = document.createElement('div');
        div.className = 'photo-preview-item';
        div.innerHTML = `
            <img src="${imageData}">
            <button type="button" class="photo-remove-btn" onclick="RunlogModule.removePhoto(${this.currentPhotos.length - 1})">×</button>
        `;
        
        const addBtn = preview.querySelector('.photo-add-btn');
        preview.insertBefore(div, addBtn);
    },
    
    /**
     * 사진 제거
     */
    removePhoto: function(index) {
        this.currentPhotos.splice(index, 1);
        
        // 미리보기 다시 그리기
        const preview = document.getElementById('photoPreview');
        
        if (!preview) return;
        
        // 기존 미리보기 제거
        preview.querySelectorAll('.photo-preview-item').forEach(item => item.remove());
        
        // 다시 추가
        this.currentPhotos.forEach(photo => {
            this.addPhotoPreview(photo);
        });
        
        // 추가 버튼 다시 표시
        const addBtn = preview.querySelector('.photo-add-btn');
        if (addBtn && this.currentPhotos.length < 3) {
            addBtn.style.display = 'flex';
        }
    },
    
    /**
     * 폼 제출 처리
     */
    handleSubmit: async function() {
        const activeBtn = document.querySelector('.record-type-btn.active');
        const type = activeBtn.textContent.includes('대회') ? 'competition' : 'special';
        
        if (type === 'competition') {
            await this.saveCompetition();
        } else {
            await this.saveSpecialRun();
        }
    },
    
    /**
     * 대회 기록 저장
     */
    saveCompetition: async function() {
        try {
            const country = document.getElementById('comp-country').value;
            const name = document.getElementById('comp-name').value;
            const distance = document.getElementById('comp-distance').value;
            const hours = document.getElementById('comp-hours').value || '0';
            const minutes = document.getElementById('comp-minutes').value;
            const seconds = document.getElementById('comp-seconds').value;
            const date = document.getElementById('comp-date').value;
            const memo = document.getElementById('comp-memo').value;
            
            // 시간 문자열 생성
            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            const data = {
                country,
                name,
                distance,
                time: timeString,
                timeString,
                date,
                memo,
                photos: this.currentPhotos
            };
            
            Helpers.showToast('저장 중...');
            
            await DataService.saveCompetition(data);
            
            Helpers.showToast('대회 기록이 저장되었습니다! ✅');
            
            this.closeRunlogModal();
            
            // 런로그 페이지로 이동
            if (window.PageManager) {
                PageManager.switchPage('runlog');
            }
            
            await this.loadRunlogs();
            
        } catch (error) {
            console.error('❌ 대회 기록 저장 오류:', error);
            Helpers.showToast('저장에 실패했습니다');
        }
    },
    
    /**
     * 특별한 러닝 저장
     */
    saveSpecialRun: async function() {
        try {
            const location = document.getElementById('special-location').value;
            const withPerson = document.getElementById('special-with').value;
            const distance = document.getElementById('special-distance').value;
            const hours = document.getElementById('special-hours').value || '0';
            const minutes = document.getElementById('special-minutes').value;
            const seconds = document.getElementById('special-seconds').value;
            const date = document.getElementById('special-date').value;
            const memo = document.getElementById('special-memo').value;
            
            // 시간 문자열 생성
            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            const data = {
                location,
                with: withPerson,
                distance,
                time: timeString,
                timeString,
                date,
                memo,
                photos: this.currentPhotos
            };
            
            Helpers.showToast('저장 중...');
            
            await DataService.saveSpecialRun(data);
            
            Helpers.showToast('특별한 러닝이 저장되었습니다! ✅');
            
            this.closeRunlogModal();
            
            // 런로그 페이지로 이동
            if (window.PageManager) {
                PageManager.switchPage('runlog');
            }
            
            await this.loadRunlogs();
            
        } catch (error) {
            console.error('❌ 특별한 러닝 저장 오류:', error);
            Helpers.showToast('저장에 실패했습니다');
        }
    },
    
    /**
     * 런로그 모달 닫기
     */
    closeRunlogModal: function() {
        const modal = document.getElementById('writeModalRunlog');
        
        if (modal) {
            modal.style.display = 'none';
            modal.innerHTML = '';
        }
        
        // 사진 초기화
        this.currentPhotos = [];
    }
};

// 전역으로 사용 가능하도록
window.RunlogModule = RunlogModule;
