// Importação dos módulos necessários do Firebase (Versão Modular 9.6.10)
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

// Variáveis de Controle
let isLogin = true;
const ADMIN_EMAIL = "eliasfabisantos@gmail.com";
let todosProdutos = [];

// --- SISTEMA DE AUTENTICAÇÃO ---

// Alternar entre Login e Cadastro
window.toggleAuth = () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Bem-vindo" : "Criar Conta";
    document.getElementById('btn-auth').innerText = isLogin ? "Entrar" : "Cadastrar Agora";
};

// Ação de Entrar ou Cadastrar
window.authAction = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if (!email || !pass) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
            alert("Conta criada com sucesso! Bem-vindo.");
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        let mensagem = "Erro ao processar. Verifique os dados.";
        if (error.code === 'auth/wrong-password') mensagem = "Senha incorreta.";
        if (error.code === 'auth/user-not-found') mensagem = "E-mail não cadastrado.";
        if (error.code === 'auth/email-already-in-use') mensagem = "Este e-mail já está em uso.";
        alert(mensagem);
    }
};

// Observador: Detecta se o usuário logou ou saiu
onAuthStateChanged(auth, (user) => {
    const authBox = document.getElementById('auth-container');
    const appBox = document.getElementById('app-container');
    
    if (user) {
        authBox.style.display = 'none';
        appBox.style.display = 'block';
        document.getElementById('user-email-tag').innerText = user.email;

        // Se for você, mostra o painel de controle
        if (user.email === ADMIN_EMAIL) {
            document.getElementById('admin-panel').style.display = 'block';
            document.getElementById('admin-indicator').innerHTML = '<span class="badge-admin">ADMINISTRADOR</span>';
        } else {
            document.getElementById('admin-panel').style.display = 'none';
            document.getElementById('admin-indicator').innerHTML = '';
        }
        
        ouvirProdutos(); // Inicia a escuta do banco de dados
    } else {
        authBox.style.display = 'block';
        appBox.style.display = 'none';
    }
});

// --- GERENCIAMENTO DE CONTA ---
window.changePassword = () => {
    const newPass = document.getElementById('new-pass').value;
    if (newPass.length < 6) return alert("A senha deve ter pelo menos 6 caracteres.");
    
    updatePassword(auth.currentUser, newPass)
        .then(() => {
            alert("Senha atualizada com sucesso!");
            document.getElementById('new-pass').value = "";
        })
        .catch(e => alert("Erro ao atualizar (reloge para segurança): " + e.message));
};

// --- BANCO DE DADOS EM TEMPO REAL ---

function ouvirProdutos() {
    // Busca os produtos ordenados pelos mais recentes
    const q = query(collection(db, "produtos"), orderBy("criadoEm", "desc"));
    
    onSnapshot(q, (snapshot) => {
        todosProdutos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizar(); // Atualiza a tela sempre que o banco mudar
    });
}

window.renderizar = () => {
    const termoBusca = document.getElementById('search').value.toLowerCase();
    const lista = document.getElementById('product-list');
    lista.innerHTML = "";

    const filtrados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termoBusca));

    filtrados.forEach(p => {
        const souAdmin = auth.currentUser.email === ADMIN_EMAIL;
        lista.innerHTML += `
            <div class="product-item">
                <div>
                    <div style="font-weight:600; color:white">${p.nome}</div>
                    <div style="color:#10b981; font-size:14px">R$ ${p.preco}</div>
                </div>
                ${souAdmin ? `<button onclick="removerProduto('${p.id}')" style="width:auto; padding:6px 12px; background:rgba(239, 68, 68, 0.2); color:#ef4444; border: 1px solid #ef4444;">Excluir</button>` : ''}
            </div>
        `;
    });
};

// Adicionar Produto (Admin Only)
window.addProduct = async () => {
    const nome = document.getElementById('p-name').value;
    const preco = document.getElementById('p-price').value;
    
    if (nome && preco) {
        try {
            await addDoc(collection(db, "produtos"), {
                nome: nome,
                preco: preco,
                criadoEm: new Date()
            });
            document.getElementById('p-name').value = "";
            document.getElementById('p-price').value = "";
        } catch (e) {
            alert("Erro ao salvar no banco: " + e.message);
        }
    } else {
        alert("Preencha o nome e o preço!");
    }
};

// Remover Produto (Admin Only)
window.removerProduto = async (id) => {
    if (confirm("Tem certeza que deseja remover este produto?")) {
        try {
            await deleteDoc(doc(db, "produtos", id));
        } catch (e) {
            alert("Erro ao excluir: " + e.message);
        }
    }
};

window.logout = () => signOut(auth);