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
* @param {string} id
* @returns {void}
*/
export function draw(id) {
    const ptr0 = passStringToWasm(id);
    const len0 = WASM_VECTOR_LEN;
    return wasm.draw(ptr0, len0);
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

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

let cachedTextDecoder = new TextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

export const __wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
};

export const __widl_instanceof_Window = function(arg0) {
    return getObject(arg0) instanceof Window;
};

export const __widl_instanceof_CanvasRenderingContext2D = function(arg0) {
    return getObject(arg0) instanceof CanvasRenderingContext2D;
};

export const __widl_f_begin_path_CanvasRenderingContext2D = function(arg0) {
    getObject(arg0).beginPath();
};

export const __widl_f_stroke_CanvasRenderingContext2D = function(arg0) {
    getObject(arg0).stroke();
};

export const __widl_f_arc_CanvasRenderingContext2D = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    try {
        getObject(arg0).arc(arg1, arg2, arg3, arg4, arg5);
    } catch (e) {
        handleError(e);
    }
};

export const __widl_f_move_to_CanvasRenderingContext2D = function(arg0, arg1, arg2) {
    getObject(arg0).moveTo(arg1, arg2);
};

export const __widl_f_get_element_by_id_Document = function(arg0, arg1, arg2) {
    let varg1 = getStringFromWasm(arg1, arg2);

    const val = getObject(arg0).getElementById(varg1);
    return isLikeNone(val) ? 0 : addHeapObject(val);

};

export const __widl_instanceof_HTMLCanvasElement = function(arg0) {
    return getObject(arg0) instanceof HTMLCanvasElement;
};

export const __widl_f_get_context_HTMLCanvasElement = function(arg0, arg1, arg2) {
    let varg1 = getStringFromWasm(arg1, arg2);
    try {

        const val = getObject(arg0).getContext(varg1);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    } catch (e) {
        handleError(e);
    }
};

export const __widl_f_document_Window = function(arg0) {

    const val = getObject(arg0).document;
    return isLikeNone(val) ? 0 : addHeapObject(val);

};

export const __wbg_call_836fa928f74337e5 = function(arg0, arg1) {
    try {
        return addHeapObject(getObject(arg0).call(getObject(arg1)));
    } catch (e) {
        handleError(e);
    }
};

export const __wbindgen_object_clone_ref = function(arg0) {
    return addHeapObject(getObject(arg0));
};

export const __wbg_newnoargs_8d1797b163dbc9fb = function(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    return addHeapObject(new Function(varg0));
};

export const __wbg_globalThis_9ddb3fffb60b1a36 = function() {
    try {
        return addHeapObject(globalThis.globalThis);
    } catch (e) {
        handleError(e);
    }
};

export const __wbg_self_0575d7e8e3453fe9 = function() {
    try {
        return addHeapObject(self.self);
    } catch (e) {
        handleError(e);
    }
};

export const __wbg_window_b43c0cab39940cfc = function() {
    try {
        return addHeapObject(window.window);
    } catch (e) {
        handleError(e);
    }
};

export const __wbg_global_cc4dfb2588e840fb = function() {
    try {
        return addHeapObject(global.global);
    } catch (e) {
        handleError(e);
    }
};

export const __wbindgen_is_undefined = function(arg0) {
    return getObject(arg0) === undefined;
};

export const __wbindgen_debug_string = function(ret, arg0) {

    const retptr = passStringToWasm(debugString(getObject(arg0)));
    const retlen = WASM_VECTOR_LEN;
    const mem = getUint32Memory();
    mem[ret / 4] = retptr;
    mem[ret / 4 + 1] = retlen;

};

export const __wbindgen_throw = function(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    throw new Error(varg0);
};

