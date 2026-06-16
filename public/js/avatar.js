const style = document.querySelector('#style');
const bgColor = document.querySelector('#bgColor');
const playerName = document.querySelector('#playerName');

// ١. بەکارهێنانی بەستەرە نوێیەکەی DiceBear API
const baseURL = 'https://api.dicebear.com/7.x';

// نەخشەکردنی ناوە کوردییەکان بۆ ئەو ناوانەی کە DiceBear لێیان تێدەگات
const spriteMapping = {
    'مۆدێرن': 'adventurer',
    'ڕۆبۆت': 'bottts',
    'کچانه': 'avataaars',
    'کچانە': 'avataaars',
    'پێکسڵ': 'pixel-art',
    'مرۆڤ': 'open-peeps',
    'شێوە': 'shapes',
    'پیت': 'initials',
    'هێما': 'identicon',
    'کورانه': 'micah',
    'کۆرانە': 'micah'
};

const my = {
    name: localStorage.getItem('name') || '',
    avatar: localStorage.getItem('avatar') || `${baseURL}/pixel-art/svg?seed=avatar`,
};

const settings = document.createElement('script');
const game = document.createElement('script');
settings.src = 'js/settings.js';
game.src = 'js/game.js';
document.body.append(settings, game);

function updateAvatar() {
    // ٢. وەرگرتنی بەهای هەڵبژێردراو و گۆڕینی بۆ ناوی ئینگلیزی گونجاو لەگەڵ API
    const selectedStyle = style.value.trim();
    const sprite = spriteMapping[selectedStyle] || 'pixel-art';
    
    // ٣. ڕێکخستنی ڕەنگی باکگراوند بەبێ نیشانەی # بۆ ئەوەی URL تێکنەچێت
    const color = bgColor.value.substring(1);
    const seed = playerName.value.trim() || 'player';
    
    // ٤. دروستکردنی فۆرماتی نوێی بەستەری وێنەکە بەپێی وەشانی نوێی DiceBear
    const url = `${baseURL}/${sprite}/svg?seed=${seed}&backgroundColor=${color}`;
    
    const newAvatar = document.createElement('img');
    newAvatar.src = url;
    newAvatar.alt = 'Avatar';
    newAvatar.id = 'avatar';
    newAvatar.classList.add('img-fluid', 'rounded-circle', 'mb-4', 'mb-sm-0');
    
    newAvatar.addEventListener('load', () => {
        const currentAvatar = document.querySelector('#avatar');
        if (currentAvatar) {
            currentAvatar.replaceWith(newAvatar);
        }
    });
    
    my.avatar = url;
    my.name = playerName.value;
    localStorage.setItem('name', playerName.value);
    localStorage.setItem('avatar', url);
}

window.onload = () => {
    if (localStorage.getItem('avatar')) {
        const currentAvatar = document.querySelector('#avatar');
        if (currentAvatar) currentAvatar.setAttribute('src', localStorage.getItem('avatar'));
    }
    if (localStorage.getItem('name')) {
        playerName.setAttribute('value', localStorage.getItem('name'));
    }
};

style.addEventListener('input', updateAvatar);
bgColor.addEventListener('input', updateAvatar);
playerName.addEventListener('input', updateAvatar); // گۆڕینی change بۆ input بۆ ئەوەی کاتێک ناوەکە دەنوسێت ڕاستەوخۆ وێنەکە بگۆڕێت