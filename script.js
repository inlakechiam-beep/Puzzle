const COLS = 6;
const ROWS = 4;
const WIDTH = 295.33;
const HEIGHT = 295.5;
const SNAP_THRESHOLD = 120;

const board = document.getElementById('game-board');
const gridContainer = document.getElementById('grid-container');
const piecesContainer = document.getElementById('pieces-container');

let currentScale = 1;
let activePiece = null;
let startX, startY, initialLeft, initialTop;

function initGame() {
  // 1. Zoom an die Fenstergröße anpassen
  autoFitToScreen();

  // 2. Raster-Hintergrund erzeugen
  gridContainer.innerHTML = '';
  for (let i = 0; i < COLS * ROWS; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    gridContainer.appendChild(cell);
  }

  // 3. Kacheln erzeugen und außen ablegen
  initPieces();
}

// Stellt sicher, dass das 3:2 Feld immer komplett sichtbar ist
function autoFitToScreen() {
  const padding = 100; // Platz für die seitlichen Steine
  const scaleX = window.innerWidth / (1772 + padding * 2);
  const scaleY = window.innerHeight / (1182 + padding);
  
  // Nimm den kleineren Skalierungswert, damit nichts abgeschnitten wird
  currentScale = Math.min(scaleX, scaleY, 1);
  board.style.transform = `scale(${currentScale})`;
}

function initPieces() {
  piecesContainer.innerHTML = '';
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const piece = document.createElement('div');
      piece.classList.add('puzzle-piece');
      
      const posX = col * WIDTH;
      const posY = row * HEIGHT;
      piece.style.backgroundPosition = `-${posX}px -${posY}px`;
      
      const randomRotation = Math.floor(Math.random() * 4) * 90;
      piece.dataset.rotation = randomRotation;

      // Außerhalb platzieren
      const spawnOnLeft = Math.random() < 0.5;
      let randomLeft;

      if (spawnOnLeft) {
        randomLeft = -360 + Math.random() * 50;
      } else {
        randomLeft = 1800 + Math.random() * 50;
      }
      
      const randomTop = Math.random() * (1182 - HEIGHT);
      
      piece.style.left = `${randomLeft}px`;
      piece.style.top = `${randomTop}px`;
      piece.style.transform = `rotate(${randomRotation}deg)`;

      piecesContainer.appendChild(piece);
      addDragAndDrop(piece);
    }
  }
}

function addDragAndDrop(piece) {
  piece.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    
    activePiece = piece;
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = piece.offsetLeft;
    initialTop = piece.offsetTop;

    piecesContainer.appendChild(piece);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

function onMouseMove(e) {
  if (!activePiece) return;
  const dx = (e.clientX - startX) / currentScale;
  const dy = (e.clientY - startY) / currentScale;

  activePiece.style.left = `${initialLeft + dx}px`;
  activePiece.style.top = `${initialTop + dy}px`;
}

function onMouseUp() {
  if (activePiece) {
    snapToGrid(activePiece);
    activePiece = null;
  }
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}

function snapToGrid(piece) {
  const currentLeft = piece.offsetLeft;
  const currentTop = piece.offsetTop;

  const targetCol = Math.round(currentLeft / WIDTH);
  const targetRow = Math.round(currentTop / HEIGHT);

  if (targetCol >= 0 && targetCol < COLS && targetRow >= 0 && targetRow < ROWS) {
    const snapLeft = targetCol * WIDTH;
    const snapTop = targetRow * HEIGHT;

    const distanceX = Math.abs(currentLeft - snapLeft);
    const distanceY = Math.abs(currentTop - snapTop);

    if (distanceX < SNAP_THRESHOLD && distanceY < SNAP_THRESHOLD) {
      piece.style.left = `${snapLeft}px`;
      piece.style.top = `${snapTop}px`;
    }
  }
}

// Steuerung
document.addEventListener('contextmenu', (e) => {
  if (e.target.classList.contains('puzzle-piece')) {
    e.preventDefault();
    let currentRotation = parseInt(e.target.dataset.rotation || '0');
    currentRotation = (currentRotation + 90) % 360;
    
    e.target.dataset.rotation = currentRotation;
    e.target.style.transform = `rotate(${currentRotation}deg)`;
  }
});

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (e.deltaY < 0) {
    currentScale = Math.min(currentScale + 0.1, 2.5);
  } else {
    currentScale = Math.max(currentScale - 0.1, 0.2);
  }
  board.style.transform = `scale(${currentScale})`;
}, { passive: false });

// Passt die Skalierung bei Fenstergrößenänderung an
window.addEventListener('resize', autoFitToScreen);

initGame();
