all: wasm

export CRATE_DIR=./juliaset--tmp
export CRATE_NAME=julia_set
MAKE_TARGET=$(MAKE) -f ../wasm/bindgen.mk $@
wasm:
	$(MAKE_TARGET) 

clean:
	$(MAKE_TARGET)
