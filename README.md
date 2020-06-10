# threelet

**threelet** is a [three.js](https://github.com/mrdoob/three.js/) based framework for rapidly developing 3D/WebXR apps all at once!

Using threelet\'s built-in features, developers who have a minimal knowledge of three.js can immediately start writing interactive 3D apps with less code.

Some notable features include:

- built-in render loop manager (with auto VR context switching),
- function interface `.update = (t, dt) => {}` for programming temporal 3D scenes, and
- input device abstraction: mouse/xr-controller event listeners.

## Demos

### Basic demos

- Hello world (with the default axes and a unit lattice) [ [live](https://w3reality.github.io/threelet/examples/simple/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/simple/index.html) |  [Observable](https://observablehq.com/@j-devel/hello-world-with-threelet) ]
- Hello VR world [ [live](https://w3reality.github.io/threelet/examples/simple-webvr/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/simple-webvr/index.html) | [Observable](https://observablehq.com/@j-devel/hello-world-with-threelet/2) ]
- Hybrid apps with WebXR buttons. [ [live](https://w3reality.github.io/threelet/examples/embed-multiple-buttons/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/embed-multiple-buttons/index.html) ]
- App with a static scene (mouse-event driven passive rendering) [  [live](https://w3reality.github.io/threelet/examples/simple-static/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/simple-static/index.html) | [Observable](https://observablehq.com/@j-devel/making-a-static-3d-app) ]
- App with a dynamic scene (rendering at 30 fps) [ [live](https://w3reality.github.io/threelet/examples/simple-dynamic/index.html) |  [source](https://github.com/w3reality/threelet/tree/master/examples/simple-dynamic/index.html) | [Observable](https://observablehq.com/@j-devel/making-a-dynamic-3d-app) ]
- App extending the `Threelet` class (Object-Oriented Programming) [  [live](https://w3reality.github.io/threelet/examples/simple-oop/index.html)  | [source](https://github.com/w3reality/threelet/tree/master/examples/simple-oop/index.html) ]
- Embedding a 3D viewer into a web page. [ [live](https://w3reality.github.io/threelet/examples/embed-inline-block/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/embed-inline-block/index.html) ]
- 💡 Embedding multiple independent viewers into a web page. [ [live](https://w3reality.github.io/threelet/examples/embed-multiple/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/embed-multiple/index.html) ]
- Hello glTF animation. [ [live](https://w3reality.github.io/threelet/examples/animation-hello/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/animation-hello/index.html) ]
- 🦀 rust-canvas-hello: Drawing on a 3D plane via [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) and Rust. [ [live](https://w3reality.github.io/threelet/examples/rust-canvas-hello/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/rust-canvas-hello) ]

### App demos

- VR app with interactive objects [ [live](https://w3reality.github.io/threelet/examples/webvr-interactive/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/webvr-interactive/index.html) | [Observable](https://observablehq.com/@j-devel/making-an-interactive-vr-app) ]
- 🎮 WebXR controller state visualizer [ [live](https://w3reality.github.io/threelet/examples/webvr-controllers/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/webvr-controllers) | [video](https://w3reality.github.io/threelet/examples/webvr-controllers/media/webvr-controllers.mp4) ]
- 🎬 Animation player (with glTF, FBX and Collada models). [ [live](https://w3reality.github.io/threelet/examples/animation-player/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/animation-player/index.html) ]
- glTF model selection panel. [ [live](https://w3reality.github.io/threelet/examples/model-selection/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/model-selection/index.html) ]
- In-window VR casting. [ [live](https://w3reality.github.io/threelet/examples/vr-casting-in-window/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/vr-casting-in-window/index.html) ]
- 🎨 vr-paint app [ [live](https://w3reality.github.io/threelet/examples/vr-paint/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/vr-paint) ]
- 🤖 ML app (MNIST with LeNet) [ [live](https://w3reality.github.io/spacial-ml/examples/lenet/index.html) | [source](https://github.com/w3reality/spacial-ml/tree/master/examples/lenet/index.html) ] 🔗
- 🦀 rust-canvas-juliaset: Interactive 3D app that can visualize Julia sets. [  [live](https://w3reality.github.io/threelet/examples/rust-canvas-juliaset/index.html)  | [source](https://github.com/w3reality/threelet/tree/master/examples/rust-canvas-juliaset) ]
- 🦀 rust-fern-bench: WebXR app for benchmarking fractal computation with Rust+wasm vs JavaScript. [ [live](https://w3reality.github.io/threelet/examples/rust-fern-bench/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/rust-fern-bench) | [video](https://w3reality.github.io/threelet/examples/rust-fern-bench/rust-fern-bench.mp4) ]
- 🗺️ geo-viewer [ [live](https://w3reality.github.io/three-geo/examples/geo-viewer/io/index.html?lat=46.5763&lng=7.9904&title=Eiger) | [source](https://github.com/w3reality/three-geo/tree/master/examples/geo-viewer) ] 🔗

### Screenshots

- [App with a dynamic scene](https://w3reality.github.io/threelet/examples/simple-dynamic/index.html)

  [![image](https://w3reality.github.io/threelet/examples/simple-dynamic/index.jpg)](https://w3reality.github.io/threelet/examples/simple-dynamic/index.html)

- [Animation player](https://w3reality.github.io/threelet/examples/animation-player/index.html)

  [![image](https://w3reality.github.io/threelet/examples/media/img/mora2.jpg)](https://w3reality.github.io/threelet/examples/animation-player/index.html)

- [In-window VR casting](https://w3reality.github.io/threelet/examples/vr-casting-in-window/index.html)

  [![image](https://w3reality.github.io/threelet/examples/media/img/casting-2.jpg)](https://w3reality.github.io/threelet/examples/vr-casting-in-window/index.html)

## Installation

```
$ npm i threelet
```

## Hello world

```html
<canvas id="canvas" style="width: 100%; height: 100%;"></canvas>

<script src="../deps/three.min.js"></script>
<script src="../deps/OrbitControls.js"></script>
<script src="../deps/stats.min.js"></script>

<script src="../../dist/threelet.min.js"></script>

<script>
const threelet = new Threelet({
    canvas: document.getElementById('canvas'),
});

threelet.setup('mod-controls', THREE.OrbitControls);
threelet.setup('mod-stats', window.Stats);

threelet.render(); // first time
</script>
```

[live](https://w3reality.github.io/threelet/examples/simple/index.html) | [source code](https://github.com/w3reality/threelet/tree/master/examples/simple/index.html)

[![image](https://w3reality.github.io/threelet/examples/simple/img/threelet.png)](https://w3reality.github.io/threelet/examples/simple/index.html)

## More usage

### Basic

`camera`, `scene` and `renderer` can be automatically/manually configured:

```js
const threelet = new Threelet({canvas: myCanvas});
// now the following objects are all set
//   threelet.camera
//   threelet.scene (with the default axes and a unit lattice)
//   threelet.renderer
```

`scene` can be customized as:

```js
const threelet = new Threelet({
    canvas: myCanvas,
    optScene: myScene, // instantiate with a custom scene
});

threelet.scene.add(myObject) // add an object to the scene
```

specifying render modes (passive, active, and fps-throttled) by the built-in loop controller:

```js
threelet.updateLoop(fps); // render at fps using the built-in looper

threelet.render(); // atomic render manually
```

programming 3D scene dynamics ([example](https://w3reality.github.io/threelet/examples/simple-dynamic/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/simple-dynamic/index.html)):

```js
threelet.update = (t, dt) => {
   // your implementation
};
```

`dispose()` terminates the loop and disposes all the scene objects:

```js
threelet.dispose();
```

### Parameters

Calling the constructor with the default parameters looks as:

```js
const threelet = new Threelet({
    canvas: null,
    width: 480,
    height: 320,
    // ---- viewer options ----
    optScene: null,
    optVR: false, // enable VR 🔥
    optAR: false, // enable AR 🔥
    optXR: false, // enable both VR/AR
    optVRAppendButtonTo: null, // specify an HTML element where the VR button is appended
    optARAppendButtonTo: null, // specify an HTML element where the AR button is appended
    optAxes: true, // axes and a unit lattice
    optCameraPosition: [0, 1, 2], // initial camera position in desktop mode
});
```

### Extending the Threelet class (Object-Oriented Programming)

[example](https://w3reality.github.io/threelet/examples/simple-oop/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/simple-oop/index.html)

```js
class App extends Threelet {
    // override
    onCreate(params) {
        // ...
    }

    // override
    onUpdate(t, dt) { // note: this method is not called when this.update is defined
        // ...
    }

    // override
    onDestroy() {
        // ...
    }
}
```

### Embedding

Without the `canvas` parameter, the constructor creates an inline-block div element (`threelet.domElement`) that is ready to be embedded into a web page.

Examples: [single](https://w3reality.github.io/threelet/examples/embed-inline-block/index.html) | [multiple](https://w3reality.github.io/threelet/examples/embed-multiple/index.html)

```html
<div>
    This <span id="viewer"></span> is an inline-block element.
</div>

<script>
const threelet = new Threelet({width: 480, height: 320});
document.getElementById('viewer').appendChild(threelet.domElement);
</script>
```

### High-level input management

[example](https://w3reality.github.io/threelet/examples/vr-paint/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/vr-paint/index.html)

```js
threelet.setupMouseInterface({
    onClick: (mx, my) => { /* ... */ },
    onDrag: (mx, my) => { /* ... */ },
    onDragStart: (mx, my) => { /* ... */ },
    onDragEnd: (mx, my) => { /* ... */ },
});

threelet.setupTouchInterface({
    onClick: (mx, my) => { /* ... */ },
    onDrag: (mx, my) => { /* ... */ },
    onDragStart: (mx, my) => { /* ... */ },
    onDragEnd: (mx, my) => { /* ... */ },
});
```

### Low-level event listeners

setting mouse listeners:

[example](https://w3reality.github.io/threelet/examples/model-selection/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/model-selection/index.html)

```js
// mx, my: mouse coordinates

threelet.on('mouse-click', (mx, my) => { /* ... */ }); // alias of 'mouse-click-left'
threelet.on('mouse-click-left', (mx, my) => { /* ... */ });
threelet.on('mouse-click-middle', (mx, my) => { /* ... */ });
threelet.on('mouse-click-right', (mx, my) => { /* ... */ });
threelet.on('mouse-down', (mx, my) => { /* ... */ });  // alias of 'mouse-down-left'
threelet.on('mouse-down-left', (mx, my) => { /* ... */ });
threelet.on('mouse-down-middle', (mx, my) => { /* ... */ });
threelet.on('mouse-down-right', (mx, my) => { /* ... */ });
threelet.on('mouse-move', (mx, my) => { /* ... */ });
threelet.on('mouse-up', (mx, my) => { /* ... */ });
threelet.on('mouse-drag-end', (mx, my) => { /* ... */ });

threelet.on('touch-start', (mx, my) => { /* ... */ });
threelet.on('touch-move', (mx, my) => { /* ... */ });
threelet.on('touch-end', (mx, my) => { /* ... */ });
threelet.on('touch-click', (mx, my) => { /* ... */ });
threelet.on('touch-drag-end', (mx, my) => { /* ... */ });
```

setting VR controller listeners:

[example](https://w3reality.github.io/threelet/examples/webvr-controllers/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/webvr-controllers/index.html)

```js
// i: controller index
// x, y: controller touchpad coordinates

threelet.on('xr-trigger-press-start', i => { /* ... */ });
threelet.on('xr-trigger-press-end', i => { /* ... */ });

// WIP
threelet.on('xr-touchpad-touch-start', (i, x, y) => { /* ... */ });
threelet.on('xr-touchpad-touch-end', (i, x, y) => { /* ... */ });
threelet.on('xr-touchpad-press-start', (i, x, y) => { /* ... */ });
threelet.on('xr-touchpad-press-end', (i, x, y) => { /* ... */ });   
```

unsetting listeners:

```js
threelet.on(eventName, null);
```

### Raycasting

```js
threelet.raycast(origin, direction, meshes, recursive=false, faceExclude=null);
threelet.raycastFromMouse(mx, my, meshes, recursive=false); // mx, my: mouse coordinates
threelet.raycastFromController(i, meshes, recursive=false); // i: VR controller index
```

### Utils

animation loading:

[example](https://w3reality.github.io/threelet/examples/animation-hello/index.html) | [source](https://github.com/w3reality/threelet/tree/master/examples/animation-hello/index.html)

```js
// <script src="../deps/GLTFLoader.js"></script>
const data = await Threelet.Utils.loadGLTF(path, file);

// <script src="../deps/inflate.min.js"></script>
// <script src="../deps/FBXLoader.js"></script>
const data = await Threelet.Utils.loadFBX(path);

// <script src="../deps/ColladaLoader.js"></script>
const data = await Threelet.Utils.loadCollada(path);
```

creating test THREE objects (used in the examples for shortcuts):

```js
const obj = Threelet.Utils.createTestHemisphereLight();
const obj = Threelet.Utils.createTestDirectionalLight();
const obj = Threelet.Utils.createTestCube(size=[0.4, 0.1, 0.4], color=0xff00ff, wireframe=false);
const objs = Threelet.Utils.createTestObjects(offset=[0, 1, -2]);
```

### External modules

OrbitControls, stats (and more to be added in future):

```html
<script src="OrbitControls.js"></script>
<script src="stats.min.js"></script>
```

```js
threelet.setup('mod-controls', THREE.OrbitControls); // enable controls
threelet.setup('mod-stats', window.Stats); // show the stats meter
```

Sky based on the [shaders/sky](https://threejs.org/examples/?q=sky#webgl_shaders_sky) example in three.js:

```html
<script src="Sky.js"></script>

threelet.setup('mod-sky', THREE.Sky); // show sky with the analytical daylight
```

## Build

```
$ npm i
$ npm run build
```
