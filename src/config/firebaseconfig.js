// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsXEFcoqTOJ4ydxx04h5St4prItZWm3o8",
  authDomain: "gulftransportation-10441.firebaseapp.com",
  projectId: "gulftransportation-10441",
  storageBucket: "gulftransportation-10441.appspot.com",
  messagingSenderId: "222338551992",
  appId: "1:222338551992:web:f18843744adab4bcc0244d",
  measurementId: "G-1PQBTVWLBH"
};



const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
