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
