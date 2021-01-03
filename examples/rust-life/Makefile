all: release

release:
	make -C ./life release
	mkdir -p dist && cp ./life/pkg/life{.js,_bg.wasm} ./dist/
dev:
	make -C ./life

clean:
