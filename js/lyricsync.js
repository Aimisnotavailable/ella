// Lyric portrait grid generation and real-time highlighting
(function() {
  let gridContainer;
  let portraitActive = false;
  let syncData = {};
  let highlightInterval = null;
  let audioElement;
  let currentSongTitle = '';

  // Expose functions to garden.js
  window.initPortrait = initPortrait;
  window.updateSongForPortrait = updateSongForPortrait;
  window.clearLyricHighlighting = clearHighlighting;

  async function initPortrait() {
    gridContainer = document.getElementById('portraitGrid');
    if (!gridContainer || portraitActive) return;
    portraitActive = true;

    // Fetch portrait mapping
    try {
      const response = await fetch('assets/portrait-mapping.json');
      const data = await response.json();
      buildGrid(data.grid);
      syncData = data.sync;
      audioElement = document.getElementById('gardenAudio');
    } catch (err) {
      gridContainer.innerHTML = '<p style="color:white; padding:2rem;">Lyric portrait data not found. Please check portrait-mapping.json</p>';
    }
  }

  function buildGrid(gridArray) {
    gridContainer.innerHTML = '';
    // gridArray is an array of objects: { row, col, text, color }
    // We'll create a 30x30 grid, fill cells with spans
    const size = 30;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('span');
        const entry = gridArray.find(e => e.row === r && e.col === c);
        if (entry) {
          cell.textContent = entry.text;
          cell.style.color = entry.color || '#554433';
          cell.style.fontSize = entry.fontSize || '0.55rem';
          cell.dataset.row = r;
          cell.dataset.col = c;
        } else {
          cell.textContent = '·'; // placeholder
          cell.style.color = '#2a2a1a';
        }
        gridContainer.appendChild(cell);
      }
    }
  }

  function updateSongForPortrait(songTitle) {
    currentSongTitle = songTitle || '';
    const label = document.getElementById('portraitSongLabel');
    if (label) {
      if (currentSongTitle === 'The Prophecy') {
        label.textContent = '✨ Now playing "The Prophecy" — lyrics light up in sync ✨';
      } else {
        label.textContent = `🎵 Playing: ${currentSongTitle} (highlighting only for "The Prophecy")`;
      }
    }
    // Clear previous highlights
    clearHighlighting();
    if (currentSongTitle === 'The Prophecy' && syncData && syncData['The Prophecy']) {
      startHighlighting(syncData['The Prophecy']);
    }
  }

  function clearHighlighting() {
    if (highlightInterval) {
      clearInterval(highlightInterval);
      highlightInterval = null;
    }
    // Remove all highlights
    document.querySelectorAll('.portrait-grid span').forEach(span => {
      span.classList.remove('highlight');
    });
  }

  function startHighlighting(prophecySync) {
    if (!audioElement) audioElement = document.getElementById('gardenAudio');
    if (!audioElement) return;

    // prophecySync is array of { start, end, cells: [[r,c], ...] }
    highlightInterval = setInterval(() => {
      const currentTime = audioElement.currentTime;
      // Remove all highlights first
      document.querySelectorAll('.portrait-grid span.highlight').forEach(span => {
        span.classList.remove('highlight');
      });

      // Find matching time segment
      for (let segment of prophecySync) {
        if (currentTime >= segment.start && currentTime < segment.end) {
          segment.cells.forEach(([row, col]) => {
            const cell = document.querySelector(`span[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('highlight');
          });
          break; // only one segment active at a time
        }
      }
    }, 100);
  }

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    clearHighlighting();
  });
})();