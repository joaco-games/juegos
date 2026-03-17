// Configuración y Estado
const suits = [
    {n: 'Espadas', s: '⚔️', c: 'espadas'},
    {n: 'Bastos', s: '🪵', c: 'bastos'},
    {n: 'Oros', s: '🟡', c: 'oros'},
    {n: 'Copas', s: '🏆', c: 'copas'}
];
const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
let deck = [], hand = [], discardCard = null, score = 0;
let isMusicPlaying = false;

// Elementos DOM
const ui = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-ui'),
    hand: document.getElementById('player-hand'),
    discard: document.getElementById('discard-pile'),
    deckCnt: document.getElementById('deck-count'),
    score: document.getElementById('score'),
    msg: document.getElementById('feedback-matrix'),
    bgMusic: document.getElementById('bg-music'),
    sndCard: document.getElementById('snd-card'),
    sndSpecial: document.getElementById('snd-special'),
    musicBtn: document.getElementById('music-toggle')
};

// --- Gestión de Menús y Audio ---

function toggleOverlay(id) {
    document.getElementById(id).classList.toggle('active');
    playSimpleSound(300, 0.1);
}

function startGame() {
    ui.start.classList.remove('active');
    ui.game.classList.add('active');
    if(navigator.vibrate) navigator.vibrate(200);
    // Intentar reproducir música (muchos navegadores lo bloquean hasta interacción)
    if(isMusicPlaying) ui.bgMusic.play(); 
    initGame();
}

function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    if (isMusicPlaying) {
        ui.bgMusic.play().catch(()=>{
            alert("Toca la pantalla primero para permitir audio.");
            isMusicPlaying = false;
        });
        ui.musicBtn.innerText = '🔊';
    } else {
        ui.bgMusic.pause();
        ui.musicBtn.innerText = '🔇';
    }
}

function playSound(type) {
    // Resetear y reproducir
    ui[type].currentTime = 0;
    ui[type].play().catch(()=>{}); // Ignorar errores si no hay interacción
}

// Sonido sintético de respaldo si no hay archivos mp3
function playSimpleSound(freq, duration) {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, context.currentTime);
        gainNode.gain.setValueAtTime(0.1, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
    } catch(e) {}
}

// --- Lógica del Juego ---

function initGame() {
    createDeck();
    shuffle(deck);
    discardCard = deck.pop();
    for (let i = 0; i < 5; i++) hand.push(deck.pop());
    render();
}

function createDeck() {
    deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ suit: suit, value: value });
        });
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Generador de HTML de carta basado en CSS (Sin imágenes)
function getCardHTML(card, isBack = false) {
    if (isBack) return '<div class="card-visual card-back"></div>';
    
    const s = card.suit;
    const v = card.value;
    const isAnchoEspada = (v === 1 && s.n === 'Espadas');
    
    return `
        <div class="card-visual ${s.c} ${isAnchoEspada ? 'special-ancho' : ''}">
            <div class="c-top">
                <div class="c-number">${v}</div>
                <div class="c-suit-mini">${s.s}</div>
            </div>
            <div class="c-symbol-main">${s.s}</div>
            <div class="c-bottom" style="transform: rotate(180deg);">
                <div class="c-number">${v}</div>
                <div class="c-suit-mini">${s.s}</div>
            </div>
        </div>
    `;
}

function render() {
    // Renderizar Pila Descarte
    ui.discard.innerHTML = getCardHTML(discardCard);
    
    // Renderizar Mano
    ui.hand.innerHTML = '';
    hand.forEach((card, index) => {
        const cardNode = document.createRange().createContextualFragment(getCardHTML(card)).firstChild;
        cardNode.style.setProperty('--i', index - Math.floor(hand.length/2)); // Para el efecto abanico
        cardNode.onclick = (e) => animateAndPlayCard(index, e.target.closest('.card-visual'));
        ui.hand.appendChild(cardNode);
    });
    
    // Stats
    ui.deckCnt.innerText = deck.length;
    ui.score.innerText = score;
}

function animateAndPlayCard(index, cardEl) {
    const card = hand[index];
    
    // Regla UNO
    if (card.suit.n === discardCard.suit.n || card.value === discardCard.value) {
        
        // Animación de vuelo (básica)
        const rect = cardEl.getBoundingClientRect();
        const clone = cardEl.cloneNode(true);
        clone.classList.add('playing-card');
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.margin = '0';
        document.body.appendChild(clone);
        
        // Esconder la carta original instantáneamente
        cardEl.style.opacity = '0';

        // Mover clon al centro
        const discardRect = ui.discard.getBoundingClientRect();
        
        setTimeout(() => {
            clone.style.left = discardRect.left + 'px';
            clone.style.top = discardRect.top + 'px';
            clone.style.transform = 'rotate('+(Math.random()*20-10)+'deg)';
        }, 10);

        // Finalizar jugada tras animación
        setTimeout(() => {
            document.body.removeChild(clone);
            completePlayCard(index, card);
        }, 400);

    } else {
        // Error
        if(navigator.vibrate) navigator.vibrate([50, 100, 50]);
        playSimpleSound(100, 0.3);
        showFeedback("No orejee... no coincide");
    }
}

function completePlayCard(index, card) {
    discardCard = card;
    hand.splice(index, 1);
    
    // Puntos base
    let pointsGained = card.value; 
    
    // Lógica Truco simplificada (Bonus por cartas altas)
    if(card.value === 1) pointsGained += 20;
    if(card.value === 2) pointsGained += 15;
    if(card.value === 3) pointsGained += 10;

    // Sonido y feedback vibración normal
    playSound('sndCard');
    if(navigator.vibrate) navigator.vibrate(30);

    // MECÁNICA ESPECIAL: ANCHOS (1 de Espada o Basto)
    if (card.value === 1 && (card.suit.n === 'Espadas' || card.suit.n === 'Bastos')) {
        score += 100;
        showFeedback("¡QUIERO RETRUCO! +100");
        playSound('sndSpecial');
        if(navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
        
        // Limpiar mesa: Cambiar carta central por una aleatoria del mazo
        if(deck.length > 0) discardCard = deck.pop();
    }

    score += pointsGained;
    render();
    
    // Condición Victoria
    if (hand.length === 0) {
        showFeedback("¡FALTA ENVIDO Y TRUCO! GANASTE.");
        if(navigator.vibrate) navigator.vibrate(1000);
        setTimeout(()=> location.reload(), 3000);
    }
}

function drawCard() {
    if (deck.length > 0) {
        playSimpleSound(600, 0.1);
        hand.push(deck.pop());
        render();
    } else {
        showFeedback("Se acabó el mazo, canejo.");
    }
}

function showFeedback(text) {
    ui.msg.innerText = text;
    ui.msg.classList.add('active');
    setTimeout(() => ui.msg.classList.remove('active'), 1500);
}
