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

auto/manual camera/scene/renderer configuration:

.. code:: js

   const threelet = new Threelet();
   // now the following objects are all set
   // threelet.camera
   // threelet.scene
   // threelet.renderer
   // threelet.controls

object registration/custom scene:

.. code:: js

   threelet.scene.add(myObject) // add an object

   const threelet = new Threelet({scene: myScene}) // instantiate with a custom scene

passive/active/fps-based rendering, built-in rendering loop control:

.. code:: js

   threelet.updateLoop(fps) // render via the looper

   threelet.render() // atomic render manually

scene dynamics handler:

.. code:: js

   threelet.update = (t, dt) => {
      // your implementation
   };

**Utils**

built-in mouse events handlers (clicks, drags):

.. code:: js

   threelet.onClick = (mx, my) => {
      // your implementation
   };

raycasting utils:

.. code:: js

   threelet.raycast()
   threelet.raycastFromCamera()

optional controls:

.. code:: js

   const threelet = new Threelet({optClassControls})

optional stats:

.. code:: js

   const threelet = new Threelet({optClassStats})

optional desktop/WebVR switching:

.. code:: js

   const threelet = new Threelet({optClassWebVR})
