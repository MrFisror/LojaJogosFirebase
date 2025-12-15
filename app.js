// --- VARIÁVEIS GLOBAIS ---
const formJogo = document.getElementById('formJogo');
const painelAdmin = document.getElementById('painelAdmin');
const btnSalvar = formJogo.querySelector('button[type="submit"]');

let idEdicao = null;
let carrinho = []; 
const ADMIN_EMAIL = 'admin@loja.com'; 

// ==========================================
// 1. SISTEMA DE AUTH
// ==========================================

function iniciarAuth() {
    window.onAuthStateChanged(window.auth, (user) => {
        const btnLoginUI = document.getElementById('btnLoginUI');
        const btnLogoutUI = document.getElementById('btnLogoutUI');
        const statusUsuario = document.getElementById('statusUsuario');
        
        document.body.classList.remove('modo-admin');
        painelAdmin.classList.add('d-none'); 

        if (user) {
            btnLoginUI.classList.add('d-none');
            btnLogoutUI.classList.remove('d-none');
            
            if (user.email === ADMIN_EMAIL) {
                painelAdmin.classList.remove('d-none');
                document.body.classList.add('modo-admin');
                statusUsuario.innerHTML = `<i class="bi bi-shield-lock-fill text-primary"></i> Olá, <strong>Admin</strong>`;
            } else {
                statusUsuario.innerHTML = `<i class="bi bi-person-fill text-success"></i> Olá, <strong>Cliente</strong>`;
            }
        } else {
            btnLoginUI.classList.remove('d-none');
            btnLogoutUI.classList.add('d-none');
            statusUsuario.innerHTML = `<i class="bi bi-circle-fill text-secondary small"></i> Visitante`;
        }
    });
}

document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('senhaLogin').value;
    try {
        await window.signInWithEmailAndPassword(window.auth, email, pass);
        bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
        alert("Login realizado!");
    } catch (erro) {
        alert("Erro no login: " + erro.message);
    }
});

document.getElementById('btnCriarConta').addEventListener('click', async () => {
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('senhaLogin').value;
    if(pass.length < 6) return alert("Senha mínima: 6 dígitos");
    try {
        await window.createUserWithEmailAndPassword(window.auth, email, pass);
        bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
        alert("Conta criada!");
    } catch (erro) { alert("Erro: " + erro.message); }
});

document.getElementById('btnLogoutUI').addEventListener('click', async () => {
    if(confirm("Sair do sistema?")) await window.signOut(window.auth);
});

// ==========================================
// 2. CRUD E LISTAGEM
// ==========================================

formJogo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('titulo').value;
    const preco = parseFloat(document.getElementById('preco').value);
    const genero = document.getElementById('genero').value;

    try {
        if (idEdicao == null) {
            await window.addDoc(window.collection(window.db, "jogos"), { titulo, preco, genero });
            alert("Jogo salvo!");
        } else {
            const jogoRef = window.doc(window.db, "jogos", idEdicao);
            await window.updateDoc(jogoRef, { titulo, preco, genero });
            alert("Jogo atualizado!");
            cancelarEdicao();
        }
        formJogo.reset();
        carregarJogos();
    } catch (erro) { console.error(erro); alert("Erro ao salvar."); }
});

