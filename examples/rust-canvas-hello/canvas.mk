all: wasm

export CRATE_DIR=./canvas--tmp
export CRATE_NAME=canvas
MAKE_TARGET=$(MAKE) -f ../wasm/bindgen.mk $@
wasm:
	$(MAKE_TARGET) 

clean:
	$(MAKE_TARGET)