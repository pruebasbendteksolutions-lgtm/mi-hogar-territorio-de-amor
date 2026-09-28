import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC4geGsgRNSi4IQx24VlSa1z5mtkse8Z5w",
  authDomain: "mi-hogar-territorio-de-amor.firebaseapp.com",
  projectId: "mi-hogar-territorio-de-amor",
  storageBucket: "mi-hogar-territorio-de-amor.firebasestorage.app",
  messagingSenderId: "35650712463",
  appId: "1:35650712463:web:fd57471b90fcbddf4291fa"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);