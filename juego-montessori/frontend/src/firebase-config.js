import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA7piDOYCV85ocUkiaTzowwnGucpXinF0",
  authDomain: "colorin-colorado-0.firebaseapp.com",
  projectId: "colorin-colorado-0",
  storageBucket: "colorin-colorado-0.firebasestorage.app",
  messagingSenderId: "113531846885",
  appId: "1:113531846885:web:fb723656debf0d61b4540c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
