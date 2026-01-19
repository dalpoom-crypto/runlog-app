/**
 * Home Module
 * 
 * 홈 화면 관련 기능
 * - BEST 게시글 표시 (더미 데이터)
 * - 추천 러너 표시 (더미 데이터)
 */

const HomeModule = {
    /**
     * 모듈 초기화
     */
    init: function() {
        console.log('🏠 HomeModule 초기화');
        this.loadHomePage();
    },
    
    /**
     * 홈 페이지 로드
     */
    loadHomePage: function() {
        this.loadBestPosts();
    },
    
    /**
     * BEST 게시글 로드 (더미 데이터)
     */
    loadBestPosts: function() {
        const container = document.getElementById('bestPosts');
        
        if (!container) return;
        
        // 더미 BEST 게시글
        const bestPosts = [
            {
                id: '1',
                category: 'race',
                username: '러너123',
                avatar: 'https://i.pravatar.cc/40?img=1',
                time: '2시간 전',
                title: '춘천 마라톤 완주 후기',
                hasPhotos: true,
                likes: 42,
                comments: 12
            },
            {
                id: '2',
                category: 'training',
                username: '달리기왕',
                avatar: 'https://i.pravatar.cc/40?img=2',
                time: '5시간 전',
                title: '인터벌 트레이닝 루틴 공유',
                hasPhotos: false,
                likes: 38,
                comments: 8
            },
            {
                id: '3',
                category: 'gear',
                username: '운동화덕후',
                avatar: 'https://i.pravatar.cc/40?img=3',
                time: '1일 전',
                title: '나이키 베이퍼플라이 후기',
                hasPhotos: true,
                likes: 56,
                comments: 15
            }
        ];
        
        container.innerHTML = bestPosts.map(post => this.createBestPostCard(post)).join('');
    },
    
    /**
     * BEST 게시글 카드 생성
     */
    createBestPostCard: function(post) {
        const categoryEmoji = {
            'race': '🏆',
            'training': '💪',
            'gear': '👟',
            'injury': '🏥',
            'story': '📖'
        };
        
        return `
            <div class="best-compact-item" onclick="HomeModule.showPostDetail('${post.id}')">
                <img src="${post.avatar}" class="best-compact-avatar">
                <div class="best-compact-content">
                    <div class="best-compact-header">
                        <span class="best-compact-badge">${categoryEmoji[post.category] || '📝'}</span>
                        <span class="best-compact-user">${post.username}</span>
                        <span class="best-compact-time">${post.time}</span>
                    </div>
                    <div class="best-compact-title">
                        ${post.title} ${post.hasPhotos ? '🖼️' : ''}
                    </div>
                    <div class="best-compact-stats">
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${post.comments}</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * 게시글 상세 보기 (임시)
     */
    showPostDetail: function(postId) {
        Helpers.showToast('상세 페이지는 추후 구현 예정입니다');
        console.log('게시글 상세:', postId);
    }
};

// 전역으로 사용 가능하도록
window.HomeModule = HomeModule;
