export const wasm = {_timestamp: performance.now()}; // to be populated by loadWasmBindgen()

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let stack_pointer = 32;

function addBorrowedObject(obj) {
    if (stack_pointer == 1) throw new Error('out of js stack');
    heap[--stack_pointer] = obj;
    return stack_pointer;
}
/**
* @param {any} ctx
* @param {number} width
* @param {number} height
* @param {number} scale
* @param {number} real
* @param {number} imaginary
* @returns {void}
*/
export function draw(ctx, width, height, scale, real, imaginary) {
    try {
        return wasm.draw(addBorrowedObject(ctx), width, height, scale, real, imaginary);

    } finally {
        heap[stack_pointer++] = undefined;

    }

}

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

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

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function handleError(e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
}

let cachegetUint8ClampedMemory = null;
function getUint8ClampedMemory() {
    if (cachegetUint8ClampedMemory === null || cachegetUint8ClampedMemory.buffer !== wasm.memory.buffer) {
        cachegetUint8ClampedMemory = new Uint8ClampedArray(wasm.memory.buffer);
    }
    return cachegetUint8ClampedMemory;
}

function getClampedArrayU8FromWasm(ptr, len) {
    return getUint8ClampedMemory().subarray(ptr / 1, ptr / 1 + len);
}

let cachedTextDecoder = new TextDecoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __widl_f_put_image_data_CanvasRenderingContext2D = function(arg0, arg1, arg2, arg3) {
    try {
        getObject(arg0).putImageData(getObject(arg1), arg2, arg3);
    } catch (e) {
        handleError(e);
    }
};

export const __widl_f_new_with_u8_clamped_array_and_sh_ImageData = function(arg0, arg1, arg2, arg3) {
    let varg0 = getClampedArrayU8FromWasm(arg0, arg1);
    try {
        return addHeapObject(new ImageData(varg0, arg2 >>> 0, arg3 >>> 0));
    } catch (e) {
        handleError(e);
    }
};

export const __wbindgen_throw = function(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    throw new Error(varg0);
};

export const __wbindgen_rethrow = function(arg0) {
    throw takeObject(arg0);
};

