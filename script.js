document.addEventListener('DOMContentLoaded', () => {

/* ---------------------------------------------------
    ALWAYS START AT THE TOP ON REFRESH
--------------------------------------------------- */
window.scrollTo(0, 0);

/* ---------------------------------------------------
    FALLING HEARTS
--------------------------------------------------- */
const ambientLayer = document.getElementById('ambientLayer');
const petalField = document.getElementById('petals');
const HEART_COUNT = window.innerWidth < 700 ? 18 : 30;
const HEART_COLORS = ['#f3e8ff', '#d8b4fe', '#c4a1ff', '#a78bfa', '#e879f9', '#f0abfc'];

// heart-shaped confetti (used when the surprise opens and when a letter is opened)
let heartShape = null;
try {
heartShape = confetti.shapeFromPath({ path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' });
} catch (err) { /* falls back to default confetti shapes */ }

for (let i = 0; i < HEART_COUNT; i++) {
const p = document.createElement('span');
const size = 12 + Math.random() * 18;
p.className = 'heart';
p.style.left = Math.random() * 100 + 'vw';
p.style.width = size + 'px';
p.style.height = size + 'px';
p.style.backgroundColor = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
p.style.setProperty('--sway', (Math.random() * 80 - 40).toFixed(0) + 'px');
p.style.animationDuration = (9 + Math.random() * 12) + 's';
p.style.animationDelay = (Math.random() * -20) + 's';
p.style.opacity = (0.3 + Math.random() * 0.45).toFixed(2);
petalField.appendChild(p);
}

/* ---------------------------------------------------
    SCROLL REVEAL (stagger within each section)
--------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');
revealEls.forEach((el, globalIndex) => {
const siblings = el.parentElement ? Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal')) : [];
const localIndex = siblings.indexOf(el);
const delay = Math.min(localIndex, 6) * 0.12;
el.style.setProperty('--d', delay + 's');
});

const revealObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
    }
});
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

/* ---------------------------------------------------
    START OF CELEBRATION
--------------------------------------------------- */
const main = document.getElementById('main');
const music = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');


function startCelebration() {
main.style.display = 'block';
document.body.style.overflow = 'auto';

// heart burst
if (window.confetti) {
    const burst = {
    spread: 120,
    startVelocity: 38,
    scalar: 2.2,
    ticks: 220,
    colors: HEART_COLORS,
    origin: { y: 0.6 }
    };
    if (heartShape) burst.shapes = [heartShape];
    confetti({ ...burst, particleCount: 90 });
    setTimeout(() => confetti({ ...burst, particleCount: 60, spread: 160, startVelocity: 28 }), 250);
}

// music
music.volume = 0.35;
music.play().then(() => {
    musicBtn.classList.add('is-playing');
}).catch(() => {
    /* autoplay blocked — user can press the music button */
});
musicBtn.disabled = false;
musicBtn.classList.add('is-ready');
}

/* ---------------------------------------------------
    PRE-GATE: GIFT TEASE
--------------------------------------------------- */
(function () {
const preGate = document.getElementById('preGate');
if (!preGate) return;
const preCard = document.getElementById('preCard');
const preText = document.getElementById('preText');
const preYes = document.getElementById('preYes');
const preNo = document.getElementById('preNo');
const preSub = document.getElementById('preSub');

const steps = [
    { text: 'would you like to open your surprise?', yes: 'Yes',            no: 'No' },
    { text: 'are you sure?',                         yes: "Yes, I'm sure",  no: 'Not yet' },
    { text: 'really sure? like, really really?',     yes: 'Really sure',    no: 'Hmm...' },
    { text: 'okay, last one. no take-backs, langga.', yes: 'No take-backs', no: 'Wait' },
    { text: "fine, fine, i'll stop teasing. ready?",  yes: "I'm ready",      no: 'Maybe later' }
];
const dodgeLines = [
    'nice try.',
    'the button is feeling shy.',
    'it really does not want to be pressed.',
    'you can\u2019t say no to this one.',
    'just press yes, langga.'
];
let step = 0, dodges = 0, busy = false;

function burst(x, y, n) {
    try {
    confetti({
        particleCount: n, spread: 70, startVelocity: 28, scalar: 1.1,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ['#f3e8ff', '#d8b4fe', '#a78bfa', '#e879f9'],
        shapes: heartShape ? [heartShape] : undefined, zIndex: 7000
    });
    } catch (err) { /* confetti unavailable */ }
}

function resetNo() {
    preNo.classList.remove('is-dodging');
    preNo.style.left = preNo.style.top = '';
}

function dodge(e) {
    e.preventDefault();
    e.stopPropagation();
    const r = preNo.getBoundingClientRect();
    const w = r.width, h = r.height;
    const card = preCard.getBoundingClientRect();
    const pad = 16;
    let x, y, tries = 0;
    do {
    x = pad + Math.random() * Math.max(1, window.innerWidth - w - pad * 2);
    y = pad + Math.random() * Math.max(1, window.innerHeight - h - pad * 2);
    tries++;
    } while (tries < 25 &&
        x + w > card.left - 12 && x < card.right + 12 &&
        y + h > card.top - 12 && y < card.bottom + 12);
    if (tries >= 25) { // card fills the screen: tuck it at the bottom edge
    x = pad + Math.random() * Math.max(1, window.innerWidth - w - pad * 2);
    y = window.innerHeight - h - pad;
    }
    if (!preNo.classList.contains('is-dodging')) {
    preNo.style.left = r.left + 'px';
    preNo.style.top = r.top + 'px';
    preNo.classList.add('is-dodging');
    void preNo.offsetWidth; // flush so the first jump animates
    }
    preNo.style.left = x + 'px';
    preNo.style.top = y + 'px';
    preSub.textContent = dodgeLines[Math.min(dodges, dodgeLines.length - 1)];
    dodges++;
}

preNo.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') dodge(e); });
preNo.addEventListener('pointerdown', dodge);
preNo.addEventListener('click', dodge);

function openEnvelopeGate() {
    busy = true;
    preGate.classList.add('is-hidden');
    ambientLayer.classList.remove('is-paused');
    startCelebration(); // straight to the surprise (also starts the music from this tap)
    setTimeout(() => preGate.remove(), 1200);
}

preYes.addEventListener('click', (e) => {
    if (busy) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (step >= steps.length - 1) { openEnvelopeGate(); return; }
    burst(r.left + r.width / 2, r.top, 18);
    busy = true;
    step++;
    dodges = 0;
    preText.classList.add('is-swapping');
    setTimeout(() => {
    preText.textContent = steps[step].text;
    preYes.textContent = steps[step].yes;
    preNo.textContent = steps[step].no;
    preSub.innerHTML = '&nbsp;';
    resetNo();
    preText.classList.remove('is-swapping');
    busy = false;
    }, 250);
});
})();

// lock scroll until opened
document.body.style.overflow = 'hidden';

/* ---------------------------------------------------
    MUSIC TOGGLE
--------------------------------------------------- */
musicBtn.addEventListener('click', () => {
if (music.paused) {
    music.play();
    musicBtn.classList.add('is-playing');
} else {
    music.pause();
    musicBtn.classList.remove('is-playing');
}
});

/* ---------------------------------------------------
    SCROLL PROGRESS BAR
--------------------------------------------------- */
const progressFill = document.getElementById('progressFill');
function updateProgress() {
const scrollTop = window.scrollY;
const docHeight = document.documentElement.scrollHeight - window.innerHeight;
const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
progressFill.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------------------------------------------------
    SIDE NAV — SCROLL SPY
--------------------------------------------------- */
const navLinks = document.querySelectorAll('.side-nav a');
const navSections = Array.from(navLinks).map(link => document.querySelector(link.getAttribute('href')));

const spyObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    const id = '#' + entry.target.id;
    navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === id);
    });
    }
});
}, { threshold: 0.5 });

