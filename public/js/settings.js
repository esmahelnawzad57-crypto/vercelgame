/* eslint-disable func-names */
/* global io, my, Howl */
const socket = io();
const params = window.location.toString().substring(window.location.toString().indexOf('?'));
const searchParams = new URLSearchParams(params);
const copyBtn = document.querySelector('#copy');
let language = 'English';

const pop = typeof Howl !== 'undefined' ? new Howl({ src: ['audio/pop.mp3'] }) : { play: () => {} };
const exit = typeof Howl !== 'undefined' ? new Howl({ src: ['audio/exit.mp3'] }) : { play: () => {} };

function animateCSS(element, animation, selector = true) {
    return new Promise((resolve) => {
        const animationName = `animate__${animation}`;
        const node = selector ? document.querySelector(element) : element;

        if (!node) {
            resolve('Element not found');
            return;
        }

        node.classList.add('animate__animated', animationName);
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove('animate__animated', animationName);
            resolve('Animation ended');
        }
        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
}

function updateSettings(e) {
    if (e) e.preventDefault();
    
    const roundsEl = document.querySelector('#rounds');
    const timeEl = document.querySelector('#time');
    const customWordsEl = document.querySelector('#customWords');
    const probabilityEl = document.querySelector('#probability');
    const languageEl = document.querySelector('#language');

    socket.emit('settingsUpdate', {
        rounds: roundsEl ? roundsEl.value : 2,
        time: timeEl ? timeEl.value : 40,
        customWords: customWordsEl ? Array.from(new Set(customWordsEl.value.split('\n').map((word) => word.trim()).filter((word) => word !== ''))) : [],
        probability: probabilityEl ? probabilityEl.value : 0,
        language: languageEl ? languageEl.value : 'English',
    });
}

function putPlayer(player) {
    if (!player || !player.name) return;
    if (document.querySelector(`#skribblr-${player.id}`)) return;

    const div = document.createElement('div');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const text = document.createTextNode(player.name);
    div.id = `skribblr-${player.id}`;
    p.appendChild(text);
    p.classList.add('text-center', 'text-white', 'mt-2');
    img.src = player.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=avatar';
    img.alt = player.name;
    img.classList.add('img-fluid', 'rounded-circle');
    div.classList.add('col-4', 'col-sm-3', 'col-md-4', 'col-lg-3', 'mb-3');
    
    img.onload = async () => {
        div.appendChild(img);
        div.appendChild(p);
        const playersDiv = document.querySelector('#playersDiv');
        if (playersDiv) {
            playersDiv.appendChild(div);
            pop.play();
            await animateCSS(div, 'fadeInDown', false);
        }
    };
}

function showCanvasArea() {
    const sketchpad = document.createElement('script');
    const canvas = document.createElement('script');
    sketchpad.src = 'https://cdn.jsdelivr.net/npm/responsive-sketchpad/dist/sketchpad.min.js';
    canvas.src = 'js/canvas.js';
    document.body.append(sketchpad);
    sketchpad.addEventListener('load', async () => {
        document.body.append(canvas);
        const set1 = document.querySelector('#settings>div');
        const set2 = document.querySelector('#settings>div:nth-of-type(2)');
        if (set1) animateCSS(set1, 'fadeOutLeft', false);
        if (set2) animateCSS(set2, 'fadeOutRight', false);
        
        const gameZone = document.querySelector('#gameZone');
        if (gameZone) {
            gameZone.classList.remove('d-none');
            await animateCSS('#gameZone', 'fadeInDown');
        }
        const settingsArea = document.querySelector('#settings');
        if (settingsArea) settingsArea.remove();
    });
}

socket.on('joinRoom', putPlayer);
socket.on('otherPlayers', (players) => {
    if (players) players.forEach((player) => putPlayer(player));
});
socket.on('disconnection', async (player) => {
    if (player && document.querySelector(`#skribblr-${player.id}`)) {
        exit.play();
        await animateCSS(`#skribblr-${player.id}`, 'fadeOutUp');
        document.querySelector(`#skribblr-${player.id}`).remove();
    }
});
socket.on('startGame', showCanvasArea);

// بەشی جۆینبوون یان دروستکردنی ژوور
if (searchParams.has('id')) {
    const roundsEl = document.querySelector('#rounds');
    const timeEl = document.querySelector('#time');
    const startGameEl = document.querySelector('#startGame');
    const languageEl = document.querySelector('#language');

    if (roundsEl) roundsEl.setAttribute('disabled', true);
    if (timeEl) timeEl.setAttribute('disabled', true);
    if (startGameEl) startGameEl.setAttribute('disabled', true);
    if (languageEl) languageEl.setAttribute('disabled', true);
    
    const playGameBtn = document.querySelector('#playGame');
    if (playGameBtn) {
        playGameBtn.addEventListener('click', async () => {
            const nameInput = document.querySelector('#playerName');
            if (!nameInput || !nameInput.value.trim()) {
                alert('تکایە سەرەتا ناوەکەت بنووسە!');
                return;
            }
            
            my.name = nameInput.value.trim();
            my.id = socket.id;
            
            const landingArea = document.querySelector('#landing');
            if (landingArea) {
                animateCSS('#landing>div>div', 'fadeOut');
                landingArea.remove();
            }
            
            const settingsArea = document.querySelector('#settings');
            if (settingsArea) {
                settingsArea.classList.remove('d-none');
                animateCSS('#settings div', 'jackInTheBox');
            }
            
            const gameLinkInput = document.querySelector('#gameLink');
            if (gameLinkInput) gameLinkInput.value = window.location.href;
            putPlayer(my);
            
            socket.emit('joinRoom', { id: searchParams.get('id'), player: my });
        });
    }
} else {
    // خاوەنی ژوورەکە
    const roundsEl = document.querySelector('#rounds');
    const timeEl = document.querySelector('#time');
    const customWordsEl = document.querySelector('#customWords');
    const probabilityEl = document.querySelector('#probability');
    const languageEl = document.querySelector('#language');

    if (roundsEl) roundsEl.addEventListener('input', updateSettings);
    if (timeEl) timeEl.addEventListener('input', updateSettings);
    if (customWordsEl) customWordsEl.addEventListener('change', updateSettings);
    if (probabilityEl) probabilityEl.addEventListener('change', updateSettings);
    if (languageEl) languageEl.addEventListener('change', updateSettings);
    
    const createRoomBtn = document.querySelector('#createRoom');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', async () => {
            const nameInput = document.querySelector('#playerName');
            if (!nameInput || !nameInput.value.trim()) {
                alert('تکایە سەرەتا ناوەکەت بنووسە بۆ دروستکردنی ژوور!');
                return;
            }
            
            my.name = nameInput.value.trim();
            my.id = socket.id;
            
            socket.emit('newPrivateRoom', my);
            
            const landingArea = document.querySelector('#landing');
            if (landingArea) {
                await animateCSS('#landing>div>div', 'fadeOut');
                landingArea.remove();
            }
            
            const settingsArea = document.querySelector('#settings');
            if (settingsArea) {
                settingsArea.classList.remove('d-none');
                animateCSS('#settings div', 'jackInTheBox');
            }
        });
    }
}

