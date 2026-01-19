/**
 * Image Compression Utility
 * 
 * 이미지를 압축하여 Firestore 1MB 제한을 통과하도록 함
 */

const ImageCompressor = {
    /**
     * 이미지 압축
     * 
     * @param {File} file - 원본 이미지 파일
     * @param {number} maxWidth - 최대 너비 (기본: 1200px)
     * @param {number} quality - 압축 품질 0-1 (기본: 0.8)
     * @returns {Promise<string>} - Base64 압축된 이미지
     */
    compress: async function(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    try {
                        // Canvas 생성
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
                        
                        // 이미지 그리기
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // JPEG로 압축
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                        
                        console.log(`📸 이미지 압축 완료: ${Math.round(compressedDataUrl.length / 1024)}KB`);
                        
                        resolve(compressedDataUrl);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => {
                    reject(new Error('이미지 로드 실패'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('파일 읽기 실패'));
            };
            
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * 여러 이미지 압축
     * 
     * @param {FileList|Array} files - 이미지 파일 배열
     * @param {number} maxWidth - 최대 너비
     * @param {number} quality - 압축 품질
     * @returns {Promise<Array>} - 압축된 이미지 배열
     */
    compressMultiple: async function(files, maxWidth = 1200, quality = 0.8) {
        const filesArray = Array.from(files);
        const compressed = [];
        
        for (const file of filesArray) {
            try {
                const compressedImage = await this.compress(file, maxWidth, quality);
                compressed.push(compressedImage);
            } catch (error) {
                console.error('이미지 압축 오류:', error);
            }
        }
        
        return compressed;
    }
};