navSections.forEach(sec => { if (sec) spyObserver.observe(sec); });

/* ---------------------------------------------------
    CLICKABLE HEARTS -> LOVE LETTERS
    (edit the letters below — add, remove or reword as you like)
--------------------------------------------------- */

const LOVE_LETTERS = [
  {
    title: "To my baby",
    text: "happy birthday, baby ko. if i could give you one thing today, it would be the chance to see yourself through my eyes. maybe then you'd understand why you mean so much to me, why your happiness matters to me, and why i'm so thankful nga ikaw ang ginpadala sang life sa akon. you are, and always will be, someone so precious to me."
  },
  {
    title: "my favorite person",
    text: "you're the person i want to tell my little stories to, the first person i want to share good news with, and the one i think of when something reminds me of happiness. life feels a little more beautiful simply because i get to share a part of it with you."
  },
  {
    title: "my whole world",
    text: "baby, you might think you're just one person living your everyday life, but to me, you're so much more than that. you're someone who changed the way i see love, someone who makes ordinary moments feel special, and someone i'd choose over and over again. you'll always have a special place in my heart babyy."
  },
  {
    title: "that beautiful smile",
    text: "love, i hope you never run out of reasons to smile. your smile is one of my favorite things in this world, and seeing you happy makes me happy, too. kung kabalo ka lang kung ano ko ka happy makita ka nga ga smile, you would understand why i always wish for more beautiful days for you. keep that smile, baby. you deserve every reason to wear it."
  },
  {
    title: "your beautiful heart",
    text: "langga, one of the things i admire most about you is the heart you carry. the way you care, the way you love, and the little things you do even when nobody notices them, say so much about who you are. you're beautiful in ways that go far beyond what the eyes can see, and i'm so lucky to know the person behind that beautiful smile."
  },
  {
    title: "my safe place",
    text: "baby, with you, i don't feel like i have to be perfect all the time. i can just be myself, make mistakes, learn, and keep growing. thank you for being someone i can share my thoughts with and someone whose presence means so much to me. the thought of you brings me comfort in a way words can hardly explain."
  },
  {
    title: "thank you for being you",
    text: "love, thank you. for the little things, the conversations, the laughter, the patience, and all the moments that might seem ordinary but mean so much to me. thank you for letting me be part of your life. indi ko man ma express tanan nga ara sakon heart, but please know that i appreciate you more than you realize."
  },
  {
    title: "our little moments",
    text: "some of my favorite memories aren't necessarily the big ones. sometimes, it's the random conversations, the silly jokes, the little updates about your day, and the simple moments when we get to spend time together. bskan simple lang nga moments, basta upod ta, they become memories i want to keep for a long, long time."
  },
  {
    title: "i'm proud of you",
    text: "langga ko, i hope you give yourself credit for how far you've come. i know life isn't always easy, and there may be days when you feel tired, uncertain, or overwhelmed. but look at you, still learning, still trying, still becoming the person you're meant to be. proud gd ko smo, baby. and even on the days when you don't feel strong, i'll still be cheering you on."
  },
  {
    title: "you are more than enough",
    text: "baby, you don't have to prove anything to deserve love. you don't have to be perfect, have everything figured out, or make everyone happy. you are worthy of kindness, patience, understanding, and all the good things life has to offer, exactly as you are. palangga taka not because of what you can do for me, but because of the person you are."
  },
  {
    title: "my favorite goodmorning, baby. kamusta kda love",
    text: "there's something special about hearing from you, even when it's just a simple message about your day. somehow, the little things you tell me become things i want to remember. you're the person i want to talk to sa mga gamay kg dako nga bagay. you're my favorite person to share life with, and i hope i get to hear many more of your little chikas."
  },
  {
    title: "a love that surrounds you",
    text: "on your birthday, i hope you feel just how loved you are. not only by me, but by the people who are lucky enough to have you in their lives. i hope you receive the same kindness you give, the same warmth you share, and the same happiness you bring to others. you deserve to feel appreciated, celebrated, and loved today and every day."
  },
  {
    title: "beautiful in every way",
    text: "love, i hope you know that your beauty isn't limited to the way you look. it's in your kindness, your thoughts, your little habits, your passions, and all the things that make you uniquely you. the more i get to know you, the more reasons i find to appreciate you. saakon mata, you're someone truly special, and i hope you never forget that."
  },
  {
    title: "you make me want to grow",
    text: "baby, being with you makes me want to become a better person, not because you ask me to be someone else, but because loving you gives me another reason to grow. i want to learn, improve, and become someone who can love you with more patience, honesty, and understanding. i know i still have a lot to learn, pero i'm willing to keep growing, one day at a time."
  },
  {
    title: "the world is lucky to have you",
    text: "sometimes, i wonder if you realize how much good you bring into this world just by being yourself. the little kindnesses you show, the love you give, and the moments you share with others all matter more than you might know. i'm so glad nga natawo ka, baby. because of that one beautiful thing, our paths had the chance to meet, and i got to know someone as wonderful as you."
  },
  {
    title: "a future with you",
    text: "love, i can't promise that every day will be perfect, but i hope we keep choosing to understand each other, to communicate, and to grow together. i look forward to all the memories we haven't made yet, all the places we might see, and all the ordinary days that will someday become special memories. hinay2 lang ta, baby. one day at a time, one memory at a time, with so much more life ahead of us."
  },
  {
    title: "my birthday wish for you",
    text: "for your birthday, baby, i wish you a peaceful heart, a healthy and happy year, dreams that slowly become reality, and people who genuinely care for you. i hope you find courage when things get difficult and reasons to smile even on ordinary days. kabaypa nga madamo pa nga blessings ang mag abot sa imo, because you deserve a life filled with love, peace, and beautiful surprises."
  },
  {
    title: "you deserve beautiful things",
    text: "langga ko, i hope this new chapter brings you opportunities that excite you, experiences that help you grow, and moments that remind you how beautiful life can be. i hope you never feel guilty for resting, celebrating yourself, or taking your time. you deserve to enjoy your life, to chase your dreams, and to be proud of every little step you take. i'll always be happy to see you win."
  },
  {
    title: "when life gets difficult",
    text: "baby, if life ever feels too heavy, remember that you don't have to have all the answers right away. it's okay to take a breath, slow down, and figure things out little by little. you don't always have to be strong, and you never have to pretend that everything is okay with me. ari lg ko di, love. i'll listen, i'll try to understand, and i'll do my best to support you through the difficult days, too."
  },
  {
    title: "even on ordinary days",
    text: "you don't have to do anything extraordinary to make me appreciate you, love. you don't need to plan something special or find the perfect words. even when you're sleepy, quiet, busy, or simply going about your day, you're still the same person i'm thankful to have in my life. your presence itself is something i treasure, and i hope you always feel comfortable being your natural, unfiltered self with me."
  },
  {
    title: "another year of being you",
    text: "happy birthday, love! another year of your life means another year of learning new things, discovering more about yourself, and making memories you haven't even imagined yet. i hope you look back someday and smile at how much you've grown. you don't need to rush, baby. enjoy your journey, celebrate your little wins, and remember that you have so many beautiful moments ahead of you."
  },
];


