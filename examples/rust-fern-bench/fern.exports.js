
const crateName = "fern";
const createBgExports = () => (() => {
const exports = {};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compute_buffer_hash = compute_buffer_hash;
exports.__wbindgen_memory = exports.__wbindgen_throw = exports.__wbindgen_debug_string = exports.__wbg_newwithbyteoffsetandlength_09420223e29d5cef = exports.__wbg_newwithbyteoffsetandlength_3e607c21646a8aef = exports.__wbg_buffer_aa8ebea80955a01a = exports.__wbg_call_9c879b23724d007e = exports.__widl_f_log_2_ = exports.__wbg_randomFillSync_840de8af65aeaced = exports.__wbg_getRandomValues_ede03c02c0e5985c = exports.__wbg_require_4602a8ea6f7f0a5e = exports.__wbg_getRandomValues_be0608e2b392e143 = exports.__wbindgen_is_undefined = exports.__wbg_crypto_b5ee0cb542848ef7 = exports.__wbg_self_0f27e3832f556b8e = exports.__wbindgen_jsval_eq = exports.__wbg_call_20c0763b477cbf4a = exports.__wbg_new_f7152ecede80cef7 = exports.__wbindgen_string_new = exports.__wbindgen_object_drop_ref = exports.WasmMemBuffer = exports.VertsBuffer = exports.wasm = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

//-------- begin es6 block
var isNodejs = typeof window === 'undefined' && typeof __non_webpack_require__ !== 'undefined'; // 'require' is not defined in case of WebWorker

if (isNodejs) {
  // console.log('global:', global);
  var util = __non_webpack_require__('util');

  global.TextEncoder = util.TextEncoder;
  global.TextDecoder = util.TextDecoder;
}

var wasm = {};
exports.wasm = wasm;
var heap = new Array(32);
heap.fill(undefined);
heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

var heap_next = heap.length;

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  var ret = getObject(idx);
  dropObject(idx);
  return ret;
}

var stack_pointer = 32;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error('out of js stack');
  heap[--stack_pointer] = obj;
  return stack_pointer;
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error("expected instance of ".concat(klass.name));
  }

  return instance.ptr;
}
/**
* @param {WasmMemBuffer} data
* @returns {number}
*/


function compute_buffer_hash(data) {
  _assertClass(data, WasmMemBuffer);

  var ret = wasm.compute_buffer_hash(data.ptr);
  return ret >>> 0;
}

var cachedTextDecoder = new TextDecoder('utf-8');
var cachegetUint8Memory = null;

function getUint8Memory() {
  if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
  }

  return cachegetUint8Memory;
}

function getStringFromWasm(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  var idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}

function getArrayU8FromWasm(ptr, len) {
  return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

function handleError(e) {
  wasm.__wbindgen_exn_store(addHeapObject(e));
}

var WASM_VECTOR_LEN = 0;
var cachedTextEncoder = new TextEncoder('utf-8');
var passStringToWasm;

if (typeof cachedTextEncoder.encodeInto === 'function') {
  passStringToWasm = function passStringToWasm(arg) {
    var size = arg.length;

    var ptr = wasm.__wbindgen_malloc(size);

    var offset = 0;
    {
      var mem = getUint8Memory();

      for (; offset < arg.length; offset++) {
        var code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
      }
    }

    if (offset !== arg.length) {
      arg = arg.slice(offset);
      ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + arg.length * 3);
      var view = getUint8Memory().subarray(ptr + offset, ptr + size);
      var ret = cachedTextEncoder.encodeInto(arg, view);
      offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  };
} else {
  passStringToWasm = function passStringToWasm(arg) {
    var size = arg.length;

    var ptr = wasm.__wbindgen_malloc(size);

    var offset = 0;
    {
      var mem = getUint8Memory();

      for (; offset < arg.length; offset++) {
        var code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
      }
    }

    if (offset !== arg.length) {
      var buf = cachedTextEncoder.encode(arg.slice(offset));
      ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + buf.length);
      getUint8Memory().set(buf, ptr + offset);
      offset += buf.length;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
  };
}

var cachegetInt32Memory = null;

function getInt32Memory() {
  if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
  }

  return cachegetInt32Memory;
}

