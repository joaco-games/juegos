const suits = ['Espada', 'Basto', 'Oro', 'Copa'];
const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
let deck = [];
let hand = [];
let discardCard = null;
let score = 0;

// Crear mazo español
function createDeck() {
    for (let s of suits) {
        for (let v of values) {
            deck.push({ suit: s, value: v });
        }
    }
    deck.sort(() => Math.random() - 0.5);
}

function initGame() {
    createDeck();
    discardCard = deck.pop();
    for (let i = 0; i < 5; i++) hand.push(deck.pop());
    render();
}

function render() {
    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    
    document.getElementById('discard-pile').innerText = `${discardCard.value} de ${discardCard.suit}`;
    document.getElementById('deck-count').innerText = deck.length;
    document.getElementById('score').innerText = score;

    hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.innerText = `${card.value}\n${card.suit}`;
        cardEl.onclick = () => playCard(index);
        handDiv.appendChild(cardEl);
    });
}

function playCard(index) {
    const card = hand[index];
    // Regla estilo UNO: mismo palo o mismo valor
    if (card.suit === discardCard.suit || card.value === discardCard.value) {
        discardCard = card;
        hand.splice(index, 1);
        score += 10;
        
        // Bonus de "Truco": El 1 de espada da puntos extra
        if (card.value === 1 && card.suit === 'Espada') {
            score += 50;
            alert("¡QUIERO VALE CUATRO! (Bonus de Espada)");
        }
        
        render();
    } else {
        alert("No puedes jugar esa carta. Debe coincidir palo o número.");
    }
}

function drawCard() {
    if (deck.length > 0) {
        hand.push(deck.pop());
        render();
    } else {
        alert("No quedan cartas en el mazo.");
    }
}

initGame();