const FRIEND_NAME = 'Ella';
const CHARACTER_DELAY = 40;

const AUDIO_FILES = {
    lover: 'audio/lover.mp3',
    folklore: 'audio/folklore.mp3',
    fearless: 'audio/fearless.mp3',
    red: 'audio/red.mp3',
    evermore: 'audio/evermore.mp3',
    midnights: 'audio/midnights.mp3',
    speaknow: 'audio/speaknow.mp3',
    '1989': 'audio/1989.mp3',
    TTPD : 'audio/ttpd.mp3',
    '3114' : 'audio/3114.mp3'
};

const BASE_IMG_PATH = 'assets/imgs/'

const ALBUM_COVERS = {
    lover: BASE_IMG_PATH + 'lv.png',
    folklore: BASE_IMG_PATH + 'fl.png',
    fearless: BASE_IMG_PATH + 'frl.png',
    red: BASE_IMG_PATH + 'rd.png',
    evermore: BASE_IMG_PATH + 'evm.png',
    midnights: BASE_IMG_PATH + 'mn.png',
    speaknow: BASE_IMG_PATH + 'skn.png',
    '1989': BASE_IMG_PATH + '19.png',
    TTPD : BASE_IMG_PATH + 'ttpd.png',
    '3114' : BASE_IMG_PATH + '3114.png',
};

const SONG_TITLES = {
    lover: 'Lover',
    folklore: 'cardigan',
    fearless: 'Love Story',
    red: 'All Too Well',
    evermore: 'willow',
    midnights: 'Anti-Hero',
    speaknow: 'Mine',
    '1989': 'Blank Space',
    TTPD : 'The Prophecy',
    '3114' : 'You Belong With Me',
};

// ---------- DOM references ----------
const petalContainer = document.getElementById('petalContainer');
const gateOverlay = document.getElementById('gateOverlay');
const heroBirthday = document.getElementById('heroBirthday');
const heroLilyLeft = document.getElementById('heroLilyLeft');
const heroLilyRight = document.getElementById('heroLilyRight');
const albumCardsContainer = document.getElementById('albumCards');

const modalOverlay = document.getElementById('modalOverlay');
const modalBook = document.getElementById('modalBook');
const modalClose = document.getElementById('modalClose');
const modalAlbumCover = document.getElementById('modalAlbumCover');
const modalLyrics = document.getElementById('modalLyrics');
const modalVinyl = document.getElementById('modalVinyl');
const waveformPill = document.getElementById('waveformPill');
const nowPlayingEl = document.getElementById('nowPlaying');
const modalPetalContainer = document.getElementById('modalPetalContainer');

// ---------- Name placeholders ----------
// document.querySelectorAll('#friendName, #footerFriendName').forEach(el => el.textContent = FRIEND_NAME);
document.getElementById('gateText').textContent = `🌸 For you, ${FRIEND_NAME}`;
document.getElementById('heroBirthday').textContent = `Scroll down for the actual surprise`;

