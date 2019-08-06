extern crate wasm_bindgen;
extern crate web_sys;
extern crate js_sys;
extern crate rand;

//use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::{console};
//use js_sys::{Function, Object, Reflect, Uint8Array, WebAssembly};
use rand::Rng;

#[wasm_bindgen]
pub struct VertsBuffer {
    num_verts: u32,
    positions: Vec<f32>,
    colors: Vec<u8>,
}

#[wasm_bindgen]
impl VertsBuffer {
    #[wasm_bindgen(constructor)]
    pub fn new(num_verts: u32) -> Self {
        if num_verts % 3 != 0 {
            console::log_2(&"will panic:".into(), &"num_verts % 3 != 0 (non-trianglular vertices??)".into());
            panic!();
        }

        // let positions: Vec<f32> = Vec::with_capacity((num_verts * 3) as usize);
        // let colors: Vec<u8> = Vec::with_capacity((num_verts * 4) as usize);
        //---- slower due to filling 0's
        let positions: Vec<f32> = vec![0.0; (num_verts * 3) as usize];
        let colors: Vec<u8> = vec![0; (num_verts * 4) as usize];

        Self {
            num_verts,
            positions,
            colors,
        }
    }
    pub fn compute_one_triangle(&mut self) {
        let positions = &mut self.positions;
        let colors = &mut self.colors;

        // 1 vertex: 4b*3 + 1b*4 = 16 byte
        let pp = [0.0,0.0,0.0,  0.5,0.0,0.0,  0.0,0.5,0.0];
        let cc = [255,0,0,100,  0,255,0,100,  0,0,255,100];

        // positions = pp.to_vec(); // debug
        // colors = cc.to_vec(); // debug
        //----
        pp.iter().for_each(|&q| positions.push(q));
        cc.iter().for_each(|&q| colors.push(q));
        console::log_2(&"positions:".into(), &format!("{:?}", positions).into());
    }
    pub fn compute_fern(&mut self) {
        let positions = &mut self.positions;
        let colors = &mut self.colors;
        let num_verts = self.num_verts;
        // console::log_2(&"num_verts:".into(), &format!("{:?}", num_verts).into());

        let tri_width = 0.02;
        let z_variation = 0.01;
        let base_colors = [255,0,0,100,  255,0,0,100,  255,0,0,100];

        let f1 = [0.0, 0.0, 0.0, 0.16, 0.0, 0.0, 0.01]; // Stem
        let f2 = [0.85, 0.04, -0.04, 0.85, 0.0, 1.60, 0.85]; // Successively smaller leaflets
        let f3 = [0.20, -0.26, 0.23, 0.22, 0.0, 1.60, 0.07]; // Largest left-hand leaflet
        let f4 = [-0.15, 0.28, 0.26, 0.24, 0.0, 0.44, 0.07]; // Largest right-hand leaflet
        let prob_acc_1 = f1[6];
        let prob_acc_2 = f1[6] + f2[6];
        let prob_acc_3 = f1[6] + f2[6] + f3[6];

        let mut x = 0.0;
        let mut y = 0.0;
        let max_iter = num_verts / 3; // triangles assumed
        for idx in 0..max_iter {
            // let prob = 0.5;
            let prob = rand::thread_rng().gen_range(0.0, 1.0);
            let z = z_variation * prob;

            let offset = (9 * idx) as usize;
            //-- this seems slow due to clone()
            // https://stackoverflow.com/questions/28678615/efficiently-insert-or-replace-multiple-elements-in-the-middle-or-at-the-beginnin
            // let slice = &[x,y,z,  x+tri_width,y,z,  x,y+tri_width,z];
            // positions.splice(offset..offset+9, slice.iter().cloned());
            //-- be straightforward
            positions[offset] = x;
            positions[offset+1] = y;
            positions[offset+2] = z;
            positions[offset+3] = x + tri_width;
            positions[offset+4] = y;
            positions[offset+5] = z;
            positions[offset+6] = x;
            positions[offset+7] = y + tri_width;
            positions[offset+8] = z;

            let offset = (12 * idx) as usize;
            //-- this seems slow due to clone()
            // colors.splice(offset..offset+12, (&base_colors).iter().cloned());
            //-- be straightforward
            (0..12).for_each(|i| colors[offset+i] = base_colors[i]);

            //==== in case positions/colors allocated by Vec::with_capacity()
            // positions.extend_from_slice(&[x,y,z,  x+tri_width,y,z,  x,y+tri_width,z]);
            // colors.extend_from_slice(&base_color);
            // colors.extend_from_slice(&base_color);
            // colors.extend_from_slice(&base_color);

            let cs = match prob {
                prob if prob < prob_acc_1 => f1,
                prob if prob < prob_acc_2 => f2,
                prob if prob < prob_acc_3 => f3,
                _ => f4,
            };
            let _x = cs[0] * x + cs[1] * y + cs[4];
            let _y = cs[2] * x + cs[3] * y + cs[5];
            x = _x;
            y = _y;
        }
    }
    pub fn get_positions(&self) -> wasm_bindgen::JsValue {
        unsafe {
            JsValue::from(js_sys::Float32Array::view(&self.positions))
        }
    }
    pub fn get_colors(&self) -> wasm_bindgen::JsValue {
        unsafe {
            JsValue::from(js_sys::Uint8Array::view(&self.colors))
        }
    }
    pub fn test_hash(&self) {
        let sum_positions = self.positions.iter().map(|&q| q as f64).sum::<f64>();
        let sum_colors = self.colors.iter().map(|&q| q as u32).sum::<u32>();
        console::log_2(&"hash:".into(), &format!("{} {}", sum_positions, sum_colors).into());
    }
}


//======== ======== the wasm memory 'view' pattern
// https://github.com/rustwasm/wasm-bindgen/issues/1079
// https://github.com/rustwasm/wasm-bindgen/issues/1643

// ok: tested with Demo.testWasmMemBuffer(mod)
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
