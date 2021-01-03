// This is a derived work of
// https://github.com/rustwasm/wasm_game_of_life/blob/master/www/index.js
// with the following changes:
//
// - ...
// - ...

(async () => {

const bgName = './wasm_game_of_life';
// (use ${bgName}.js#N (N=0,1,..) in case making multiple wasm instances)
const mod = await Threelet.Utils.loadWasmBindgen(
    bgName, await import(`${bgName}.export.js`));
console.log('mod:', mod);

const { Universe, Cell, wasm } = mod;
console.log('wasm:', wasm);
const memory = wasm.memory;

if (0) {
    mod.greet("expect OK"); // OK
    wasm.greet("expect NG"); // NG; name not shown!!
    Universe.greet("expect OK"); // OK; name shown
}
//========

// TODO what would be the perf difference when using the canvas via wasm??
//   https://github.com/rustwasm/wasm-bindgen/tree/master/examples/canvas

// https://rustwasm.github.io/docs/book/game-of-life/implementing.html

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct the universe, and get its width and height.
const universe = Universe.new();
console.log('universe:', universe);
const width = universe.width();
const height = universe.height();

//======== begin canvas stuff ========
// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;
const ctx = canvas.getContext('2d');

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i <= width; i++) { // Vertical lines.
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }
    for (let j = 0; j <= height; j++) { // Horizontal lines.
        ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }
    ctx.stroke();
};

const _fillCell = (ctx, row, col) => {
    ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE, CELL_SIZE);
};
const getIndex = (row, column) => {
    return row * width + column;
};
const drawCells = (useDelta=true) => {
    if (1) { // draw directly in Rust
        //---- bench for 1000 frames (bench without rAF restriction !!!!)
        // empty return; (baseline): 522 ms
        // direct universe.draw_cells(): ???? ms
        // best delta method: 1157 ms
        //----
        universe.draw_cells(ctx);

        return;//!!!!!!!!
    }
    if (useDelta) { // delta version
        // universe.dump_cells(); // debug

        const deltaAlive = new Uint32Array(memory.buffer,
            universe.delta_alive_ptr(), universe.delta_alive_size());
        const deltaDead = new Uint32Array(memory.buffer,
            universe.delta_dead_ptr(), universe.delta_dead_size());
        // console.log('delta:', deltaAlive, deltaDead);

        ctx.fillStyle = ALIVE_COLOR;
        for (let idx of deltaAlive) {
            _fillCell(ctx, Math.floor(idx/width), idx % width);
        }

        ctx.fillStyle = DEAD_COLOR;
        for (let idx of deltaDead) {
            _fillCell(ctx, Math.floor(idx/width), idx % width);
        }
    } else { // orig version
        const cellsPtr = universe.cells();
        // console.log('cellsPtr:', cellsPtr);
        const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

        // Alive cells.
        ctx.fillStyle = ALIVE_COLOR;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const idx = getIndex(row, col);
                if (cells[idx] !== Cell.Alive) continue;
                _fillCell(ctx, row, col);
            }
        }

        // Dead cells.
        ctx.fillStyle = DEAD_COLOR;
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const idx = getIndex(row, col);
                if (cells[idx] !== Cell.Dead) continue;
                _fillCell(ctx, row, col);
            }
        }
    }
};

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;
    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;
    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

    universe.toggle_cell(row, col);

    drawGrid();
    drawCells();
});
//======== end canvas stuff ========


const fps = new class {
    constructor() {
        this.fps = document.getElementById("fps");
        this.frames = [];
        this.lastFrameTimeStamp = performance.now();
    }

    render(frame) {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        this.lastFrameTimeStamp = now;
        const fps = 1 / delta * 1000;

        // Save only the latest 100 timings.
        this.frames.push(fps);
        if (this.frames.length > 100) {
            this.frames.shift();
        }

        // Find the max, min, and mean of our 100 latest timings.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < this.frames.length; i++) {
            sum += this.frames[i];
            min = Math.min(this.frames[i], min);
            max = Math.max(this.frames[i], max);
        }
        let mean = sum / this.frames.length;

        // Render the statistics.
        this.fps.textContent = `
[frame: ${frame}]
fps:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
    }
};

let animationId = null;

let _count = 0;
let _frame = 0;
const renderLoop = () => {
    if (1 && _frame > 1000) {
        console.log('reached 1000 frames:', performance.now());
        return;
    }
    fps.render(_frame);

    if (0) { // dev
        const useDelta = true;
        // const useDelta = false;
        drawGrid();
        drawCells(useDelta);
        console.log('renderLoop(): draw{Grid,Cells}() done for frame:', _frame);
        if (_count === 0) {
        // if (_count === 33) {
            console.log('pausing at _count:', _count);
            pause(); return;
        } else {
            universe.tick(); _frame++;
        }
        _count++;
        //======== ========
        // improvements:
        // (203-170)/203 = 0.1625 (render every frame)
        // (2815-2439)/2815 = 0.1335 (render every 10 frame)
    } else if (1) { // 60 fps; reached 1000 frames: 17083.40
        for (let i = 0; i < 9; i++) { // delta; [oculusGo 25fps] ~ 60 fps; 2439.93/1000frames
            drawGrid();
            drawCells(true);
            universe.tick(); _frame++;
        }
    } else { // ~ 50 fps; reached 1000 frames: 20317.23
        drawGrid();
        drawCells(false);
        for (let i = 0; i < 9; i++) { // orig; [oculusGo 7fps] ~ 45 fps; 2815.78/1000frames
            universe.tick(); _frame++;
        }
    }

    // animationId = requestAnimationFrame(renderLoop);
    renderLoop(); // bench without rAF restriction !!!!!!!!!!!
};

const playPauseButton = document.getElementById("play-pause");
const play = () => {
    playPauseButton.textContent = "⏸";
    renderLoop();
};
const pause = () => {
    playPauseButton.textContent = "▶";
    cancelAnimationFrame(animationId);
    animationId = null;
};
playPauseButton.addEventListener("click", event => {
    if (animationId === null) { // if paused
        universe.tick(); _frame++;
        play();
    } else {
        pause();
    }
});

play();

})(); // end async fn