const heartField = document.getElementById('heartField');
const loveModal = document.getElementById('loveModal');
const loveClose = document.getElementById('loveClose');
const loveTitle = document.getElementById('loveTitle');
const loveText = document.getElementById('loveText');
const loveCount = document.getElementById('loveCount');
const loveOpenedEl = document.getElementById('loveOpened');
const loveTotalEl = document.getElementById('loveTotal');
const loveFinale = document.getElementById('loveFinale');
const openedLetters = new Set();
let lastLayoutMode = null;
let lastHeartEl = null;

loveTotalEl.textContent = LOVE_LETTERS.length;

function shuffle(arr) {
for (let i = arr.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[k]] = [arr[k], arr[i]];
}
return arr;
}

function buildHeartField() {
const mobile = window.innerWidth < 700;
const mode = mobile ? 'm' : 'd';
if (mode === lastLayoutMode) return;
lastLayoutMode = mode;

heartField.innerHTML = '';
const total = LOVE_LETTERS.length;
const cols = mobile ? 4 : 6;
const rows = Math.ceil(total / cols);
heartField.style.height = (mobile ? rows * 118 : rows * 150) + 'px';

const cells = [];
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([r, c]);
shuffle(cells);

for (let i = 0; i < total; i++) {
    const [r, c] = cells[i];
    const size = mobile ? 46 + Math.random() * 22 : 56 + Math.random() * 32;
    const x = ((c + 0.2 + Math.random() * 0.6) / cols) * 100;
    const y = ((r + 0.2 + Math.random() * 0.6) / rows) * 100;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'love-heart';
    btn.setAttribute('aria-label', 'Open letter: ' + LOVE_LETTERS[i].title);
    btn.style.left = x + '%';
    btn.style.top = y + '%';
    btn.style.width = size + 'px';
    btn.style.height = size * 0.92 + 'px';
    btn.style.marginLeft = (-size / 2) + 'px';
    btn.style.marginTop = (-size * 0.46) + 'px';
    btn.style.animationDuration = (3.5 + Math.random() * 3) + 's';
    btn.style.animationDelay = (Math.random() * -6) + 's';

    const shape = document.createElement('span');
    shape.className = 'love-heart__shape';
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    shape.style.backgroundColor = color;
    btn.style.setProperty('--glow', color);
    btn.appendChild(shape);

    if (openedLetters.has(i)) btn.classList.add('is-opened');
    btn.addEventListener('click', () => openLetter(i, btn));
    heartField.appendChild(btn);
}
}

