importScripts('../deps/async-thread-worker.min.js');

importScripts('../../dist/threelet.min.js');
// importScripts('../../lib/threelet.js'); // dev

//importScripts('./pkg-es-pack/fern.min.js'); // test
//====
importScripts('./fern.min.js'); // prod

class FernThreadWorker extends AsyncThreadWorker.ThreadWorker {
    // override
    onCreate(opts) {
        super.onCreate();

        this.mod = null;
    }
    async onRequest(id, payload) {
        const { task } = payload;
        console.log('onRequest(): task:', task);

        switch (task) {
            case 'init': {
                if (!this.mod) {
                    this.mod = await Fern.create();
                    this.sendResponse(id, 'ok, init done.');
                } else {
                    this.sendResponse(id, 'nop, already initialized!!');
                }

                // FernThreadWorker.testWasmMemBuffer(this.mod);
                break;
            }
            //--------
            case 'bench-rust':
            case 'bench-js': {
                if (this.mod) {
                    const ret = this.doBench(
                        payload.maxIter, payload.numFerns, task.endsWith('rust'));
                    this.sendResponse(id, ret, [ret.posBuf, ret.colorBuf]);
                } else {
                    this.sendError(id, 'not initialized yet');
                }
                break;
            }
            //--------
            case 'add': {
                const { a, b } = payload;
                this.sendResponse(id, a + b);
                break;
            }
            case 'terminate': {
                this.sendResponse(id, 'ok, closing in a sec...');
                setTimeout(() => self.close(), 1000);
                break;
            }
            default: {
                this.sendError(id, 'unknown task');
            }
        }
    }
    doBench(maxIter, numFerns, isRust) {
        return isRust ?
            FernThreadWorker.doBenchRust(maxIter, numFerns, this.mod) :
            FernThreadWorker.doBenchJs(maxIter, numFerns);
    }

    static computeFernJs(positions, colors, maxIter) {
        // https://en.wikipedia.org/wiki/Barnsley_fern
        const f1 = [0, 0, 0, 0.16, 0, 0, 0.01]; // Stem
        const f2 = [0.85, 0.04, -0.04, 0.85, 0, 1.60, 0.85]; // Successively smaller leaflets
        const f3 = [0.20, -0.26, 0.23, 0.22, 0, 1.60, 0.07]; // Largest left-hand leaflet
        const f4 = [-0.15, 0.28, 0.26, 0.24, 0, 0.44, 0.07]; // Largest right-hand leaflet
        //---- a mutant
        // const f1 = [0, 0, 0, 0.25, 0, -0.4, 0.02];
        // const f2 = [0.95, 0.005, -0.005, 0.93, -0.002, 0.5, 0.84];
        // const f3 = [0.035, -0.2, 0.16, 0.04, -0.09, 0.02, 0.07];
        // const f4 = [-0.04, 0.2, 0.16, 0.04, 0.083, 0.12, 0.07];

        const probAcc1 = f1[6];
        const probAcc2 = f1[6] + f2[6];
        const probAcc3 = f1[6] + f2[6] + f3[6];
        const fractalUpdate = (x, y, prob) => {
            let cs;
            if (prob < probAcc1) {
                cs = f1;
            } else if (prob < probAcc2) {
                cs = f2;
            } else if (prob < probAcc3) {
                cs = f3;
            } else {
                cs = f4;
            }
            return [
                cs[0] * x + cs[1] * y + cs[4],
                cs[2] * x + cs[3] * y + cs[5],
            ];
        };

        const triWidth = 0.02;
        const zVariation = 0.01;
        const baseColor = [255, 255, 0, 100];
        for (let i = 0, x = 0, y = 0, z = 0; i < maxIter; i++) {
            // const prob = 0.5;
            const prob = Math.random();
            z = zVariation * prob;

            positions[9*i] = x;
            positions[9*i+1] = y;
            positions[9*i+2] = z;
            positions[9*i+3] = x + triWidth;
            positions[9*i+4] = y;
            positions[9*i+5] = z;
            positions[9*i+6] = x;
            positions[9*i+7] = y + triWidth;
            positions[9*i+8] = z;

            colors[12*i] = baseColor[0];
            colors[12*i+1] = baseColor[1];
            colors[12*i+2] = baseColor[2];
            colors[12*i+3] = baseColor[3];
            colors[12*i+4] = baseColor[0];
            colors[12*i+5] = baseColor[1];
            colors[12*i+6] = baseColor[2];
            colors[12*i+7] = baseColor[3];
            colors[12*i+8] = baseColor[0];
            colors[12*i+9] = baseColor[1];
            colors[12*i+10] = baseColor[2];
            colors[12*i+11] = baseColor[3];

            [x, y] = fractalUpdate(x, y, prob);
        }
    }
    static doBenchJs(maxIter, numFerns) {
        const loggerAlloc = Threelet.Utils.createLogger({mute: false});
        loggerAlloc.log('begin: js verts alloc');
        const positions = new Float32Array(maxIter * 9);
        const colors = new Uint8Array(maxIter * 12);
        loggerAlloc.log('end: js verts alloc <<<<');
        console.log('positions/colors len:', positions.length, colors.length);

        const logger = Threelet.Utils.createLogger();
        for (let i = 0; i < numFerns; i++) {
            logger.log('begin: js verts compute');
            this.computeFernJs(positions, colors, maxIter);
            logger.log('end: js verts compute <<<<');
        }
        // console.log('logger:', logger);

        // const samples = new Float32Array(10).map(_val => 0.5 + 0.2 * (Math.random() - 0.5)); // test
        const samples = logger.grep('end:').splits;
        // console.log('samples:', samples);

        const posBuf = positions.buffer;
        const colorBuf = colors.buffer;
        // console.log('posBuf, colorBuf:', posBuf, colorBuf);
        return { posBuf, colorBuf, samples };
    }
    static doBenchRust(maxIter, numFerns, mod) {
        const numVerts = maxIter * 3; // 1 iter <-> 1 triangle

        const loggerAlloc = Threelet.Utils.createLogger({mute: false});
        loggerAlloc.log('begin: rust verts alloc');
        const vertsBuf = new mod.VertsBuffer(numVerts);
        loggerAlloc.log('end: rust verts alloc <<<<');

        const logger = Threelet.Utils.createLogger();
        for (let i = 0; i < numFerns; i++) {
            logger.log('begin: rust verts compute');
            // vertsBuf.compute_one_triangle(); // debug
            vertsBuf.compute_fern();
            logger.log('end: rust verts compute <<<<');
        }
        // console.log('logger:', logger);

        const samples = logger.grep('end:').splits;
        // console.log('samples:', samples);

        let positions = vertsBuf.get_positions();
        let colors = vertsBuf.get_colors();
        console.log('positions/colors len:', positions.length, colors.length);

        if (numVerts === 3) { // debug
            console.log('positions:', positions); // Float32Array(9) [...]
            console.log('colors:', colors); // Uint8Array(12) [...]
            vertsBuf.test_hash();
        }

        // In this case, we have the single contiguous buffer allocated
        // as a Rust struct, so just dupe positions/colors instead and
        // send them as transferables.
        // console.log('positions.buffer:', positions.buffer); // ArrayBuffer(1179648)
        // console.log('colors.buffer:', colors.buffer); // ArrayBuffer(1179648)
        const posBuf = Float32Array.from(positions).buffer;
        const colorBuf = Uint8Array.from(colors).buffer;
        // console.log('posBuf, colorBuf:', posBuf, colorBuf);

        vertsBuf.free();

        return { posBuf, colorBuf, samples };
    }
    static testWasmMemBuffer(mod) {
        // https://github.com/rustwasm/wasm-bindgen/issues/1079
        // https://github.com/rustwasm/wasm-bindgen/issues/1643

        // let buffer = new WasmMemBuffer(100000, array => {
        let buffer = new mod.WasmMemBuffer(10, array => {
          // "array" wraps a piece of wasm memory. Fill it with some values.
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            console.log('array:', array);
            console.log('sum of array:', array.reduce((a, b) => a + b, 0));
        });
        console.log('buffer:', buffer);
        const hash = mod.compute_buffer_hash(buffer); // No buffer copy when passing this argument. Yay!
        buffer.free();
        console.log('hash:', hash);
    }
}
const _worker = new FernThreadWorker(self);
