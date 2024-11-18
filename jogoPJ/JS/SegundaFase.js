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
imagemCenario.src = 'IMG/fundoLago.png';
const alturaPlataforma = 748;
const larguraCenario = 3220.7447;

// Configurações do Personagem Principal
const larguraFramePersonagem = 64;
const alturaFramePersonagem = 64;
const imagemMovimentacao = new Image();
imagemMovimentacao.src = 'IMG/PrincipeAndar.png';
const imagemAtaque = new Image();
imagemAtaque.src = 'IMG/PrincipeAttk.png';
const imagemCoracao = new Image();
imagemCoracao.src = 'IMG/Coracao.png';
const imagemFundoPausa = new Image();
imagemFundoPausa.src = 'IMG/LagoSomb.jpg'

let posXPersonagem = 955;
let posYPersonagem = 540;
let velocidadePersonagem = 2;
let colunaSpritePersonagem = 0;
let linhaSpritePersonagem = 0;
let atacandoPersonagem = false;
let direcaoPersonagem = 0;
let tempoUltimoQuadroPersonagem = 0;
let tempoUltimoAtaquePersonagem = 0;
const intervaloEntreQuadrosPersonagem = 100;
const intervaloEntreAtaquesPersonagem = 500;

// Configurações do Bot (Lesma)
const larguraFrameLesma = 72;
const alturaFrameLesma = 36;
const imagemMovimentacaoLesma = new Image();
imagemMovimentacaoLesma.src = 'IMG/lesmaAndar.png'; // Sprite de movimento do lesma
const imagemAtaqueLesma = new Image();
imagemAtaqueLesma.src = 'IMG/lesmaAttk.png'; // Sprite de ataque do lesma

let posXLesma = 3200;
let posYLesma = 600;
let velocidadeLesma = 2;
let colunaSpriteLesma = 0;
let linhaSpriteLesma = 0;
let atacandoLesma = false;
let direcaoLesma = 0;
let tempoUltimoQuadroLesma = 0;
let tempoUltimoAtaqueLesma = 0;
let opacidadePausa = 0;
let opacidade = 0;
let botaoReiniciar;
const taxaFade = 0.02;
let botaoVoltar;
let faseLiberada = false;
const intervaloEntreQuadrosLesma = 100;
const intervaloEntreAtaquesLesma = 500;

