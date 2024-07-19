// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6xnX0xOZRFUptTUnmkqEJI5fDUs3w0Vw",
  authDomain: "stock-f18f3.firebaseapp.com",
  projectId: "stock-f18f3",
  storageBucket: "stock-f18f3.appspot.com",
  messagingSenderId: "371782672353",
  appId: "1:371782672353:web:b2951f32fac01e30d83ca0",
  measurementId: "G-WQTJRJVV8M"
};



const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
