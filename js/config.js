/**
 * Firebase Configuration
 * 
 * Firebase 프로젝트 설정 및 초기화
 */

const firebaseConfig = {
    apiKey: "AIzaSyDSohws5ke01co3dd3vndrLXEanv4Ma7r4",
    authDomain: "runlog-app-e8c5b.firebaseapp.com",
    projectId: "runlog-app-e8c5b",
    storageBucket: "runlog-app-e8c5b.firebasestorage.app",
    messagingSenderId: "143684848256",
    appId: "1:143684848256:web:b87e08b8b7eb55aecee12f"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스
const db = firebase.firestore();

// Auth 인스턴스
const auth = firebase.auth();

console.log('✅ Firebase initialized');