// ---------- Falling petals in hero (pure CSS petals, reduced count) ----------
const HERO_PETAL_COUNT = 14;
for (let i = 0; i < HERO_PETAL_COUNT; i++) {
    const petal = document.createElement('div');
    petal.className = 'falling-petal';
    petal.style.left = Math.random() * 94 + '%';
    petal.style.animationDuration = (Math.random() * 6 + 7) + 's';
    petal.style.animationDelay = (Math.random() * 8) + 's';
    petal.style.animationName = Math.random() > 0.5 ? 'petalFall' : 'petalFallAlt';
    petal.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random()*0.6})`;
    petalContainer.appendChild(petal);
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

// ---------- Gate opening ----------
let gateOpened = false;
gateOverlay.addEventListener('click', () => {
    if (gateOpened) return;
    gateOpened = true;
    gateOverlay.classList.add('bloom');
    setTimeout(() => gateOverlay.classList.add('hidden'), 1800);
    setTimeout(() => {
        heroBirthday.classList.add('revealed');
        heroLilyLeft?.classList.add('bloomed');
        heroLilyRight?.classList.add('bloomed');
    }, 1400);
});

// ---------- Build album cards ----------
Object.keys(AUDIO_FILES).forEach(key => {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.dataset.album = key;
    card.innerHTML = `<img src="${ALBUM_COVERS[key]}" alt="${key}" loading="lazy">
                      <div class="album-card__name">${key}</div>`;
    albumCardsContainer.appendChild(card);
});

// ---------- Audio & lyrics ----------
let audioElement = null;
let currentAudioKey = null;
let lyricsData = null;
let typewriterInterval = null;
let lastActiveIndex = -1;
let fireflyTimer = null;
let intensityTimers = [];

async function fetchLyrics() {
    try {
        const resp = await fetch('lyrics.json');
        lyricsData = await resp.json();
    } catch (err) {
        console.warn('lyrics.json not loaded', err);
        lyricsData = {};
    }
}
fetchLyrics();

function stopAudio() {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement.removeEventListener('timeupdate', onTimeUpdate);
        audioElement = null;
    }
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
    }
    modalVinyl?.classList.remove('playing');
    waveformPill?.classList.remove('playing');
    modalBook?.classList.remove('playing', 'intense', 'super-intense');
    // clear firefly intensifying timers
    if (fireflyTimer) { clearInterval(fireflyTimer); fireflyTimer = null; }
    intensityTimers.forEach(t => clearTimeout(t));
    intensityTimers = [];
}

function onTimeUpdate() {
    if (!audioElement || !lyricsData || !currentAudioKey) return;
    const albumLyrics = lyricsData[currentAudioKey];
    if (!albumLyrics || !albumLyrics.lines) return;

    const lines = albumLyrics.lines;
    const currentTime = audioElement.currentTime;
    let activeIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (currentTime >= lines[i].time) activeIndex = i;
    }
    if (activeIndex === -1 || activeIndex === lastActiveIndex) return;

    if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
    }

    lastActiveIndex = activeIndex;
    const fullText = lines[activeIndex].text;
    const lyricReel = document.getElementById('lyricReel');
    if (!lyricReel) return;

    lyricReel.textContent = '';
    let charIndex = 0;
    typewriterInterval = setInterval(() => {
        if (charIndex < fullText.length) {
            lyricReel.textContent += fullText[charIndex];
            charIndex++;
        } else {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
    }, CHARACTER_DELAY);
}

// ---------- Progressive animations while playing ----------
function startProgressEffects() {
    // After 8s: more intense glow + faster firefly multiplication
    const t1 = setTimeout(() => {
        modalBook?.classList.add('intense');
    }, 8000);
    // After 16s: super intense
    const t2 = setTimeout(() => {
        modalBook?.classList.add('super-intense');
    }, 16000);
    intensityTimers.push(t1, t2);

    // Every 3 seconds spawn extra fireflies (up to a max of 30)
    let extraFireflies = 0;
    fireflyTimer = setInterval(() => {
        if (extraFireflies >= 18) { clearInterval(fireflyTimer); fireflyTimer = null; return; }
        const firefly = document.createElement('div');
        firefly.className = 'ambient-firefly';
        firefly.style.left = Math.random() * 90 + '%';
        firefly.style.top = Math.random() * 90 + '%';
        firefly.style.animationDelay = '0s';
        firefly.style.animationDuration = 3 + Math.random() * 4 + 's';
        firefly.style.width = (8 + Math.random() * 10) + 'px';
        firefly.style.height = firefly.style.width;
        document.body.appendChild(firefly);
        ambientElements.push(firefly);
        extraFireflies++;
    }, 3000);
}

function playSnippet(key) {
    stopAudio();
    currentAudioKey = key;
    const src = AUDIO_FILES[key];
    if (!src) return;

    audioElement = new Audio(src);
    audioElement.preload = 'auto';

    if (modalLyrics) {
        modalLyrics.innerHTML = '';
        const reel = document.createElement('div');
        reel.id = 'lyricReel';
        reel.className = 'lyric-reel';
        reel.textContent = '';
        modalLyrics.appendChild(reel);
    }

    if (nowPlayingEl) {
        nowPlayingEl.textContent = 'Now Playing: ' + (SONG_TITLES[key] || key);
        setTimeout(() => nowPlayingEl.classList.add('active'), 700);
    }

    audioElement.addEventListener('play', () => {
        modalVinyl.classList.add('playing');
        waveformPill.classList.add('playing');
        modalBook.classList.add('playing');
        startProgressEffects();      // launch the progression
    });
    audioElement.addEventListener('pause', () => {
        modalVinyl.classList.remove('playing');
        waveformPill.classList.remove('playing');
        modalBook.classList.remove('playing', 'intense', 'super-intense');
        clearInterval(fireflyTimer);
        fireflyTimer = null;
        intensityTimers.forEach(t => clearTimeout(t));
        intensityTimers = [];
    });
    audioElement.addEventListener('ended', () => {
        modalVinyl.classList.remove('playing');
        waveformPill.classList.remove('playing');
        modalBook.classList.remove('playing', 'intense', 'super-intense');
        clearInterval(fireflyTimer);
        fireflyTimer = null;
        intensityTimers.forEach(t => clearTimeout(t));
        intensityTimers = [];
    });

    audioElement.addEventListener('loadedmetadata', () => {
        audioElement.currentTime = 0;
        lastActiveIndex = -1;
        audioElement.play().catch(err => { console.warn('Playback failed', err); stopAudio(); });
    });

    audioElement.addEventListener('timeupdate', onTimeUpdate);
    audioElement.addEventListener('error', () => {
        console.warn('Audio error', src);
        stopAudio();
    });
}

function togglePlayback() {
    if (!audioElement) return;
    if (audioElement.paused) {
        audioElement.play().catch(err => console.warn('Resume failed', err));
    } else {
        audioElement.pause();
    }
}

// ---------- Modal falling petals (fewer, scaled) ----------
function spawnModalPetals() {
    if (!modalPetalContainer) return;
    modalPetalContainer.innerHTML = '';
    const count = window.innerWidth < 600 ? 6 : 8;
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'modal-falling-petal';
        petal.style.left = Math.random() * 90 + '%';
        petal.style.animationDuration = (Math.random() * 4 + 3) + 's';
        petal.style.animationDelay = Math.random() * 3 + 's';
        petal.style.transform = `rotate(${Math.random()*360}deg) scale(${0.6 + Math.random()*0.6})`;
        modalPetalContainer.appendChild(petal);
    }
}

function clearModalPetals() {
    if (modalPetalContainer) modalPetalContainer.innerHTML = '';
}

// ---------- Ambient fireflies (initial set) ----------
let ambientElements = [];

function createAmbient() {
    removeAmbient();
    for (let i = 0; i < 10; i++) {
        const firefly = document.createElement('div');
        firefly.className = 'ambient-firefly';
        firefly.style.left = Math.random() * 90 + '%';
        firefly.style.top = Math.random() * 90 + '%';
        firefly.style.animationDelay = Math.random() * 4 + 's';
        firefly.style.animationDuration = 4 + Math.random() * 6 + 's';
        firefly.style.width = 6 + Math.random() * 8 + 'px';
        firefly.style.height = firefly.style.width;
        document.body.appendChild(firefly);
        ambientElements.push(firefly);
    }
}

function removeAmbient() {
    ambientElements.forEach(el => el.remove());
    ambientElements = [];
}

// ---------- Modal open/close ----------
function openModal(albumKey) {
    if (modalAlbumCover) modalAlbumCover.src = ALBUM_COVERS[albumKey];
    modalOverlay.classList.add('active');
    modalBook.classList.add('active');
    createAmbient();
    // spawnModalPetals();
    playSnippet(albumKey);
}

function closeModal() {
    stopAudio();
    modalOverlay.classList.remove('active');
    modalBook.classList.remove('active');
    removeAmbient();
    clearModalPetals();
    if (nowPlayingEl) {
        nowPlayingEl.classList.remove('active');
        nowPlayingEl.textContent = '';
    }
}

document.querySelectorAll('.album-card').forEach(card => {
    card.addEventListener('click', () => {
        const album = card.dataset.album;
        if (album) openModal(album);
    });
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
modalVinyl.addEventListener('click', togglePlayback);

console.log(`🌸 Dear Reader's Garden is in full bloom for ${FRIEND_NAME}.`);