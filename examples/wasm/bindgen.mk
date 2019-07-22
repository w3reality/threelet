wasm:
	cd $(CRATE_DIR) && wasm-pack build
	cp $(CRATE_DIR)/pkg/$(CRATE_NAME)_bg.wasm .
	cat $(CRATE_DIR)/pkg/$(CRATE_NAME).js | sed -e "s/import \* as wasm.*/export const wasm = {_timestamp: performance.now()}; \/\/ to be populated by loadWasmBindgen()/g" > $(CRATE_NAME).export.js

clean:
	rm -f $(CRATE_NAME)_bg.wasm $(CRATE_NAME).export.js