function openLetter(index, btn) {
const letter = LOVE_LETTERS[index];
loveTitle.textContent = letter.title;
loveText.innerHTML = letter.text;
loveCount.textContent = 'A letter for you';
lastHeartEl = btn;

btn.classList.add('is-opened');
openedLetters.add(index);
loveOpenedEl.textContent = openedLetters.size;
loveModal.classList.add('is-open');

if (window.confetti) {
    const rect = btn.getBoundingClientRect();
    const opts = {
    particleCount: 16, spread: 70, startVelocity: 22, scalar: 1.6, ticks: 120, zIndex: 9000,
    origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
    colors: HEART_COLORS
    };
    if (heartShape) opts.shapes = [heartShape];
    confetti(opts);
}
}

function closeLetter() {
loveModal.classList.remove('is-open');
if (openedLetters.size === LOVE_LETTERS.length) loveFinale.classList.add('is-visible');
}

loveClose.addEventListener('click', closeLetter);
loveModal.addEventListener('click', (e) => { if (e.target === loveModal) closeLetter(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLetter(); });

buildHeartField();
let resizeTimer = null;
window.addEventListener('resize', () => {
clearTimeout(resizeTimer);
resizeTimer = setTimeout(buildHeartField, 200);
});

/* ---------------------------------------------------
    LIGHTBOX (gallery)
--------------------------------------------------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.querySelector('.lightbox__close');

document.querySelectorAll('[data-src]').forEach(el => {
el.addEventListener('click', () => {
    lightboxImg.src = el.dataset.src;
    lightboxImg.alt = el.querySelector('img')?.alt || '';
    lightbox.classList.remove('is-album'); // plain single-image mode (no arrows)
    lightbox.classList.add('is-open');
});
});

function closeLightbox() {
lightbox.classList.remove('is-open');
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') closeLightbox();
});

/* ---------------------------------------------------
    ALBUM: FAVORITE PICTURES
    1) put your photos in the  assets/album/  folder
    2) edit this list: one line per photo
       caption is optional, it shows when you hover / open the photo
       e.g. { src: 'assets/photo1.jpg', caption: 'my favorite smile' }
    Photos that can't be found show a little heart placeholder.
--------------------------------------------------- */
const ALBUM_PHOTOS = [
  { src: 'assets/photo1.jpg',  caption: '' },
  { src: 'assets/photo2.jpg',  caption: '' },
  { src: 'assets/photo3.jpg',  caption: '' },
  { src: 'assets/photo4.jpg',  caption: '' },
  { src: 'assets/photo5.jpg',  caption: '' },
  { src: 'assets/photo6.jpg',  caption: '' },
  { src: 'assets/photo7.jpg',  caption: '' },
  { src: 'assets/photo8.jpg',  caption: '' },
  { src: 'assets/photo9.jpg',  caption: '' },
  { src: 'assets/photo10.jpg', caption: '' },
  { src: 'assets/photo11.jpg', caption: '' },
  { src: 'assets/photo12.jpg', caption: '' }
];

const albumGrid = document.getElementById('albumGrid');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCaption = document.getElementById('lightboxCaption');
const albumItems = [];
let albumIndex = 0;

// fade photos in as they scroll into view
const albumObserver = new IntersectionObserver((entries) => {
entries.forEach(entry => {
    if (entry.isIntersecting) {
    entry.target.classList.add('is-visible');
    albumObserver.unobserve(entry.target);
    }
});
}, { threshold: 0.12 });

ALBUM_PHOTOS.forEach((photo, i) => {
const item = document.createElement('figure');
item.className = 'album__item reveal';
item.style.setProperty('--d', ((i % 4) * 0.1) + 's');
item.tabIndex = 0;
item.setAttribute('role', 'button');
item.setAttribute('aria-label', 'Open picture ' + (i + 1));

const img = document.createElement('img');
img.loading = 'lazy';
img.alt = photo.caption || '';
img.addEventListener('error', () => item.classList.add('is-missing'));
img.src = photo.src;
item.appendChild(img);

if (photo.caption) {
    const cap = document.createElement('figcaption');
    cap.textContent = photo.caption;
    item.appendChild(cap);
}

item.addEventListener('click', () => openAlbum(i));
item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAlbum(i); }
});

