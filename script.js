const FRIEND_NAME = 'Alice';
const MUSIC_SNIPPET_DURATION = 30; // ← no longer used; songs play fully

const AUDIO_FILES = {
    lover: 'audio/lover.mp3',
    folklore: 'audio/folklore.mp3',
    fearless: 'audio/fearless.mp3',
    red: 'audio/red.mp3',
    evermore: 'audio/evermore.mp3',
    midnights: 'audio/midnights.mp3',
    speaknow: 'audio/speaknow.mp3',
    '1989': 'audio/1989.mp3',
};

const SONG_TITLES = {
    lover: 'Lover',
    folklore: 'cardigan',
    fearless: 'Love Story',
    red: 'All Too Well (10 Minute Version)',
    evermore: 'willow',
    midnights: 'Anti-Hero',
    speaknow: 'Mine',
    '1989': 'Shake It Off'
};

const ALBUM_COVERS = {
    lover: 'https://placehold.co/300x300/F4B8C1/5C2D35?text=Lover',
    folklore: 'https://placehold.co/300x300/7A9A7E/FDFBF7?text=folklore',
    fearless: 'assets/imgs/ls.png',
    red: 'https://placehold.co/300x300/C41E3A/fff?text=Red',
    evermore: 'https://placehold.co/300x300/A0785C/fff?text=evermore',
    midnights: 'https://placehold.co/300x300/3C4A6B/fff?text=Midnights',
    speaknow: 'https://placehold.co/300x300/B8A0C9/3D2C4A?text=Speak+Now',
    '1989': 'https://placehold.co/300x300/7BA4C7/fff?text=1989',
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

// ---------- Name placeholders ----------
document.querySelectorAll('#friendName, #footerFriendName').forEach(el => el.textContent = FRIEND_NAME);
document.getElementById('gateText').textContent = `🌸 For you, ${FRIEND_NAME}`;
document.getElementById('heroBirthday').textContent = `Happy Birthday, ${FRIEND_NAME}! May your garden always bloom. 🌸`;

// ---------- Falling petals ----------
for (let i = 0; i < 22; i++) {
    const petal = document.createElement('div');
    petal.className = 'falling-petal';
    petal.style.left = Math.random() * 94 + '%';
    petal.style.animationDuration = (Math.random() * 6 + 7) + 's';
    petal.style.animationDelay = (Math.random() * 8) + 's';
    petal.style.animationName = Math.random() > 0.5 ? 'petalFall' : 'petalFallAlt';
    petal.innerHTML = '<svg viewBox="0 0 28 60"><use href="#spider-lily-petal"/></svg>';
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
let playTimeout = null;        // ← will be removed (no more snippet limit)
let lyricsData = null;
let typewriterTimer = null;   // for character-by-character typing

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
    // Stop any in‑progress typewriter
    if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
    }
    isPlaying = false;
    modalVinyl?.classList.remove('playing');
    waveformPill?.classList.remove('playing');
}

// ---------- Barrel‑like lyric display ----------
function onTimeUpdate() {
    if (!audioElement || !lyricsData || !currentAudioKey) return;
    const albumLyrics = lyricsData[currentAudioKey];
    if (!albumLyrics || !albumLyrics.lines) return;

    const currentTime = audioElement.currentTime;
    const lines = albumLyrics.lines;

    let activeIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (currentTime >= lines[i].time) activeIndex = i;
    }

    const lyricReel = document.getElementById('lyricReel');
    if (!lyricReel) return;

    const prevActive = parseInt(lyricReel.dataset.activeIndex, 10) || -1;
    if (activeIndex === prevActive) return;       // same line, no change

    // ---------- 1. Outgoing line: slide‑up clone ----------
    if (prevActive !== -1) {
        const outgoingText = lyricReel.textContent;   // current text (could be partially typed)
        const outgoing = document.createElement('span');
        outgoing.className = 'lyric-reel-outgoing';
        outgoing.textContent = outgoingText;
        lyricReel.appendChild(outgoing);
        // The clone automatically animates out (see CSS)
        setTimeout(() => {
            if (outgoing && outgoing.parentNode) outgoing.remove();
        }, 500);
    }

    // ---------- 2. Cancel any ongoing typing ----------
    if (typewriterTimer) {
        clearInterval(typewriterTimer);
        typewriterTimer = null;
    }

    // ---------- 3. Start typewriter for the new line ----------
    const newLine = lines[activeIndex] ? lines[activeIndex].text : '♫';
    lyricReel.textContent = '';          // clear completely
    lyricReel.dataset.activeIndex = activeIndex;

    let charIndex = 0;
    typewriterTimer = setInterval(() => {
        if (charIndex < newLine.length) {
            lyricReel.textContent += newLine[charIndex];
            charIndex++;
        } else {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
        }
    }, 20);   // typing speed: ~40ms per character
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
        reel.dataset.activeIndex = '-1';
        // Start completely empty – the first line will type in
        reel.textContent = '';
        modalLyrics.appendChild(reel);
    }
    // Inside playSnippet, after creating the lyric reel:
    if (nowPlayingEl) {
        nowPlayingEl.textContent = 'Now Playing: ' + (SONG_TITLES[key] || key);
        // Delay the class add to let the modal book open animation finish
        setTimeout(() => {
            nowPlayingEl.classList.add('active');
        }, 700);
    }


    audioElement.addEventListener('loadedmetadata', () => {
        // Always start from 0 (no snippet offset)
        audioElement.currentTime = 0;
        audioElement.play().catch(err => { console.warn('Playback failed', err); stopAudio(); });
    });

    audioElement.addEventListener('play', () => {
        isPlaying = true;
        modalVinyl.classList.add('playing');
        waveformPill.classList.add('playing');
        audioElement.addEventListener('timeupdate', onTimeUpdate);
        // ❌ Remove the 30‑second snippet limit
        // playTimeout = setTimeout(() => stopAudio(), MUSIC_SNIPPET_DURATION * 1000);
    });

    audioElement.addEventListener('ended', stopAudio);
    audioElement.addEventListener('error', () => {
        console.warn('Audio error', src);
        stopAudio();
    });
}

function togglePlayback() {
    if (isPlaying) {
        stopAudio();
    } else if (currentAudioKey) {
        playSnippet(currentAudioKey);
    }
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
    playSnippet(albumKey);
}

function closeModal() {
    stopAudio();
    modalOverlay.classList.remove('active');
    modalBook.classList.remove('active');
    removeAmbient();
    // Hide the now‑playing banner
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