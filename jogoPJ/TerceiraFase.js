const canvas = document.getElementById('meuCanvas');
const contexto = canvas.getContext('2d');

// Adicionando trilha sonora
const trilhaSonora = new Audio('SND/AudioGame.mp3');
trilhaSonora.loop = true;
trilhaSonora.volume = 0.1;

const mixerVolume = document.createElement('input');
mixerVolume.type = 'range';
mixerVolume.min = 0;
mixerVolume.max = 1;
mixerVolume.step = 0.01;
mixerVolume.value = trilhaSonora.volume;
document.body.appendChild(mixerVolume);

const botaoPause = document.createElement('button');
botaoPause.innerHTML = 'Pause';
document.body.appendChild(botaoPause);

mixerVolume.addEventListener('input', function () {
    trilhaSonora.volume = mixerVolume.value;
});

botaoPause.addEventListener('click', function () {
    if (jogoPausado) {
        trilhaSonora.play();
        botaoPause.innerHTML = 'Pause';
    } else {
        trilhaSonora.pause();
        botaoPause.innerHTML = 'Play';
    }
    jogoPausado = !jogoPausado;
});

// Configuração do cenário
const imagemCenario = new Image();
imagemCenario.src = "IMG/CAVERNA.png";
const alturaPlataforma = 702;
const larguraCenario = 3220.7447;
// Configuração vidas
const imagemCoracao = new Image();
imagemCoracao.src = "IMG/coracao.png";

// Configurações do Personagem Principal
const larguraFramePersonagem = 64;
const alturaFramePersonagem = 64;
const alturaMinimaMorcego = alturaFramePersonagem / 2; // A altura mínima do morcego será metade da altura do personagem
const imagemMovimentacao = new Image();
imagemMovimentacao.src = "IMG/PrincipeAndar.png";
const imagemAtaque = new Image();
imagemAtaque.src = "IMG/PrincipeAttk.png";
let posXPersonagem = 300; // 955
let posYPersonagem = 560;
let velocidadePersonagem = 2;
let colunaSpritePersonagem = 0;
let linhaSpritePersonagem = 0;
let atacandoPersonagem = false;
let direcaoPersonagem = 0;
let tempoUltimoQuadroPersonagem = 0;
let tempoUltimoAtaquePersonagem = 0;
const intervaloEntreQuadrosPersonagem = 100;
const intervaloEntreAtaquesPersonagem = 150;
let ataquesPersonagemNoMorcego = 0;
let ataquesRecebidosPersonagem = 0;
let tempoUltimoAtaqueRecebido = 0; 
let vidas = 3;

// Variáveis para o morcego
let imgMorcego = new Image();
imgMorcego.src = "IMG/MorcegoMove.png"; // Coloque o caminho correto da imagem do morcego
const larguraFrameMorcego = 256 / 8.7;
const alturaFrameMorcego = 32;
const imagemMovimentacaoMorcego = new Image();
imagemMovimentacaoMorcego.src = "IMG/MorcegoMove.png"; // Sprite de movimento do morcego
const imagemAtaqueMorcego = new Image();
imagemAtaqueMorcego.src = "IMG/MorcegoAttk.png"; // Sprite de ataque do morcego
let posXMorcego = canvas.width - posXPersonagem; // Posição inicial fora da tela à direita
let posYMorcego = canvas.height - posYPersonagem; // Começa no topo da tela
let velocidadeMorcego = 2;
let morcegoApareceu = true; // Definimos como "aparecido" logo de início
let colunaSpriteMorcego = 0;
let linhaSpriteMorcego = 0;
let atacandoMorcego = false;
let direcaoMorcego = 0;
let tempoUltimoQuadroMorcego = 0;
let tempoUltimoAtaqueMorcego = 0;
let morcegosMortos = 0;
let ultimaDirecaoMorcego = direcaoMorcego;
const intervaloEntreQuadrosMorcego = 55;
const intervaloEntreAtaquesMorcego = 10;
const ataquesNecessariosParaEliminarMorcego = 2;

