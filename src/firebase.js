// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCiTHVJZizHn9XDoSRemb_QUmkdBb0-204",
  authDomain: "grocery-app-tracker.firebaseapp.com",
  projectId: "grocery-app-tracker",
  storageBucket: "grocery-app-tracker.firebasestorage.app",
  messagingSenderId: "290368660810",
  appId: "1:290368660810:web:db1febf804bdb6f3388db3",
  measurementId: "G-CRXCG33ZL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only if supported (avoids errors in some environments)
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;