function debugString(val) {
  // primitive types
  var type = _typeof(val);

  if (type == 'number' || type == 'boolean' || val == null) {
    return "".concat(val);
  }

  if (type == 'string') {
    return "\"".concat(val, "\"");
  }

  if (type == 'symbol') {
    var description = val.description;

    if (description == null) {
      return 'Symbol';
    } else {
      return "Symbol(".concat(description, ")");
    }
  }

  if (type == 'function') {
    var name = val.name;

    if (typeof name == 'string' && name.length > 0) {
      return "Function(".concat(name, ")");
    } else {
      return 'Function';
    }
  } // objects


  if (Array.isArray(val)) {
    var length = val.length;
    var debug = '[';

    if (length > 0) {
      debug += debugString(val[0]);
    }

    for (var i = 1; i < length; i++) {
      debug += ', ' + debugString(val[i]);
    }

    debug += ']';
    return debug;
  } // Test for built-in


  var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  var className;

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
  } // errors


  if (val instanceof Error) {
    return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
  } // TODO we could test for more things here, like `Set`s and `Map`s.


  return className;
}
/**
*/


var VertsBuffer =
/*#__PURE__*/
function () {
  _createClass(VertsBuffer, [{
    key: "free",
    value: function free() {
      var ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_vertsbuffer_free(ptr);
    }
    /**
    * @param {number} num_verts
    * @returns {VertsBuffer}
    */

  }], [{
    key: "__wrap",
    value: function __wrap(ptr) {
      var obj = Object.create(VertsBuffer.prototype);
      obj.ptr = ptr;
      return obj;
    }
  }]);

  function VertsBuffer(num_verts) {
    _classCallCheck(this, VertsBuffer);

    var ret = wasm.vertsbuffer_new(num_verts);
    return VertsBuffer.__wrap(ret);
  }
  /**
  */


  _createClass(VertsBuffer, [{
    key: "compute_one_triangle",
    value: function compute_one_triangle() {
      wasm.vertsbuffer_compute_one_triangle(this.ptr);
    }
    /**
    */

  }, {
    key: "compute_fern",
    value: function compute_fern() {
      wasm.vertsbuffer_compute_fern(this.ptr);
    }
    /**
    * @returns {any}
    */

  }, {
    key: "get_positions",
    value: function get_positions() {
      var ret = wasm.vertsbuffer_get_positions(this.ptr);
      return takeObject(ret);
    }
    /**
    * @returns {any}
    */

  }, {
    key: "get_colors",
    value: function get_colors() {
      var ret = wasm.vertsbuffer_get_colors(this.ptr);
      return takeObject(ret);
    }
    /**
    */

  }, {
    key: "test_hash",
    value: function test_hash() {
      wasm.vertsbuffer_test_hash(this.ptr);
    }
  }]);

  return VertsBuffer;
}();
/**
*/


exports.VertsBuffer = VertsBuffer;