// Estado das Teclas
let teclasPressionadas = {};

// Configurações da Câmera
let cameraX = 0;
const zoom = 1;

// Variável para controle de pausa
let jogoPausado = false; 

// Variável para controlar a animação de perda de vida
let animacaoPerdaVida = false;
let tempoAnimacaoPerdaVida = 0;
let gameOver = false;


function moverPersonagem(tempoAtual) {
    if (atacandoPersonagem) return;

    if (teclasPressionadas['ArrowRight']) {
        direcaoPersonagem = 1;
        linhaSpritePersonagem = 2;
        if (tempoAtual - tempoUltimoQuadroPersonagem >= intervaloEntreQuadrosPersonagem) {
            colunaSpritePersonagem = (colunaSpritePersonagem + 1) % 6;
            tempoUltimoQuadroPersonagem = tempoAtual;
        }
        posXPersonagem += velocidadePersonagem;

        // Verifica se o personagem ultrapassou o limite do cenário
        if (posXPersonagem + larguraFramePersonagem > larguraCenario) {
            posXPersonagem = larguraCenario - larguraFramePersonagem;
            // Redireciona para a nova fase
            window.location.href = 'telaCutScene4.html'; // Substitua 'novaFase.html' pelo link da nova fase
        }
    } else if (teclasPressionadas['ArrowLeft']) {
        direcaoPersonagem = 2;
        linhaSpritePersonagem = 1;
        if (tempoAtual - tempoUltimoQuadroPersonagem >= intervaloEntreQuadrosPersonagem) {
            colunaSpritePersonagem = (colunaSpritePersonagem + 1) % 6;
            tempoUltimoQuadroPersonagem = tempoAtual;
        }
        posXPersonagem -= velocidadePersonagem;
        if (posXPersonagem < 0) {
            posXPersonagem = 0;
        }
    } else if (teclasPressionadas[' ']) {
        if (tempoAtual - tempoUltimoAtaquePersonagem >= intervaloEntreAtaquesPersonagem) {
            iniciarAtaquePersonagem(tempoAtual);
        }
    } else {
        colunaSpritePersonagem = 0;
    }
}

function iniciarAtaquePersonagem(tempoAtual) {
    atacandoPersonagem = true;
    colunaSpritePersonagem = 0;
    linhaSpritePersonagem = direcaoPersonagem === 1 ? 2 : 1;
    tempoUltimoAtaquePersonagem = tempoAtual;
    console.log("Personagem atacando!"); // Debug para garantir que o ataque foi iniciado
}

function desenharPersonagem(tempoAtual) {
    let imagem = atacandoPersonagem ? imagemAtaque : imagemMovimentacao;

    if (atacandoPersonagem) {
        if (tempoAtual - tempoUltimoQuadroPersonagem >= intervaloEntreQuadrosPersonagem) {
            colunaSpritePersonagem++;
            if (colunaSpritePersonagem > 5) {
                colunaSpritePersonagem = 0;
                atacandoPersonagem = false; // Certifique-se de que a animação reinicia corretamente
            }
            tempoUltimoQuadroPersonagem = tempoAtual;
        }
    }

    const scaleFactor = 3; // Aumentar o tamanho do personagem
    contexto.drawImage(
        imagem,
        colunaSpritePersonagem * larguraFramePersonagem, linhaSpritePersonagem * alturaFramePersonagem,
        larguraFramePersonagem, alturaFramePersonagem,
        posXPersonagem - cameraX, posYPersonagem,
        larguraFramePersonagem * scaleFactor, alturaFramePersonagem * scaleFactor // Aumentar o tamanho aqui
    );
}

function verificarAtaquePersonagem() {
    for (let i = 0; i < morcegos.length; i++) {
        let morcego = morcegos[i];

        // Verifica se o morcego está a 20 pixels do personagem e se o personagem está atacando
        if (detectarColisao(morcego) && atacandoPersonagem) {
            morcego.ataquesRecebidos++;  // Incrementa o número de ataques recebidos

            console.log(`Morcego atingido! Ataques recebidos: ${morcego.ataquesRecebidos}`); // Debug: mostra o número de ataques recebidos
            console.log("Personagem atacou o morcego!"); // Adiciona log de ataque do personagem

            atacandoPersonagem = false;  // Reseta o ataque para evitar múltiplas contagens

            // Se o morcego receber 2 ataques, ele morre
            if (morcego.ataquesRecebidos >= ataquesNecessariosParaEliminarMorcego) {
                console.log("Morcego eliminado!");
                morcegos.splice(i, 1);  // Remove o morcego da lista
                morcegosMortos++;  // Incrementa o contador de morcegos mortos
                console.log(`Total de morcegos mortos: ${morcegosMortos}`);  // Mostra quantos morcegos já morreram
                i--;  // Ajusta o índice para o próximo morcego
            }
            break;  // Para evitar múltiplas verificações em um só ataque
        }
    }
}
function verificarAtaquePersonagemRecebido() {
    for (let morcego of morcegos) {
        if (detectarColisao(morcego) && morcego.atacando) {
            ataquesRecebidosPersonagem++; 
            console.log(`Personagem atingido! Ataques recebidos: ${ataquesRecebidosPersonagem}`);

            if (ataquesRecebidosPersonagem >= 3) {
                vidas--;
                console.log(`Vida perdida! Vidas restantes: ${vidas}`);
                ataquesRecebidosPersonagem = 0;
                animacaoPerdaVida = true;
                tempoAnimacaoPerdaVida = 0;
                desenharVidas();

                if (vidas <= 0 && !gameOver) { // Verifica se o jogo já não está em Game Over
                    gameOver = true; // Define que o jogo está em Game Over
                    exibirGameOver(); // Chama a função para exibir Game Over
                }
            }
            break;
        }
    }
}

// Função para desenhar as vidas
function desenharVidas() {
    const tamanhoCoracao = 50; // Defina o tamanho desejado para os corações
    contexto.clearRect(0, 0, canvas.width, 50); // Limpa a área onde as vidas são desenhadas

    // Desenha os corações com base no número de vidas restantes
    for (let i = 0; i < vidas; i++) {
        contexto.drawImage(imagemCoracao, 10 + i * (tamanhoCoracao + 10), 10, tamanhoCoracao, tamanhoCoracao); // Aumente o tamanho aqui
    }

    // Log para mostrar as vidas atuais
    console.log(`Vidas atuais: ${vidas}`);

    // Se a animação de perda de vida estiver ativa, desenhe um coração "desaparecendo"
    if (animacaoPerdaVida) {
        const coracaoPerdidoX = 10 + (vidas) * (tamanhoCoracao + 10); // Posição do coração perdido
        const alpha = Math.max(0, 1 - (tempoAnimacaoPerdaVida / 500)); // Diminui a opacidade
        contexto.globalAlpha = alpha; // Altera a opacidade
        contexto.drawImage(imagemCoracao, coracaoPerdidoX, 10, tamanhoCoracao, tamanhoCoracao); // Desenha o coração perdido
        contexto.globalAlpha = 1; // Reseta a opacidade
    }
}


// Somente informações dos morcegos
// Variáveis para controlar os morcegos
let morcegos = [];
let morcegosVivos = 6;
let ataquesMorcegos = 2; // Cada morcego pode ser atacado 2 vezes

// Função para gerar a posição do morcego com a altura mínima
function gerarPosicaoMorcego() {
    const larguraCanvas = canvas.width;
    const alturaCanvas = canvas.height;

    let posX, posY;

    const lado = Math.floor(Math.random() * 4);
    if (lado === 0) { // Lado esquerdo
        posX = -50;
        posY = Math.max(Math.random() * alturaCanvas, 100); // Garantir que o Y do morcego seja >= 100px
    } else if (lado === 1) { // Lado direito
        posX = larguraCanvas + 50;
        posY = Math.max(Math.random() * alturaCanvas, 100); // Garantir que o Y do morcego seja >= 100px
    } else if (lado === 2) { // Lado superior
        posX = Math.random() * larguraCanvas;
        posY = 100; // Sempre começa no mínimo 100px no eixo Y
    } else { // Lado inferior
        posX = Math.random() * larguraCanvas;
        posY = alturaCanvas + 50;
    }

    return { posX, posY, vida: 2, ataquesRecebidos: 0, atacando: false, alturaMorcego: alturaMinimaMorcego };  // A altura do morcego agora é metade da altura do personagem
}


// Função para garantir que os morcegos sejam corretamente criados
function criarMorcegos() {
    morcegos = [];
    for (let i = 0; i < morcegosVivos; i++) {
        let morcego = gerarPosicaoMorcego();
        morcegos.push(morcego);
        console.log(`Morcego criado na posição: (${morcego.posX}, ${morcego.posY})`); // Debug para criação dos morcegos
    }
}
function atacarPersonagem(morcego) {
    if (!morcego.atacando) return;

    // Exibe uma mensagem no console indicando o ataque do morcego
    console.log("Morcego atacando o personagem!");

    // Incrementa o contador de ataques recebidos pelo personagem
    ataquesRecebidosPersonagem++;

    // Exibe o número de ataques recebidos pelo personagem
    console.log(`Ataques recebidos pelo personagem: ${ataquesRecebidosPersonagem}`);

    // Reseta o estado de ataque do morcego para evitar múltiplas contagens
    morcego.atacando = false;

    // Verifica se o personagem perdeu uma vida após receber 3 ataques
    if (ataquesRecebidosPersonagem >= 3) {
        vidas--;
        console.log(`Vida perdida! Vidas restantes: ${vidas}`);
        ataquesRecebidosPersonagem = 0; // Reinicia o contador de ataques recebidos
        animacaoPerdaVida = true;
        tempoAnimacaoPerdaVida = 0;
        desenharVidas();

        // Verifica se o jogo deve exibir o Game Over
        if (vidas <= 0 && !gameOver) {
            gameOver = true;
            exibirGameOver();
        }
    }
}

// Atualize a função de mover o morcego para incluir a lógica de ataque
function moverMorcego(morcego, posXPersonagem, posYPersonagem, tempoAtual) {
    if (morcego.vida <= 0) return;

    // Calcula a direção do movimento do morcego em direção ao personagem
    const dx = posXPersonagem - morcego.posX;
    const dy = posYPersonagem - morcego.posY;
    const distancia = Math.sqrt(dx * dx + dy * dy);

    const velocidadeMorcego = 1;

    // Se o morcego estiver a uma distância de 50 pixels do personagem, ele ataca
    if (distancia <= 50) {
        // Verifica se já passou o intervalo para atacar
        if (tempoAtual - tempoUltimoAtaqueMorcego >= intervaloEntreAtaquesMorcego) {
            morcego.atacando = true; // O morcego está atacando
            atacarPersonagem(morcego); // Chama a função de ataque
            tempoUltimoAtaqueMorcego = tempoAtual; // Atualiza o tempo do último ataque
        }
        morcego.posX -= (dx / distancia) * 10; // Afasta o morcego após o ataque
    } else {
        morcego.atacando = false;
        // Move o morcego em direção ao personagem
        morcego.posX += (dx / distancia) * velocidadeMorcego;
        morcego.posY += (dy / distancia) * velocidadeMorcego;
    }
}


// Função para desenhar os morcegos considerando a altura mínima
function desenharMorcegos(tempoAtual) {
    for (let morcego of morcegos) {
        if (morcego.vida <= 0) continue; // Não desenha o morcego se ele estiver morto

        // Controle do tempo para atualizar o quadro do sprite
        if (tempoAtual - tempoUltimoQuadroMorcego >= intervaloEntreQuadrosMorcego) {
            colunaSpriteMorcego = (colunaSpriteMorcego + 1) % 4; // Atualiza o quadro
            tempoUltimoQuadroMorcego = tempoAtual; // Atualiza o tempo do último quadro
        }

        // Desenhar o morcego com a altura mínima ajustada
        contexto.drawImage(
            imgMorcego,
            colunaSpriteMorcego * larguraFrameMorcego, 0,
            larguraFrameMorcego, alturaFrameMorcego,
            morcego.posX, morcego.posY,
            larguraFrameMorcego * 2, morcego.alturaMorcego * 2 // Altura ajustada
        );
    }
}
// Atualize a função de detecção de colisão
function detectarColisao(morcego) {
    const distanciaX = Math.abs(posXPersonagem - morcego.posX);
    const distanciaY = Math.abs(posYPersonagem - morcego.posY); // Distância vertical

    // Verifica se a distância total (em ambas as direções) é menor ou igual a 20 pixels
    return distanciaX <= 50 && distanciaY <= 50;
}

// Função para exibir "Game Over"
function exibirGameOver() {
    contexto.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Fundo semi-transparente
    contexto.fillRect(0, 0, canvas.width, canvas.height); // Preenche o fundo

    contexto.fillStyle = 'white'; // Cor do texto
    contexto.font = '48px sans-serif'; // Estilo do texto
    contexto.textAlign = 'center'; // Alinhamento do texto
    contexto.fillText('Game Over', canvas.width / 2, canvas.height / 2); // Exibe "Game Over"
}
function atualizar(tempoAtual) {
    if (jogoPausado || gameOver) return;

    contexto.clearRect(0, 0, canvas.width, canvas.height);
    cameraX = posXPersonagem - (canvas.width / (2 * zoom));
    if (cameraX < 0) cameraX = 0;
    if (cameraX > larguraCenario - canvas.width) cameraX = larguraCenario - canvas.width;

    contexto.drawImage(imagemCenario, -cameraX, alturaPlataforma - canvas.height, larguraCenario / zoom, canvas.height / zoom);

    desenharVidas(); // Chame a função para desenhar as vidas
    moverPersonagem(tempoAtual);
    desenharPersonagem(tempoAtual);

    verificarAtaquePersonagem();
    verificarAtaquePersonagemRecebido();

    for (let i = morcegos.length - 1; i >= 0; i--) {
        const morcego = morcegos[i];
        moverMorcego(morcego, posXPersonagem, posYPersonagem, tempoAtual);
        if (morcego.vida > 0) {
            desenharMorcegos(tempoAtual);
        } else {
            morcegos.splice(i, 1);
        }
    }

    requestAnimationFrame(atualizar);
}

function inicializar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    trilhaSonora.play();
    
    // Exibe um alerta com informações ao iniciar o jogo
    alert("Bem-vindo a terceira fase!\n\nBotão de pause esta desativada nessa fase, dificultando a fase.\nEm caso de derrota, precione F5 para recomeçar.\nCuidado com os morcegos!\n\nBoa sorte!");

    mixerVolume.style.position = 'absolute';
    mixerVolume.style.top = '10px';
    mixerVolume.style.right = '10px';

    botaoPause.style.position = 'absolute';
    botaoPause.style.top = '10px';
    botaoPause.style.right = '150px';

    window.addEventListener('keydown', (evento) => teclasPressionadas[evento.key] = true);
    window.addEventListener('keyup', (evento) => teclasPressionadas[evento.key] = false);

    criarMorcegos(); // Cria os morcegos
    requestAnimationFrame(atualizar);
}

inicializar();
