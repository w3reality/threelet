threelet
===================

A portable standalone viewer for THREE objects.

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

More Usage (WIP)
----------------

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

**Utils**

binding built-in mouse event handlers (clicks, drags):

.. code:: js

    threelet.onClick = (mx, my) => { // alias for left click
       // your implementation
    };
    threelet.onClickLeft = (mx, my) => { /* ... */ };
    threelet.onClickMiddle = (mx, my) => { /* ... */ };
    threelet.onClickRight = (mx, my) => { /* ... */ };

raycasting utils:

.. code:: js

    threelet.raycast();
    threelet.raycastFromCamera();

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
