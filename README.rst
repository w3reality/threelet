threelet
===================

**threelet** is a three.js based scene viewer.
It can be also used as a tiny framework for rapidly making dynamic 3D applications.
Some notable features include:

- programmable scene update interface,
- fps controllable rendering loop, and
- built-in mouse/vr-controller event handlers.


Setup
-----

**Installation**

.. code:: sh

    $ npm install threelet

**Loading**

.. code:: js

    import Threelet from 'dist/threelet.js';

Simple usage
------------

.. code:: html

    <canvas id="canvas" style="width: 100%; height: 100%;"></canvas>

    <script src="../deps/three.min.js"></script>
    <script src="../deps/OrbitControls.js"></script>
    <script src="../deps/stats.min.js"></script>

    <script type="module">
    import Threelet from '../../dist/threelet.js';

    const threelet = new Threelet({
        canvas: document.getElementById("canvas"),
        optClassControls: THREE.OrbitControls,
        optClassStats: Stats,
    });

    threelet.updateLoop(0); // 0 fps, i.e. passive rendering with OribitControls
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

    threelet.raycast(origin, direction, meshes, recursive=false, faceExclude=null);
    threelet.raycastFromMouse(mx, my, meshes, recursive=false);

**Pluggable feature intreface**

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
