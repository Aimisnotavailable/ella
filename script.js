// ==================== CONFIGURATION ====================
const FRIEND_NAME = 'Alice'; // Change to your friend's name
const MUSIC_SNIPPET_DURATION = 30; // seconds

// Audio file paths (place your MP3 files in an "audio" folder)
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

// ==================== NAME PLACEHOLDERS ====================
document.querySelectorAll('#friendName, #footerFriendName').forEach(el => {
    el.textContent = FRIEND_NAME;
});
document.getElementById('gateText').textContent = `🌸 For you, ${FRIEND_NAME}`;
document.getElementById('heroBirthday').textContent = `Happy Birthday, ${FRIEND_NAME}! May your garden always bloom. 🌸`;

// ==================== 1. FALLING PETALS ====================
const petalContainer = document.getElementById('petalContainer');
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

// ==================== 2. SCROLL REVEALS ====================
const revealElements = document.querySelectorAll('.reveal');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
revealElements.forEach(el => sectionObserver.observe(el));

// ==================== 3. BOOK NOTE CARDS ====================
const books = document.querySelectorAll('.book');
const noteCard = document.getElementById('noteCard');
const noteOverlay = document.getElementById('noteOverlay');
const noteText = document.getElementById('noteText');
const noteClose = document.getElementById('noteClose');

function openNote(msg) {
    noteText.textContent = msg;
    noteCard.classList.add('active');
    noteOverlay.classList.add('active');
}
function closeNote() {
    noteCard.classList.remove('active');
    noteOverlay.classList.remove('active');
}
books.forEach(book => {
    book.addEventListener('click', () => {
        const msg = book.getAttribute('data-message');
        if (msg) openNote(msg);
    });
});
noteClose.addEventListener('click', closeNote);
noteOverlay.addEventListener('click', closeNote);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeNote();
});

// ==================== 4. GARDEN GATE OVERLAY ====================
const gateOverlay = document.getElementById('gateOverlay');
const heroBirthday = document.getElementById('heroBirthday');
const heroLilyLeft = document.getElementById('heroLilyLeft');
const heroLilyRight = document.getElementById('heroLilyRight');
let gateOpened = false;

gateOverlay.addEventListener('click', () => {
    if (gateOpened) return;
    gateOpened = true;

    // Bloom the gate lily
    gateOverlay.classList.add('bloom');

    // Fade out overlay after the bloom animation completes
    setTimeout(() => {
        gateOverlay.classList.add('hidden');
    }, 1800);

    // Reveal hero birthday message and bloom hero lilies with a slight delay
    setTimeout(() => {
        heroBirthday.classList.add('revealed');
        heroLilyLeft?.classList.add('bloomed');
        heroLilyRight?.classList.add('bloomed');
    }, 1400);
});

// ==================== 5. ERA BADGES + TYPEWRITER LYRIC ====================
const eraBadges = document.querySelectorAll('.era-badge');
const swiftieLyricDisplay = document.getElementById('swiftieLyricDisplay');
let typewriterTimer = null;
let currentAudioKey = null; // tracks which era's music to play

function typeLyric(lyric) {
    if (typewriterTimer) clearInterval(typewriterTimer);
    swiftieLyricDisplay.classList.remove('active');
    swiftieLyricDisplay.textContent = '';
    swiftieLyricDisplay.classList.add('active');

    let i = 0;
    const speed = 38 + Math.random() * 22;
    typewriterTimer = setInterval(() => {
        if (i < lyric.length) {
            swiftieLyricDisplay.textContent += lyric.charAt(i);
            i++;
        } else {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
        }
    }, speed);
}

eraBadges.forEach(badge => {
    badge.addEventListener('click', () => {
        const lyric = badge.getAttribute('data-lyric');
        const audioKey = badge.getAttribute('data-audio');
        if (lyric) typeLyric(lyric);
        if (audioKey && AUDIO_FILES[audioKey]) {
            currentAudioKey = audioKey;
        }
        togglePlayback();
    });
});

// ==================== 6. SWIFTIE BLOOMING LILY (scroll triggered) ====================
const swiftieBloomLily = document.getElementById('swiftieBloomLily');
const swiftieHiddenMessage = document.getElementById('swiftieHiddenMessage');
let swiftieLilyBloomed = false;

const swiftieLilyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !swiftieLilyBloomed) {
            swiftieLilyBloomed = true;
            setTimeout(() => {
                swiftieBloomLily?.classList.add('bloomed');
                swiftieHiddenMessage?.classList.add('revealed');
            }, 300);
            swiftieLilyObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.4 });
if (swiftieBloomLily) swiftieLilyObserver.observe(swiftieBloomLily);

// ==================== 7. LOCAL MP3 AUDIO PLAYER ====================
const vinylPlayBtn = document.getElementById('vinylPlayBtn');
const vinylPlayLabel = document.getElementById('vinylPlayLabel');

let audioElement = null; // current playing Audio instance
let isPlaying = false;
let playTimeout = null;

/**
 * Stop and cleanup the current audio
 */
function stopAudio() {
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioElement = null;
    }
    if (playTimeout) clearTimeout(playTimeout);
    isPlaying = false;
    vinylPlayBtn?.classList.remove('playing');
    if (vinylPlayLabel) vinylPlayLabel.textContent = 'Play a snippet';
}

/**
 * Play a short snippet from the specified audio file
 * @param {string} audioKey - key from AUDIO_FILES
 */
function playSnippet(audioKey) {
    // If already playing, stop previous
    stopAudio();

    const src = AUDIO_FILES[audioKey];
    if (!src) {
        console.warn('No audio file defined for', audioKey);
        return;
    }

    // Create a new Audio element
    audioElement = new Audio(src);
    audioElement.preload = 'auto';

    // When metadata is loaded, set start time and play
    audioElement.addEventListener('loadedmetadata', () => {
        // Seek to 30s if the file is long enough; otherwise start from 0
        const startTime = audioElement.duration > MUSIC_SNIPPET_DURATION ? MUSIC_SNIPPET_DURATION : 0;
        audioElement.currentTime = startTime;
        audioElement.play().catch(err => {
            console.warn('Audio playback failed:', err);
            stopAudio();
        });
    });

    // Set timeout to stop after MUSIC_SNIPPET_DURATION seconds
    audioElement.addEventListener('play', () => {
        isPlaying = true;
        vinylPlayBtn?.classList.add('playing');
        if (vinylPlayLabel) vinylPlayLabel.textContent = 'Playing…';

        playTimeout = setTimeout(() => {
            stopAudio();
        }, MUSIC_SNIPPET_DURATION * 1000);
    });

    // Handle natural end (if file shorter than snippet)
    audioElement.addEventListener('ended', () => {
        stopAudio();
    });

    // Handle errors
    audioElement.addEventListener('error', () => {
        console.warn('Error loading audio:', src);
        stopAudio();
    });

    // If the browser blocks autoplay, we still attempt
    // For mobile, user gesture ensures play() works
}

/**
 * Toggle play/pause of the current era's snippet
 */
function togglePlayback() {
    if (isPlaying) {
        stopAudio();
    } else {
        // Play current selected era, or default to 'lover' if none set
        const era = currentAudioKey || 'lover';
        playSnippet(era);
    }
}


// ==================== 8. OPTIONAL: Swap placeholder images with real ones ====================
// Uncomment the block below and replace with your actual image paths:
//
// document.querySelectorAll('.polaroid img[data-real-src]').forEach(img => {
//     img.src = img.getAttribute('data-real-src');
// });

console.log(`🌸 Dear Reader's Garden is in full bloom for ${FRIEND_NAME}.`);