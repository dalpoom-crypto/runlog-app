/**
 * Common Helper Functions
 * 
 * 앱 전체에서 사용하는 공통 함수들
 */

const Helpers = {
    /**
     * 토스트 메시지 표시
     */
    showToast: function(message, duration = 2000) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },
    
    /**
     * 로딩 상태 표시
     */
    showLoading: function() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    },
    
    /**
     * 로딩 상태 숨김
     */
    hideLoading: function() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    },
    
    /**
     * 시간 문자열을 초로 변환
     */
    timeToSeconds: function(hours, minutes, seconds) {
        return (parseInt(hours) || 0) * 3600 + 
               (parseInt(minutes) || 0) * 60 + 
               (parseInt(seconds) || 0);
    },
    
    /**
     * 초를 시간 문자열로 변환
     */
    secondsToTimeString: function(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
    
    /**
     * 날짜 포맷팅 (YYYY-MM-DD)
     */
    formatDate: function(date) {
        if (!date) return '';
        
        if (date.toDate) {
            // Firestore Timestamp
            date = date.toDate();
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },
    
    /**
     * 상대 시간 표시 (예: "2시간 전")
     */
    getRelativeTime: function(date) {
        if (!date) return '';
        
        if (date.toDate) {
            date = date.toDate();
        }
        
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // 초 단위
        
        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}일 전`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)}개월 전`;
        return `${Math.floor(diff / 31536000)}년 전`;
    },
    
    /**
     * 거리 포맷팅
     */
    formatDistance: function(distance) {
        if (!distance) return '';
        
        // "10km" 형식
        if (typeof distance === 'string' && distance.includes('km')) {
            return distance;
        }
        
        // 숫자면 km 추가
        return `${distance}km`;
    },
    
    /**
     * 안전한 HTML 이스케이프
     */
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * 디바운스 함수
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 전역으로 사용할 수 있도록
window.showToast = Helpers.showToast;
