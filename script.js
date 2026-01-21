import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// --- SUA CONFIGURAÇÃO OFICIAL ---
const firebaseConfig = {
  apiKey: "AIzaSyByiAUMQ3I94RkRbjSDF_faBtJdTWfF6Ec",
  authDomain: "siteelievn.firebaseapp.com",
  projectId: "siteelievn",
  storageBucket: "siteelievn.firebasestorage.app",
  messagingSenderId: "444694913470",
  appId: "1:444694913470:web:6abc1d5efe4ea8ed8119ef",
  measurementId: "G-DYL3VDW9S2"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "eliasfabisantos@gmail.com";
let isLogin = true;
let produtosLocal = [];

/* --- CONTROLE DE TELA (LOGIN / APP) --- */

window.toggleAuth = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Night Gamers | Login" : "Criar Nova Conta";
    document.getElementById('btn-auth').innerText = isLogin ? "Entrar" : "Cadastrar";
};

window.authAction = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;

    if(!email || !pass) return alert("Preencha os campos!");

    try {
        if(isLogin) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
            alert("Conta criada com sucesso!");
        }
    } catch (e) {
        alert("Erro: " + e.message);
    }
};

onAuthStateChanged(auth, (user) => {
    const authBox = document.getElementById('auth-container');
    const appBox = document.getElementById('app-container');

    if (user) {
        authBox.style.display = 'none';
        appBox.style.display = 'block';
        document.getElementById('user-email-tag').innerText = user.email;

        // Se for o Elias, libera o painel
        if(user.email === ADMIN_EMAIL) {
            document.getElementById('admin-panel').style.display = 'block';
            document.getElementById('admin-indicator').innerHTML = '<span class="badge-admin">DONO</span>';
        } else {
            document.getElementById('admin-panel').style.display = 'none';
        }
        ouvirProdutos();
    } else {
        authBox.style.display = 'block';
        appBox.style.display = 'none';
    }
});

/* --- GERENCIAMENTO DE PRODUTOS --- */

function ouvirProdutos() {
    const q = query(collection(db, "produtos"), orderBy("criadoEm", "desc"));
    onSnapshot(q, (snapshot) => {
        produtosLocal = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        render();
    });
}

window.render = () => {
    const busca = document.getElementById('search').value.toLowerCase();
    const lista = document.getElementById('product-list');
    lista.innerHTML = "";

    produtosLocal.filter(p => p.nome.toLowerCase().includes(busca)).forEach(p => {
        const isAdmin = auth.currentUser.email === ADMIN_EMAIL;
        lista.innerHTML += `
            <div class="product-item">
                <div>
                    <div style="font-weight:bold">${p.nome}</div>
                    <div style="color:#10b981">R$ ${p.preco}</div>
                </div>
                ${isAdmin ? `<button onclick="remover('${p.id}')" style="width:auto; background:red; padding:5px">X</button>` : ''}
            </div>`;
    });
};

window.addProduct = async () => {
    const nome = document.getElementById('p-name').value;
    const preco = document.getElementById('p-price').value;
    if(nome && preco) {
        await addDoc(collection(db, "produtos"), {
            nome, preco, criadoEm: new Date()
        });
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
    }
};

window.remover = async (id) => {
    if(confirm("Excluir item?")) await deleteDoc(doc(db, "produtos", id));
};

/* --- CONFIGURAÇÕES DE CONTA --- */
window.changePassword = () => {
    const nova = document.getElementById('new-pass').value;
    if(nova.length < 6) return alert("Mínimo 6 caracteres");
    updatePassword(auth.currentUser, nova).then(() => alert("Senha alterada!")).catch(e => alert("Erro: " + e.message));
};

window.logout = () => signOut(auth);