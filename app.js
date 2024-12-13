let caractereAtual = '';
const synth = window.speechSynthesis;

// Adicionar estas constantes no início do arquivo
const PRECISAO_MINIMA = 0.60; // Reduzir para 60%
const TOLERANCIA = 5; // Aumentar para 5 pixels

// Adicionar constante para diferenciação entre letras e números
const PRECISAO_NUMEROS = 0.65; // Reduzir para 65% para números

// Adicionar este objeto no início do arquivo, após as constantes
const PALAVRAS_EXEMPLO = {
    'A': { palavra: 'Abelha', icone: '🐝' },
    'B': { palavra: 'Bola', icone: '⚽' },
    'C': { palavra: 'Casa', icone: '🏠' },
    'D': { palavra: 'Dado', icone: '🎲' },
    'E': { palavra: 'Elefante', icone: '🐘' },
    'F': { palavra: 'Faca', icone: '🔪' },
    'G': { palavra: 'Gato', icone: '🐱' },
    'H': { palavra: 'Hora', icone: '⏰' },
    'I': { palavra: 'Igreja', icone: '⛪' },
    'J': { palavra: 'Jacaré', icone: '🐊' },
    'K': { palavra: 'Kiwi', icone: '🥝' },
    'L': { palavra: 'Leão', icone: '🦁' },
    'M': { palavra: 'Macaco', icone: '🐒' },
    'N': { palavra: 'Navio', icone: '🚢' },
    'O': { palavra: 'Ovo', icone: '🥚' },
    'P': { palavra: 'Pato', icone: '🦆' },
    'Q': { palavra: 'Queijo', icone: '🧀' },
    'R': { palavra: 'Rato', icone: '🐭' },
    'S': { palavra: 'Sapo', icone: '🐸' },
    'T': { palavra: 'Tatu', icone: '🦕' },
    'U': { palavra: 'Uva', icone: '🍇' },
    'V': { palavra: 'Vaca', icone: '🐮' },
    'W': { palavra: 'Waffle', icone: '🧇' },
    'X': { palavra: 'Xícara', icone: '☕' },
    'Y': { palavra: 'Yoga', icone: '🧘' },
    'Z': { palavra: 'Zebra', icone: '🦓' },
    '0': { palavra: 'Zero', icone: '0️⃣' },
    '1': { palavra: 'Um', icone: '1️⃣' },
    '2': { palavra: 'Dois', icone: '2️⃣' },
    '3': { palavra: 'Três', icone: '3️⃣' },
    '4': { palavra: 'Quatro', icone: '4️⃣' },
    '5': { palavra: 'Cinco', icone: '5️⃣' },
    '6': { palavra: 'Seis', icone: '6️⃣' },
    '7': { palavra: 'Sete', icone: '7️⃣' },
    '8': { palavra: 'Oito', icone: '8️⃣' },
    '9': { palavra: 'Nove', icone: '9️⃣' }
};

// Adicionar configurações de voz
const CONFIGURACOES_VOZ = {
    lang: 'pt-BR',
    rate: 0.8,        // Velocidade (0.1 a 2.0)
    pitch: 1.2,       // Tom (0.1 a 2.0)
    volume: 1.0,      // Volume (0.0 a 1.0)
    voiceIndex: 0     // Índice da voz (podemos mudar para escolher diferentes vozes)
};

function mostrarSelecao(tipo) {
    const selecao = document.getElementById('selecao-caracteres');
    
    // Limpar conteúdo anterior
    selecao.innerHTML = '';
    
    // Criar grid de caracteres
    const grid = document.createElement('div');
    grid.className = 'grid-caracteres';
    
    // Criar botão voltar
    const btnVoltar = document.createElement('button');
    btnVoltar.className = 'btn-voltar';
    btnVoltar.onclick = voltarMenu;
    btnVoltar.textContent = 'Voltar';
    
    // Adicionar elementos ao selecao
    selecao.appendChild(grid);
    selecao.appendChild(btnVoltar);
    
    // Preencher grid com caracteres
    const caracteres = tipo === 'letras' 
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        : '0123456789'.split('');
    
    caracteres.forEach(char => {
        const btn = document.createElement('button');
        btn.textContent = char;
        btn.onclick = () => iniciarAtividade(char);
        grid.appendChild(btn);
    });
    
    selecao.classList.remove('escondido');
    document.getElementById('menu-principal').classList.add('escondido');
}

