(function() {
    const flowersContainer = document.getElementById('gardenFlowers');
    const floatingText = document.getElementById('floatingText');
    const portraitOverlay = document.getElementById('portraitOverlay');
    const portraitClose = document.getElementById('portraitCloseBtn');
    const portraitTextBlock = document.getElementById('portraitTextBlock');
    const portraitLabel = document.getElementById('portraitSongLabel');
    const caseClosedOverlay = document.getElementById('caseClosedOverlay');
    const caseDismiss = document.getElementById('caseClosedDismissBtn');
    const audio = document.getElementById('gardenAudio');

    // SVG definitions for flowers (clean, no emoji)
    const flowerSvgs = {
        rose: '<svg class="flower-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="#e63946"/><path d="M50 20 L55 40 L70 35 L60 50 L75 60 L58 65 L50 80 L42 65 L25 60 L40 50 L30 35 L45 40 Z" fill="#d90429"/></svg>',
        sunflower: '<svg class="flower-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="#f4a261"/><path d="M50 15 L55 25 L70 20 L60 35 L80 35 L63 45 L85 55 L62 60 L75 78 L55 65 L50 85 L45 65 L25 78 L38 60 L15 55 L37 45 L20 35 L40 35 L30 20 L45 25 Z" fill="#e9c46a"/></svg>',
        tulip: '<svg class="flower-svg" viewBox="0 0 100 100"><path d="M50 20 L70 50 L65 70 L50 80 L35 70 L30 50 Z" fill="#e76f51"/><ellipse cx="50" cy="55" rx="15" ry="20" fill="#f4a261"/></svg>',
        cherry: '<svg class="flower-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="18" fill="#f8edeb"/><circle cx="50" cy="50" r="10" fill="#fcd5ce"/><circle cx="50" cy="50" r="4" fill="#f8ad9d"/></svg>',
        bouquet: '<svg class="flower-svg" viewBox="0 0 100 100"><circle cx="40" cy="45" r="15" fill="#cd9771"/><circle cx="60" cy="45" r="15" fill="#cd9771"/><circle cx="50" cy="35" r="15" fill="#f4a261"/></svg>',
        hibiscus: '<svg class="flower-svg" viewBox="0 0 100 100"><path d="M50 30 L70 50 L50 70 L30 50 Z" fill="#ffb5a7"/><circle cx="50" cy="50" r="10" fill="#f08080"/></svg>'
    };
    const flowerNames = ['Rose', 'Sunflower', 'Tulip', 'Cherry Blossom', 'Bouquet', 'Hibiscus'];
    const specialFlower = '<svg class="flower-svg" viewBox="0 0 100 100"><path d="M50 20 L65 45 L90 50 L65 55 L50 80 L35 55 L10 50 L35 45 Z" fill="#c77dff"/><circle cx="50" cy="50" r="8" fill="#f3c26b"/></svg>';

    // Build flower buttons
    Object.keys(flowerSvgs).forEach((key, idx) => {
        const btn = document.createElement('button');
        btn.className = 'flower';
        btn.dataset.flower = idx;
        btn.dataset.name = flowerNames[idx];
        btn.innerHTML = flowerSvgs[key] + `<span class="flower-name">${flowerNames[idx]}</span>`;
        flowersContainer.appendChild(btn);
    });
    const specialBtn = document.createElement('button');
    specialBtn.className = 'flower';
    specialBtn.dataset.flower = 'special';
    specialBtn.dataset.name = 'The Prophecy';
    specialBtn.innerHTML = specialFlower + `<span class="flower-name">The Prophecy</span>`;
    flowersContainer.appendChild(specialBtn);
    const allFlowers = document.querySelectorAll('.flower');

    // ----- WILLOW (full lyrics + timings) -----
    const willowSong = {
        title: 'Willow',
        src: 'audio/willow.mp3',  // place your willow.mp3 in /audio/
        lines: [
            { text: "I'm like the water when your ship rolled in that night", start: 0.0 },
            { text: "Rough on the surface but you cut through like a knife", start: 3.2 },
            { text: "And if it was an open-shut case", start: 6.5 },
            { text: "I never would've known from that look on your face", start: 9.0 },
            { text: "Lost in your current like a priceless wine", start: 12.3 },
            { text: "That's my man", start: 15.0 },
            { text: "Wait for the signal and I'll meet you after dark", start: 17.5 },
            { text: "Show me the places where the others gave you scars", start: 20.7 },
            { text: "Wherever you stray I follow", start: 24.0 },
            { text: "I'm begging for you to take my hand", start: 27.0 },
            { text: "Wreck my plans, that's my man", start: 30.2 },
            { text: "Life was a willow and it bent right to your wind", start: 33.0 },
            { text: "They count me out time and time again", start: 36.5 },
            { text: "But I come back stronger than a 90's trend", start: 39.5 }
        ]
    };

    let currentSong = willowSong;
    let highlightInterval = null;
    let portraitActive = false;
    let clickedSet = new Set();

    function showFloating(msg) {
        floatingText.textContent = msg;
        floatingText.classList.add('show');
        setTimeout(() => floatingText.classList.remove('show'), 2000);
    }

    function clearHighlight() {
        if (highlightInterval) clearInterval(highlightInterval);
        document.querySelectorAll('.lyric-line').forEach(l => l.classList.remove('active-line'));
    }

    function startKaraoke(song) {
        clearHighlight();
        if (!portraitActive) return;
        highlightInterval = setInterval(() => {
            const ct = audio.currentTime;
            let activeIdx = -1;
            for (let i = song.lines.length-1; i >= 0; i--) {
                if (ct >= song.lines[i].start) { activeIdx = i; break; }
            }
            document.querySelectorAll('.lyric-line').forEach((line, idx) => {
                if (idx === activeIdx) line.classList.add('active-line');
                else line.classList.remove('active-line');
            });
        }, 100);
    }

    function loadSong(song) {
        if (audio.src !== song.src) {
            audio.pause();
            audio.src = song.src;
            audio.load();
        }
        audio.play().catch(e => console.log("Audio play blocked", e));
        if (portraitActive) {
            // rebuild lyric lines
            portraitTextBlock.innerHTML = song.lines.map(l => `<span class="lyric-line">${l.text}</span>`).join('');
            portraitLabel.textContent = `🎵 Now playing: ${song.title}`;
            startKaraoke(song);
        }
    }

    function revealPortrait() {
        if (portraitActive) return;
        portraitActive = true;
        portraitOverlay.classList.add('active');
        portraitTextBlock.innerHTML = currentSong.lines.map(l => `<span class="lyric-line">${l.text}</span>`).join('');
        portraitLabel.textContent = `🎵 Now playing: ${currentSong.title}`;
        if (!audio.paused && audio.currentTime > 0) startKaraoke(currentSong);
    }

    portraitClose.addEventListener('click', () => {
        portraitOverlay.classList.remove('active');
        clearHighlight();
        portraitActive = false;
    });

    allFlowers.forEach(flower => {
        flower.addEventListener('click', () => {
            flower.classList.add('bloom');
            setTimeout(() => flower.classList.remove('bloom'), 500);
            const name = flower.dataset.name;
            showFloating(`${name} whispers a melody...`);
            loadSong(currentSong);
            clickedSet.add(flower.dataset.flower);
            if (clickedSet.size >= allFlowers.length) {
                caseClosedOverlay.classList.add('active');
            }
            if (!portraitActive) revealPortrait();
        });
    });
    caseDismiss.addEventListener('click', () => caseClosedOverlay.classList.remove('active'));

    // Fireflies
    const ffContainer = document.getElementById('firefliesContainer');
    for(let i=0;i<30;i++) {
        const ff = document.createElement('div');
        ff.className = 'firefly';
        ff.style.left = Math.random()*100 + '%';
        ff.style.top = Math.random()*70 + '%';
        ff.style.animationDelay = Math.random()*10 + 's';
        ffContainer.appendChild(ff);
    }
})();