albumGrid.appendChild(item);
albumItems.push(item);
albumObserver.observe(item);
});

// only photos that actually loaded can be browsed
function availableAlbum() {
return ALBUM_PHOTOS.map((_, i) => i).filter(i => !albumItems[i].classList.contains('is-missing'));
}

function showAlbum(i) {
const list = availableAlbum();
const photo = ALBUM_PHOTOS[i];
albumIndex = i;

lightboxImg.src = photo.src;
lightboxImg.alt = photo.caption || '';

lightboxCaption.textContent = '';
const count = document.createElement('span');
count.textContent = (list.indexOf(i) + 1) + ' / ' + list.length;
lightboxCaption.appendChild(count);
if (photo.caption) {
    const text = document.createElement('span');
    text.className = 'lightbox__text';
    text.textContent = photo.caption;
    lightboxCaption.appendChild(text);
}
lightboxPrev.hidden = lightboxNext.hidden = list.length < 2;
}

function openAlbum(i) {
if (albumItems[i].classList.contains('is-missing')) return;
lightbox.classList.add('is-album');
showAlbum(i);
lightbox.classList.add('is-open');
}

function albumStep(dir) {
const list = availableAlbum();
if (list.length < 2) return;
const pos = list.indexOf(albumIndex);
showAlbum(list[(pos + dir + list.length) % list.length]);
}

lightboxPrev.addEventListener('click', () => albumStep(-1));
lightboxNext.addEventListener('click', () => albumStep(1));

document.addEventListener('keydown', (e) => {
if (!lightbox.classList.contains('is-open') || !lightbox.classList.contains('is-album')) return;
if (e.key === 'ArrowRight') albumStep(1);
if (e.key === 'ArrowLeft') albumStep(-1);
});

// swipe left / right on phones
let swipeStartX = null;
lightbox.addEventListener('touchstart', (e) => { swipeStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', (e) => {
if (swipeStartX === null || !lightbox.classList.contains('is-album')) return;
const dx = e.changedTouches[0].clientX - swipeStartX;
swipeStartX = null;
if (Math.abs(dx) > 50) albumStep(dx < 0 ? 1 : -1);
}, { passive: true });

});