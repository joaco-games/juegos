const suits = ['Espadas', 'Bastos', 'Oros', 'Copas'];
const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
let deck = [], hand = [], discardCard = null, score = 0;

// Sonidos básicos usando el sintetizador del navegador
const playSound = (freq, type = 'sine') => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
};

function initGame() {
    createDeck();
    discardCard = deck.pop();
    for (let i = 0; i < 5; i++) hand.push(deck.pop());
    render();
}

function createDeck() {
    suits.forEach(s => values.forEach(v => deck.push({ suit: s, value: v })));
    deck.sort(() => Math.random() - 0.5);
}

function render() {
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    
    // Renderizar Descarte
    document.getElementById('discard-pile').innerHTML = createCardHTML(discardCard);
    document.getElementById('deck-count').innerText = deck.length;
    document.getElementById('score').innerText = score;

    // Renderizar Mano
    hand.forEach((card, i) => {
        const cardEl = document.createElement('div');
        cardEl.innerHTML = createCardHTML(card);
        cardEl.onclick = () => playCard(i);
        handDiv.appendChild(cardEl.firstChild);
    });
}

function createCardHTML(card) {
    const isSpecial = (card.value === 1 && (card.suit === 'Espadas' || card.suit === 'Bastos'));
    return `
        <div class="card ${isSpecial ? 'special' : ''}" style="color: ${card.suit === 'Oros' || card.suit === 'Copas' ? 'red' : 'black'}">
            <span>${card.value}</span>
            <small>${card.suit}</small>
            <span style="align-self: flex-end">${card.value}</span>
        </div>
    `;
}

function playCard(index) {
    const card = hand[index];
    if (card.suit === discardCard.suit || card.value === discardCard.value) {
        // Feedback Háptico (Vibración)
        if (navigator.vibrate) navigator.vibrate(50);
        playSound(440, 'triangle');
        
        discardCard = card;
        hand.splice(index, 1);
        score += 10;
        
        if (card.value === 1 && card.suit === 'Espadas') {
            score += 100;
            notify("¡ANCHO DE ESPADA! +100");
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
        
        render();
    } else {
        playSound(150, 'sawtooth');
        notify("No coincide el palo o número");
    }
}

function notify(txt) {
    const msg = document.getElementById('msg-box');
    msg.innerText = txt;
    msg.style.transform = "scale(1.2)";
    setTimeout(() => msg.style.transform = "scale(1)", 300);
}

function drawCard() {
    if (deck.length > 0) {
        playSound(600);
        hand.push(deck.pop());
        render();
    }
}

initGame();

initGame();