async function carregarJogos(ordenarPor = null) {
    const listaJogos = document.getElementById('listaJogos');
    
    listaJogos.innerHTML = `
        <div class="col-12 text-center my-5 text-muted">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 small">Carregando catálogo...</p>
        </div>`;

    try {
        let q;
        const colecaoRef = window.collection(window.db, "jogos");

        if (ordenarPor) {
            q = window.query(colecaoRef, window.orderBy(ordenarPor, "asc"));
        } else {
            q = colecaoRef;
        }

        const querySnapshot = await window.getDocs(q);
        listaJogos.innerHTML = '';

        if(querySnapshot.empty) {
            listaJogos.innerHTML = '<div class="col-12 text-center text-muted">Nenhum jogo encontrado.</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const jogo = doc.data();
            const id = doc.id;
            
            const html = `
                <div class="col-md-4 mb-4">
                    <div class="card card-jogo h-100 bg-white">
                        <div class="card-body">
                            <h5 class="card-title fw-bold text-dark">${jogo.titulo}</h5>
                            <span class="badge bg-light text-secondary border mb-2">${jogo.genero || 'Geral'}</span>
                            <h3 class="card-text text-primary fw-bold">R$ ${jogo.preco.toFixed(2).replace('.', ',')}</h3>
                        </div>
                        <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center pb-3">
                            <button class="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm" 
                                onclick="adicionarAoCarrinho('${jogo.titulo}', ${jogo.preco})">
                                <i class="bi bi-cart-plus"></i> Comprar
                            </button>
                            
                            <div class="card-admin-btns gap-1">
                                <button class="btn btn-outline-warning btn-sm border-0" 
                                    onclick="prepararEdicao('${id}', '${jogo.titulo}', '${jogo.preco}', '${jogo.genero}')">
                                    <i class="bi bi-pencil-fill"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm border-0" onclick="deletarJogo('${id}')">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listaJogos.innerHTML += html;
        });

    } catch (erro) {
        console.error(erro);
        if(erro.message.includes("index")) alert("Falta criar índice no Firebase!");
    }
}

window.deletarJogo = async function(id) {
    if(confirm("Tem certeza que deseja excluir?")) {
        await window.deleteDoc(window.doc(window.db, "jogos", id));
        carregarJogos();
    }
}

window.prepararEdicao = function(id, titulo, preco, genero) {
    document.getElementById('titulo').value = titulo;
    document.getElementById('preco').value = preco;
    document.getElementById('genero').value = genero;
    idEdicao = id;
    
    btnSalvar.innerHTML = `<i class="bi bi-check-lg"></i> Atualizar`;
    btnSalvar.classList.replace('btn-success', 'btn-warning');
    
    painelAdmin.classList.remove('d-none');
    painelAdmin.scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicao() {
    idEdicao = null;
    formJogo.reset();
    btnSalvar.innerHTML = `<i class="bi bi-plus-lg"></i> Salvar`;
    btnSalvar.classList.replace('btn-warning', 'btn-success');
}

// ==========================================
// 3. CARRINHO
// ==========================================

window.adicionarAoCarrinho = function(titulo, preco) {
    carrinho.push({ titulo, preco });
    atualizarCarrinhoUI();
    
    // --- MUDANÇA AQUI: ALERTA ADICIONADO ---
    alert(`${titulo} adicionado ao carrinho!`);
    
    // Efeito visual no botão do carrinho
    const badge = document.getElementById('contagemCarrinho');
    badge.classList.add('bg-warning');
    setTimeout(() => badge.classList.remove('bg-warning'), 300);
}

function atualizarCarrinhoUI() {
    const tbody = document.getElementById('itensCarrinho');
    const contador = document.getElementById('contagemCarrinho');
    const totalSpan = document.getElementById('totalCarrinho');
    
    contador.innerText = carrinho.length;
    tbody.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        tbody.innerHTML += `
            <tr>
                <td class="align-middle">${item.titulo}</td>
                <td class="align-middle">R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="removerDoCarrinho(${index})">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    totalSpan.innerText = 'R$ ' + total.toFixed(2).replace('.', ',');
}

window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

window.finalizarCompraTotal = function() {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    alert("Pedido realizado com sucesso!");
    carrinho = []; 
    atualizarCarrinhoUI();
    bootstrap.Modal.getInstance(document.getElementById('modalCarrinho')).hide();
}

document.getElementById('campoBusca').addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    const cards = document.querySelectorAll('#listaJogos > div');
    cards.forEach(card => {
        const titulo = card.querySelector('.card-title').innerText.toLowerCase();
        if(titulo.includes(termo)) card.classList.remove('d-none');
        else card.classList.add('d-none');
    });
});

window.carregarJogos = carregarJogos;
window.iniciarAuth = iniciarAuth;

if (window.db) {
    carregarJogos();
    iniciarAuth();
} else {
    window.addEventListener('firebase-pronto', () => {
        carregarJogos();
        iniciarAuth();
    });
}