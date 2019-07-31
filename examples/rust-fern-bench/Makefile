all: wasm

export CRATE_DIR=./fern
export CRATE_NAME=fern
MAKE_TARGET=make -f ../wasm/bindgen.mk $@
wasm:
	$(MAKE_TARGET) 

clean:
	$(MAKE_TARGET)
