// VARIÁVEIS GLOBAIS 
const formJogo = document.getElementById('formJogo');
const painelAdmin = document.getElementById('painelAdmin');
const btnSalvar = formJogo.querySelector('button[type="submit"]');

let idEdicao = null;
let carrinho = []; 
let isUserAdmin = false; // Controle global de admin


// Monitora se o usuário entrou ou saiu
function iniciarAuth() {
    window.onAuthStateChanged(window.auth, (user) => {
        const btnLoginUI = document.getElementById('btnLoginUI');
        const btnLogoutUI = document.getElementById('btnLogoutUI');
        const statusUsuario = document.getElementById('statusUsuario');

        if (user) {
            btnLoginUI.classList.add('d-none');
            btnLogoutUI.classList.remove('d-none');
            
            if (user.email === 'admin@loja.com') {
                isUserAdmin = true;
                painelAdmin.classList.remove('d-none');
                statusUsuario.innerHTML = `Olá, <strong>Admin Chefe</strong> (${user.email})`;
            } else {
                isUserAdmin = false;
                painelAdmin.classList.add('d-none');
                statusUsuario.innerHTML = `Olá, <strong>Cliente</strong> (${user.email})`;
            }
        } else {
            isUserAdmin = false;
            btnLoginUI.classList.remove('d-none');
            btnLogoutUI.classList.add('d-none');
            painelAdmin.classList.add('d-none');
            statusUsuario.innerHTML = `Usuário: <strong>Visitante</strong>`;
        }
        
        atualizarVisualizacaoAdmin();
    });
}

// Botão ENTRAR (Login)
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('senhaLogin').value;

    try {
        await window.signInWithEmailAndPassword(window.auth, email, pass);
        // Fecha modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
        modal.hide();
        alert("Bem-vindo(a) de volta!");
    } catch (erro) {
        alert("Erro no login: " + erro.message);
    }
});

// Botão CRIAR CONTA
document.getElementById('btnCriarConta').addEventListener('click', async () => {
    const email = document.getElementById('emailLogin').value;
    const pass = document.getElementById('senhaLogin').value;
    
    if(pass.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    try {
        await window.createUserWithEmailAndPassword(window.auth, email, pass);
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
        modal.hide();
        alert("Conta criada com sucesso! Você já está logado.");
    } catch (erro) {
        alert("Erro ao criar conta: " + erro.message);
    }
});

// Botão SAIR (Logout)
document.getElementById('btnLogoutUI').addEventListener('click', async () => {
    if(confirm("Deseja realmente sair?")) {
        await window.signOut(window.auth);
    }
});


window.adicionarAoCarrinho = function(titulo, preco) {
    carrinho.push({ titulo, preco });
    atualizarCarrinhoUI();
    alert(`"${titulo}" adicionado ao carrinho!`);
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
                <td>${item.titulo}</td>
                <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="finalizarItemUnico(${index})">Comprar Só Este</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerDoCarrinho(${index})">❌</button>
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

window.finalizarItemUnico = function(index) {
    alert(`Compra realizada: ${carrinho[index].titulo}`);
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

window.finalizarCompraTotal = function() {
    if (carrinho.length === 0) {
        alert("Carrinho vazio!");
        return;
    }
    alert("Compra finalizada com sucesso!");
    carrinho = []; 
    atualizarCarrinhoUI();
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCarrinho'));
    modal.hide();
}




// CREATE e UPDATE
formJogo.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valorInput = document.getElementById('preco').value;
    const titulo = document.getElementById('titulo').value;
    const preco = parseFloat(valorInput.replace(',', '.'));
    const genero = document.getElementById('genero').value;

    try {
        if (idEdicao == null) {
            await window.addDoc(window.collection(window.db, "jogos"), { titulo, preco, genero });
            alert("Jogo cadastrado!");
        } else {
            const jogoRef = window.doc(window.db, "jogos", idEdicao);
            await window.updateDoc(jogoRef, { titulo, preco, genero });
            alert("Jogo atualizado!");
            cancelarEdicao();
        }
        formJogo.reset();
        carregarJogos();
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao salvar no banco.");
    }
});

// READ (Listar)
async function carregarJogos() {
    const listaJogos = document.getElementById('listaJogos');
    listaJogos.innerHTML = '';

    try {
        const querySnapshot = await window.getDocs(window.collection(window.db, "jogos"));
        
        querySnapshot.forEach((doc) => {
            const jogo = doc.data();
            const id = doc.id;

            const html = `
                <div class="col-md-4 mb-4">
                    <div class="card card-jogo h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title fw-bold">${jogo.titulo}</h5>
                            <span class="badge bg-secondary mb-2">${jogo.genero}</span>
                            <h3 class="card-text text-success">R$ ${jogo.preco.toFixed(2).replace('.', ',')}</h3>
                        </div>
                        <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                            <button class="btn btn-outline-primary btn-sm" 
                                onclick="adicionarAoCarrinho('${jogo.titulo}', ${jogo.preco})">
                                Adicionar
                            </button>
                            
                            <div class="grupo-admin d-none">
                                <button class="btn btn-warning btn-sm" 
                                    onclick="prepararEdicao('${id}', '${jogo.titulo}', '${jogo.preco}', '${jogo.genero}')">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deletarJogo('${id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listaJogos.innerHTML += html;
        });

        if(querySnapshot.empty) listaJogos.innerHTML = '<p class="text-center w-100">Nenhum jogo cadastrado.</p>';
        
        atualizarVisualizacaoAdmin();

    } catch (erro) {
        console.error("Erro ao listar:", erro);
    }
}

// DELETE
window.deletarJogo = async function(id) {
    if(confirm("Excluir este jogo permanentemente?")) {
        try {
            await window.deleteDoc(window.doc(window.db, "jogos", id));
            carregarJogos();
        } catch (erro) { console.error(erro); }
    }
}

// Helpers de Edição
window.prepararEdicao = function(id, titulo, preco, genero) {
    document.getElementById('titulo').value = titulo;
    document.getElementById('preco').value = preco;
    document.getElementById('genero').value = genero;
    idEdicao = id;
    btnSalvar.innerText = "Atualizar Jogo";
    btnSalvar.classList.replace('btn-success', 'btn-warning');
    // Mostra o form se estiver escondido (no caso de admin)
    painelAdmin.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    idEdicao = null;
    formJogo.reset();
    btnSalvar.innerText = "Salvar";
    btnSalvar.classList.replace('btn-warning', 'btn-success');
}

// Função Visual (Controla quem vê os botões de lápis/lixeira)
function atualizarVisualizacaoAdmin() {
    const botoesAdmin = document.querySelectorAll('.grupo-admin');
    botoesAdmin.forEach(div => {
        if (isUserAdmin) {
            div.classList.remove('d-none');
        } else {
            div.classList.add('d-none');
        }
    });
}

// Busca Visual
const campoBusca = document.getElementById('campoBusca');
campoBusca.addEventListener('input', function() {
    const termo = this.value.toLowerCase(); 
    const cards = document.querySelectorAll('#listaJogos > div');
    cards.forEach(card => {
        const titulo = card.querySelector('.card-title').innerText.toLowerCase();
        if(titulo.includes(termo)) card.classList.remove('d-none');
        else card.classList.add('d-none');
    });
});


// Expor funções necessárias
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