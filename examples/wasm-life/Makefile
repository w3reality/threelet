all: wasm

wasm:
	make -C ./wasm_game_of_life--rustwasm
	cp ./wasm_game_of_life--rustwasm/pkg/wasm_game_of_life*{wasm,static.js} .

clean:
	rm -f *_bg.wasm *.static.js
