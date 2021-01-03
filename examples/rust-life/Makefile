all: release

release:
	make -C ./life release
	mkdir -p dist && cp ./fern/pkg/life{.js,_bg.wasm} ./dist/
dev:
	make -C ./life

clean:
