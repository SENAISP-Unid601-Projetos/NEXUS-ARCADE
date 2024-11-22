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
imagemCenario.src = './IMG/FlorestaSombria.png';
const alturaPlataforma = 748;
const larguraCenario = 3220.7447;

// Configurações do Personagem Principal
const larguraFramePersonagem = 64;
const alturaFramePersonagem = 64;
const imagemMovimentacao = new Image();
imagemMovimentacao.src = '/IMG/PrincipeAndar.png';
const imagemAtaque = new Image();
imagemAtaque.src = '/IMG/PrincipeAttk.png';
const imagemCoracao = new Image();
imagemCoracao.src = '/IMG/Coracao.png';
const imagemFundoPausa = new Image();
imagemFundoPausa.src = '/IMG/florestaSombria.jpg'

let posXPersonagem = 400;
let posYPersonagem = 515;
let velocidadePersonagem = 2;
let colunaSpritePersonagem = 0;
let linhaSpritePersonagem = 0;
let atacandoPersonagem = false;
let direcaoPersonagem = 0;
let tempoUltimoQuadroPersonagem = 0;
let tempoUltimoAtaquePersonagem = 0;
const intervaloEntreQuadrosPersonagem = 100;
const intervaloEntreAtaquesPersonagem = 500;

// Configurações do Bot (Bot)
const  larguraFrameBot = 64;
const alturaFraneBot = 64;
const imagemMovimentacaoBot = new Image();
imagemMovimentacaoBot.src = '/IMG/OgroAndar.png'; // Sprite de movimento do bot
const imagemAtaqueBot = new Image();
imagemAtaqueBot.src = '/IMG/OgroAttk.png'; // Sprite de ataque do bot

let posXbot = 3200;
let posYBot = 515;
let velocidadeBot = 2;
let colunaSpriteBot = 0;
let linhaSpriteBot = 0;
let atacandoBot = false;
let direcaoBot = 0;
let tempoUltimoQuadroBot = 0;
let tempoUltimoAtaqueBot = 0;
let opacidadePausa = 0;
let opacidade = 0;
let botaoReiniciar;
const taxaFade = 0.02;
let botaoVoltar;
let faseLiberada = false;
const intervaloEntreQuadrosBot = 100;
const intervaloEntreAtaquesBot = 500;

// Inicialização
let gameOver = false;
let botsVivos = false;
const maxVidas = 3;
let vidas = maxVidas;
let ataquesBot = 0; // Contador de animações de ataque do bot
let renascimentosBot = 5; // Total de renascimentos do bot
let ataquesPersonagem = 0; // Contador de animações de ataque do personagem
let botVivo = true; // Estado do bot
let naAreaBot = false; // Indica se o personagem está na área do bot

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
   
    // Verificação para carregar a segunda fase
    if (posXPersonagem >= larguraCenario - larguraFramePersonagem) {
        window.location.href = 'telaCutScene2.html'; // Redireciona para o link da segunda fase
            }
    // Desenhar o cenário
    contexto.drawImage(imagemCenario, -cameraX, alturaPlataforma - canvas.height, larguraCenario / zoom, canvas.height / zoom);

    desenharVidas();

    // Mover e desenhar o personagem
    moverPersonagem(tempoAtual);
    desenharPersonagem(tempoAtual);

    // Verificar se o Bot ainda renasce e desenhá-lo
    if (botVivo && renascimentosBot > 0) {
        moverBot(tempoAtual, posXPersonagem);
        desenharBot(tempoAtual);
    }

    verificarColisao();

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

function moverBot(tempoAtual, posXPersonagem) {
    if (atacandoBot) return;

    // Verifica se o bot invadiu a área do personagem
    if (posXbot > - larguraFrameBot) {
        if (posXbot > posXPersonagem) {
            direcaoBot = 2;
            linhaSpriteBot = 2;
            if (tempoAtual - tempoUltimoQuadroBot >= intervaloEntreQuadrosBot) {
                colunaSpriteBot = (colunaSpriteBot + 1) % 6;
                tempoUltimoQuadroBot = tempoAtual;
            }
            posXbot -= velocidadeBot; // Move em direção ao personagem
        } else if (posXbot < posXPersonagem) {
            direcaoBot = 3;
            linhaSpriteBot = 3;
            if (tempoAtual - tempoUltimoQuadroBot >= intervaloEntreQuadrosBot) {
                colunaSpriteBot = (colunaSpriteBot + 1) % 6;
                tempoUltimoQuadroBot = tempoAtual;
            }
            posXbot += velocidadeBot; // Move em direção ao personagem
        }

        // Verifica se o bot entrou na área do personagem para iniciar o ataque
        if (posXbot +  larguraFrameBot > posXPersonagem && posXbot < posXPersonagem + larguraFramePersonagem) {
            atacandoBot = true; // Inicia o ataque do bot
            console.log('Bot está atacando!');
        }
    }
}

function renascerBot() {
    if (!botVivo && renascimentosBot > 0) {
        botVivo = true; // O bot renasce
        posXbot = 3223; // Posição de renascimento do bot
        ataquesBot = 0; // Resetar o contador de ataques do bot
        renascimentosBot--; // Decrementar o contador de renascimentos
        console.log(`Bot renasceu! Restam ${renascimentosBot} renascimentos`);
    } else if (botVivo) {
        // Se o bot já está vivo, não faz nada
        return;
    }
}


function desenharBot(tempoAtual) {
    if (!botVivo) return; // Se o bot não estiver vivo, não desenhe

    let imagem = atacandoBot ? imagemAtaqueBot : imagemMovimentacaoBot;

    if (atacandoBot) {
        if (tempoAtual - tempoUltimoQuadroBot >= intervaloEntreQuadrosBot) {
            colunaSpriteBot++;
            if (colunaSpriteBot > 5) {
                colunaSpriteBot = 0;
                ataquesBot++; // Incrementa o contador de animações de ataque
                console.log(`Bot atacou! Total de ataques: ${ataquesBot}`);
                if (ataquesBot >= 5) {
                    vidas--; // O personagem perde uma vida
                    console.log(`O personagem perdeu uma vida! Vidas restantes: ${vidas}`);
                    ataquesBot = 0; // Reseta o contador de animações
                    if (vidas <= 0) {
                        gameOver = true; // Fim de jogo se vidas <= 0
                        console.log("Game Over!");
                    }
                }
                atacandoBot = false; // Para a animação após 5 ataques
            }
            tempoUltimoQuadroBot = tempoAtual;
        }
    }

    const scaleFactor = 3; // Aumentar o tamanho do bot
    contexto.drawImage(
        imagem,
        colunaSpriteBot * larguraFrameBot, linhaSpriteBot * alturaFraneBot,
        larguraFrameBot, alturaFraneBot,
        posXbot - cameraX, posYBot, // Corrigido para posXbot
        larguraFrameBot * scaleFactor, alturaFraneBot * scaleFactor // Aumentar o tamanho aqui
    );
}

// imagemMovimentacaoBot para verificar colisões e ataques
function verificarColisao() {
    if (posXbot +  larguraFrameBot > posXPersonagem && posXbot < posXPersonagem + larguraFramePersonagem) {
        // Verifica se o bot está atacando
        if (atacandoBot) {
            // Aqui poderia ser usado para animações ou efeitos adicionais, se desejado.
        }
    }

    // Dentro da lógica de ataque do personagem
    if (atacandoPersonagem && posXPersonagem + larguraFramePersonagem > posXbot && posXPersonagem < posXbot +  larguraFrameBot) {
        ataquesPersonagem++;
        console.log(`Ataques do personagem: ${ataquesPersonagem}`);
        if (ataquesPersonagem >= 50) {
            botVivo = false; // O bot morre após 50 ataques
            console.log("Bot foi derrotado!");
            ataquesPersonagem = 0; // Reseta o contador de animações
            botsVivos--; // Decrementa o contador de Bots vivos
            renascerBot(); // Renova o bot

            // Verifica se todos os Bots foram derrotados
            if (botsVivos <= 0) {
                console.log("Todos os Bots foram derrotados! A fase está liberada.");
                faseLiberada = true; // Libera a fase
            }

            // Adicione um log para verificar o número de Bots vivos
            console.log(`Bots vivos restantes: ${botsVivos}`);
        }
    }
}


// Função para Desenhar as Vidas
function desenharVidas() {
    const tamanhoCoracao = 50; // Defina o tamanho desejado para os corações
    for (let i = 0; i < vidas; i++) {
        contexto.drawImage(imagemCoracao, 10 + i * (tamanhoCoracao + 10), 10, tamanhoCoracao, tamanhoCoracao); // Aumente o tamanho aqui
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

    // Calcular a posição Y do botão de reinício
    const botaoY = canvas.height * 0.55; // 55% da altura do canvas, onde o botão está
    const textY = botaoY - 50; // Colocar o texto 50 pixels acima do botão

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
