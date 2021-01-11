all: build-release

ESP = ../../node_modules/.bin/es-pack
build-release:
	make release && $(ESP) build --rustwasm -m umd
build-dev:
	make dev && $(ESP) build --rustwasm -m umd --dev

NAME = fern
dist:
	make build-release
	cp ./pkg-es-pack/$(NAME).min.js .

dev:
	RUSTFLAGS="-Z macro-backtrace" wasm-pack build --dev --target no-modules
release:
	wasm-pack build --release --target no-modules
test:
	wasm-pack test --headless --chrome

clean:
	rm -rf ./pkg/*

.PHONY: dist
