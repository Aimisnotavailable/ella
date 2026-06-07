(function() {
  const flowers = document.querySelectorAll('.flower');
  const floatingText = document.getElementById('floatingText');
  const portraitOverlay = document.getElementById('portraitOverlay');
  const portraitCloseBtn = document.getElementById('portraitCloseBtn');
  const portraitTextBlock = document.getElementById('portraitTextBlock');
  const portraitSongLabel = document.getElementById('portraitSongLabel');
  const caseClosedOverlay = document.getElementById('caseClosedOverlay');
  const caseClosedDismissBtn = document.getElementById('caseClosedDismissBtn');
  const gardenAudio = document.getElementById('gardenAudio');

  // Song library – replace src paths with your own MP3s
  const songLibrary = [
    {
      title: 'Willow',
      src: 'audio/willow.mp3',
      lyrics: `I'm like the water when your ship rolled in that night
Rough on the surface but you cut through like a knife
And if it was an open-shut case
I never would've known from that look on your face
Lost in your current like a priceless wine
That's my man`,
      lines: [
        { text: "I'm like the water when your ship rolled in that night", start: 0 },
        { text: "Rough on the surface but you cut through like a knife", start: 3 },
        { text: "And if it was an open-shut case", start: 6 },
        { text: "I never would've known from that look on your face", start: 9 },
        { text: "Lost in your current like a priceless wine", start: 12 },
        { text: "That's my man", start: 15 }
      ]
    },
    {
      title: 'Cardigan',
      src: 'audio/cardigan.mp3',
      lyrics: `Vintage tee, brand new phone
High heels on cobblestones
When you are young they assume you know nothing
Sequin smile, black lipstick
Sensual politics
When you are young they assume you know nothing`,
      lines: [
        { text: "Vintage tee, brand new phone", start: 0 },
        { text: "High heels on cobblestones", start: 2 },
        { text: "When you are young they assume you know nothing", start: 4 },
        { text: "Sequin smile, black lipstick", start: 7 },
        { text: "Sensual politics", start: 9 },
        { text: "When you are young they assume you know nothing", start: 11 }
      ]
    },
    {
      title: 'Enchanted',
      src: 'audio/enchanted.mp3',
      lyrics: `There I was again tonight
Forcing laughter, faking smiles
Same old tired, lonely place
Walls of insincerity, shifting eyes and vacancy
Vanished when I saw your face
All I can say is it was enchanting to meet you`,
      lines: [
        { text: "There I was again tonight", start: 0 },
        { text: "Forcing laughter, faking smiles", start: 3 },
        { text: "Same old tired, lonely place", start: 5 },
        { text: "Walls of insincerity, shifting eyes and vacancy", start: 8 },
        { text: "Vanished when I saw your face", start: 11 },
        { text: "All I can say is it was enchanting to meet you", start: 14 }
      ]
    },
    {
      title: 'Lover',
      src: 'audio/lover.mp3',
      lyrics: `We could leave the Christmas lights up 'til January
This is our place, we make the rules
And there's a dazzling haze, a mysterious way about you, dear
Have I known you twenty seconds or twenty years?`,
      lines: [
        { text: "We could leave the Christmas lights up 'til January", start: 0 },
        { text: "This is our place, we make the rules", start: 3 },
        { text: "And there's a dazzling haze, a mysterious way about you, dear", start: 6 },
        { text: "Have I known you twenty seconds or twenty years?", start: 9 }
      ]
    },
    {
      title: 'The Prophecy',
      src: 'audio/prophecy.mp3',
      lyrics: `Can't hurry love
Or it won't last
I found the one thing
I was missing at last
And I hope it's you
I hope it's you
That's the prophecy`,
      lines: [
        { text: "Can't hurry love", start: 0 },
        { text: "Or it won't last", start: 2 },
        { text: "I found the one thing", start: 4 },
        { text: "I was missing at last", start: 6 },
        { text: "And I hope it's you", start: 8 },
        { text: "I hope it's you", start: 10 },
        { text: "That's the prophecy", start: 12 }
      ]
    },
    {
      title: 'Blank Space',
      src: 'audio/blankspace.mp3',
      lyrics: `Nice to meet you, where you been?
I could show you incredible things
Magic, madness, heaven, sin
Saw you there and I thought
Oh my God, look at that face
You look like my next mistake`,
      lines: [
        { text: "Nice to meet you, where you been?", start: 0 },
        { text: "I could show you incredible things", start: 2 },
        { text: "Magic, madness, heaven, sin", start: 4 },
        { text: "Saw you there and I thought", start: 6 },
        { text: "Oh my God, look at that face", start: 8 },
        { text: "You look like my next mistake", start: 10 }
      ]
    }
  ];

  let currentSongIndex = null;
  let flowerInteractionCount = 0;
  const totalFlowers = flowers.length;
  let portraitRevealed = false;
  let highlightInterval = null;

  const quotes = [
    "“You are the best thing that's ever been mine.”",
    "“To live for the hope of it all.”",
    "“I had the time of my life fighting dragons with you.”",
    "“Long live all the magic we made.”",
    "“Roses are red, violets are blue, mystery loves you.”",
    "“A friend who reads is a detective of the heart.”"
  ];

  function showFloatingText(text) {
    floatingText.textContent = text;
    floatingText.classList.add('show');
    clearTimeout(floatingText._timeout);
    floatingText._timeout = setTimeout(() => {
      floatingText.classList.remove('show');
    }, 2200);
  }

  function stopAudio() {
    gardenAudio.pause();
    gardenAudio.currentTime = 0;
    clearHighlighting();
  }

  // --- Portrait rendering & highlighting ---

  function buildPortraitHTML(song) {
    let html = '';
    song.lines.forEach((line, index) => {
      html += `<span data-line="${index}" class="lyric-line">${line.text}</span><br>`;
    });
    return html;
  }

  function updatePortraitForSong(song) {
    if (!portraitRevealed) return;
    if (!portraitTextBlock) return; // safety
    portraitTextBlock.innerHTML = buildPortraitHTML(song);
    portraitSongLabel.textContent = `🎵 Now playing: ${song.title}`;
    clearHighlighting();
    startHighlighting(song);
  }

  function clearHighlighting() {
    if (highlightInterval) {
      clearInterval(highlightInterval);
      highlightInterval = null;
    }
    document.querySelectorAll('.lyric-line').forEach(line => {
      line.classList.remove('active-line');
    });
  }

  function startHighlighting(song) {
    if (!song.lines || song.lines.length === 0) return;
    clearHighlighting();

    highlightInterval = setInterval(() => {
      const currentTime = gardenAudio.currentTime;
      let activeIndex = -1;
      for (let i = song.lines.length - 1; i >= 0; i--) {
        if (currentTime >= song.lines[i].start) {
          activeIndex = i;
          break;
        }
      }
      document.querySelectorAll('.lyric-line').forEach((line, idx) => {
        if (idx === activeIndex) {
          line.classList.add('active-line');
        } else {
          line.classList.remove('active-line');
        }
      });
    }, 150);
  }

  // --- Flower interactions & audio ---

  function playRandomSong() {
    const randomIndex =  0; // Math.floor(Math.random() * songLibrary.length);
    if (randomIndex === currentSongIndex && songLibrary.length > 1) return playRandomSong();
    currentSongIndex = randomIndex;
    const song = songLibrary[randomIndex];
    stopAudio();
    gardenAudio.src = song.src;
    gardenAudio.load();
    gardenAudio.play().catch(e => console.log('Audio play failed (maybe no file):', e));
    updatePortraitForSong(song);
    return song.title;
  }

  flowers.forEach(flower => {
    flower.addEventListener('click', () => {
      flower.classList.add('bloom');
      setTimeout(() => flower.classList.remove('bloom'), 800);

      const flowerName = flower.dataset.name || 'Mystery Flower';
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      showFloatingText(`${flowerName}: ${randomQuote}`);

      playRandomSong();
      flowerInteractionCount++;

      if (flower.dataset.flower === 'special' || (flowerInteractionCount >= 5 && !portraitRevealed)) {
        revealPortrait();
      }
      checkAllFlowersClicked();
    });
  });

  function revealPortrait() {
    if (portraitRevealed) return;
    portraitRevealed = true;
    portraitOverlay.classList.add('active');
    if (currentSongIndex !== null) {
      updatePortraitForSong(songLibrary[currentSongIndex]);
    } else {
      portraitTextBlock.innerHTML = '<p style="color: white; font-family: Caveat, cursive;">Click a flower to start the music…</p>';
    }
  }

  portraitCloseBtn.addEventListener('click', () => {
    portraitOverlay.classList.remove('active');
    clearHighlighting();
  });

  // --- Case Closed Easter Egg ---
  const clickedFlowersSet = new Set();
  flowers.forEach(f => {
    f.addEventListener('click', function tracker() {
      clickedFlowersSet.add(f.dataset.flower);
      checkAllFlowersClicked();
    });
  });

  function checkAllFlowersClicked() {
    if (clickedFlowersSet.size >= totalFlowers) {
      caseClosedOverlay.classList.add('active');
    }
  }

  caseClosedDismissBtn.addEventListener('click', () => {
    caseClosedOverlay.classList.remove('active');
  });

  // --- Fireflies ---
  const firefliesContainer = document.getElementById('firefliesContainer');
  for (let i = 0; i < 25; i++) {
    const ff = document.createElement('div');
    ff.className = 'firefly';
    ff.style.left = Math.random() * 100 + '%';
    ff.style.top = Math.random() * 70 + '%';
    ff.style.animationDelay = Math.random() * 10 + 's';
    firefliesContainer.appendChild(ff);
  }

  window.addEventListener('beforeunload', () => clearHighlighting());
})();