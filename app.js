// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqQS90gihFdXfG_ONbLvrR6N1b2AnP0yk",
  authDomain: "viajecitocr.firebaseapp.com",
  databaseURL: "https://viajecitocr-default-rtdb.firebaseio.com",
  projectId: "viajecitocr",
  storageBucket: "viajecitocr.firebasestorage.app",
  messagingSenderId: "679414504729",
  appId: "1:679414504729:web:27e6395493668a05213988",
  measurementId: "G-Y0SN20XVLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);