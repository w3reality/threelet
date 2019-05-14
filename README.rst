threelet
===================

A three.js scene viewer with batteries.

Setup
-----

**Installation**

.. code:: sh

    $ npm install threelet

**Loading**

.. code:: js

    import Threelet from 'dist/threelet.js';

Usage
-----

.. code:: html

    <canvas id="canvas" style="width: 100%; height: 100%;"></canvas>

    <script src="../deps/three.min.js"></script>
    <script src="../deps/OrbitControls.js"></script>
    <script src="../deps/stats.min.js"></script>

    <script type="module">
    import Threelet from '../../dist/threelet.js';

    const threelet = new Threelet({
        canvas: document.getElementById("canvas"),
        optClassControls: window.THREE.OrbitControls,
        optClassStats: window.Stats,
    });

    threelet.updateLoop(0); // 0 fps, i.e. passive rendering with OribitControls
    </script>

`live <https://w3reality.github.io/threelet/examples/simple/index.html>`__ | `source code <https://github.com/w3reality/threelet/tree/master/examples/simple/index.html>`__

.. image:: https://w3reality.github.io/threelet/examples/simple/img/threelet.png

🚧 🚧 🚧 More Usage (WIP)
--------------------------

**Basic**

auto/manual configuring camera/scene/renderer:

.. code:: js

    const threelet = new Threelet({canvas: myCanvas});
    // now the following objects are all set
    // threelet.camera
    // threelet.scene
    // threelet.renderer

object registration/custom scene:

.. code:: js

    threelet.scene.add(myObject) // add an object to the scene

    const threelet = new Threelet({
        canvas: myCanvas,
        scene: myScene, // instantiate with a custom scene
    });

passive/active/fps-throttled rendering by built-in loop controller:

.. code:: js

    threelet.updateLoop(fps); // render at fps using the looper

    threelet.render(); // atomic render manually

binding scene mechanics handler:

.. code:: js

    threelet.update = (t, dt) => {
       // your implementation
    };

**Event listeners**

.. code:: js

    // setting mouse listeners
    //   mx, my: mouse coordinates

    threelet.setEventListener('mouse-click', (mx, my) => { /* ... */ }); // alias of 'mouse-click-left'
    threelet.setEventListener('mouse-click-left', (mx, my) => { /* ... */ });
    threelet.setEventListener('mouse-click-middle', (mx, my) => { /* ... */ });
    threelet.setEventListener('mouse-click-right', (mx, my) => { /* ... */ });

    threelet.setEventListener('mouse-down', (mx, my) => { /* ... */ });  // alias of 'mouse-down-left'
    threelet.setEventListener('mouse-down-left', (mx, my) => { /* ... */ });
    threelet.setEventListener('mouse-down-middle', (mx, my) => { /* ... */ });
    threelet.setEventListener('mouse-down-right', (mx, my) => { /* ... */ });

    threelet.setEventListener('mouse-move', (mx, my) => { /* ... */ });
    threelet.setEventListener('mouse-drag-end', (mx, my) => { /* ... */ });

    // setting VR controller listeners
    //   i: controller index
    //   x, y: touchpad coordinates

    threelet.setEventListener('vr-touchpad-touch-start', (i, x, y) => { /* ... */ });
    threelet.setEventListener('vr-touchpad-touch-end', (i, x, y) => { /* ... */ });
    threelet.setEventListener('vr-touchpad-press-start', (i, x, y) => { /* ... */ });
    threelet.setEventListener('vr-touchpad-press-end', (i, x, y) => { /* ... */ });

    threelet.setEventListener('vr-trigger-press-start', (i) => { /* ... */ });
    threelet.setEventListener('vr-trigger-press-end', (i) => { /* ... */ });

**Utils**

raycasting:

.. code:: js

    threelet.raycast(origin, direction, meshes, faceExclude=null, recursive=false);
    threelet.raycastFromCamera(mx, my, meshes, recursive=false);

**Optional features**

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