function iniciarAtividade(caractere) {
    caractereAtual = caractere;
    document.getElementById('selecao-caracteres').classList.add('escondido');
    document.getElementById('area-atividade').classList.remove('escondido');
    
    // Atualizar a letra de referência
    const letraRef = document.querySelector('.letra-referencia');
    letraRef.textContent = caractere;
    
    // Adicionar evento de clique na letra
    letraRef.onclick = falarLetra;
    
    // Mostrar o ícone exemplo e adicionar evento de clique
    const imagemExemplo = document.querySelector('.imagem-exemplo');
    if (PALAVRAS_EXEMPLO[caractere]) {
        imagemExemplo.textContent = PALAVRAS_EXEMPLO[caractere].icone;
        imagemExemplo.style.opacity = '1';
        imagemExemplo.style.cursor = 'pointer'; // Adicionar cursor pointer
        imagemExemplo.onclick = falar; // Adicionar mesmo evento do botão "Ouvir Exemplo"
    } else {
        imagemExemplo.style.opacity = '0';
    }
    
    iniciarCanvas();
}

function iniciarCanvas() {
    const canvas = document.getElementById('canvas-desenho');
    const tamanho = Math.min(window.innerWidth - 40, 400);
    canvas.width = tamanho;
    canvas.height = tamanho;
    
    const ctx = canvas.getContext('2d');
    let desenhando = false;
    let ultimoX, ultimoY;

    // Desenhar letra guia
    desenharLetraGuia(ctx);

    function iniciarDesenho(e) {
        e.preventDefault();
        desenhando = true;
        const pos = getPosicaoMouse(e);
        ultimoX = pos.x;
        ultimoY = pos.y;
    }

    function desenhar(e) {
        if (!desenhando) return;
        e.preventDefault();

        const pos = getPosicaoMouse(e);
        ctx.beginPath();
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--cor-principal');
        ctx.lineWidth = tamanho * 0.02;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(ultimoX, ultimoY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        ultimoX = pos.x;
        ultimoY = pos.y;
    }

    function pararDesenho() {
        desenhando = false;
    }

    function getPosicaoMouse(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        if (e.touches && e.touches[0]) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    // Limpar eventos anteriores
    canvas.removeEventListener('mousedown', iniciarDesenho);
    canvas.removeEventListener('mousemove', desenhar);
    canvas.removeEventListener('mouseup', pararDesenho);
    canvas.removeEventListener('mouseleave', pararDesenho);
    canvas.removeEventListener('touchstart', iniciarDesenho);
    canvas.removeEventListener('touchmove', desenhar);
    canvas.removeEventListener('touchend', pararDesenho);

    // Adicionar novos eventos
    canvas.addEventListener('mousedown', iniciarDesenho);
    canvas.addEventListener('mousemove', desenhar);
    canvas.addEventListener('mouseup', pararDesenho);
    canvas.addEventListener('mouseleave', pararDesenho);

    canvas.addEventListener('touchstart', iniciarDesenho);
    canvas.addEventListener('touchmove', desenhar);
    canvas.addEventListener('touchend', pararDesenho);
}

function desenharLetraGuia(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    ctx.font = `${ctx.canvas.width * 0.6}px Comic Sans MS`;
    const medidas = ctx.measureText(caractereAtual);
    const x = (ctx.canvas.width - medidas.width) / 2;
    const y = (ctx.canvas.height + ctx.canvas.width * 0.3) / 2;
    
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.strokeText(caractereAtual, x, y);
}

function limparDesenho() {
    iniciarCanvas();
}

// Modificar a função falar
function falar() {
    synth.cancel();

    const exemplo = PALAVRAS_EXEMPLO[caractereAtual];
    const prefixo = /^\d$/.test(caractereAtual) ? 'NÚMERO' : 'LETRA';
    const texto = `${prefixo}... ${caractereAtual}... ${exemplo ? exemplo.palavra : caractereAtual}`;
    
    const utterance = new SpeechSynthesisUtterance(texto);
    
    // Aplicar configurações
    utterance.lang = CONFIGURACOES_VOZ.lang;
    utterance.rate = CONFIGURACOES_VOZ.rate;
    utterance.pitch = CONFIGURACOES_VOZ.pitch;
    utterance.volume = CONFIGURACOES_VOZ.volume;
    
    // Adicionar pausas mais longas
    utterance.text = texto.replace(/\.\.\./g, '............');
    
    // Selecionar a voz
    const vozes = synth.getVoices();
    const vozesPortugues = vozes.filter(voz => voz.lang.includes('pt-BR'));
    
    if (vozesPortugues.length > 0) {
        utterance.voice = vozesPortugues[CONFIGURACOES_VOZ.voiceIndex];
    }

    synth.speak(utterance);
}

// Modificar a função falarLetra também
function falarLetra() {
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(caractereAtual);
    
    utterance.lang = CONFIGURACOES_VOZ.lang;
    utterance.rate = CONFIGURACOES_VOZ.rate;
    utterance.pitch = CONFIGURACOES_VOZ.pitch;
    utterance.volume = CONFIGURACOES_VOZ.volume;
    
    const vozes = synth.getVoices();
    const vozesPortugues = vozes.filter(voz => voz.lang.includes('pt-BR'));
    
    if (vozesPortugues.length > 0) {
        utterance.voice = vozesPortugues[CONFIGURACOES_VOZ.voiceIndex];
    }

    synth.speak(utterance);
}

// Função para listar vozes disponíveis (para debug)
window.speechSynthesis.onvoiceschanged = function() {
    const vozes = synth.getVoices();
    const vozesPortugues = vozes.filter(voz => voz.lang.includes('pt-BR'));
    console.log('Vozes em português disponíveis:', 
        vozesPortugues.map((voz, index) => `${index}: ${voz.name}`));
};

// Função para trocar a voz (pode ser chamada para testar diferentes vozes)
function trocarVoz(index) {
    CONFIGURACOES_VOZ.voiceIndex = index;
    // Testar a nova voz
    falar();
}

function verificarDesenhoManualmente() {
    const canvas = document.getElementById('canvas-desenho');
    const ctx = canvas.getContext('2d');
    
    // Verificar se há desenho
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!temDesenho(imageData)) {
        mostrarMensagem("Desenhe algo primeiro!");
        return;
    }

    // Criar canvas temporário para o padrão
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Desenhar o padrão ideal
    tempCtx.font = `${canvas.width * 0.6}px Comic Sans MS`;
    const medidas = tempCtx.measureText(caractereAtual);
    const x = (canvas.width - medidas.width) / 2;
    const y = (canvas.height + canvas.width * 0.3) / 2;
    
    tempCtx.fillStyle = 'black';
    tempCtx.fillText(caractereAtual, x, y);
    
    // Comparar o desenho com o padrão
    const padrao = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const resultado = analisarDesenho(imageData, padrao);
    
    // Usar precisão diferente para números
    const precisaoMinima = /^\d$/.test(caractereAtual) ? PRECISAO_NUMEROS : PRECISAO_MINIMA;
    
    // Reduzir o requisito de cobertura
    if (resultado.precisao >= precisaoMinima && resultado.cobertura >= 0.4) {
        mostrarMensagem("Muito bem!");
        canvas.classList.add('desenho-correto');
        setTimeout(() => {
            canvas.classList.remove('desenho-correto');
            limparDesenho();
        }, 1500);
    } else {
        mostrarMensagem("Tente novamente!");
        canvas.classList.add('desenho-incorreto');
        setTimeout(() => {
            canvas.classList.remove('desenho-incorreto');
        }, 1500);
    }
}

// Nova função para análise mais detalhada do desenho
function analisarDesenho(desenho, padrao) {
    let acertos = 0;
    let totalPixelsPadrao = 0;
    let pixelsDesenho = 0;
    
    // Primeiro, contar pixels do desenho
    for (let i = 3; i < desenho.data.length; i += 4) {
        if (desenho.data[i] > 127) {
            pixelsDesenho++;
        }
    }
    
    // Analisar correspondência com o padrão
    for (let y = 0; y < padrao.height; y++) {
        for (let x = 0; x < padrao.width; x++) {
            const i = (y * padrao.width + x) * 4;
            if (padrao.data[i + 3] > 127) {
                totalPixelsPadrao++;
                if (verificarAreaPixel(x, y, desenho, padrao.width, padrao.height)) {
                    acertos++;
                }
            }
        }
    }
    
    const precisao = totalPixelsPadrao > 0 ? acertos / totalPixelsPadrao : 0;
    const cobertura = pixelsDesenho / (totalPixelsPadrao * 1.2); // Permitir 20% a mais de pixels
    
    return {
        precisao: precisao,
        cobertura: cobertura
    };
}

// Modificar a função verificarAreaPixel para ser menos rigorosa
function verificarAreaPixel(x, y, imageData, width, height) {
    let pixelsEncontrados = 0;
    const toleranciaQuadrada = TOLERANCIA * TOLERANCIA;
    
    for (let dy = -TOLERANCIA; dy <= TOLERANCIA; dy++) {
        for (let dx = -TOLERANCIA; dx <= TOLERANCIA; dx++) {
            if (dx*dx + dy*dy <= toleranciaQuadrada) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const i = (ny * width + nx) * 4;
                    if (imageData.data[i + 3] > 127) {
                        pixelsEncontrados++;
                        if (pixelsEncontrados > 1) { // Reduzir para apenas 1 pixel necessário
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function temDesenho(imageData) {
    for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
    }
    return false;
}

function mostrarMensagem(texto) {
    let msg = document.getElementById('mensagem-feedback');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'mensagem-feedback';
        document.getElementById('area-atividade').appendChild(msg);
    }
    
    msg.textContent = texto;
    msg.style.opacity = '1';
    
    setTimeout(() => {
        msg.style.opacity = '0';
    }, 2000);
}

function voltarMenu() {
    document.getElementById('area-atividade').classList.add('escondido');
    document.getElementById('selecao-caracteres').classList.add('escondido');
    document.getElementById('menu-principal').classList.remove('escondido');
} 