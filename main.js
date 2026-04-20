const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const solveBtn = document.getElementById("solveBtn");
const undoBtn = document.getElementById("undoBtn");

let currentPos = null;
let visitedCount = 0;
let visitedBoard = Array.from({ length: 8 }, () => Array(8).fill(false));
let history = [];
let startTime, timerInterval;
let isSolving = false;


const dr = [2, 1, -1, -2, -2, -1, 1, 2];
const dc = [1, 2, 2, 1, -1, -2, -2, -1];

function initBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = `cell ${(r + c) % 2 === 0 ? "white" : "black"}`;
      cell.onclick = () => !isSolving && handleMove(r, c);
      boardElement.appendChild(cell);
    }
  }
}

function handleMove(r, c) {
  if (currentPos === null) {
    startTimer();
    makeMove(r, c);
    return;
  }

  if (visitedBoard[r][c]) {
    showMessage("Already visited!");
    return;
  }

  const deltaR = Math.abs(currentPos[0] - r);
  const deltaC = Math.abs(currentPos[1] - c);
  if ((deltaR === 2 && deltaC === 1) || (deltaR === 1 && deltaC === 2)) {
    makeMove(r, c);
  } else {
    showMessage("Invalid Horse Move!");
  }
}

function makeMove(r, c) {
  if (currentPos) {
    const oldCell = boardElement.children[currentPos[0] * 8 + currentPos[1]];
    oldCell.classList.remove("current");
    oldCell.classList.add("visited");
    oldCell.innerText = visitedCount;
  }

  history.push({ r, c });
  currentPos = [r, c];
  visitedBoard[r][c] = true;
  visitedCount++;

  const cell = boardElement.children[r * 8 + c];
  cell.classList.add("current");
  cell.innerText = "♞";
  scoreElement.innerText = visitedCount;

  if (visitedCount === 64) {
    stopTimer();
    showMessage("Success! Tour Completed!", "#2ecc71");
  }
}

function undoMove() {
  if (history.length <= 1) {
    if (history.length === 1) resetGame();
    return;
  }

  const lastMove = history.pop();
  visitedBoard[lastMove.r][lastMove.c] = false;
  visitedCount--;

  const cell = boardElement.children[lastMove.r * 8 + lastMove.c];
  cell.classList.remove("current", "visited");
  cell.innerText = "";

  const prevMove = history[history.length - 1];
  currentPos = [prevMove.r, prevMove.c];
  const prevCell = boardElement.children[prevMove.r * 8 + prevMove.c];
  prevCell.classList.remove("visited");
  prevCell.classList.add("current");
  prevCell.innerText = "♞";

  scoreElement.innerText = visitedCount;
}

async function solveKT(r, c, movei) {
  if (movei === 64) return true;

  let candidates = [];
  for (let i = 0; i < 8; i++) {
    let nr = r + dr[i],
      nc = c + dc[i];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !visitedBoard[nr][nc]) {
      let deg = 0;
      for (let j = 0; j < 8; j++) {
        let nnr = nr + dr[j],
          nnc = nc + dc[j];
        if (
          nnr >= 0 &&
          nnr < 8 &&
          nnc >= 0 &&
          nnc < 8 &&
          !visitedBoard[nnr][nnc]
        )
          deg++;
      }
      candidates.push({ nr, nc, deg });
    }
  }
  candidates.sort((a, b) => a.deg - b.deg);

  for (let cand of candidates) {
    makeMove(cand.nr, cand.nc);
    await new Promise((res) => setTimeout(res, 50)); 

    if (await solveKT(cand.nr, cand.nc, movei + 1)) return true;

    // Backtrack
    undoMove();
    await new Promise((res) => setTimeout(res, 20));
  }
  return false;
}

async function runBacktracking() {
  if (isSolving) return;
  resetGame();
  isSolving = true;
  solveBtn.disabled = true;
  undoBtn.disabled = true;

  startTimer();
  makeMove(0, 0); 

  if (!(await solveKT(0, 0, 1))) {
    showMessage("No solution found!");
  }

  isSolving = false;
  solveBtn.disabled = false;
  undoBtn.disabled = false;
}

function showMessage(txt, color = "#f1c40f") {
  messageElement.innerText = txt;
  messageElement.style.color = color;
  setTimeout(() => (messageElement.innerText = ""), 2500);
}

function startTimer() {
  if (timerInterval) return;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const diff = Date.now() - startTime;
    const m = Math.floor(diff / 60000)
      .toString()
      .padStart(2, "0");
    const s = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    timerElement.innerText = `${m}:${s}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetGame() {
  stopTimer();
  currentPos = null;
  visitedCount = 0;
  history = [];
  visitedBoard = Array.from({ length: 8 }, () => Array(8).fill(false));
  timerElement.innerText = "00:00";
  scoreElement.innerText = "0";
  messageElement.innerText = "";
  initBoard();
}

initBoard();
