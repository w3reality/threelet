threelet
===================

**threelet** is a three.js based scene viewer.
It can be also used as a 3D app framework for rapidly making dynamic desktop/VR applications.
Some notable features include:

- 3D scene update interface,
- render loop manager, and
- built-in mouse/vr-controller event handlers.

**demos**

- Hello world with the default axes and a unit lattice [ `live <https://w3reality.github.io/threelet/examples/simple/index.html>`__ | `source code <https://github.com/w3reality/threelet/tree/master/examples/simple/index.html>`__ | `Observable notebook <https://observablehq.com/@j-devel/hello-world-with-threelet>`__ ]

- App with a static scene (mouse-event driven passive rendering) [ `live <https://w3reality.github.io/threelet/examples/simple-static/index.html>`__ | `source code <https://github.com/w3reality/threelet/tree/master/examples/simple-static/index.html>`__ | `Observable notebook <https://observablehq.com/@j-devel/making-a-static-3d-app>`__ ]

- App with a dynamic scene (rendering at 30 fps) [ `live <https://w3reality.github.io/threelet/examples/simple-dynamic/index.html>`__ | `source code <https://github.com/w3reality/threelet/tree/master/examples/simple-dynamic/index.html>`__ | `Observable notebook <https://observablehq.com/@j-devel/making-a-dynamic-3d-app>`__ ]

- WebVR controller state visualizer [ `live <https://w3reality.github.io/threelet/examples/webvr-controllers/index.html>`__ | `source code <https://github.com/w3reality/threelet/tree/master/examples/webvr-controllers>`__ ]

.. image:: https://w3reality.github.io/threelet/examples/simple-dynamic/index.jpg
     :target: https://w3reality.github.io/threelet/examples/simple-dynamic/index.html

Setup
-----

**Installation**

.. code:: sh

    $ npm install threelet

**Loading**

ES6:

.. code:: js

    import Threelet from 'src/index.js';

Script tag:

.. code:: html

    <script src="dist/threelet.min.js"></script>

Hello world
-----------

.. code:: html

    <canvas id="canvas" style="width: 100%; height: 100%;"></canvas>

    <script src="../deps/three.min.js"></script>
    <script src="../deps/OrbitControls.js"></script>
    <script src="../deps/stats.min.js"></script>

    <script src="../../dist/threelet.min.js"></script>

    <script>
    const threelet = new Threelet({
        canvas: document.getElementById("canvas"),
        optClassControls: THREE.OrbitControls,
        optClassStats: Stats,
    });

    threelet.render(); // first time
    </script>

`live <https://w3reality.github.io/threelet/examples/simple/index.html>`__ | `source code <https://github.com/w3reality/threelet/tree/master/examples/simple/index.html>`__

.. image:: https://w3reality.github.io/threelet/examples/simple/img/threelet.png

More usage
----------

**Basic**

``camera``, ``scene`` and ``renderer`` can be automatically/manually configured:

.. code:: js

    const threelet = new Threelet({canvas: myCanvas});
    // now the following objects are all set
    //   threelet.camera
    //   threelet.scene (with the default axes and a unit lattice)
    //   threelet.renderer

``scene`` can be customized as:

.. code:: js

    const threelet = new Threelet({
        canvas: myCanvas,
        scene: myScene, // instantiate with a custom scene
    });

    threelet.scene.add(myObject) // add an object to the scene

render modes (passive, active, and fps-throttled) by the built-in loop controller:

.. code:: js

    threelet.updateLoop(fps); // render at fps using the looper

    threelet.render(); // atomic render manually

scene mechanics handler:

.. code:: js

    threelet.update = (t, dt) => {
       // your implementation
    };

**Parameters**

.. code:: js

    const threelet = new Threelet({ /* params */ });

``/* params */`` with default values are as follows:

.. code:: js

    canvas: null, // required
    // viewer options ----
    optScene: null,
    optAxes: true, // axes and a unit lattice
    optCameraPosition: [0, 1, 2], // initial camera position in desktop mode
    // plugin options ----
    optClassStats: null, // for stats.js
    optStatsPenel: 0, // 0: fps, 1: ms, 2: mb, 3+: custom
    optClassControls: null, // for OrbitControls
    optClassWebVR: null, // for VR switch button
    optClassSky: null,

**Event listeners**

.. code:: js

    // setting mouse listeners
    //   mx, my: mouse coordinates

    threelet.on('mouse-click', (mx, my) => { /* ... */ }); // alias of 'mouse-click-left'
    threelet.on('mouse-click-left', (mx, my) => { /* ... */ });
    threelet.on('mouse-click-middle', (mx, my) => { /* ... */ });
    threelet.on('mouse-click-right', (mx, my) => { /* ... */ });

    threelet.on('mouse-down', (mx, my) => { /* ... */ });  // alias of 'mouse-down-left'
    threelet.on('mouse-down-left', (mx, my) => { /* ... */ });
    threelet.on('mouse-down-middle', (mx, my) => { /* ... */ });
    threelet.on('mouse-down-right', (mx, my) => { /* ... */ });

    threelet.on('mouse-move', (mx, my) => { /* ... */ });
    threelet.on('mouse-drag-end', (mx, my) => { /* ... */ });

    // setting VR controller listeners
    //   i: controller index
    //   x, y: touchpad coordinates

    threelet.on('vr-touchpad-touch-start', (i, x, y) => { /* ... */ });
    threelet.on('vr-touchpad-touch-end', (i, x, y) => { /* ... */ });
    threelet.on('vr-touchpad-press-start', (i, x, y) => { /* ... */ });
    threelet.on('vr-touchpad-press-end', (i, x, y) => { /* ... */ });

    threelet.on('vr-trigger-press-start', (i) => { /* ... */ });
    threelet.on('vr-trigger-press-end', (i) => { /* ... */ });

    // cancelling

    threelet.on(eventName, null);

**Utils**

raycasting:

.. code:: js

    threelet.raycast(origin, direction, meshes, recursive=false, faceExclude=null);
    threelet.raycastFromMouse(mx, my, meshes, recursive=false);

**Pluggable features**

OrbitControls, stats, and WebVR:

.. code:: html

    <script src="OrbitControls.js"></script>
    <script src="stats.min.js"></script>
    <script src="WebVR.js"></script>

.. code:: js

    const threelet = new Threelet({
        // ...
        optClassControls: THREE.OrbitControls,
        optClassStats: window.Stats,
        optClassWebVR: window.WEBVR,
    });

Sky based on the `shaders/sky <https://threejs.org/examples/?q=sky#webgl_shaders_sky>`__ example in three.js:

.. code:: html

    <script src="Sky.js"></script>

.. code:: js

    const threelet = new Threelet({
        // ...
        optClassSky: THREE.Sky,
    });

    threelet.setupSky(); // one liner

    // OR, to manually add the sky, do as follows:

    const skyHelper = threelet.getSkyHelper();
    threelet.scene.add(...skyHelper.init()); // add 'sun' and 'sunSphere' objects
    skyHelper.updateUniforms({ // optional configs
        turbidity: 1,
        // ...
    });

Build
-----

.. code::

    $ npm install  # set up build tools
    $ npm run build  # generate module files in lib/
