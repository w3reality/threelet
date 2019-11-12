all: wasm-compat

export CRATE_DIR=./fern
export CRATE_NAME=fern
export OUT_DIR=.
export WASM_TOOLS_DIR=../wasm
MAKE_TARGET=make -f $(WASM_TOOLS_DIR)/bindgen.mk $@
wasm-compat:
	$(MAKE_TARGET) 

clean:
	$(MAKE_TARGET)
