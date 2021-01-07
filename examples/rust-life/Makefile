all: release

release:
	make -C ./rust release
	mkdir -p dist && cp ./rust/pkg/life-mod{.js,_bg.wasm} ./dist/
dev:
	make -C ./rust

clean:
