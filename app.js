// --- CONFIGURAÇÃO INICIAL E VARIÁVEIS ---
const formJogo = document.getElementById('formJogo');
const painelAdmin = document.getElementById('painelAdmin');
const statusUsuario = document.getElementById('statusUsuario');
const btnSalvar = formJogo.querySelector('button[type="submit"]');

let idEdicao = null;
let carrinho = []; // Lista para guardar os jogos comprados

// --- FUNÇÕES DO CARRINHO (NOVO!) ---

// 1. Adiciona um jogo ao carrinho
window.adicionarAoCarrinho = function(titulo, preco) {
    carrinho.push({ titulo, preco });
    atualizarCarrinhoUI();
    // Efeito visual simples (feedback)
    alert(`"${titulo}" foi adicionado ao carrinho!`);
}

// 2. Atualiza o visual do modal e o contador
function atualizarCarrinhoUI() {
    const tbody = document.getElementById('itensCarrinho');
    const contador = document.getElementById('contagemCarrinho');
    const totalSpan = document.getElementById('totalCarrinho');
    
    // Atualiza número no botão vermelho
    contador.innerText = carrinho.length;

    // Limpa a tabela
    tbody.innerHTML = '';
    let total = 0;

    // Recria a lista de itens no Modal
    carrinho.forEach((item, index) => {
        total += item.preco;
        
        tbody.innerHTML += `
            <tr>
                <td>${item.titulo}</td>
                <td>R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="finalizarItemUnico(${index})">
                        Comprar Só Este
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerDoCarrinho(${index})">
                        ❌
                    </button>
                </td>
            </tr>
        `;
    });

    // Atualiza o preço total
    totalSpan.innerText = 'R$ ' + total.toFixed(2).replace('.', ',');
}

// 3. Remove item do carrinho (sem comprar)
window.removerDoCarrinho = function(index) {
    carrinho.splice(index, 1);
    atualizarCarrinhoUI();
}

// 4. Finaliza APENAS UM item
window.finalizarItemUnico = function(index) {
    const item = carrinho[index];
    alert(`Compra realizada com sucesso!\nVocê comprou: ${item.titulo}`);
    
    carrinho.splice(index, 1); // Remove só ele
    atualizarCarrinhoUI();
}

// 5. Finaliza TUDO
window.finalizarCompraTotal = function() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    
    alert("Compra realizada com sucesso! Todos os itens foram adquiridos.");
    carrinho = []; // Zera o array
    atualizarCarrinhoUI();
    
    // Fecha o modal (opcional, precisa do bootstrap instance)
    const modalEl = document.getElementById('modalCarrinho');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
}

// --- FUNÇÕES EXISTENTES (ADMIN E CRUD) ---

function mudarModo(modo) {
    if (modo === 'admin') {
        painelAdmin.classList.remove('d-none');
        statusUsuario.innerHTML = "Modo Atual: <strong class='text-primary'>Administrador</strong>";
    } else {
        painelAdmin.classList.add('d-none');
        statusUsuario.innerHTML = "Modo Atual: <strong>Visitante</strong>";
        cancelarEdicao();
    }
    atualizarVisualizacaoAdmin();
}

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
    }
});

async function carregarJogos() {
    const listaJogos = document.getElementById('listaJogos');
    listaJogos.innerHTML = '';

    try {
        const querySnapshot = await window.getDocs(window.collection(window.db, "jogos"));
        
        querySnapshot.forEach((doc) => {
            const jogo = doc.data();
            const id = doc.id;

            // ATENÇÃO AQUI: O botão 'Comprar' agora chama adicionarAoCarrinho
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
                                Adicionar ao Carrinho
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

window.deletarJogo = async function(id) {
    if(confirm("Excluir este jogo?")) {
        try {
            await window.deleteDoc(window.doc(window.db, "jogos", id));
            carregarJogos();
        } catch (erro) { console.error(erro); }
    }
}

window.prepararEdicao = function(id, titulo, preco, genero) {
    document.getElementById('titulo').value = titulo;
    document.getElementById('preco').value = preco;
    document.getElementById('genero').value = genero;
    idEdicao = id;
    btnSalvar.innerText = "Atualizar Jogo";
    btnSalvar.classList.replace('btn-success', 'btn-warning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    idEdicao = null;
    formJogo.reset();
    btnSalvar.innerText = "Salvar";
    btnSalvar.classList.replace('btn-warning', 'btn-success');
}

function atualizarVisualizacaoAdmin() {
    const botoesAdmin = document.querySelectorAll('.grupo-admin');
    const isAdmin = !painelAdmin.classList.contains('d-none');
    botoesAdmin.forEach(div => div.classList.toggle('d-none', !isAdmin));
}

// --- FUNÇÃO DE BUSCA (NOVO!) ---
// Filtra os jogos visualmente sem recarregar do banco
const campoBusca = document.getElementById('campoBusca');

campoBusca.addEventListener('input', function() {
    const termo = this.value.toLowerCase(); // O que foi digitado (em minúsculo)
    
    // Pega todos os cards de jogos que estão na tela
    // Usamos o seletor '#listaJogos > div' para pegar as colunas (col-md-4) diretas
    const cards = document.querySelectorAll('#listaJogos > div');

    cards.forEach(card => {
        // Busca o título dentro do card atual
        const titulo = card.querySelector('.card-title').innerText.toLowerCase();
        
        // Se o título conter o termo digitado, mostra. Se não, esconde.
        if(titulo.includes(termo)) {
            card.classList.remove('d-none');
        } else {
            card.classList.add('d-none');
        }
    });
});

// Inicialização
window.carregarJogos = carregarJogos;
if (window.db) carregarJogos();
else window.addEventListener('firebase-pronto', carregarJogos);