(() => {
  const targetField = document.getElementById('background-square');
  if (!targetField) {
    return;
  }

  const controls = document.createElement('div');
  controls.className = 'record-controls';
  controls.innerHTML = `
    <button type="button" class="record-btn" data-action="record" aria-label="Record">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="7"></circle>
      </svg>
    </button>
    <button type="button" class="record-btn" data-action="play" aria-label="Play" disabled>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <polygon points="9,7 19,12 9,17"></polygon>
      </svg>
    </button>
    <button type="button" class="record-btn" data-action="stop" aria-label="Stop" disabled>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="7" y="7" width="10" height="10"></rect>
      </svg>
    </button>
  `;
  document.body.appendChild(controls);

  setButtonState();
  window.recordTimePositions = startRecording;
})();
