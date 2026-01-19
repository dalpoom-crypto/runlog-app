/**
 * Data Service
 * 
 * Firestore 데이터 접근을 통합 관리
 * 모든 DB 작업은 이 서비스를 통해서만 수행
 */

const DataService = {
    /**
     * 현재 로그인한 사용자
     */
    getCurrentUser: function() {
        return firebase.auth().currentUser;
    },
    
    // ==================== 사용자 데이터 ====================
    
    /**
     * 사용자 프로필 가져오기
     */
    getUserProfile: async function(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            
            return null;
        } catch (error) {
            console.error('❌ 사용자 프로필 로드 오류:', error);
            throw error;
        }
    },
    
    /**
     * 사용자 프로필 업데이트
     */
    updateUserProfile: async function(userId, data) {
        try {
            await db.collection('users').doc(userId).update(data);
            console.log('✅ 사용자 프로필 업데이트 완료');
            return true;
        } catch (error) {
            console.error('❌ 사용자 프로필 업데이트 오류:', error);
            throw error;
        }
    },
    
    // ==================== 런로그 - 대회 기록 ====================
    
    /**
     * 대회 기록 가져오기
     */
    getCompetitions: async function(userId) {
        try {
            const snapshot = await db.collection('competitions')
                .where('userId', '==', userId)
                .get();
            
            const competitions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // 클라이언트에서 정렬 (최신순)
            competitions.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            });
            
            console.log(`📊 대회 기록 ${competitions.length}개 로드됨`);
            
            return competitions;
        } catch (error) {
            console.error('❌ 대회 기록 로드 오류:', error);
            return [];
        }
    },
    
    /**
     * 대회 기록 저장
     */
    saveCompetition: async function(data) {
        try {
            const currentUser = this.getCurrentUser();
            
            if (!currentUser) {
                throw new Error('로그인이 필요합니다');
            }
            
            const record = {
                userId: currentUser.uid,
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('competitions').add(record);
            
            console.log('✅ 대회 기록 저장 완료:', docRef.id);
            
            return {
                id: docRef.id,
                ...record
            };
        } catch (error) {
            console.error('❌ 대회 기록 저장 오류:', error);
            throw error;
        }
    },
    
    /**
     * 대회 기록 삭제
     */
    deleteCompetition: async function(id) {
        try {
            await db.collection('competitions').doc(id).delete();
            console.log('✅ 대회 기록 삭제 완료:', id);
            return true;
        } catch (error) {
            console.error('❌ 대회 기록 삭제 오류:', error);
            throw error;
        }
    },
    
    // ==================== 런로그 - 특별한 러닝 ====================
    
    /**
     * 특별한 러닝 가져오기
     */
    getSpecialRuns: async function(userId) {
        try {
            const snapshot = await db.collection('specialRuns')
                .where('userId', '==', userId)
                .get();
            
            const specialRuns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // 클라이언트에서 정렬 (최신순)
            specialRuns.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.toMillis() - a.createdAt.toMillis();
            });
            
            console.log(`📊 특별한 러닝 ${specialRuns.length}개 로드됨`);
            
            return specialRuns;
        } catch (error) {
            console.error('❌ 특별한 러닝 로드 오류:', error);
            return [];
        }
    },
    
    /**
     * 특별한 러닝 저장
     */
    saveSpecialRun: async function(data) {
        try {
            const currentUser = this.getCurrentUser();
            
            if (!currentUser) {
                throw new Error('로그인이 필요합니다');
            }
            
            const record = {
                userId: currentUser.uid,
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('specialRuns').add(record);
            
            console.log('✅ 특별한 러닝 저장 완료:', docRef.id);
            
            return {
                id: docRef.id,
                ...record
            };
        } catch (error) {
            console.error('❌ 특별한 러닝 저장 오류:', error);
            throw error;
        }
    },
    
    /**
     * 특별한 러닝 삭제
     */
    deleteSpecialRun: async function(id) {
        try {
            await db.collection('specialRuns').doc(id).delete();
            console.log('✅ 특별한 러닝 삭제 완료:', id);
            return true;
        } catch (error) {
            console.error('❌ 특별한 러닝 삭제 오류:', error);
            throw error;
        }
    },
    
    // ==================== 커뮤니티 (나중에 구현) ====================
    
    /**
     * 커뮤니티 게시글 가져오기 (더미)
     */
    getCommunityPosts: async function() {
        // TODO: 나중에 구현
        return [];
    },
    
    /**
     * 커뮤니티 게시글 저장 (더미)
     */
    saveCommunityPost: async function(data) {
        // TODO: 나중에 구현
        console.log('커뮤니티 글쓰기 - 구현 예정');
        return null;
    }
};
