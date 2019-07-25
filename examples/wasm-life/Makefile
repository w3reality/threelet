all: wasm

export CRATE_DIR=./wasm_game_of_life
export CRATE_NAME=wasm_game_of_life
MAKE_TARGET=$(MAKE) -f ../wasm/bindgen.mk $@
wasm:
	$(MAKE_TARGET) 

clean:
	$(MAKE_TARGET)
