/**
 * Event Manager
 * 
 * 이벤트 리스너 중복 등록 방지 및 메모리 누수 방지
 */

const EventManager = {
    // 등록된 이벤트 저장
    listeners: new Map(),
    
    /**
     * 이벤트 리스너 추가
     * 
     * @param {Element} element - DOM 요소
     * @param {string} eventType - 이벤트 타입 (click, input 등)
     * @param {Function} handler - 핸들러 함수
     * @param {string} id - 고유 식별자 (선택)
     */
    add: function(element, eventType, handler, id = null) {
        if (!element) {
            console.warn('EventManager: element가 없습니다');
            return;
        }
        
        // 고유 키 생성
        const key = id || `${element.id || element.className}-${eventType}`;
        
        // 기존 이벤트 제거
        this.remove(key);
        
        // 새 이벤트 등록
        element.addEventListener(eventType, handler);
        
        // 저장
        this.listeners.set(key, {
            element,
            eventType,
            handler
        });
        
        console.log(`✅ 이벤트 등록: ${key}`);
    },
    
    /**
     * 이벤트 리스너 제거
     * 
     * @param {string} key - 이벤트 키
     */
    remove: function(key) {
        const listener = this.listeners.get(key);
        
        if (listener) {
            listener.element.removeEventListener(listener.eventType, listener.handler);
            this.listeners.delete(key);
            console.log(`🗑️ 이벤트 제거: ${key}`);
        }
    },
    
    /**
     * 모든 이벤트 제거
     */
    removeAll: function() {
        this.listeners.forEach((listener, key) => {
            listener.element.removeEventListener(listener.eventType, listener.handler);
        });
        this.listeners.clear();
        console.log('🗑️ 모든 이벤트 제거됨');
    },
    
    /**
     * 특정 요소의 모든 이벤트 제거
     * 
     * @param {Element} element - DOM 요소
     */
    removeByElement: function(element) {
        const keysToRemove = [];
        
        this.listeners.forEach((listener, key) => {
            if (listener.element === element) {
                listener.element.removeEventListener(listener.eventType, listener.handler);
                keysToRemove.push(key);
            }
        });
        
        keysToRemove.forEach(key => this.listeners.delete(key));
        
        if (keysToRemove.length > 0) {
            console.log(`🗑️ 요소의 이벤트 ${keysToRemove.length}개 제거됨`);
        }
    },
    
    /**
     * 등록된 이벤트 개수 확인
     */
    count: function() {
        return this.listeners.size;
    }
};