// Inicialização
let gameOver = false;
const maxVidas = 3;
let vidas = maxVidas;
let ataquesLesma = 0; // Contador de animações de ataque do lesma
let renascimentosLesma = 7; // Total de renascimentos do lesma
let ataquesPersonagem = 0; // Contador de animações de ataque do personagem
let lesmaViva = true; // Estado do lesma
let naAreaLesma = false; // Indica se o personagem está na área do lesma

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
    window.location.href = 'telaCutScene3.html'; // Redireciona para o link da segunda fase
        }


    // Desenhar o cenário
    contexto.drawImage(imagemCenario, -cameraX, alturaPlataforma - canvas.height, larguraCenario / zoom, canvas.height / zoom);

    desenharVidas();

    // Mover e desenhar o personagem
    moverPersonagem(tempoAtual);
    desenharPersonagem(tempoAtual);

    // Verificar se o Lesma ainda renasce e desenhá-lo
    if (lesmaViva && renascimentosLesma > 0) {
        moverLesma(tempoAtual, posXPersonagem);
        desenharLesma(tempoAtual);
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

function moverLesma(tempoAtual, posXPersonagem) {
    if (atacandoLesma) return;

    // Verifica se o lesma invadiu a área do personagem
    if (posXLesma > -larguraFrameLesma
    
    ) {
        if (posXLesma > posXPersonagem) {
            direcaoLesma = 2;
            linhaSpriteLesma = 1;
            if (tempoAtual - tempoUltimoQuadroLesma >= intervaloEntreQuadrosLesma
            
            ) {
                colunaSpriteLesma = (colunaSpriteLesma + 1) % 4;
                tempoUltimoQuadroLesma = tempoAtual;
            }
            posXLesma -= velocidadeLesma; // Move em direção ao personagem
        } else if (posXLesma < posXPersonagem) {
            direcaoLesma = 3;
            linhaSpriteLesma = 1;
            if (tempoAtual - tempoUltimoQuadroLesma >= intervaloEntreQuadrosLesma
            
            ) {
                colunaSpriteLesma = (colunaSpriteLesma + 1) % 4;
                tempoUltimoQuadroLesma = tempoAtual;
            }
            posXLesma += velocidadeLesma; // Move em direção ao personagem
        }

        // Verifica se o lesma entrou na área do personagem para iniciar o ataque
        if (posXLesma + larguraFrameLesma
         > posXPersonagem && posXLesma < posXPersonagem + larguraFramePersonagem) {
            atacandoLesma = true; // Inicia o ataque do lesma
            console.log('Lesma está atacando!');
        }
    }
}

function renascerLesma() {
    if (!lesmaViva && renascimentosLesma > 0) {
        lesmaViva = true; // O lesma renasce
        posXLesma = 3223; // Posição de renascimento do lesma
        ataquesLesma = 0; // Resetar o contador de ataques do lesma
        renascimentosLesma--; // Decrementar o contador de renascimentos
        console.log(`Lesma renasceu! Restam ${renascimentosLesma} renascimentos`);
    }
}

function desenharLesma(tempoAtual) {
    if (!lesmaViva) return; // Se o lesma não estiver vivo, não desenhe

    let imagem = atacandoLesma ? imagemAtaqueLesma : imagemMovimentacaoLesma;

    if (atacandoLesma) {
        if (tempoAtual - tempoUltimoQuadroLesma >= intervaloEntreQuadrosLesma
        
        ) {
            colunaSpriteLesma++;
            if (colunaSpriteLesma > 5) {
                colunaSpriteLesma = 0;
                ataquesLesma++; // Incrementa o contador de animações de ataque
                console.log(`Lesma atacou! Total de ataques: ${ataquesLesma}`);
                if (ataquesLesma >= 3) {
                    vidas--; // O personagem perde uma vida
                    console.log(`O personagem perdeu uma vida! Vidas restantes: ${vidas}`);
                    ataquesLesma = 0; // Reseta o contador de animações
                    if (vidas <= 0) {
                        gameOver = true; // Fim de jogo se vidas <= 0
                        console.log("Game Over!");
                    }
                }
                atacandoLesma = false; // Para a animação após 5 ataques
            }
            tempoUltimoQuadroLesma = tempoAtual;
        }
    }

    const scaleFactor = 2; // Aumentar o tamanho do lesma
    contexto.drawImage(
        imagem,
        colunaSpriteLesma * larguraFrameLesma
    , linhaSpriteLesma * alturaFrameLesma,
        larguraFrameLesma
    , alturaFrameLesma,
        posXLesma - cameraX, posYLesma,
        larguraFrameLesma
     * scaleFactor, alturaFrameLesma * scaleFactor // Aumentar o tamanho aqui
    );
}

// Verificação de Colisão
function verificarColisao() {
    if (posXLesma + larguraFrameLesma
     > posXPersonagem && posXLesma < posXPersonagem + larguraFramePersonagem) {
        // Verifica se o lesma está atacando
        if (atacandoLesma) {
            // Aqui poderia ser usado para animações ou efeitos adicionais, se desejado.
        }
    }

    // Verifica se o personagem está atacando o lesma
    if (atacandoPersonagem && posXPersonagem + larguraFramePersonagem > posXLesma && posXPersonagem < posXLesma + larguraFrameLesma
    
    ) {
        ataquesPersonagem++;
        console.log(`Ataques do personagem: ${ataquesPersonagem}`);
        if (ataquesPersonagem >= 50){
            lesmaViva = false; // O lesma morre após 2 ataques
            console.log("Lesma foi derrotado!");
            ataquesPersonagem = 0; // Reseta o contador de animações
            renascerLesma(); // renasce o lesma
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
