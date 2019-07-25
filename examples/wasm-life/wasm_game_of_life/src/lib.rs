extern crate cfg_if;
extern crate wasm_bindgen;
extern crate web_sys;

mod utils;

use std::fmt;
use wasm_bindgen::prelude::*;
use web_sys::console;

// use std::collections::HashMap;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    // NG; mod = await loadWasmBindgen(); and call by mod.wasm.greet('hoge');
    // OK; mod = await loadWasmBindgen(); and call by mod.greet('hoge');
    alert(&format!("Hello, {}!", name));
    console::log_2(&"name:".into(), &name.into());
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exploration() {
    }

    fn greet2(name: &str) -> String {
        format!("{}", name)
    }

    #[test]
    fn another() {
        //panic!("Make this test fail");
        // assert!(1 == 0);
        // let _x: () = &greet2("aa"); // found type `&std::string::String`
        // let _x: () = "aa"; // found type `&'static str`
        // let _x: &str = "aa"; // ok
        assert_eq!(&greet2("aa"), "aa");
    }
}
//==================================

pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        console::time_with_label(name);
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        console::time_end_with_label(self.name);
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
    // indices: Vec<usize>, // j: optimize get_index()
    // indices: HashMap<(u32, u32), usize>, // j: optimize get_index(); slowwwwwwww
    // indices: HashMap<String, usize>, // j: optimize get_index(); super slowwwwwwww
    scores: Vec<u8>,
    delta_alive: Vec<u32>,
    delta_dead: Vec<u32>,
    devmode: bool,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        //==== orig
        (row * self.width + column) as usize
        //==== play; slowwwwwww lol
        // if let Some(idx) = self.indices.get(&(row, column)) {
        // if let Some(idx) = self.indices.get(&format!("{}-{}", row, column)) {
        //     *idx
        // } else {
        //     panic!("invalid access: {} {}", row, column);
        // }
    }

    /// Get the dead and alive values of the entire universe.
    pub fn get_cells(&self) -> &[Cell] {
        &self.cells
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        //==== orig
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
        //==== works; what's the practical implication??)
        // for (row, col) in cells.iter() {
        //     let idx = self.get_index(*row, *col);
        //==== works; what's the practical implication??)
        // for &(row, col) in cells.iter() {
        //     let idx = self.get_index(row, col);
        //====
            self.cells[idx] = Cell::Alive;
        }
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        if 1 == 1 {
            // orig
            self.live_neighbor_count_faster(row, column)
        } else {
            self.live_neighbor_count_slower(row, column)
        }
    }

    // https://rustwasm.github.io/docs/book/game-of-life/implementing.html
    // ~ 25 fps
    fn live_neighbor_count_slower(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;

        //==== orig
        // for delta_row in [self.height - 1, 0, 1].iter().cloned() { // delta_row becomes owned u32
        //     for delta_col in [self.width - 1, 0, 1].iter().cloned() {
        //==== works; ~ 30 fps
        for &delta_row in [self.height - 1, 0, 1].iter() { // delta_row becomes owned u32
            for &delta_col in [self.width - 1, 0, 1].iter() {
        //====
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                // let _xx: () = self.cells[idx]; // expected (), found enum `Cell`
                // count += self.cells[idx]; // no implementation for `{integer} += Cell`
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    // orig; ~ 45 fps
    fn live_neighbor_count_faster(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;

        let north = if row == 0 { self.height - 1 } else { row - 1 };
        let south = if row == self.height - 1 { 0 } else { row + 1 };
        let west = if column == 0 { self.width - 1 } else { column - 1 };
        let east = if column == self.width - 1 { 0 } else { column + 1 };

        count += self.cells[self.get_index(north, west)] as u8;
        count += self.cells[self.get_index(north, column)] as u8;
        count += self.cells[self.get_index(north, east)] as u8;
        count += self.cells[self.get_index(row, west)] as u8;
        count += self.cells[self.get_index(row, east)] as u8;
        count += self.cells[self.get_index(south, west)] as u8;
        count += self.cells[self.get_index(south, column)] as u8;
        count += self.cells[self.get_index(south, east)] as u8;

        count
    }
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    pub fn greet(name: &str) {
        alert(&format!("Universe::greet(): Hello, {}!", name)); // OK; name shown
    }

    fn _dump_vec<T>(vec: &Vec<T>, width: u32) -> String
        where T: std::string::ToString
    {
        // https://users.rust-lang.org/t/what-is-right-ways-to-concat-strings/3780/3

        // let mut dump = String::new();
        // for (i, ele) in vec.iter().enumerate() {
        //     if (i as u32) % width == 0 {
        //         dump.push_str("\n");
        //     }
        //     dump.push_str(&ele.to_string());
        // }
        //========
        // following universe.fmt()
        let mut dump = String::from("\n");
        for line in vec.as_slice().chunks(width as usize) {
            for ele in line {
                dump.push_str(&ele.to_string());
            }
            dump.push_str("\n");
        }

        dump
    }


    // TODO draw canvas via wasm -- https://github.com/rustwasm/wasm-bindgen/tree/master/examples/canvas
    // TODO fix infinite glider
    pub fn tick(&mut self) {
        // let _timer = Timer::new("Universe::tick");

        if true { // optimized version supporting delta
            // self.dump_cells();

            //---- calc scores
            for row in 0..self.height {
                for col in 0..self.width {
                    let idx = self.get_index(row, col);

                    let north = if row == 0 { self.height - 1 } else { row - 1 };
                    let south = if row == self.height - 1 { 0 } else { row + 1 };
                    let west = if col == 0 { self.width - 1 } else { col - 1 };
                    let east = if col == self.width - 1 { 0 } else { col + 1 };

                    //======== slower
                    // self.scores[idx] += self.cells[self.get_index(north, west)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(north, col)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(north, east)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(row, west)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(row, east)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(south, west)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(south, col)] as u8;
                    // self.scores[idx] += self.cells[self.get_index(south, east)] as u8;
                    //======== faster
                    if self.cells[idx] == Cell::Alive {
                        let mut _idx = self.get_index(north, west);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(north, col);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(north, east);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(row, west);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(row, east);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(south, west);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(south, col);
                        self.scores[_idx] += 1;
                        _idx = self.get_index(south, east);
                        self.scores[_idx] += 1;
                    }
                }
            }
            // console::log_2(&"tick(): scores:".into(),
            //     &Universe::_dump_vec(&self.scores, self.width).into());

            //---- calc delta; update cells
            self.delta_alive.clear();
            self.delta_dead.clear();
            for idx in 0..(self.width * self.height) {
                // console::log_2(&"idx:".into(), &idx.into());
                match (self.cells[idx as usize], self.scores[idx as usize]) {
                    (Cell::Alive, x) if x < 2 || x > 3 => {
                        self.delta_dead.push(idx);
                        self.cells[idx as usize] = Cell::Dead;
                    },
                    (Cell::Dead, 3) => {
                        self.delta_alive.push(idx);
                        self.cells[idx as usize] = Cell::Alive;
                    },
                    (_, _) => (),
                }
                // reset this cell's score for the next tick
                self.scores[idx as usize] = 0;
            }
            // console::log_2(&"tick(): self.delta_alive:".into(), &format!("{:?}", self.delta_alive).into());
            // console::log_3(&"tick(): self.delta_alive.len(), self.delta_alive.capacity():".into(),
            //     &(self.delta_alive.len() as u32).into(),
            //     &(self.delta_alive.capacity() as u32).into());
            // console::log_2(&"tick(): self.delta_dead:".into(), &format!("{:?}", self.delta_dead).into());
            // console::log_3(&"tick(): self.delta_dead.len(), self.delta_dead.capacity():".into(),
            //     &(self.delta_dead.len() as u32).into(),
            //     &(self.delta_dead.capacity() as u32).into());
        } else { // orig version
            // TODO this mem allocation can be cached
            let mut next = self.cells.clone();

            for row in 0..self.height {
                for col in 0..self.width {
                    let idx = self.get_index(row, col);

                    next[idx] = match (self.cells[idx], self.live_neighbor_count(row, col)) {
                        // Rule 1: Any live cell with fewer than two live neighbours
                        // dies, as if caused by underpopulation.
                        (Cell::Alive, x) if x < 2 => Cell::Dead,
                        // Rule 2: Any live cell with two or three live neighbours
                        // lives on to the next generation.
                        (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                        // Rule 3: Any live cell with more than three live
                        // neighbours dies, as if by overpopulation.
                        (Cell::Alive, x) if x > 3 => Cell::Dead,
                        // Rule 4: Any dead cell with exactly three live neighbours
                        // becomes a live cell, as if by reproduction.
                        (Cell::Dead, 3) => Cell::Alive,
                        // All other cells remain in the same state.
                        (otherwise, _) => otherwise,
                    };
                }
            }

            self.cells = next;
        }
    }

    pub fn new() -> Universe {
        utils::set_panic_hook();

        // https://rustwasm.github.io/docs/wasm-bindgen/examples/console-log.html
        // console::log_1(&"Hello using web-sys".into());
        // let js: JsValue = 4.into();
        // console::log_2(&"Logging arbitrary values looks like".into(), &js);

        let devmode = false;
        // let devmode = true;

        // let width = 128;
        // let height = 128;
        let width = if devmode { 8 } else { 128 };
        let height = if devmode { 8 } else { 128 };

        let cells: Vec<Cell> = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 { Cell::Alive } else { Cell::Dead }
            })
            .collect(); // all elements generated by the iterator -> a Vector

        //---- just for testing; super slowwwwwwwww
        // let indices = (0..width * height).collect();
        // let indices = (0..width * height).map(|idx| idx as usize).collect();
        //----
        // let mut indices = HashMap::new();
        // for row in 0..height {
        //     for col in 0..width {
        //         indices.insert((row, col), (row * width + col) as usize);
        //         // indices.insert(format!("{}-{}", row, col), (row * width + col) as usize);
        //     }
        // }

        let size = (width * height) as usize;
        let mut delta_alive = Vec::with_capacity(size);
        for (idx, cell) in cells.iter().enumerate() {
            if *cell == Cell::Alive {
                delta_alive.push(idx as u32);
            }
        }

        Universe {
            width,
            height,
            cells,
            //---- mods ----
            // indices, // slow; crap
            scores: vec![0; size],
            delta_alive,
            delta_dead: Vec::with_capacity(size),
            devmode,
        }
    }

    pub fn cells(&self) -> *const Cell {
        if self.devmode {
            self.dump_cells();
        }

        self.cells.as_ptr()
    }

    pub fn dump_cells(&self) {
        let dump = Universe::_dump_vec(
            &self.cells.iter().map(|&cell| cell as u8).collect(), self.width);
        console::log_2(&"cells:".into(), &dump.into());
    }
    pub fn delta_alive_ptr(&self) -> *const u32 { self.delta_alive.as_ptr() }
    pub fn delta_alive_size(&self) -> u32 { self.delta_alive.len() as u32 }
    pub fn delta_dead_ptr(&self) -> *const u32 { self.delta_dead.as_ptr() }
    pub fn delta_dead_size(&self) -> u32 { self.delta_dead.len() as u32 }

    pub fn width(&self) -> u32 { self.width }
    pub fn height(&self) -> u32 { self.height }
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = (0..width * self.height).map(|_i| Cell::Dead).collect();
    }
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = (0..self.width * height).map(|_i| Cell::Dead).collect();
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let idx = self.get_index(row, column);
        self.cells[idx].toggle();
        //==== ????
        // self.cells[self.get_index(row, column)].toggle();
        /*
        error[E0502]: cannot borrow `*self` as immutable because it is also borrowed as mutable
           --> src/lib.rs:254:20
            |
        254 |         self.cells[self.get_index(row, column)].toggle();
            |         -----------^^^^------------------------
            |         |          |
            |         |          immutable borrow occurs here
            |         mutable borrow occurs here
            |         mutable borrow later used here
        */
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}