socket.on('newPrivateRoom', (data) => {
    if (data && data.gameID) {
        socket.roomID = data.gameID;
        const gameLinkInput = document.querySelector('#gameLink');
        if (gameLinkInput) {
            gameLinkInput.value = `${window.location.protocol}//${window.location.host}/?id=${data.gameID}`;
        }
        putPlayer(my);
    }
});

if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const gameLinkInput = document.querySelector('#gameLink');
        if (gameLinkInput) {
            gameLinkInput.select();
            document.execCommand('copy');
            alert('بەستەری ژوورەکە کۆپی کرا!');
        }
    });
}

const startGameBtn = document.querySelector('#startGame');
if (startGameBtn) {
    startGameBtn.addEventListener('click', async () => {
        showCanvasArea();
        socket.emit('startGame');
        socket.emit('getPlayers');
    });
}

const languageSelect = document.querySelector('#language');
if (languageSelect) {
    languageSelect.addEventListener('input', function () {
        language = this.value;
        if (language === 'English') return;
        if (document.querySelector('#transliterate')) return;
        const script = document.createElement('script');
        script.id = 'transliterate';
        script.src = 'js/transliterate.js';
        document.body.append(script);
    });
}

/* ------------------------------------------------------------- */
/* 🎮 لۆجیکی دوگمە نوێیەکانی کۆتایی یاری (دووبارەکردنەوە و چوونە دەرەوە) */
/* ------------------------------------------------------------- */

// 🔄 کاتێک کلیک لەسەر دووبارەکردنەوەی یاری دەکرێت (تەنها خاوەنی ژوور)
const restartGameBtn = document.querySelector('#restartGameBtn');
if (restartGameBtn) {
    restartGameBtn.addEventListener('click', () => {
        socket.emit('startGame'); // ناردنی فەرمانی دەستپێکردنەوە بۆ سێرڤەر
    });
}

// 🚪 کاتێک یاریزانێک دەیەوێت بچێتە دەرەوە و بگەڕێتەوە بۆ لاپەڕەی سەرەکی
const exitGameBtn = document.querySelector('#exitGameBtn');
if (exitGameBtn) {
    exitGameBtn.addEventListener('click', () => {
        window.location.href = window.location.origin;
    });
}

// 📡 کاتێک سێرڤەر فەرمانی دەستپێکردنەوەی یاری دەنێرێت بۆ هەمووان
socket.on('gameRestarted', () => {
    const gameEndedArea = document.querySelector('#gameEnded');
    if (gameEndedArea) gameEndedArea.classList.add('d-none'); // شاردنەوەی ئەنجامەکان
    
    const gameZone = document.querySelector('#gameZone');
    if (gameZone) gameZone.classList.remove('d-none'); // پیشاندانەوەی شاشەی یاری
    
    showCanvasArea(); // پاککردنەوە و ئامادەکردنی کانڤەسەکە
});