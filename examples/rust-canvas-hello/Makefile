all: build-release

ESP = ../../node_modules/.bin/es-pack
dist:
	make release && $(ESP) build --rustwasm -m esm -d .
build-release:
	make release && $(ESP) build --rustwasm -m esm
build-dev:
	make dev && $(ESP) build --rustwasm -m esm --dev

dev:
	RUSTFLAGS="-Z macro-backtrace" wasm-pack build --dev --target no-modules
release:
	wasm-pack build --release --target no-modules
test:
	wasm-pack test --headless --chrome

clean:
	rm -rf ./pkg/*

.PHONY: dist
