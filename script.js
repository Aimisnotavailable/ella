const FRIEND_NAME = 'Alice';
const CHARACTER_DELAY = 40;      // typing speed in ms (lower = faster)

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
document.querySelectorAll('#friendName, #footerFriendName').forEach(el => el.textContent = FRIEND_NAME);
document.getElementById('gateText').textContent = `🌸 For you, ${FRIEND_NAME}`;
document.getElementById('heroBirthday').textContent = `Happy Birthday, ${FRIEND_NAME}! May your garden always bloom. 🌸`;

// ---------- Falling petals in hero ----------
for (let i = 0; i < 22; i++) {
    const petal = document.createElement('div');
    petal.className = 'falling-petal';
    petal.style.left = Math.random() * 94 + '%';
    petal.style.animationDuration = (Math.random() * 6 + 7) + 's';
    petal.style.animationDelay = (Math.random() * 8) + 's';
    petal.style.animationName = Math.random() > 0.5 ? 'petalFall' : 'petalFallAlt';
    petal.innerHTML = '<svg viewBox="0 0 28 60" class="swaying-lily"><use href="#spider-lily-petal"/></svg>';
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

// ---------- Audio & lyrics sync ----------
let audioElement = null;
let currentAudioKey = null;
let isPlaying = false;
let lyricsData = null;
let typewriterInterval = null;
let lastActiveIndex = -1;

async function fetchLyrics() {
    try {
        const resp = await fetch('lyrics.json');
        lyricsData = await resp.json();
    } catch (err) {
        console.warn('lyrics.json not loaded, lyric sync disabled', err);
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
    isPlaying = false;
    modalVinyl?.classList.remove('playing');
    waveformPill?.classList.remove('playing');
}

// ---------- Old‑style letter‑by‑letter typewriter ----------
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

    // New line → cancel any ongoing typing
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

function playSnippet(key) {
    stopAudio();
    currentAudioKey = key;
    const src = AUDIO_FILES[key];
    if (!src) return;

    audioElement = new Audio(src);
    audioElement.preload = 'auto';

    // ---------- Prepare lyric reel ----------
    if (modalLyrics) {
        modalLyrics.innerHTML = '';
        const reel = document.createElement('div');
        reel.id = 'lyricReel';
        reel.className = 'lyric-reel';
        reel.textContent = '';
        modalLyrics.appendChild(reel);
    }

    // Now Playing banner
    if (nowPlayingEl) {
        nowPlayingEl.textContent = 'Now Playing: ' + (SONG_TITLES[key] || key);
        setTimeout(() => nowPlayingEl.classList.add('active'), 700);
    }

    // Vinyl / waveform playing state
    audioElement.addEventListener('play', () => {
        modalVinyl.classList.add('playing');
        waveformPill.classList.add('playing');
    });
    audioElement.addEventListener('pause', () => {
        modalVinyl.classList.remove('playing');
        waveformPill.classList.remove('playing');
    });
    audioElement.addEventListener('ended', () => {
        modalVinyl.classList.remove('playing');
        waveformPill.classList.remove('playing');
    });

    audioElement.addEventListener('loadedmetadata', () => {
        audioElement.currentTime = 0;
        lastActiveIndex = -1;       // reset for new song
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

// ---------- Modal floating petals ----------
function spawnModalPetals() {
    if (!modalPetalContainer) return;
    modalPetalContainer.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const petal = document.createElement('div');
        petal.className = 'modal-falling-petal';
        petal.style.left = Math.random() * 90 + '%';
        petal.style.animationDuration = (Math.random() * 4 + 5) + 's';
        petal.style.animationDelay = Math.random() * 3 + 's';
        petal.innerHTML = '<svg viewBox="0 0 28 60"><use href="#spider-lily-petal"/></svg>';
        modalPetalContainer.appendChild(petal);
    }
}

function clearModalPetals() {
    if (modalPetalContainer) modalPetalContainer.innerHTML = '';
}

// ---------- Ambient fireflies ----------
let ambientElements = [];

function createAmbient() {
    removeAmbient();
    for (let i = 0; i < 12; i++) {
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
    spawnModalPetals();          // petals over the cover
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

// Album card clicks
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