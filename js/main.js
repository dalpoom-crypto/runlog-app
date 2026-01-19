/**
 * Main Script
 * 
 * 앱 초기화 및 페이지 전환 관리
 */

const PageManager = {
    currentPage: 'home',
    
    /**
     * 앱 초기화
     */
    init: function() {
        console.log('🚀 앱 초기화 시작');
        
        // 인증 상태 확인
        setTimeout(() => {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ 로그인된 사용자:', user.email);
                    this.setupApp();
                } else {
                    console.log('❌ 로그인 필요');
                    window.location.href = 'login.html';
                }
        });
    }, 500);
    
    /**
     * 앱 설정
     */
    setupApp: function() {
        // 하단 네비게이션 설정
        this.setupNavigation();
        
        // + 버튼 설정
        this.setupAddButton();
        
        // 모달 백그라운드 클릭 이벤트
        this.setupModalClose();
        
        // 로그아웃 버튼
        this.setupLogout();
        
        // 첫 페이지 로드
        this.loadPage(this.currentPage);
    },
    
    /**
     * 하단 네비게이션 설정
     */
    setupNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item-v2:not(.nav-add-v2)');
        
        navItems.forEach(item => {
            EventManager.add(item, 'click', () => {
                const page = item.dataset.page;
                if (page) {
                    this.switchPage(page);
                }
            }, `nav-${item.dataset.page}`);
        });
    },
    
    /**
     * + 버튼 설정
     */
    setupAddButton: function() {
        const addBtn = document.querySelector('.nav-add-v2');
        
        if (addBtn) {
            EventManager.add(addBtn, 'click', () => {
                this.showAddMenu();
            }, 'add-button');
        }
    },
    
    /**
     * 페이지 전환
     */
    switchPage: function(pageName) {
        console.log(`📄 페이지 전환: ${this.currentPage} → ${pageName}`);
        
        // 네비게이션 활성화 상태 변경
        document.querySelectorAll('.nav-item-v2').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`.nav-item-v2[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
        
        // 페이지 표시
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 페이지 로드
        this.currentPage = pageName;
        this.loadPage(pageName);
    },
    
    /**
     * 페이지 로드
     */
    loadPage: function(pageName) {
        switch (pageName) {
            case 'home':
                HomeModule.init();
                break;
                
            case 'search':
                this.loadSearchPage();
                break;
                
            case 'runlog':
                RunlogModule.init();
                break;
                
            case 'community':
                this.loadCommunityPage();
                break;
                
            default:
                console.warn('알 수 없는 페이지:', pageName);
        }
    },
    
    /**
     * 검색 페이지 로드 (더미)
     */
    loadSearchPage: function() {
        console.log('🔍 검색 페이지 (추후 구현)');
        
        const container = document.getElementById('recommendedRunners');
        
        if (!container) return;
        
        // 더미 추천 러너
        const runners = [
            {
                id: '1',
                nickname: '김러너',
                avatar: 'https://i.pravatar.cc/50?img=5',
                region: '서울 강남',
                crew: '런닝크루A',
                hasFullMarathon: true
            },
            {
                id: '2',
                nickname: '박달리기',
                avatar: 'https://i.pravatar.cc/50?img=6',
                region: '서울 송파',
                crew: '새벽러너스',
                hasFullMarathon: true
            },
            {
                id: '3',
                nickname: '이마라톤',
                avatar: 'https://i.pravatar.cc/50?img=7',
                region: '경기 성남',
                crew: '크루 없음',
                hasFullMarathon: false
            }
        ];
        
        container.innerHTML = runners.map(runner => `
            <div class="runner-card">
                <img src="${runner.avatar}" class="runner-avatar">
                <div class="runner-info">
                    <div class="runner-name">${runner.nickname}</div>
                    <div class="runner-details">
                        <span>📍 ${runner.region}</span>
                        ${runner.hasFullMarathon ? '<span>🏃 풀코스</span>' : ''}
                    </div>
                    <div class="runner-crew">${runner.crew}</div>
                </div>
            </div>
        `).join('');
    },
    
    /**
     * 커뮤니티 페이지 로드 (더미)
     */
    loadCommunityPage: function() {
        console.log('👥 커뮤니티 페이지 (추후 구현)');
        
        const container = document.getElementById('communityFeed');
        
        if (!container) return;
        
        // 더미 커뮤니티 피드
        const posts = [
            {
                id: '1',
                category: 'race',
                username: '러너A',
                avatar: 'https://i.pravatar.cc/40?img=8',
                time: '1시간 전',
                title: '서울 마라톤 참가 후기',
                preview: '날씨도 좋고 정말 즐거웠어요!',
                likes: 15,
                comments: 5
            },
            {
                id: '2',
                category: 'training',
                username: '러너B',
                avatar: 'https://i.pravatar.cc/40?img=9',
                time: '3시간 전',
                title: '5km 페이스 향상 팁',
                preview: '인터벌 트레이닝을 시작한 후...',
                likes: 22,
                comments: 8
            }
        ];
        
        container.innerHTML = posts.map(post => `
            <div class="feed-item" onclick="HomeModule.showPostDetail('${post.id}')">
                <div class="feed-header">
                    <img src="${post.avatar}" class="feed-avatar">
                    <div class="feed-user-info">
                        <span class="feed-username">${post.username}</span>
                        <span class="feed-time">${post.time}</span>
                    </div>
                </div>
                <div class="feed-content">
                    <div class="feed-badge">${post.category === 'race' ? '🏆' : '💪'}</div>
                    <div class="feed-item-title">${post.title}</div>
                    <div class="feed-preview">${post.preview}</div>
                </div>
                <div class="feed-stats">
                    <span>❤️ ${post.likes}</span>
                    <span>💬 ${post.comments}</span>
                </div>
            </div>
        `).join('');
    },
    
    /**
     * + 버튼 메뉴 표시
     */
    showAddMenu: function() {
        const menu = document.getElementById('addMenu');
        
        if (!menu) return;
        
        menu.innerHTML = `
            <div class="add-menu-content">
                <button class="add-menu-item" onclick="PageManager.openRunlogModal('competition')">
                    <span class="add-menu-icon">🏆</span>
                    <span>대회 기록</span>
                </button>
                <button class="add-menu-item" onclick="PageManager.openRunlogModal('special')">
                    <span class="add-menu-icon">⭐</span>
                    <span>특별한 러닝</span>
                </button>
                <button class="add-menu-item" onclick="PageManager.openCommunityPost()">
                    <span class="add-menu-icon">✍️</span>
                    <span>게시글 작성</span>
                </button>
            </div>
        `;
        
        menu.style.display = 'block';
        
        // 백그라운드 클릭 시 닫기
        setTimeout(() => {
            EventManager.add(document, 'click', (e) => {
                if (!menu.contains(e.target) && !e.target.closest('.nav-add-v2')) {
                    this.closeAddMenu();
                }
            }, 'add-menu-close');
        }, 100);
    },
    
    /**
     * + 버튼 메뉴 닫기
     */
    closeAddMenu: function() {
        const menu = document.getElementById('addMenu');
        
        if (menu) {
            menu.style.display = 'none';
            menu.innerHTML = '';
        }
        
        EventManager.remove('add-menu-close');
    },
    
    /**
     * 런로그 모달 열기
     */
    openRunlogModal: function(type) {
        this.closeAddMenu();
        RunlogModule.openRunlogModal(type);
    },
    
    /**
     * 커뮤니티 글쓰기 (임시)
     */
    openCommunityPost: function() {
        this.closeAddMenu();
        Helpers.showToast('커뮤니티 글쓰기는 추후 구현 예정입니다');
    },
    
    /**
     * 모달 백그라운드 클릭 닫기
     */
    setupModalClose: function() {
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    },
    
    /**
     * 로그아웃 설정
     */
    setupLogout: function() {
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (logoutBtn) {
            EventManager.add(logoutBtn, 'click', async () => {
                try {
                    await firebase.auth().signOut();
                    console.log('✅ 로그아웃 완료');
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('❌ 로그아웃 오류:', error);
                    Helpers.showToast('로그아웃에 실패했습니다');
                }
            }, 'logout-button');
        }
    }
};

// 전역으로 사용 가능하도록
window.PageManager = PageManager;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    PageManager.init();
});