var WasmMemBuffer =
/*#__PURE__*/
function () {
  _createClass(WasmMemBuffer, [{
    key: "free",
    value: function free() {
      var ptr = this.ptr;
      this.ptr = 0;

      wasm.__wbg_wasmmembuffer_free(ptr);
    }
    /**
    * @param {number} byte_length
    * @param {any} f
    * @returns {WasmMemBuffer}
    */

  }], [{
    key: "__wrap",
    value: function __wrap(ptr) {
      var obj = Object.create(WasmMemBuffer.prototype);
      obj.ptr = ptr;
      return obj;
    }
  }]);

  function WasmMemBuffer(byte_length, f) {
    _classCallCheck(this, WasmMemBuffer);

    try {
      var ret = wasm.wasmmembuffer_new(byte_length, addBorrowedObject(f));
      return WasmMemBuffer.__wrap(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  return WasmMemBuffer;
}();

exports.WasmMemBuffer = WasmMemBuffer;

var __wbindgen_object_drop_ref = function __wbindgen_object_drop_ref(arg0) {
  takeObject(arg0);
};

exports.__wbindgen_object_drop_ref = __wbindgen_object_drop_ref;

var __wbindgen_string_new = function __wbindgen_string_new(arg0, arg1) {
  var ret = getStringFromWasm(arg0, arg1);
  return addHeapObject(ret);
};

exports.__wbindgen_string_new = __wbindgen_string_new;

var __wbg_new_f7152ecede80cef7 = function __wbg_new_f7152ecede80cef7(arg0, arg1) {
  var ret = new Function(getStringFromWasm(arg0, arg1));
  return addHeapObject(ret);
};

exports.__wbg_new_f7152ecede80cef7 = __wbg_new_f7152ecede80cef7;

var __wbg_call_20c0763b477cbf4a = function __wbg_call_20c0763b477cbf4a(arg0, arg1) {
  var ret = getObject(arg0).call(getObject(arg1));
  return addHeapObject(ret);
};

exports.__wbg_call_20c0763b477cbf4a = __wbg_call_20c0763b477cbf4a;

var __wbindgen_jsval_eq = function __wbindgen_jsval_eq(arg0, arg1) {
  var ret = getObject(arg0) === getObject(arg1);
  return ret;
};

exports.__wbindgen_jsval_eq = __wbindgen_jsval_eq;

var __wbg_self_0f27e3832f556b8e = function __wbg_self_0f27e3832f556b8e(arg0) {
  var ret = getObject(arg0).self;
  return addHeapObject(ret);
};

exports.__wbg_self_0f27e3832f556b8e = __wbg_self_0f27e3832f556b8e;

var __wbg_crypto_b5ee0cb542848ef7 = function __wbg_crypto_b5ee0cb542848ef7(arg0) {
  var ret = getObject(arg0).crypto;
  return addHeapObject(ret);
};

exports.__wbg_crypto_b5ee0cb542848ef7 = __wbg_crypto_b5ee0cb542848ef7;

var __wbindgen_is_undefined = function __wbindgen_is_undefined(arg0) {
  var ret = getObject(arg0) === undefined;
  return ret;
};

exports.__wbindgen_is_undefined = __wbindgen_is_undefined;

var __wbg_getRandomValues_be0608e2b392e143 = function __wbg_getRandomValues_be0608e2b392e143(arg0) {
  var ret = getObject(arg0).getRandomValues;
  return addHeapObject(ret);
};

exports.__wbg_getRandomValues_be0608e2b392e143 = __wbg_getRandomValues_be0608e2b392e143;

var __wbg_require_4602a8ea6f7f0a5e = function __wbg_require_4602a8ea6f7f0a5e(arg0, arg1) {
  var ret = require(getStringFromWasm(arg0, arg1));

  return addHeapObject(ret);
};

exports.__wbg_require_4602a8ea6f7f0a5e = __wbg_require_4602a8ea6f7f0a5e;

var __wbg_getRandomValues_ede03c02c0e5985c = function __wbg_getRandomValues_ede03c02c0e5985c(arg0, arg1, arg2) {
  getObject(arg0).getRandomValues(getArrayU8FromWasm(arg1, arg2));
};

exports.__wbg_getRandomValues_ede03c02c0e5985c = __wbg_getRandomValues_ede03c02c0e5985c;

var __wbg_randomFillSync_840de8af65aeaced = function __wbg_randomFillSync_840de8af65aeaced(arg0, arg1, arg2) {
  getObject(arg0).randomFillSync(getArrayU8FromWasm(arg1, arg2));
};

exports.__wbg_randomFillSync_840de8af65aeaced = __wbg_randomFillSync_840de8af65aeaced;

var __widl_f_log_2_ = function __widl_f_log_2_(arg0, arg1) {
  console.log(getObject(arg0), getObject(arg1));
};

exports.__widl_f_log_2_ = __widl_f_log_2_;

var __wbg_call_9c879b23724d007e = function __wbg_call_9c879b23724d007e(arg0, arg1, arg2) {
  try {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  } catch (e) {
    handleError(e);
  }
};

exports.__wbg_call_9c879b23724d007e = __wbg_call_9c879b23724d007e;

var __wbg_buffer_aa8ebea80955a01a = function __wbg_buffer_aa8ebea80955a01a(arg0) {
  var ret = getObject(arg0).buffer;
  return addHeapObject(ret);
};

exports.__wbg_buffer_aa8ebea80955a01a = __wbg_buffer_aa8ebea80955a01a;

var __wbg_newwithbyteoffsetandlength_3e607c21646a8aef = function __wbg_newwithbyteoffsetandlength_3e607c21646a8aef(arg0, arg1, arg2) {
  var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
};

exports.__wbg_newwithbyteoffsetandlength_3e607c21646a8aef = __wbg_newwithbyteoffsetandlength_3e607c21646a8aef;

var __wbg_newwithbyteoffsetandlength_09420223e29d5cef = function __wbg_newwithbyteoffsetandlength_09420223e29d5cef(arg0, arg1, arg2) {
  var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
};

exports.__wbg_newwithbyteoffsetandlength_09420223e29d5cef = __wbg_newwithbyteoffsetandlength_09420223e29d5cef;

var __wbindgen_debug_string = function __wbindgen_debug_string(arg0, arg1) {
  var ret = debugString(getObject(arg1));
  var ret0 = passStringToWasm(ret);
  var ret1 = WASM_VECTOR_LEN;
  getInt32Memory()[arg0 / 4 + 0] = ret0;
  getInt32Memory()[arg0 / 4 + 1] = ret1;
};

exports.__wbindgen_debug_string = __wbindgen_debug_string;

var __wbindgen_throw = function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm(arg0, arg1));
};

exports.__wbindgen_throw = __wbindgen_throw;

var __wbindgen_memory = function __wbindgen_memory() {
  var ret = wasm.memory;
  return addHeapObject(ret);
}; //-------- end es6 block


exports.__wbindgen_memory = __wbindgen_memory;
return exports; })();
// export { crateName, createBgExports };
