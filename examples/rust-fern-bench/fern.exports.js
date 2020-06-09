
const crateName = "fern";

const createBgExports = () => (() => {
const exports = {};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compute_buffer_hash = compute_buffer_hash;
exports.__wbindgen_memory = exports.__wbindgen_throw = exports.__wbindgen_debug_string = exports.__wbg_newwithbyteoffsetandlength_7ccfa06426575282 = exports.__wbg_newwithbyteoffsetandlength_284676320876299d = exports.__wbg_buffer_f897a8d316863411 = exports.__wbg_call_1ad0eb4a7ab279eb = exports.__wbg_log_37d28746c6186550 = exports.__wbg_randomFillSync_d5bd2d655fdf256a = exports.__wbg_getRandomValues_f5e14ab7ac8e995d = exports.__wbg_getRandomValues_a3d34b4fee3c2869 = exports.__wbindgen_is_undefined = exports.__wbg_crypto_968f1772287e2df0 = exports.__wbg_require_604837428532a733 = exports.__wbg_self_1b7a39e3a92c949c = exports.__wbindgen_string_new = exports.__wbindgen_object_drop_ref = exports.WasmMemBuffer = exports.VertsBuffer = exports.wasm = void 0;

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
var heap = new Array(32).fill(undefined);
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

var lTextDecoder = typeof TextDecoder === 'undefined' ? require('util').TextDecoder : TextDecoder;
var cachedTextDecoder = new lTextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
});
cachedTextDecoder.decode();
var cachegetUint8Memory0 = null;

function getUint8Memory0() {
  if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }

  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  var idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
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

var WASM_VECTOR_LEN = 0;
var lTextEncoder = typeof TextEncoder === 'undefined' ? require('util').TextEncoder : TextEncoder;
var cachedTextEncoder = new lTextEncoder('utf-8');
var encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function (arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function (arg, view) {
  var buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    var buf = cachedTextEncoder.encode(arg);

    var _ptr = malloc(buf.length);

    getUint8Memory0().subarray(_ptr, _ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return _ptr;
  }

  var len = arg.length;
  var ptr = malloc(len);
  var mem = getUint8Memory0();
  var offset = 0;

  for (; offset < len; offset++) {
    var code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }

    ptr = realloc(ptr, len, len = offset + arg.length * 3);
    var view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    var ret = encodeString(arg, view);
    offset += ret.written;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

var cachegetInt32Memory0 = null;

function getInt32Memory0() {
  if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }

  return cachegetInt32Memory0;
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

function handleError(e) {
  wasm.__wbindgen_exn_store(addHeapObject(e));
}

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
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
    * @param {Function} f
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
  var ret = getStringFromWasm0(arg0, arg1);
  return addHeapObject(ret);
};

exports.__wbindgen_string_new = __wbindgen_string_new;

var __wbg_self_1b7a39e3a92c949c = function __wbg_self_1b7a39e3a92c949c() {
  try {
    var ret = self.self;
    return addHeapObject(ret);
  } catch (e) {
    handleError(e);
  }
};

exports.__wbg_self_1b7a39e3a92c949c = __wbg_self_1b7a39e3a92c949c;

var __wbg_require_604837428532a733 = function __wbg_require_604837428532a733(arg0, arg1) {
  var ret = require(getStringFromWasm0(arg0, arg1));

  return addHeapObject(ret);
};

exports.__wbg_require_604837428532a733 = __wbg_require_604837428532a733;

var __wbg_crypto_968f1772287e2df0 = function __wbg_crypto_968f1772287e2df0(arg0) {
  var ret = getObject(arg0).crypto;
  return addHeapObject(ret);
};

exports.__wbg_crypto_968f1772287e2df0 = __wbg_crypto_968f1772287e2df0;

var __wbindgen_is_undefined = function __wbindgen_is_undefined(arg0) {
  var ret = getObject(arg0) === undefined;
  return ret;
};

exports.__wbindgen_is_undefined = __wbindgen_is_undefined;

var __wbg_getRandomValues_a3d34b4fee3c2869 = function __wbg_getRandomValues_a3d34b4fee3c2869(arg0) {
  var ret = getObject(arg0).getRandomValues;
  return addHeapObject(ret);
};

exports.__wbg_getRandomValues_a3d34b4fee3c2869 = __wbg_getRandomValues_a3d34b4fee3c2869;

var __wbg_getRandomValues_f5e14ab7ac8e995d = function __wbg_getRandomValues_f5e14ab7ac8e995d(arg0, arg1, arg2) {
  getObject(arg0).getRandomValues(getArrayU8FromWasm0(arg1, arg2));
};

exports.__wbg_getRandomValues_f5e14ab7ac8e995d = __wbg_getRandomValues_f5e14ab7ac8e995d;

var __wbg_randomFillSync_d5bd2d655fdf256a = function __wbg_randomFillSync_d5bd2d655fdf256a(arg0, arg1, arg2) {
  getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
};

exports.__wbg_randomFillSync_d5bd2d655fdf256a = __wbg_randomFillSync_d5bd2d655fdf256a;

var __wbg_log_37d28746c6186550 = function __wbg_log_37d28746c6186550(arg0, arg1) {
  console.log(getObject(arg0), getObject(arg1));
};

exports.__wbg_log_37d28746c6186550 = __wbg_log_37d28746c6186550;

var __wbg_call_1ad0eb4a7ab279eb = function __wbg_call_1ad0eb4a7ab279eb(arg0, arg1, arg2) {
  try {
    var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
  } catch (e) {
    handleError(e);
  }
};

exports.__wbg_call_1ad0eb4a7ab279eb = __wbg_call_1ad0eb4a7ab279eb;

var __wbg_buffer_f897a8d316863411 = function __wbg_buffer_f897a8d316863411(arg0) {
  var ret = getObject(arg0).buffer;
  return addHeapObject(ret);
};

exports.__wbg_buffer_f897a8d316863411 = __wbg_buffer_f897a8d316863411;

var __wbg_newwithbyteoffsetandlength_284676320876299d = function __wbg_newwithbyteoffsetandlength_284676320876299d(arg0, arg1, arg2) {
  var ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
};

exports.__wbg_newwithbyteoffsetandlength_284676320876299d = __wbg_newwithbyteoffsetandlength_284676320876299d;

var __wbg_newwithbyteoffsetandlength_7ccfa06426575282 = function __wbg_newwithbyteoffsetandlength_7ccfa06426575282(arg0, arg1, arg2) {
  var ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
  return addHeapObject(ret);
};

exports.__wbg_newwithbyteoffsetandlength_7ccfa06426575282 = __wbg_newwithbyteoffsetandlength_7ccfa06426575282;

var __wbindgen_debug_string = function __wbindgen_debug_string(arg0, arg1) {
  var ret = debugString(getObject(arg1));
  var ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  getInt32Memory0()[arg0 / 4 + 1] = len0;
  getInt32Memory0()[arg0 / 4 + 0] = ptr0;
};

exports.__wbindgen_debug_string = __wbindgen_debug_string;

var __wbindgen_throw = function __wbindgen_throw(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
};

exports.__wbindgen_throw = __wbindgen_throw;

var __wbindgen_memory = function __wbindgen_memory() {
  var ret = wasm.memory;
  return addHeapObject(ret);
}; //-------- end es6 block


exports.__wbindgen_memory = __wbindgen_memory;
return exports; })();

// export { crateName, createBgExports };
