(() => {
  const placedLayer = document.getElementById('placed-cards-layer');
  const sharedTeamStorageKey = 'ctvirtual_shared_team';
  const tacticsStateStorageKey = 'ctvirtual_tactics_state';
  const mesaTaticaRewardStorageKey = 'ctvirtual_reward_mesa_tatica_pending';
  const mesaTaticaCompletionKey = 'ctvirtual_mesa_tatica_completed';
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get('returnTo') || '../index.html';
  const mission = searchParams.get('mission') || '';
  if (!placedLayer) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'share-team';
  button.className = 'share-team';
  button.type = 'button';
  button.textContent = 'Compartilhar time';
  button.hidden = true;
  document.body.appendChild(button);

  const targetField = document.getElementById('background-square') ||
    document.getElementById('trace-canvas') ||
    document.body;

  function getPlacedCount() {
    return Array.from(placedLayer.querySelectorAll('.selected-card-layer'))
      .filter((layerEl) => layerEl.dataset.cardSrc)
      .length;
  }

  function updateButton() {
    button.hidden = getPlacedCount() < 11;
  }

  function getCaptureRect() {
    const elements = [
      targetField,
      document.querySelector('.tactics-panel'),
      ...document.querySelectorAll('.circle'),
      ...placedLayer.querySelectorAll('.selected-card-layer')
    ].filter(Boolean);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      minX = Math.min(minX, rect.left);
      minY = Math.min(minY, rect.top);
      maxX = Math.max(maxX, rect.right);
      maxY = Math.max(maxY, rect.bottom);
    });

    if (!Number.isFinite(minX)) {
      const rect = targetField.getBoundingClientRect();
      return rect;
    }

    const padding = 14;
    return {
      left: minX - padding,
      top: minY - padding,
      right: maxX + padding,
      bottom: maxY + padding
    };
  }

  async function captureFieldImage() {
    if (!window.html2canvas) {
      throw new Error('html2canvas nao carregado');
    }
    const rect = getCaptureRect();
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    const canvas = await window.html2canvas(document.body, {
      backgroundColor: null,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width,
      height,
      scale: 2
    });
    return canvas;
  }

  function readTacticsState() {
    if (window.ctvirtualTacticsState) {
      return window.ctvirtualTacticsState;
    }

    try {
      return JSON.parse(localStorage.getItem(tacticsStateStorageKey) || '{}');
    } catch (error) {
      return {};
    }
  }

  async function shareImage() {
    button.disabled = true;
    button.textContent = 'Gerando imagem...';
    try {
      const canvas = await captureFieldImage();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        throw new Error('Falha ao gerar imagem');
      }
      const text = 'Meu time escalado no CT Virtual';
      const url = 'https://osinvictos.com.br/paulista26/ctvirtual/';
      const shareText = `${text} ${url}`;
      const imageUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'guarani-time.png';
      link.click();
      URL.revokeObjectURL(imageUrl);

      localStorage.setItem(sharedTeamStorageKey, 'unlocked');
      if (mission === 'mesa-tatica') {
        const tacticsState = readTacticsState();
        const completedMesaTatica = tacticsState.formation === '4-4-2' && tacticsState.phase === 'sem-posse';

        if (!completedMesaTatica) {
          alert('Imagem salva, mas a missao Mesa Tatica so vale no esquema 4-4-2 em sem posse de bola.');
          return;
        }

        localStorage.setItem(mesaTaticaRewardStorageKey, '3');
        localStorage.setItem(mesaTaticaCompletionKey, 'unlocked');
        alert(`Imagem salva com sucesso. Clique em OK para voltar ao album e receber 3 figurinhas aleatorias. Compartilhe a imagem e o link: ${shareText}`);
        window.location.href = returnTo;
        return;
      }

      alert(`Imagem salva com sucesso. Clique em OK para voltar ao album. Compartilhe a imagem e o link: ${shareText}`);
      window.location.href = returnTo;
    } catch (error) {
      alert('Nao foi possivel gerar a imagem do time.');
    } finally {
      button.disabled = false;
      button.textContent = 'Compartilhar time';
    }
  }

  button.addEventListener('click', shareImage);
  document.addEventListener('cards-updated', updateButton);
  updateButton();
})();
