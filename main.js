const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const messageElement = document.getElementById("message");

let currentPos = null; // سيخزن [row, col]
let visitedCount = 0;
let visitedBoard = Array.from({ length: 8 }, () => Array(8).fill(false));

// إنشاء الرقعة
function createBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement("div");
      cell.className = `cell ${(r + c) % 2 === 0 ? "white" : "black"}`;
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleMove(r, c));
      boardElement.appendChild(cell);
    }
  }
}

// التحقق من قانونية حركة الحصان (شكل L)
function isValidKnightMove(r1, c1, r2, c2) {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
}

// دالة معالجة الحركة مع فصل الأخطاء
function handleMove(r, c) {
  // الحركة الأولى مسموحة دائماً لبدء اللعبة
  if (currentPos === null) {
    makeMove(r, c);
    return;
  }

  // 1. التحقق إذا كان المربع مزاراً مسبقاً
  if (visitedBoard[r][c]) {
    showMessage("عذراً.. هذا المربع مزار مسبقاً!");
    return;
  }

  // 2. التحقق إذا كانت الحركة غير قانونية (ليست شكل L)
  if (!isValidKnightMove(currentPos[0], currentPos[1], r, c)) {
    showMessage("حركة خاطئة! يجب أن يتحرك الحصان على شكل حرف L.");
    return;
  }

  // إذا كانت الحركة سليمة
  makeMove(r, c);
}

// دالة عرض الرسائل المؤقتة
function showMessage(text) {
  messageElement.innerText = text;
  messageElement.style.color = "#ff4d4d"; // لون أحمر للتنبيه
  setTimeout(() => {
    messageElement.innerText = "";
  }, 2500);
}

function makeMove(r, c) {
  // إزالة تمييز الحصان من الموقع القديم
  if (currentPos) {
    const oldCell = getCellElement(currentPos[0], currentPos[1]);
    oldCell.classList.remove("current");
    oldCell.classList.add("visited");
    oldCell.innerText = visitedCount; // وضع رقم الخطوة في المربع السابق
  }

  // تحديث البيانات للموقع الجديد
  currentPos = [r, c];
  visitedBoard[r][c] = true;
  visitedCount++;

  const newCell = getCellElement(r, c);
  newCell.classList.add("current");
  newCell.innerText = "♞"; // وضع رمز الحصان في الموقع الحالي

  scoreElement.innerText = visitedCount;

  // حالة الفوز
  if (visitedCount === 64) {
    messageElement.innerText = "تهانينا! لقد حققت جولة كاملة بنجاح!";
    messageElement.style.color = "#2ecc71";
  }
}

function getCellElement(r, c) {
  return boardElement.children[r * 8 + c];
}

function resetGame() {
  currentPos = null;
  visitedCount = 0;
  visitedBoard = Array.from({ length: 8 }, () => Array(8).fill(false));
  messageElement.innerText = "";
  createBoard();
  scoreElement.innerText = "0";
}

// تشغيل اللعبة
createBoard();
