const PageManager = {
    init: function() {
        console.log('🚀 시작');
        
        // 인증 체크 완전 제거
        this.setupApp();
    },
    
    setupApp: function() {
        console.log('📱 앱 설정');
        this.setupNavigation();
    },
    
    setupNavigation: function() {
        console.log('🔽 하단 메뉴 설정');
        
        const navButtons = document.querySelectorAll('.nav-item-v2:not(.nav-add-v2)');
        
        navButtons.forEach(button => {
            const page = button.getAttribute('data-page');
            
            if (page) {
                button.addEventListener('click', () => {
                    console.log('클릭:', page);
                    this.switchPage(page);
                });
            }
        });
    },
    
    switchPage: function(pageName) {
        console.log('페이지 전환:', pageName);
        
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(p => p.classList.remove('active'));
        
        const target = document.getElementById(pageName + 'Page');
        if (target) target.classList.add('active');
        
        const navs = document.querySelectorAll('.nav-item-v2');
        navs.forEach(n => n.classList.remove('active'));
        
        const activeNav = document.querySelector(`.nav-item-v2[data-page="${pageName}"]`);
        if (activeNav) activeNav.classList.add('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PageManager.init();
});
