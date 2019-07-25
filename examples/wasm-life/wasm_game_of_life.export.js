export const wasm = {_timestamp: performance.now()}; // to be populated by loadWasmBindgen()

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

let passStringToWasm;
if (typeof cachedTextEncoder.encodeInto === 'function') {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            arg = arg.slice(offset);
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + arg.length * 3);
            const view = getUint8Memory().subarray(ptr + offset, ptr + size);
            const ret = cachedTextEncoder.encodeInto(arg, view);

            offset += ret.written;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
} else {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            const buf = cachedTextEncoder.encode(arg.slice(offset));
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + buf.length);
            getUint8Memory().set(buf, ptr + offset);
            offset += buf.length;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
}
/**
* @param {string} name
*/
export function greet(name) {
    wasm.greet(passStringToWasm(name), WASM_VECTOR_LEN);
}

let cachedTextDecoder = new TextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}
/**
*/
export const Cell = Object.freeze({ Dead:0,Alive:1, });
/**
*/
export class Universe {

    static __wrap(ptr) {
        const obj = Object.create(Universe.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;

        wasm.__wbg_universe_free(ptr);
    }
    /**
    * @param {string} name
    */
    static greet(name) {
        wasm.universe_greet(passStringToWasm(name), WASM_VECTOR_LEN);
    }
    /**
    */
    tick() {
        wasm.universe_tick(this.ptr);
    }
    /**
    * @returns {Universe}
    */
    static new() {
        const ret = wasm.universe_new();
        return Universe.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    cells() {
        const ret = wasm.universe_cells(this.ptr);
        return ret;
    }
    /**
    */
    dump_cells() {
        wasm.universe_dump_cells(this.ptr);
    }
    /**
    * @returns {number}
    */
    delta_alive_ptr() {
        const ret = wasm.universe_delta_alive_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    delta_alive_size() {
        const ret = wasm.universe_delta_alive_size(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    delta_dead_ptr() {
        const ret = wasm.universe_delta_dead_ptr(this.ptr);
        return ret;
    }
    /**
    * @returns {number}
    */
    delta_dead_size() {
        const ret = wasm.universe_delta_dead_size(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    width() {
        const ret = wasm.universe_width(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    height() {
        const ret = wasm.universe_height(this.ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} width
    */
    set_width(width) {
        wasm.universe_set_width(this.ptr, width);
    }
    /**
    * @param {number} height
    */
    set_height(height) {
        wasm.universe_set_height(this.ptr, height);
    }
    /**
    * @param {number} row
    * @param {number} column
    */
    toggle_cell(row, column) {
        wasm.universe_toggle_cell(this.ptr, row, column);
    }
}

export const __wbg_alert_fbbeabc2309f67cb = function(arg0, arg1) {
    alert(getStringFromWasm(arg0, arg1));
};

export const __wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm(arg0, arg1);
    return addHeapObject(ret);
};

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __wbg_new_59cb74e423758ede = function() {
    const ret = new Error();
    return addHeapObject(ret);
};

export const __wbg_stack_558ba5917b466edd = function(arg0, arg1) {
    const ret = getObject(arg1).stack;
    const ret0 = passStringToWasm(ret);
    const ret1 = WASM_VECTOR_LEN;
    getInt32Memory()[arg0 / 4 + 0] = ret0;
    getInt32Memory()[arg0 / 4 + 1] = ret1;
};

export const __wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
    const v0 = getStringFromWasm(arg0, arg1).slice();
    wasm.__wbindgen_free(arg0, arg1 * 1);
    console.error(v0);
};

export const __widl_f_log_2_ = function(arg0, arg1) {
    console.log(getObject(arg0), getObject(arg1));
};

export const __wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm(arg0, arg1));
};

