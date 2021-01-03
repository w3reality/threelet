CRATE_NAME:=$(subst -,_,$(CRATE_NAME))

# DEPRECATED: Use deps/load-wbg.js instead
wasm:
	cd $(CRATE_DIR) && wasm-pack build
	cp $(CRATE_DIR)/pkg/$(CRATE_NAME)_bg.wasm .
	cat $(CRATE_DIR)/pkg/$(CRATE_NAME).js | sed -e "s/import \* as wasm.*/export const wasm = {_timestamp: performance.now()}; \/\/ to be populated by loadWasmBindgen()/g" > $(CRATE_NAME).exports.js

# DEPRECATED: Use the wasm-mt crate instead
# this variant generates `*.exports.js` that is compatible with NodeJS and Web Workers.
wasm-compat:
	cd $(CRATE_DIR) && wasm-pack build $(WASM_PACK_BUILD_FLAGS)
	cp $(CRATE_DIR)/pkg/$(CRATE_NAME)_bg.wasm .
	$(WASM_TOOLS_DIR)/gen-bindgen-exports $(CRATE_DIR) $(CRATE_NAME) $(OUT_DIR) $(OPT_SNIPPET_FILE)

clean:
	rm -f $(CRATE_NAME)_bg.wasm $(CRATE_NAME).exports.js
