let currentScale = 1;
const board = document.getElementById('game-board');

// 1. Zoom-Funktion per Mausrad
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        currentScale = Math.min(currentScale + 0.1, 2.5); // Heranzoomen (max 2.5x)
    } else {
        currentScale = Math.max(currentScale - 0.1, 0.5); // Herauszoomen (min 0.5x)
    }
    board.style.transform = `scale(${currentScale})`;
}, { passive: false });

// 2. Rechtsklick-Rotation für Puzzle-Teile
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('puzzle-piece')) {
        e.preventDefault(); // Verhindert das Standard-Kontextmenü

        let currentRotation = parseInt(e.target.dataset.rotation || '0');
        currentRotation = (currentRotation + 90) % 360;

        e.target.dataset.rotation = currentRotation;
        e.target.style.transform = `rotate(${currentRotation}deg)`;
    }

    const COLS = 6;
    const ROWS = 4;
    const WIDTH = 295.33;
    const HEIGHT = 295.5;

    function createPieces() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = document.createElement('div');
                piece.classList.add('puzzle-piece');

                // Bestimmt, welcher Teil des Gesamtbildes in diesem Quadrat sichtbar ist
                const posX = col * WIDTH;
                const posY = row * HEIGHT;
                piece.style.backgroundPosition = `-${posX}px -${posY}px`;

                // Hier wird die Kachel später auf dem Spielfeld gemischt verteilt...
                document.getElementById('pieces-container').appendChild(piece);
            }
        }
    }

    createPieces();

});