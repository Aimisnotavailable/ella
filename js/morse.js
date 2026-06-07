(function() {
  const playBtn = document.getElementById('playMorseBtn');
  const statusEl = document.getElementById('morseStatus');
  const passwordInput = document.getElementById('passwordInput');
  const submitBtn = document.getElementById('submitBtn');
  const hintEl = document.getElementById('hintMessage');
  const lockIcon = document.getElementById('gateLock');

  const morseMap = {
    'P': '.--.', 'R': '.-.', 'O': '---', 'P': '.--.',
    'H': '....', 'E': '.', 'C': '-.-.', 'Y': '-.--'
  };
  const targetWord = 'prophecy';
  const dotDuration = 0.08;
  const dashDuration = 0.25;
  const intraLetterGap = 0.06;
  const interLetterGap = 0.3;
  const wordEndGap = 0.6;

  let audioCtx = null;

  function playBeep(duration) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 700;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function playMorseCode() {
    playBtn.disabled = true;
    statusEl.textContent = '🔊 Playing signal...';
    try {
      for (const letter of targetWord.toUpperCase()) {
        const pattern = morseMap[letter];
        if (!pattern) continue;
        for (const symbol of pattern) {
          if (symbol === '.') {
            playBeep(dotDuration);
            await sleep(dotDuration * 1000);
          } else if (symbol === '-') {
            playBeep(dashDuration);
            await sleep(dashDuration * 1000);
          }
          await sleep(intraLetterGap * 1000);
        }
        await sleep(interLetterGap * 1000);
      }
      await sleep(wordEndGap * 1000);
      statusEl.textContent = '✅ Transmission complete.';
    } catch (err) {
      statusEl.textContent = '⚠️ Audio error.';
    } finally {
      playBtn.disabled = false;
    }
  }

  playBtn.addEventListener('click', playMorseCode);

  function checkPassword() {
    const input = passwordInput.value.trim().toLowerCase();
    if (input === targetWord) {
      sessionStorage.setItem('gardenUnlocked', 'true');
      lockIcon.textContent = '🔓';
      hintEl.textContent = 'Correct, detective! Opening the gate...';
      setTimeout(() => {
        window.location.href = 'garden.html';
      }, 800);
    } else {
      hintEl.textContent = 'Not quite, Meitantei… listen again! 🔍';
      passwordInput.value = '';
      lockIcon.textContent = '🔒';
      passwordInput.focus();
    }
  }

  submitBtn.addEventListener('click', checkPassword);
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
  });
})();