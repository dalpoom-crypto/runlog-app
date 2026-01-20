/**
 * main.js - 페이지 관리자 & 초기화
 * v2.0.0-Hybrid
 */

const PageManager = {
    currentPage: 'home',

    /**
     * 앱 초기화
     */
    init: function() {
        console.log('🚀 PageManager 초기화');
        
        // Firebase Auth 상태 확인 (약간의 딜레이)
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
    },

    /**
     * 앱 설정
     */
    setupApp: function() {
        console.log('📱 앱 설정 시작');
        
        // 하단 네비게이션 설정
        this.setupNavigation();
        
        // + 버튼 설정
        this.setupAddButton();
        
        // 로그아웃 버튼 설정
        this.setupLogout();
        
        // 홈 페이지 로드
        this.loadPage('home');
        
        console.log('✅ 앱 설정 완료');
    },

    /**
     * 하단 네비게이션 설정
     */
    setupNavigation: function() {
        console.log('🔽 하단 메뉴 설정');
        
        const navButtons = document.querySelectorAll('.nav-item-v2:not(.nav-add-v2)');
        
        navButtons.forEach(button => {
            const page = button.getAttribute('data-page');
            
            if (page) {
                EventManager.add(button, 'click', () => {
                    console.log('🔘 하단 메뉴 클릭:', page);
                    this.switchPage(page);
                }, `nav-${page}`);
            }
        });
        
        console.log('✅ 하단 메뉴 설정 완료');
    },

    /**
     * 페이지 전환
     */
    switchPage: function(pageName) {
        console.log('📄 페이지 전환:', pageName);
        
        // 모든 페이지 숨기기
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(page => page.classList.remove('active'));
        
        // 선택된 페이지 표시
        const targetPage = document.getElementById(pageName + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 하단 메뉴 활성화 상태 변경
        const navButtons = document.querySelectorAll('.nav-item-v2');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeNav = document.querySelector(`.nav-item-v2[data-page="${pageName}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
        
        // 페이지별 초기화
        this.loadPage(pageName);
        
        this.currentPage = pageName;
    },

    /**
     * 페이지 로드
     */
    loadPage: function(pageName) {
        console.log('📂 페이지 로드:', pageName);
        
        switch(pageName) {
            case 'home':
                if (typeof HomeModule !== 'undefined') {
                    HomeModule.init();
                }
                break;
                
            case 'runlog':
                if (typeof RunlogModule !== 'undefined') {
                    RunlogModule.init();
                }
                break;
                
            case 'search':
                this.loadSearchPage();
                break;
                
            case 'community':
                this.loadCommunityPage();
                break;
        }
    },

    /**
     * 검색 페이지 로드 (더미)
     */
    loadSearchPage: function() {
        const container = document.getElementById('recommendedRunners');
        if (!container) return;
        
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #999;">
                <p>🔍 검색 기능은 준비중입니다</p>
            </div>
        `;
    },

    /**
     * 커뮤니티 페이지 로드 (더미)
     */
    loadCommunityPage: function() {
        const container = document.getElementById('communityFeed');
        if (!container) return;
        
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #999;">
                <p>👥 커뮤니티 기능은 준비중입니다</p>
            </div>
        `;
    },

    /**
     * + 버튼 설정
     */
    setupAddButton: function() {
        console.log('➕ + 버튼 설정');
        
        const addButton = document.querySelector('.nav-add-v2');
        
        if (addButton) {
            EventManager.add(addButton, 'click', () => {
                console.log('➕ + 버튼 클릭');
                this.showAddMenu();
            }, 'add-button');
        }
