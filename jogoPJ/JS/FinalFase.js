const canvas = document.getElementById('meuCanvas');
const contexto = canvas.getContext('2d');

// Adicionando trilha sonora
const trilhaSonora = new Audio('SND/AudioGame.mp3'); // Caminho para o arquivo de áudio
trilhaSonora.loop = true; // Define para tocar em loop
trilhaSonora.volume = 0.1; // Define o volume (ajuste conforme necessário)

// Mixer de volume e botão de pausa
const mixerVolume = document.createElement('input');
mixerVolume.type = 'range';
mixerVolume.min = 0;
mixerVolume.max = 1;
mixerVolume.step = 0.01;
mixerVolume.value = trilhaSonora.volume; // Inicializa com o volume da trilha sonora
document.body.appendChild(mixerVolume);

const botaoPause = document.createElement('button');
botaoPause.innerHTML = 'Pause'; // Texto do botão de pause
document.body.appendChild(botaoPause);

// Evento para alterar o volume
mixerVolume.addEventListener('input', function () {
    trilhaSonora.volume = mixerVolume.value;
});

// Evento para pausar a música
botaoPause.addEventListener('click', function () {
    if (jogoPausado) {
        trilhaSonora.play();
        botaoPause.innerHTML = 'Pause'; // Troca o texto para Pause
    } else {
        trilhaSonora.pause();
        botaoPause.innerHTML = 'Play'; // Troca o texto para Play
    }
    jogoPausado = !jogoPausado; // Alterna o estado de pausa
});

// Tentativa de iniciar o áudio assim que o jogo começa (pode ser bloqueado por políticas do navegador)
function iniciarAudio() {
    trilhaSonora.play().catch(error => {
        console.log('O áudio não pôde ser reproduzido automaticamente. Interação necessária.', error);
    });
}

// Configurações do Cenário
const imagemCenario = new Image();
imagemCenario.src = "IMG/CASTELO.png";
const alturaPlataforma = 749;
const larguraCenario = 3220.7447;

// Configurações do Personagem Principal
const larguraFramePersonagem = 64;
const alturaFramePersonagem = 64;
const imagemMovimentacao = new Image();
imagemMovimentacao.src = "IMG/PrincipeAndar.png";
const imagemAtaque = new Image();
imagemAtaque.src = "IMG/PrincipeAttk.png";
const imagemFundoPausa = new Image();
imagemFundoPausa.src = "IMG/CASTELOpause.png";
const imagemCoracao = new Image();
imagemCoracao.src = "IMG/coracao.png";

let posXPersonagem = 3200;
let posYPersonagem = 550;
let velocidadePersonagem = 2;
let colunaSpritePersonagem = 0;
let linhaSpritePersonagem = 0;
let atacandoPersonagem = false;
let direcaoPersonagem = 0;
let tempoUltimoQuadroPersonagem = 0;
let tempoUltimoAtaquePersonagem = 0;
const danoPorAtaque = 30;
const intervaloEntreQuadrosPersonagem = 100;
const intervaloEntreAtaquesPersonagem = 500;

// Configurações do Bot (Goblin)
const larguraFrameGoblin = 250;
const alturaFrameGoblin = 250;
// Imagens das sprites (substitua pelos seus sprites)
// Imagens das sprites do goblin
const imagemMovimentacaoGoblin = new Image();
imagemMovimentacaoGoblin.src = "IMG/mover.png"; // Caminho para a sprite de movimentação do goblin
const imagemAtaqueGoblin = new Image();
imagemAtaqueGoblin.src = "IMG/Attack2.png"; // Caminho para a sprite de ataque 2 do goblin
const imagemMorteGoblin = new Image(); // Cria uma nova imagem para a animação de morte
imagemMorteGoblin.src = "IMG/morte.png"; // Substitua pelo caminho correto da imagem de morte


let posXGoblin = 0;
let posYGoblin = 350;
let velocidadeGoblin = 0.5;
let colunaSpriteGoblin = 0;
let linhaSpriteGoblin = 0;
let atacandoGoblin = false;
let morrendoGoblin = false;
let direcaoGoblin = 0;
let tempoUltimoQuadroGoblin = 0;
let tempoUltimoAtaqueGoblin = 0;
let vidaGoblin = 500;
let opacidadePausa = 0;
let opacidade = 0;
let botaoReiniciar;
const taxaFade = 0.02;
let botaoVoltar;
let faseLiberada = false;
const vidaMaxGoblin = 500;
let goblinFoiAtacado = false;
let colunaSpriteMorteGoblin = 0;
let cooldownAtaqueGoblin = 2000;
let intervaloEntreAtaquesGoblin = 1000;
const DISTANCIA_DETECCAO_GOBLIN = 720; // Distância em pixels para detectar o personagem
const intervaloEntreQuadrosGoblin = 100;
const intervaloEntreQuadrosMorte = 200;



// Inicialização
let gameOver = false;
const maxVidas = 7;
let vidas = maxVidas;
let ataquesGoblin = 0; // Contador de animações de ataque do goblin
let renascimentosGoblin = 3; // Total de renascimentos do goblin
let ataquesPersonagem = 0; // Contador de animações de ataque do personagem
let goblinVivo = true; // Estado do goblin
let naAreaGoblin = false; // Indica se o personagem está na área do goblin

// Estado das Teclas
let teclasPressionadas = {};

// Configurações da Câmera
let cameraX = 0;
const zoom = 1;

// Variável para controle de pausa
let jogoPausado = false; 

// Inicialização
function inicializar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Reproduzir música assim que o jogo iniciar
    iniciarAudio();

    // Adicione o mixer de volume e botão de pausa aqui
    mixerVolume.style.position = 'absolute';
    mixerVolume.style.top = '10px';
    mixerVolume.style.right = '10px';

    botaoPause.style.position = 'absolute';
    botaoPause.style.top = '10px';
    botaoPause.style.right = '150px'; // Ajuste conforme necessário


    window.addEventListener('keydown', function(evento) {
        if (evento.key === 'Enter') { // Tecla Enter para pausar/despausar
            jogoPausado = !jogoPausado; // Alterna o estado de pausa
            if (jogoPausado) {
                trilhaSonora.pause(); // Pausa a música quando o jogo está pausado
            } else {
                trilhaSonora.play(); // Retoma a música quando o jogo volta ao normal
            }
        }

        if (!gameOver && !jogoPausado) { // Verifique se o jogo não está pausado
            teclasPressionadas[evento.key] = true;
        }
    });

    window.addEventListener('keyup', function(evento) {
        if (!jogoPausado) { // Verifique se o jogo não está pausado
            teclasPressionadas[evento.key] = false;
        }
    });

    requestAnimationFrame(atualizar);
}

// Função de Atualização
function atualizar(tempoAtual) {
    if (gameOver) {
        desenharGameOver();
        return;
    }

    if (jogoPausado) {
        // Desenhar fundo da tela de pausa
        contexto.drawImage(imagemFundoPausa, 0, 0, canvas.width, canvas.height); // Desenhar a imagem de fundo
    
        // Aplicar filtro de desfoque
        contexto.filter = 'blur(10px)'; // Ajuste o valor do desfoque conforme necessário
        contexto.drawImage(imagemFundoPausa, 0, 0, canvas.width, canvas.height); // Redesenhar a imagem de fundo para aplicar o desfoque
    
        // Remover o filtro de desfoque para desenhar o texto
        contexto.filter = 'none';
    
        // Aumentar a opacidade para criar um efeito de fade-in
        if (opacidadePausa < 1) {
            opacidadePausa += taxaFade; // Aumenta a opacidade
        }
        contexto.globalAlpha = opacidadePausa; // Define a opacidade global
    
        // Centralizar elementos
        contexto.textAlign = 'center'; // Centraliza o texto
        contexto.fillStyle = 'white'; // Cor do texto
        contexto.font = '48px Arial';
        contexto.fillText('PAUSADO', canvas.width / 2, canvas.height / 2 - 50);
    
         // Verifica se o botão já foi criado
    if (!botaoVoltar) {
        // Botão estilizado para voltar ao jogo
        botaoVoltar = document.createElement('button');
        botaoVoltar.innerHTML = 'Voltar ao Jogo';
        botaoVoltar.style.position = 'absolute';
        botaoVoltar.style.top = '50%';
        botaoVoltar.style.left = '50%';
        botaoVoltar.style.transform = 'translate(-50%, -50%)'; // Centraliza o botão
        botaoVoltar.style.padding = '15px 30px';
        botaoVoltar.style.fontSize = '20px';
        botaoVoltar.style.backgroundColor = '#FF5722'; // Cor de fundo contrastante
        botaoVoltar.style.color = 'white'; // Cor do texto
        botaoVoltar.style.border = '2px solid #FFFFFF'; // Borda branca
        botaoVoltar.style.borderRadius = '8px';
        botaoVoltar.style.cursor = 'pointer';
        botaoVoltar.style.opacity = opacidadePausa; // Define a opacidade do botão
        botaoVoltar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)'; // Sombra para destaque
        document.body.appendChild(botaoVoltar);

        // Adiciona evento de clique para o botão
        botaoVoltar.addEventListener('click', function() {
            jogoPausado = false; // Retorna ao jogo
            trilhaSonora.play(); // Retoma a música
            if (botaoVoltar) {
                document.body.removeChild(botaoVoltar); // Remove o botão da tela
                botaoVoltar = null; // Reseta a variável do botão
            }
            opacidadePausa = 0; // Reseta a opacidade para o próximo uso
        });
    }

    // Aumenta a opacidade do botão para que ele apareça suavemente
    if (botaoVoltar) {
        botaoVoltar.style.opacity = opacidadePausa;
    }

    // Redefine a opacidade após o botão ser adicionado
    contexto.globalAlpha = 1; // Restaura a opacidade global para 1 para o restante da cena

    requestAnimationFrame(atualizar); // Continue chamando atualizar para que a tela de pausa continue visível
    return; // Não atualize o jogo
} else {
    // Quando o jogo não está pausado, verifique se o botão deve ser removido
    if (botaoVoltar) {
        document.body.removeChild(botaoVoltar); // Remove o botão da tela
        botaoVoltar = null; // Reseta a variável do botão
    }
}

    contexto.clearRect(0, 0, canvas.width, canvas.height);

    // Limita o movimento da câmera
    cameraX = posXPersonagem - (canvas.width / (2 * zoom));
    if (cameraX < 0) cameraX = 0;
    if (cameraX > larguraCenario - canvas.width) {
        cameraX = larguraCenario - canvas.width;
    }

    // Verificação para carregar a tela anterior ao colidir com o início do cenário
    if (posXPersonagem <= 0) {
        window.location.href = 'telaCutScene5.html'; // Redireciona para a tela anterior
    }

    // Desenhar o cenário
    contexto.drawImage(imagemCenario, -cameraX, alturaPlataforma - canvas.height, larguraCenario / zoom, canvas.height / zoom);

    desenharVidas();

    // Mover e desenhar o personagem
    moverPersonagem(tempoAtual);
    desenharPersonagem(tempoAtual);

    // Verificar se o Goblin ainda renasce e desenhá-lo
    if (goblinVivo && renascimentosGoblin > 0) {
        moverGoblin(tempoAtual, posXPersonagem);
        desenharGoblin(tempoAtual);
    }

    requestAnimationFrame(atualizar);
}

// Funções do Personagem Principal
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
        if (posXPersonagem + larguraFramePersonagem > larguraCenario) {
            posXPersonagem = larguraCenario - larguraFramePersonagem;
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

    // Verificar se o personagem está atacando o goblin
    if (posXPersonagem + larguraFramePersonagem > posXGoblin && posXPersonagem < posXGoblin + larguraFrameGoblin) {
        // Se o ataque acertou, aplicar dano ao goblin
        atacarGoblin(); // Chama a função para atacar o goblin
        console.log("Ataque bem-sucedido! Dano aplicado ao goblin.");
    }
}
function desenharPersonagem(tempoAtual) {
    let imagem = atacandoPersonagem ? imagemAtaque : imagemMovimentacao;

    if (atacandoPersonagem) {
        if (tempoAtual - tempoUltimoQuadroPersonagem >= intervaloEntreQuadrosPersonagem) {
            colunaSpritePersonagem++;
            if (colunaSpritePersonagem > 7) {
                colunaSpritePersonagem = 0;
                atacandoPersonagem = false; // Certifique-se de que a animação reinicia corretamente
            }
            tempoUltimoQuadroPersonagem = tempoAtual;
        }
    }

    const scaleFactor = 3; // Aumentar o tamanho do personagem
    const posX = posXPersonagem - cameraX;
    const posY = posYPersonagem;

    // Desenhar o personagem
    contexto.drawImage(
        imagem,
        colunaSpritePersonagem * larguraFramePersonagem, linhaSpritePersonagem * alturaFramePersonagem,
        larguraFramePersonagem, alturaFramePersonagem,
        posX, posY,
        larguraFramePersonagem * scaleFactor, alturaFramePersonagem * scaleFactor // Aumentar o tamanho aqui
    );

    
}

// Função para alterar a velocidade de ataque do Goblin
function alterarVelocidadeAtaqueGoblin(novoIntervalo) {
    console.log("Intervalo de ataque anterior:", intervaloEntreAtaquesGoblin);
    intervaloEntreAtaquesGoblin = novoIntervalo;
    console.log("Novo intervalo de ataque:", intervaloEntreAtaquesGoblin);
}

function moverGoblin(tempoAtual, posXPersonagem) {
    // Se o goblin está atacando, não faz nada e retorna
    if (atacandoGoblin) return;

    // Verifica se o goblin está dentro da área visível do jogo
    if (posXGoblin > -larguraFrameGoblin) {
        // Se o goblin está à direita do personagem
        if (posXGoblin > posXPersonagem) {
            direcaoGoblin = 2; // Define a direção do goblin para a esquerda
            linhaSpriteGoblin = 0; // Define a linha do sprite do goblin para a animação de movimento
            // Verifica se é hora de mudar o quadro da animação
            if (tempoAtual - tempoUltimoQuadroGoblin >= intervaloEntreQuadrosGoblin) {
                colunaSpriteGoblin = (colunaSpriteGoblin + 1) % 4; // Atualiza a coluna do sprite
                tempoUltimoQuadroGoblin = tempoAtual; // Atualiza o tempo do último quadro
            }
            posXGoblin -= velocidadeGoblin; // Move o goblin para a esquerda em direção ao personagem
        } 
        // Se o goblin está à esquerda do personagem
        else if (posXGoblin < posXPersonagem) {
            direcaoGoblin = 3; // Define a direção do goblin para a direita
            linhaSpriteGoblin = 0; // Define a linha do sprite do goblin para a animação de movimento
            // Verifica se é hora de mudar o quadro da animação
            if (tempoAtual - tempoUltimoQuadroGoblin >= intervaloEntreQuadrosGoblin) {
                colunaSpriteGoblin = (colunaSpriteGoblin + 1) % 4; // Atualiza a coluna do sprite
                tempoUltimoQuadroGoblin = tempoAtual; // Atualiza o tempo do último quadro
            }
            posXGoblin += velocidadeGoblin; // Move o goblin para a direita em direção ao personagem
        }

        // Verifica se o goblin entrou na área do personagem para iniciar o ataque
        if (posXGoblin + larguraFrameGoblin > posXPersonagem && posXGoblin < posXPersonagem + larguraFramePersonagem) {
            // Verifica se já passou o tempo suficiente desde o último ataque
            if (tempoAtual - tempoUltimoAtaqueGoblin >= 3000) { // 3000ms = 3 segundos
                atacandoGoblin = true; // Inicia o ataque do goblin
                tempoUltimoAtaqueGoblin = tempoAtual; // Atualiza o tempo do último ataque
                console.log('Goblin está atacando!'); // Log para indicar que o goblin começou a atacar
            }
        }
    }
}

// Função para atacar o goblin
function atacarGoblin() {
    if (vidaGoblin > 0) {
        vidaGoblin -= danoPorAtaque; // Reduz a vida do goblin
        if (vidaGoblin < 0) {
            vidaGoblin = 0; // Garante que a vida não fique negativa
        }
        console.log(`Goblin sofreu ataque! Vida restante: ${vidaGoblin}`);
    }
}

function desenharBarraVidaGoblin() {
    const larguraBarra = 1000; // Largura da barra de vida
    const alturaBarra = 15; // Diminui a altura da barra de vida
    const xBarra = (canvas.width - larguraBarra) / 2; // Centraliza a barra horizontalmente
    const yBarra = 60; // Posição Y da barra de vida fixa no topo da tela

    // Desenhar fundo da barra (com bordas arredondadas)
    contexto.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Cor do fundo com transparência
    contexto.roundRect(xBarra - 5, yBarra - 5, larguraBarra + 10, alturaBarra + 10, 5); // Diminui a borda
    contexto.fill();

    // Calcular a largura da barra de vida atual
    const larguraVidaAtual = (vidaGoblin / vidaMaxGoblin) * larguraBarra;

    // Desenhar a barra de vida atual com gradiente
    const gradiente = contexto.createLinearGradient(xBarra, yBarra, xBarra + larguraBarra, yBarra);
    gradiente.addColorStop(0, 'red'); // Cor inicial (vermelho)
    gradiente.addColorStop(0.5, 'yellow'); // Cor do meio (amarelo)
    gradiente.addColorStop(1, 'green'); // Cor final (verde)

    contexto.fillStyle = gradiente; // Aplica o gradiente
    contexto.roundRect(xBarra, yBarra, larguraVidaAtual, alturaBarra, 5); // Diminui a borda
    contexto.fill();

    // Desenhar o número de vida restante no centro da barra
    contexto.fillStyle = 'magenta'; // Cor do texto
    contexto.font = '16px Arial';
    contexto.textAlign = 'center'; // Centraliza o texto
    contexto.fillText(vidaGoblin, xBarra + larguraBarra / 2, yBarra + alturaBarra / 2 + 6); // +4 para ajustar a posição vertical do texto
}

// Função para desenhar retângulos com bordas arredondadas
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
};

function desenharGoblin(tempoAtual) {
    if (!goblinVivo && !morrendoGoblin) return; // Se o goblin não estiver vivo e não estiver morrendo, não desenhe

    let imagem = atacandoGoblin ? imagemAtaqueGoblin : imagemMovimentacaoGoblin; // Atualize aqui

    // Se o goblin estiver morrendo, exibe a animação de morte
    if (morrendoGoblin) {
        if (tempoAtual - tempoUltimoQuadroGoblin >= intervaloEntreQuadrosMorte) {
            colunaSpriteMorteGoblin++;
            if (colunaSpriteMorteGoblin >= 7) { // Supondo que a animação de morte tenha 8 quadros
                colunaSpriteMorteGoblin = 0;
                goblinVivo = false; // Após a animação, o goblin não está mais vivo
                console.log("O goblin morreu!");
                return; // Sai da função, não desenha o goblin
            }
            tempoUltimoQuadroGoblin = tempoAtual;
        }

        // Desenhar a animação de morte
        const posX = posXGoblin - cameraX; // Posição X do goblin em relação à câmera
        const posY = posYGoblin; // Posição Y do goblin

        contexto.save(); // Salva o estado do contexto
        contexto.drawImage(
            imagemMorteGoblin,
            colunaSpriteMorteGoblin * larguraFrameGoblin, 0, // Assume que a animação de morte está na primeira linha
            larguraFrameGoblin, alturaFrameGoblin,
            posX, posY, // Desenha na posição ajustada
            larguraFrameGoblin * 2, alturaFrameGoblin * 2 // Aumentar o tamanho do goblin
        );
        contexto.restore(); // Restaura o estado do contexto

        return; // Sai da função após desenhar a animação de morte
    }

    // Lógica normal do goblin
    if (atacandoGoblin) {
        if (tempoAtual - tempoUltimoQuadroGoblin >= intervaloEntreQuadrosGoblin) {
            colunaSpriteGoblin++;
            if (colunaSpriteGoblin >= 8) {
                colunaSpriteGoblin = 0;
                ataquesGoblin++; // Incrementa o contador de animações de ataque
                console.log(`Goblin atacou! Total de ataques: ${ataquesGoblin}`);
                if (ataquesGoblin >= 3) {
                    vidas--; // O personagem perde uma vida
                    console.log(`O personagem perdeu uma vida! Vidas restantes: ${vidas}`);
                    ataquesGoblin = 0; // Reseta o contador de animações
                    if (vidas <= 0) {
                        gameOver = true; // Fim de jogo se vidas <= 0
                        console.log("Game Over!");
                    }
                }
                // O goblin permanece na mesma posição durante o ataque
                atacandoGoblin = false; // Para a animação após 1 ataque
            }
            tempoUltimoQuadroGoblin = tempoAtual;
        }
    } else {
        // Verifica se o goblin deve atacar
        if (posXGoblin <= posXPersonagem + larguraFramePersonagem && posXGoblin + larguraFrameGoblin >= posXPersonagem) {
            atacandoGoblin = true; // Ataca se o goblin estiver na frente do personagem
        } else {
            // Se não estiver atacando, move em direção ao personagem
            if (posXGoblin > posXPersonagem) {
                posXGoblin -= 1; // Move o goblin em direção ao personagem
            } else {
                posXGoblin += 1; // Se o goblin estiver atrás do personagem, move para frente
            }
        }
    }

    // Verifica se a vida do goblin chegou a zero
    if (vidaGoblin <= 0) {
        morrendoGoblin = true; // Inicia a animação de morte
        console.log("O goblin está morrendo!");
        return; // Sai da função, não desenha o goblin
    }

    const scaleFactor = 2; // Aumentar o tamanho do goblin
    const posX = posXGoblin - cameraX; // Posição X do goblin em relação à câmera
    const posY = posYGoblin; // Posição Y do goblin

    // Desenhar o goblin sem inverter a imagem
    contexto.save(); // Salva o estado do contexto
    contexto.drawImage(
        imagem,
        colunaSpriteGoblin * larguraFrameGoblin, linhaSpriteGoblin * alturaFrameGoblin,
        larguraFrameGoblin, alturaFrameGoblin,
        posX, posY, // Desenha na posição ajustada
        larguraFrameGoblin * scaleFactor, alturaFrameGoblin * scaleFactor
    );
    contexto.restore(); // Restaura o estado do contexto

    

    // Debugging: Verifique a posição do goblin
    console.log(`Posição Goblin: (${posXGoblin}, ${posYGoblin})`);
    
    // Desenhar a barra de vida do goblin
    desenharBarraVidaGoblin();
}

// Verificação de Colisão
function verificarColisao() {
    if (posXGoblin + larguraFrameGoblin > posXPersonagem && posXGoblin < posXPersonagem + larguraFramePersonagem) {
        // Verifica se o goblin está atacando
        if (atacandoGoblin) {
            // Aqui poderia ser usado para animações ou efeitos adicionais, se desejado.
        }
    }

    // Verifica se o personagem está atacando o goblin
    if (atacandoPersonagem && posXPersonagem + larguraFramePersonagem > posXGoblin && posXPersonagem < posXGoblin + larguraFrameGoblin) {
        ataquesPersonagem++;
        console.log(`Ataques do personagem: ${ataquesPersonagem}`);
        if (ataquesPersonagem >= 50) {
            goblinVivo = false; // O goblin morre após 2 ataques
            console.log("Goblin foi derrotado!");
            ataquesPersonagem = 0; // Reseta o contador de animações
            renascerGoblin(); // renasce o goblin
        }
    }
}

// Função para Desenhar as Vidas
function desenharVidas() {
    const tamanhoCoracao = 50; // Defina o tamanho desejado para os corações
    for (let i = 0; i <= vidas; i++) {
        contexto.drawImage(imagemCoracao, 10 + i * (tamanhoCoracao/2), 10, tamanhoCoracao, tamanhoCoracao); // Aumente o tamanho aqui
    }
}

function desenharGameOver() {
    // Desenhar a imagem de fundo com desfoque
    contexto.drawImage(imagemCenario, 0, 0, canvas.width, canvas.height); // Desenhar a imagem do cenário
    contexto.filter = 'blur(10px)'; // Aplicar desfoque
    contexto.drawImage(imagemCenario, 0, 0, canvas.width, canvas.height); // Redesenhar a imagem para aplicar o desfoque
    contexto.filter = 'none'; // Remover o filtro de desfoque

    // Centralizar e desenhar o texto "GAME OVER"
    contexto.fillStyle = `rgba(255, 255, 255, ${opacidade})`; // Aplicar opacidade ao texto
    contexto.font = '48px Arial';
    const gameOverText = 'GAME OVER';
    const gameOverWidth = contexto.measureText(gameOverText).width;

    // Calcular a posição Y do texto para centralizar na tela
    const textY = canvas.height / 2 - 100; // Centraliza o texto verticalmente (50 pixels acima do centro)


    contexto.fillText(gameOverText, (canvas.width - gameOverWidth) / 2, textY);

    // Criar botão de reinício se não existir
    if (!botaoReiniciar) {
        botaoReiniciar = document.createElement('button');
        botaoReiniciar.innerHTML = 'Recomeçar';
        botaoReiniciar.style.position = 'absolute';
        botaoReiniciar.style.top = '55%';
        botaoReiniciar.style.left = '50%';
        botaoReiniciar.style.transform = 'translate(-50%, -50%)'; // Centraliza o botão
        botaoReiniciar.style.padding = '15px 30px';
        botaoReiniciar.style.fontSize = '20px';
        botaoReiniciar.style.backgroundColor = '#FF5722'; // Cor de fundo contrastante
        botaoReiniciar.style.color = 'white'; // Cor do texto
        botaoReiniciar.style.border = '2px solid #FFFFFF'; // Borda branca
        botaoReiniciar.style.borderRadius = '8px';
        botaoReiniciar.style.cursor = 'pointer';
        botaoReiniciar.style.opacity = '0'; // Inicializa a opacidade do botão
        document.body.appendChild(botaoReiniciar);

        // Adiciona evento de clique para reiniciar o jogo
        botaoReiniciar.addEventListener('click', function() {
            window.location.reload(); // Recarrega a página para reiniciar o jogo
        });
    }

    // Animação de fade-in para o texto e o botão
    if (opacidade < 1) {
        opacidade += 0.01; // Aumenta a opacidade
        botaoReiniciar.style.opacity = opacidade; // Atualiza a opacidade do botão
        requestAnimationFrame(desenharGameOver); // Chama a função novamente para continuar a animação
    } else {
        botaoReiniciar.style.opacity = '1'; // Garante que a opacidade final do botão seja 1
    }
}

// Inicia o jogo
inicializar();
