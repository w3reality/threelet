all: release

release:
	make -C ./fern release
	mkdir -p dist && cp ./fern/pkg/fern{.js,_bg.wasm} ./dist/
dev:
	make -C ./fern

clean:
