// firebase.js
// Esse arquivo é o CENTRO DE COMANDO. Ele conecta todos os outros ao Firebase.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// SUAS CREDENCIAIS REAIS
const firebaseConfig = {
  apiKey: "AIzaSyByiAUMQ3I94RkRbjSDF_faBtJdTWfF6Ec",
  authDomain: "siteelievn.firebaseapp.com",
  projectId: "siteelievn",
  storageBucket: "siteelievn.firebasestorage.app",
  messagingSenderId: "444694913470",
  appId: "1:444694913470:web:6abc1d5efe4ea8ed8119ef",
  measurementId: "G-DYL3VDW9S2"
};

// Inicializa e EXPORTA as ferramentas para os outros arquivos usarem
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_EMAIL = "eliasfabisantos@gmail.com";