// C:/Users/elias/Desktop/site html/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyByiAUMQ3I94RkRbjSDF_faBtJdTWfF6Ec",
  authDomain: "siteelievn.firebaseapp.com",
  projectId: "siteelievn",
  storageBucket: "siteelievn.firebasestorage.app",
  messagingSenderId: "444694913470",
  appId: "1:444694913470:web:6abc1d5efe4ea8ed8119ef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_EMAIL = "eliasfabisantos@gmail.com";