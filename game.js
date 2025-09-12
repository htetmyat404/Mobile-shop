// Basic Snake game — single file, readable and extendable.
// Grid-based game. No external libs.

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const scoreEl = document.getElementById('score');
  const btnRestart = document.getElementById('btn-restart');

  // Game config
  const gridSize = 20; // px per cell
  const cols = Math.floor(canvas.width / gridSize);
  const rows = Math.floor(canvas.height / gridSize);
  const tickMs = 100; // speed (lower = faster)

  // Game state
  let snake;
  let dir;
  let apple;
  let running = false;
  let score = 0;
  let loopId = null;

  function reset() {
    snake = [{ x: Math.floor(cols/2), y: Math.floor(rows/2) }];
    dir = { x: 1, y: 0 };
    placeApple();
    score = 0;
    running = true;
    scoreEl.textContent = score;
    if (loopId) { clearInterval(loopId); loopId = null; }
    loopId = setInterval(tick, tickMs);
  }

  function placeApple() {
    while (true) {
      const x = Math.floor(Math.random()*cols);
      const y = Math.floor(Math.random()*rows);
      if (!snake.some(s => s.x===x && s.y===y)) {
        apple = { x,y };
        return;
      }
    }
  }

  function tick() {
    if (!running) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // wrap-around behavior (change to crash-on-wall if you prefer)
    head.x = (head.x + cols) % cols;
    head.y = (head.y + rows) % rows;

    // collision with self
    if (snake.some(s => s.x===head.x && s.y===head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // eat apple?
    if (head.x === apple.x && head.y === apple.y) {
      score += 1;
      scoreEl.textContent = score;
      placeApple();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    // draw background
    ctx.fillStyle = '#07121a';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw apple
    drawCell(apple.x, apple.y, '#e11d48');

    // draw snake
    snake.forEach((s, i) => {
      const t = i===0 ? '#22c55e' : '#0ea5a8';
      drawCell(s.x, s.y, t);
    });
  }

  function drawCell(cx, cy, color) {
    ctx.fillStyle = color;
    ctx.fillRect(cx*gridSize + 1, cy*gridSize + 1, gridSize-2, gridSize-2);
  }

  function gameOver() {
    running = false;
    clearInterval(loopId);
    loopId = null;
    // small flash / message
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '20px system-ui, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over — Press Restart', canvas.width/2, canvas.height/2);
  }

  // Input
  window.addEventListener('keydown', e => {
    const key = e.key;
    if (!running && key === ' ') { reset(); return; }
    if (key === 'ArrowUp' && dir.y !== 1) dir = { x:0, y:-1 };
    if (key === 'ArrowDown' && dir.y !== -1) dir = { x:0, y:1 };
    if (key === 'ArrowLeft' && dir.x !== 1) dir = { x:-1, y:0 };
    if (key === 'ArrowRight' && dir.x !== -1) dir = { x:1, y:0 };
  });

  // Simple swipe support for mobile
  (function addSwipe(){
    let startX = null, startY = null;
    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', e => {
      if (startX===null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const absX = Math.abs(dx), absY = Math.abs(dy);
      if (Math.max(absX, absY) < 20) { startX=null; return; }
      if (absX > absY) {
        if (dx > 0 && dir.x !== -1) dir = { x:1,y:0 };
        else if (dx < 0 && dir.x !== 1) dir = { x:-1,y:0 };
      } else {
        if (dy > 0 && dir.y !== -1) dir = { x:0,y:1 };
        else if (dy < 0 && dir.y !== 1) dir = { x:0,y:-1 };
      }
      startX = null;
    }, { passive: true });
  })();

  btnRestart.addEventListener('click', () => reset());

  // Start
  reset();
})();
