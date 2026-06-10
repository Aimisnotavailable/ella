(function() {
    const playBtn = document.getElementById('playMorseBtn');
    const statusEl = document.getElementById('morseStatus');
    const passInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitBtn');
    const hintEl = document.getElementById('hintMessage');
    const target = 'willow';
    let audioCtx = null;
    const morse = ['.--','..','.-..','.-..','---','.--']; // W I L L O W
    function beep(dur) {
        if(!audioCtx) audioCtx = new (AudioContext || webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 700;
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }
    async function playMorse() {
        playBtn.disabled = true;
        statusEl.textContent = 'Playing signal...';
        for(let pat of morse) {
            for(let ch of pat) {
                if(ch === '.') { beep(0.1); await new Promise(r=>setTimeout(r,100)); }
                else { beep(0.3); await new Promise(r=>setTimeout(r,300)); }
                await new Promise(r=>setTimeout(r,70));
            }
            await new Promise(r=>setTimeout(r,350));
        }
        statusEl.textContent = 'Transmission done.';
        playBtn.disabled = false;
    }
    playBtn.addEventListener('click', playMorse);
    function unlock() {
        if(passInput.value.trim().toLowerCase() === target) {
            sessionStorage.setItem('gardenUnlocked','true');
            hintEl.textContent = 'Correct! Opening gate...';
            setTimeout(()=> window.location.href='garden.html',700);
        } else {
            hintEl.textContent = 'Wrong code. Try again.';
            passInput.value = '';
        }
    }
    submitBtn.addEventListener('click', unlock);
    passInput.addEventListener('keypress', e => { if(e.key === 'Enter') unlock(); });
})();