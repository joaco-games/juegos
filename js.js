const suits = [
    {n: 'Espadas', s: '⚔️', c: '#1976d2'},
    {n: 'Bastos', s: '🪵', c: '#388e3c'},
    {n: 'Oros', s: '🟡', c: '#fbc02d'},
    {n: 'Copas', s: '🏆', c: '#d32f2f'}
];
const values = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
let deck = [], hand = [], discardCard = null, score = 0;

function startGame() {
    document.getElementById('start-screen').classList.remove('active');
    initGame();
}

function initGame() {
    deck = [];
    suits.forEach(s => values.forEach(v => deck.push({ suit: s, value: v })));
    deck.sort(() => Math.random() - 0.5);
    
    discardCard = deck.pop();
    for (let i = 0; i < 5; i++) hand.push(deck.pop());
    render();
}

function render() {
    document.getElementById('discard-pile').innerHTML = createCardHTML(discardCard);
    document.getElementById('deck-count').innerText = deck.length;
    document.getElementById('score').innerText = score;

    const handDiv = document.getElementById('player-hand');
    handDiv.innerHTML = '';
    hand.forEach((card, i) => {
        const div = document.createElement('div');
        div.innerHTML = createCardHTML(card);
        const cardEl = div.firstChild;
        cardEl.style.setProperty('--r', (i - hand.length/2) * 6);
        cardEl.onclick = () => playCard(i);
        handDiv.appendChild(cardEl);
    });
}

function createCardHTML(card) {
    const isSpecial = (card.value === 1 && card.suit.n === 'Espadas');
    return `
        <div class="card-obj ${isSpecial ? 'special' : ''}">
            <b style="color:${card.suit.c}">${card.value}</b>
            <div style="font-size:2.5rem; text-align:center">${card.suit.s}</div>
            <b style="align-self:flex-end; transform:rotate(180deg); color:${card.suit.c}">${card.value}</b>
        </div>
    `;
}

function playCard(i) {
    const card = hand[i];
    if (card.suit.n === discardCard.suit.n || card.value === discardCard.value) {
        if(navigator.vibrate) navigator.vibrate(50);
        discardCard = card;
        hand.splice(i, 1);
        score += 10;

        if (card.value === 1 && card.suit.n === 'Espadas') {
            score += 100;
            notify("¡ANCHO DE ESPADA! +100");
            if(deck.length > 0) discardCard = deck.pop();
        }

        render();
        if(hand.length === 0) {
            notify("¡MANO GANADA!");
            setTimeout(initGame, 2000);
        }
    } else {
        notify("¡No podés tirar esa!");
    }
}

function drawCard() {
    if(deck.length > 0) {
        hand.push(deck.pop());
        render();
    }
}

function notify(txt) {
    const el = document.getElementById('announcement');
    el.innerText = txt;
    el.classList.add('show-msg');
    setTimeout(() => el.classList.remove('show-msg'), 1200);
}
