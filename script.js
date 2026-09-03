

const COLS = 6;
const ROWS = 4;
const WIDTH = 295.33;
const HEIGHT = 295.5;

// Wie nah muss der Stein am Feld sein, um einzurasten (in Pixeln)
const SNAP_THRESHOLD = 120;

const board = document.getElementById('game-board');
const gridContainer = document.getElementById('grid-container');
const piecesContainer = document.getElementById('pieces-container');

let currentScale = 1;
let activePiece = null;
let startX, startY, initialLeft, initialTop;

// 1. Raster-Hintergrund erzeugen
for (let i = 0; i < COLS * ROWS; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    gridContainer.appendChild(cell);
}

// 2. Puzzle-Teile erzeugen & außerhalb des Feldes platzieren
function initGame() {
    piecesContainer.innerHTML = '';

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');

            // Bildpfad auf rune.jpg setzen
            piece.style.backgroundImage = "url('rune.jpg')";

            // Bildausschnitt zuweisen
            const posX = col * WIDTH;
            const posY = row * HEIGHT;
            piece.style.backgroundPosition = `-${posX}px -${posY}px`;

            // Zufällige Start-Rotation
            const randomRotation = Math.floor(Math.random() * 4) * 90;
            piece.dataset.rotation = randomRotation;

            // Kacheln außerhalb des Spielfelds ablegen (links oder rechts)
            const spawnOnLeft = Math.random() < 0.5;
            let randomLeft, randomTop;

            if (spawnOnLeft) {
                // Links vom Feld
                randomLeft = -360 + Math.random() * 50;
            } else {
                // Rechts vom Feld
                randomLeft = 1800 + Math.random() * 50;
            }

            // Vertikal entlang der Spielfeldhöhe verteilen
            randomTop = Math.random() * (1182 - HEIGHT);

            piece.style.left = `${randomLeft}px`;
            piece.style.top = `${randomTop}px`;
            piece.style.transform = `rotate(${randomRotation}deg)`;

            piecesContainer.appendChild(piece);
            addDragAndDrop(piece);
        }
    }
}

// 3. Drag & Drop Logik
function addDragAndDrop(piece) {
    piece.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Nur Linksklick zieht Kacheln

        activePiece = piece;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = piece.offsetLeft;
        initialTop = piece.offsetTop;

        // Aufgezogenes Teil nach ganz oben holen
        piecesContainer.appendChild(piece);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}

function onMouseMove(e) {
    if (!activePiece) return;

    // Maus-Bewegung an Zoom anpassen
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

// 4. Snap-Funktion (Einrasten im Raster)
function snapToGrid(piece) {
    const currentLeft = piece.offsetLeft;
    const currentTop = piece.offsetTop;

    // Nächstgelegene Spalte (0 bis 5) und Zeile (0 bis 3) ermitteln
    const targetCol = Math.round(currentLeft / WIDTH);
    const targetRow = Math.round(currentTop / HEIGHT);

    // Prüfen, ob der Stein überhaupt im Bereich des Spielfelds losgelassen wurde
    if (targetCol >= 0 && targetCol < COLS && targetRow >= 0 && targetRow < ROWS) {
        // Exakte Position des Rasternetzes an dieser Stelle
        const snapLeft = targetCol * WIDTH;
        const snapTop = targetRow * HEIGHT;

        // Distanz zwischen aktiver Position und Rasterfeld berechnen
        const distanceX = Math.abs(currentLeft - snapLeft);
        const distanceY = Math.abs(currentTop - snapTop);

        // Wenn der Abstand kleiner als der Schwellenwert ist -> Snap!
        if (distanceX < SNAP_THRESHOLD && distanceY < SNAP_THRESHOLD) {
            piece.style.left = `${snapLeft}px`;
            piece.style.top = `${snapTop}px`;
        }
    }
}

// 5. Rechtsklick-Rotation
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('puzzle-piece')) {
        e.preventDefault();
        let currentRotation = parseInt(e.target.dataset.rotation || '0');
        currentRotation = (currentRotation + 90) % 360;

        e.target.dataset.rotation = currentRotation;
        e.target.style.transform = `rotate(${currentRotation}deg)`;
    }
});

// 6. Zoom-Funktion per Mausrad
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
        currentScale = Math.min(currentScale + 0.1, 2.5);
    } else {
        currentScale = Math.max(currentScale - 0.1, 0.3);
    }
    board.style.transform = `scale(${currentScale})`;
}, { passive: false });

initGame();
