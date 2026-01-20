import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// --- CONFIGURAÇÃO FIREBASE ---
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLogin = true;
let products = [];
const ADMIN_EMAIL = "eliasfabisantos@gmail.com";

// --- SISTEMA DE AUTENTICAÇÃO ---
window.toggleAuth = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Bem-vindo" : "Criar Conta";
    document.getElementById('btn-auth').innerText = isLogin ? "Entrar" : "Cadastrar Agora";
};

window.authAction = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(isLogin) {
        signInWithEmailAndPassword(auth, email, pass).catch(err => alert("Acesso negado: " + err.message));
    } else {
        createUserWithEmailAndPassword(auth, email, pass).catch(err => alert("Erro ao criar: " + err.message));
    }
};

onAuthStateChanged(auth, (user) => {
    const authBox = document.getElementById('auth-container');
    const appBox = document.getElementById('app-container');
    
    if (user) {
        authBox.style.display = 'none';
        appBox.style.display = 'block';
        document.getElementById('user-email-tag').innerText = user.email;

        // Verificação de Admin
        if(user.email === ADMIN_EMAIL) {
            document.getElementById('admin-panel').style.display = 'block';
            document.getElementById('admin-indicator').innerHTML = '<span class="badge-admin">ADMINISTRADOR</span>';
        }
        
        loadProducts();
    } else {
        authBox.style.display = 'block';
        appBox.style.display = 'none';
    }
});

// --- GERENCIAMENTO DE CONTA ---
window.changePassword = () => {
    const newPass = document.getElementById('new-pass').value;
    updatePassword(auth.currentUser, newPass).then(() => alert("Senha atualizada!")).catch(e => alert(e.message));
};

// --- OPERAÇÕES DE PRODUTOS (Tempo Real) ---
function loadProducts() {
    onSnapshot(collection(db, "produtos"), (snapshot) => {
        products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        render();
    });
}

window.render = () => {
    const search = document.getElementById('search').value.toLowerCase();
    const list = document.getElementById('product-list');
    list.innerHTML = "";

    products.filter(p => p.nome.toLowerCase().includes(search)).forEach(p => {
        const canEdit = auth.currentUser.email === ADMIN_EMAIL;
        list.innerHTML += `
            <div class="product-item">
                <div>
                    <div style="font-weight:600">${p.nome}</div>
                    <div style="color:var(--accent); font-size:14px">${p.preco}</div>
                </div>
                ${canEdit ? `<button onclick="removeProd('${p.id}')" style="width:auto; padding:5px 10px; background:#ef4444; font-size:11px">Excluir</button>` : ''}
            </div>
        `;
    });
};

window.addProduct = async () => {
    const nome = document.getElementById('p-name').value;
    const preco = document.getElementById('p-price').value;
    if(nome && preco) {
        await addDoc(collection(db, "produtos"), { nome, preco, criadoEm: new Date() });
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
    }
};

window.removeProd = async (id) => {
    if(confirm("Remover este produto permanentemente?")) await deleteDoc(doc(db, "produtos", id));
};

window.logout = () => signOut(auth);