import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// SUAS CREDENCIAIS
const firebaseConfig = {
  apiKey: "AIzaSyByiAUMQ3I94RkRbjSDF_faBtJdTWfF6Ec",
  authDomain: "siteelievn.firebaseapp.com",
  projectId: "siteelievn",
  storageBucket: "siteelievn.firebasestorage.app",
  messagingSenderId: "444694913470",
  appId: "1:444694913470:web:6abc1d5efe4ea8ed8119ef",
  measurementId: "G-DYL3VDW9S2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "eliasfabisantos@gmail.com";
let isLogin = true;
let listaProdutos = [];

// --- AUTENTICAÇÃO ---
window.toggleAuth = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Night Gamers Login" : "Criar Nova Conta";
    document.getElementById('btn-auth').innerText = isLogin ? "Entrar" : "Cadastrar";
};

window.authAction = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    if(!email || !pass) return alert("Preencha tudo!");

    try {
        if(isLogin) await signInWithEmailAndPassword(auth, email, pass);
        else {
            await createUserWithEmailAndPassword(auth, email, pass);
            alert("Bem-vindo à Night Gamers!");
        }
    } catch (e) { alert("Erro: " + e.message); }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-email-tag').innerText = user.email;

        if(user.email === ADMIN_EMAIL) {
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('admin-indicator').innerHTML = '<span style="background:#10b981; padding:2px 8px; border-radius:10px; font-size:10px; color:#000; font-weight:bold">ADMIN</span>';
        } else {
            document.getElementById('admin-panel').classList.add('hidden');
        }
        carregarProdutos();
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
});

// --- SISTEMA DE PRODUTOS ---
function carregarProdutos() {
    const q = query(collection(db, "produtos"), orderBy("criadoEm", "desc"));
    onSnapshot(q, (snap) => {
        listaProdutos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderizarLista();
    });
}

window.renderizarLista = () => {
    const termo = document.getElementById('search').value.toLowerCase();
    const container = document.getElementById('product-list');
    container.innerHTML = "";

    listaProdutos.filter(p => p.nome.toLowerCase().includes(termo)).forEach(p => {
        const isAdmin = auth.currentUser.email === ADMIN_EMAIL;
        container.innerHTML += `
            <div class="product-item">
                <div onclick="abrirProduto('${p.id}')" style="cursor:pointer; flex-grow:1">
                    <div style="font-weight:bold; font-size:1.1rem">${p.nome}</div>
                    <div style="color:#10b981">R$ ${p.preco}</div>
                </div>
                <div style="display:flex; gap:10px; align-items:center">
                    <button onclick="abrirProduto('${p.id}')" style="width:auto; font-size:12px; padding:6px 12px;">Ver</button>
                    ${isAdmin ? `<button onclick="remover('${p.id}')" style="width:auto; background:rgba(255,0,0,0.2); color:red; font-size:12px; padding:6px 10px;">🗑️</button>` : ''}
                </div>
            </div>`;
    });
};

// --- FUNÇÃO DE ABRIR PÁGINA DO PRODUTO (MODAL) ---
window.abrirProduto = (id) => {
    const produto = listaProdutos.find(p => p.id === id);
    const modal = document.getElementById('product-page');
    const conteudo = document.getElementById('detail-content');

    // Mude o número abaixo para o seu WhatsApp (Ex: 5511999999999)
    const telefone = "5511999999999"; 
    const msg = `Olá! Vi o produto *${produto.nome}* no site por R$ ${produto.preco} e tenho interesse.`;

    conteudo.innerHTML = `
        <h1 style="color:var(--primary); margin-bottom:5px">${produto.nome}</h1>
        <h2 style="color:#10b981; margin-bottom:20px">R$ ${produto.preco}</h2>
        
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:10px; margin-bottom:20px; line-height:1.6; color:#ddd">
            <strong>Descrição:</strong><br>
            ${produto.descricao ? produto.descricao.replace(/\n/g, '<br>') : 'Sem descrição.'}
        </div>

        <a href="https://wa.me/${telefone}?text=${encodeURIComponent(msg)}" target="_blank" class="buy-btn">
            COMPRAR VIA WHATSAPP 💬
        </a>
    `;
    modal.classList.remove('hidden');
};

window.fecharProduto = () => {
    document.getElementById('product-page').classList.add('hidden');
};

// --- FUNÇÕES ADMIN ---
window.addProduct = async () => {
    const nome = document.getElementById('p-name').value;
    const preco = document.getElementById('p-price').value;
    const desc = document.getElementById('p-desc').value;

    if(nome && preco) {
        await addDoc(collection(db, "produtos"), {
            nome, preco, descricao: desc, criadoEm: new Date()
        });
        document.getElementById('p-name').value = "";
        document.getElementById('p-price').value = "";
        document.getElementById('p-desc').value = "";
    }
};

window.remover = async (id) => {
    if(confirm("Excluir este item permanentemente?")) await deleteDoc(doc(db, "produtos", id));
};

// --- SETTINGS ---
window.changePassword = () => {
    const nova = document.getElementById('new-pass').value;
    if(nova.length >= 6) updatePassword(auth.currentUser, nova).then(()=>alert("Senha trocada!")).catch(e=>alert(e.message));
};

window.logout = () => signOut(auth);