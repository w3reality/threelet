extern crate wasm_bindgen;
extern crate web_sys;
extern crate js_sys;

//use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::{console};
//use js_sys::{Function, Object, Reflect, Uint8Array, WebAssembly};

#[wasm_bindgen]
pub struct VertsBuffer {
    positions: Vec<f32>,
    colors: Vec<u8>,
}

#[wasm_bindgen]
impl VertsBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new(verts_length: u32, f: &js_sys::Function) -> Self {
        let mut positions: Vec<f32> = Vec::with_capacity((verts_length * 3) as usize);
        let mut colors: Vec<u8> = Vec::with_capacity((verts_length * 4) as usize);

        if verts_length == 3 { // testing a single triangle
            let pp = [0.0,0.0,0.0,  0.5,0.0,0.0,  0.0,0.5,0.0];
            let cc = [255,0,0,255,  0,255,0,255,  0,0,255,255];

            // positions = pp.to_vec();
            // colors = cc.to_vec();
            //----
            pp.iter().for_each(|&q| positions.push(q));
            cc.iter().for_each(|&q| colors.push(q));
        } else {
            // TODO calc fern and fill positions/colors
            //...
        }

        unsafe {
            let positions_js = js_sys::Float32Array::view(&mut positions);
            let colors_js = js_sys::Uint8Array::view(&mut colors);
            f.call2(&JsValue::NULL,
                &JsValue::from(positions_js), &JsValue::from(colors_js))
                .expect("no throw");
        }
        Self { positions, colors }
    }
    pub fn hash(&self) {
        let sum_positions = self.positions.iter().map(|&q| q as f64).sum::<f64>();
        let sum_colors = self.colors.iter().map(|&q| q as u32).sum::<u32>();
        console::log_2(&"hash:".into(), &format!("{} {}", sum_positions, sum_colors).into());
    }
}


//======== ======== to be used with Demo.testWasmMemBuffer(mod)
// https://github.com/rustwasm/wasm-bindgen/issues/1079
// https://github.com/rustwasm/wasm-bindgen/issues/1643
#[wasm_bindgen]
pub struct WasmMemBuffer {
    buffer: Vec<u8>,
}

#[wasm_bindgen]
impl WasmMemBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new(byte_length: u32, f: &js_sys::Function) -> Self {
        let mut buffer = vec![0; byte_length as usize];
        unsafe {
            let array = js_sys::Uint8Array::view(&mut buffer);
            f.call1(&JsValue::NULL, &JsValue::from(array))
                .expect("The callback function should not throw");
        }
        Self { buffer }
    }
}

fn compute_buffer_hash_impl(data: &[u8]) -> u32 {
    console::log_2(&"data:".into(), &format!("{:?}", data).into());
    data.iter().map(|&ele| ele as u32).sum::<u32>()
}

#[wasm_bindgen]
pub fn compute_buffer_hash(data: &WasmMemBuffer) -> u32 {
    compute_buffer_hash_impl(&data.buffer)
}
//======== ========
