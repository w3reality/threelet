// Threelet - https://github.com/w3reality/threelet
// A three.js scene viewer with batteries (MIT License)

const __version = "0.9.10";

import VRControlHelper from './VRControlHelper.js';
import SkyHelper from './SkyHelper.js';

class Threelet {
    constructor(params) {
        this.version = __version;
        const defaults = {
            canvas: null,
            width: 480,
            height: 320,
            // ---- viewer options ----
            optScene: null,
            optAxes: true, // axes and a unit lattice
            optCameraPosition: [0, 1, 2], // initial camera position in desktop mode
        };
        const actual = Object.assign({}, defaults, params);

        // create domElement in case canvas is not provided
        this.domElement = null;
        let canvas = actual.canvas;
        if (! canvas) {
            // <div style="display: inline-block; position: relative;">
            //     <canvas style="width: 480px; height: 320px;"></canvas>
            // </div>
            canvas = document.createElement('canvas');
            const div = document.createElement('div');
            Object.assign(div.style, {
                display: 'inline-block',
                position: 'relative',
            });
            div.appendChild(canvas);
            this.domElement = div;
        }

        // set width, height of canvas
        Object.assign(canvas.style, {
            width: typeof actual.width === 'string' ?
                actual.width : `${actual.width}px`,
            height: typeof actual.height === 'string' ?
                actual.height : `${actual.height}px`,
        });

        // basics
        [this.scene, this.camera, this.renderer] =
            Threelet._initBasics(canvas, actual);

        this.resizeCanvas(canvas, true); // first time

        // render function
        this.render = (isPresenting=false) => {
            // console.log('@@ render(): isPresenting:', isPresenting);
            if (this.stats) { this.stats.update(); }
            if (! isPresenting) { this.resizeCanvas(canvas); }
            this.renderer.render(this.scene, this.camera);
        };

        // events
        this._eventListeners = {};
        this._eventListenerNames = [
            // TODO add keyboard events
            'mouse-down', // alias of 'mouse-down-left'
            'mouse-down-left',
            'mouse-down-middle',
            'mouse-down-right',
            'mouse-click', // alias of 'mouse-click-left'
            'mouse-click-left',
            'mouse-click-middle',
            'mouse-click-right',
            'mouse-move',
            'mouse-drag-end',
            'vr-touchpad-touch-start',
            'vr-touchpad-touch-end',
            'vr-touchpad-press-start',
            'vr-touchpad-press-end',
            'vr-trigger-press-start',
            'vr-trigger-press-end',
        ];

        //======== FIXME ?? - Oculus Go's desktop mode, OrbitControls breaks mouse events...
        this._initMouseListeners(this.renderer.domElement);
        //======== approach below is this too hackish and still not sure how to trigger
        // // kludge for mouse events and overlay;
        // canvas.style.display = 'block'; // https://stackoverflow.com/questions/8600393/there-is-a-4px-gap-below-canvas-video-audio-elements-in-html5
        //
        //         mouse events for *both* overlay and canvas
        // this._initMouseListeners(document.querySelector('#overlay'));
        // <!-- https://stackoverflow.com/questions/5763911/placing-a-div-within-a-canvas -->
        // <style>
        //     #canvas-wrap { position:relative } /* Make this a positioned parent */
        //     #overlay {
        //         position: absolute;
        //         top: 0px; left: 0px; width: 100%; height: 50%;
        //         background-color: #88000088; /* debug */
        //         /* pointer-events: none; */
        //     }
        // </style>
        // <div id="canvas-wrap">
        //   <canvas id="canvas" style="width: 100%; height: 100%;"></canvas>
        //   <div id="overlay"></div>
        // </div>

        // raycasting
        this._raycaster = new THREE.Raycaster();;

        // rendering loop and scene logic update
        this.clock = new THREE.Clock();
        this.timeLast = this.clock.getElapsedTime();
        this.iid = null;
        this.update = null;

        // plugin module table
        this.modTable = {
            'mod-controls': this._setupControls,
            'mod-stats': this._setupStats,
            'mod-webvr': this._setupWebVR,
            'mod-sky': this._setupSky,
        };

        // for controls module
        this.controls = null;

        // for stats module
        this.stats = null;

        // for sky module
        this.skyHelper = null;

        // for WebVR module
        this.fpsDesktopLast = 0;
        this._vrcHelper = new VRControlHelper(this.renderer);
        this.vrButton = null;
            // https://stackoverflow.com/questions/49471653/in-three-js-while-using-webvr-how-do-i-move-the-camera-position
            // this.dolly = new THREE.Group();
            // this.dolly.add(this.camera);

        // api
        this.onCreate();
    }
    onCreate() {
        this.render(); // _first _time
    }
    onDestroy() {
        // nop for the moment
    }

    // plugin module setup function
    setup(modTitle, Module, opts={}) {
        if (modTitle in this.modTable) {
            this.modTable[modTitle].bind(this)(Module, opts);
        } else {
            console.warn('setup(): unsupported module title:', modTitle);
        }
    }

    _setupControls(Module, opts) {
        this.controls = new Module(this.camera, this.renderer.domElement);
        this.controls.addEventListener('change', this.render.bind(null, false));
        if (Threelet.isVrSupported()) {
            // FIXME - OrbitControl breaks _initMouseListeners() on Oculus Go
            console.warn('not enabling OrbitControls (although requested) on this VR-capable browser.');
            this.controls.enabled = false; // https://stackoverflow.com/questions/20058579/threejs-disable-orbit-camera-while-using-transform-control
        }
    }

    _setupStats(Module, opts) {
        const defaults = {
            panelType: 0, // 0: fps, 1: ms, 2: mb, 3+: custom
            appendTo: this.domElement ? this.domElement : document.body,
        };
        const actual = Object.assign({}, defaults, opts);

        const stats = this.stats = new Module();
        stats.showPanel(actual.panelType);
        if (actual.appendTo !== document.body) {
            stats.dom.style.position = 'absolute';
        }
        actual.appendTo.appendChild(stats.dom);
    }

    getSkyHelper() { return this.skyHelper; }

    _setupSky(Module, opts) {
        this.skyHelper = new SkyHelper(Module);
        // console.log('@@ this.skyHelper:', this.skyHelper);

        this.scene.add(...this.skyHelper.init());
        this.skyHelper.updateUniforms({
            turbidity: 1,
        });
    }

    setupVRControlHelperTest() {
        this.scene.add(VRControlHelper.createTestHemisphereLight());
        this.scene.add(VRControlHelper.createTestDirectionalLight());

        this.enableInteractiveGroup('drag');
        const group = this.getInteractiveGroup();
        VRControlHelper.createTestObjects().forEach(obj => group.add(obj));
        this.scene.add(group);
    }
    getVRControlHelper() { // deprecated
        console.warn('@@ getVRControlHelper(): i am deprecated!!');
        return this._vrcHelper;
    }
    getInteractiveGroup() { return this._vrcHelper.getInteractiveGroup(); }
    enableInteractiveGroup(mode) {
        if (mode === 'drag') {
            this._vrcHelper.enableDragInteractiveGroup();
            // TODO disable interface ??
        } else {
            console.warn('@@ unsupported interactive mode:', mode);
        }
    }
    getControllersState() { return this._vrcHelper.getControllersState(); }
    displayControllerEvent(i, what, tf) {
        // only for updating visibility
        if (what === 'vr-trigger-press') {
            this._vrcHelper.toggleTriggerPressVisibility(i, tf);
        } else if (what === 'vr-touchpad-touch') {
            this._vrcHelper.toggleTouchpadPointVisibility(i, 'touch', tf);
        } else if (what === 'vr-touchpad-press') {
            this._vrcHelper.toggleTouchpadPointVisibility(i, 'press', tf);
        } else {
            console.warn('@@ unsupported what:', what);
        }
    }
    updateControllerTouchpad(i, what) {
        // only for updating the position based on the current axes values
        if (what === 'vr-touchpad-touch') {
            this._vrcHelper.updateTouchpadPoint(i, 'touch');
        } else if (what === 'vr-touchpad-press') {
            this._vrcHelper.updateTouchpadPoint(i, 'press');
        } else {
            console.warn('@@ unsupported what:', what);
        }
    }

    _setupWebVR(Module, opts={}) {
        const defaults = {
            appendTo: this.domElement ? this.domElement : document.body,
        };
        const actual = Object.assign({}, defaults, opts);

        // https://threejs.org/docs/manual/en/introduction/How-to-create-VR-content.html
        this.renderer.vr.enabled = Threelet.isVrSupported();

        const btn = this._createVRButton(Module);
        actual.appendTo.appendChild(btn);
        this.vrButton = btn;

        if (Threelet.isVrSupported()) {
            this._vrcHelper.getControllers()
                .forEach(cont => this.scene.add(cont));
        }
    }

    static isVrSupported() {
        // https://github.com/mrdoob/three.js/blob/dev/examples/js/vr/WebVR.js
        return 'getVRDisplays' in navigator;
    }
    _createVRButton(classWebVR) {
        const btn = classWebVR.createButton(this.renderer);
        btn.style.top = btn.style.bottom;
        btn.style.bottom = '';
        if (Threelet.isVrSupported()) {
            btn.addEventListener('click', ev => {
                console.log('@@ btn.textContent:', btn.textContent);
                if (btn.textContent.startsWith('ENTER')) {
                    this.enterVR(() => { // onError
                        console.log('@@ device:', this.renderer.vr.getDevice());
                        console.log('@@ controller:', this.renderer.vr.getController(0));
                        // TODO (how to programmatically exit the VR session????)
                        // this.updateLoop(this.fpsDesktopLast); // wanna call this after exiting the vr session...
                    });
                }
            });
        }
        return btn;
    }

    enterVR(onError=null) {
        // try entering VR for at most tryCountMax * delay (ms)
        const tryCountMax = 30, delay = 400;
        let tryCount = 0;
        const _enterVR = () => {
            setTimeout(() => {
                tryCount++;
                if (this.renderer.vr.isPresenting()) {
                    console.log(`@@ transition to vr loop!! (tryCount: ${tryCount})`);
                    this.updateLoop(-1);
                } else {
                    console.log(`@@ vr not ready after: ${tryCount*delay} ms (tryCount: ${tryCount})`);
                    if (tryCount < tryCountMax) {
                        _enterVR(tryCountMax, delay); // try harder
                    } else if (onError) {
                        console.error('@@ enter vr failed!!')
                        onError();
                    }
                }
            }, delay); // need some delay for this.renderer.vr.isPresenting() to become true
        };

        this.updateLoop(0); // first, make sure desktop loop is stopped
        _enterVR(tryCountMax, delay);
    }

    updateMechanics() { // update for the scene logic
        const time = this.clock.getElapsedTime();
        const dt = time - this.timeLast;
        this.timeLast = time;
        if (this.update) {
            this.update(time, dt);
        }
    }

    updateLoop(fps) {
        if (this.iid !== null) {
            // console.log('@@ updateLoop(): clearing interval:', this.iid);
            clearInterval(this.iid);
        }

        if (fps === 0) {
            return; // stop the loop
        } else if (fps < 0) { // start the vr loop
            this.renderer.setAnimationLoop(() => {
                if (! this.renderer.vr.isPresenting()) {
                    this.renderer.setAnimationLoop(null); // stop the vr loop
                    console.log('@@ transition back to desktop');
                    // console.log('fps last:', this.fpsDesktopLast);
                    return this.updateLoop(this.fpsDesktopLast);
                }

                this.updateMechanics();
                this._vrcHelper.intersectObjects();
                this._vrcHelper.updateControllers();
                this.render(true);
            });
            return;
        }

        // FIXME for this naive dev version, not looping with rAF()...
        this.fpsDesktopLast = fps;
        this.iid = setInterval(() => {
            this.updateMechanics();
            this.render();
        }, 1000/fps);
        // console.log('@@ updateLoop(): new interval:', this.iid);
    }

    static _initBasics(canvas, opts) {
        const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.001, 1000);
        camera.position.set(...opts.optCameraPosition);
        camera.up.set(0, 1, 0); // important for OrbitControls

        const renderer = new THREE.WebGLRenderer({
            // alpha: true,
            canvas: canvas,
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        console.log('renderer:', renderer);

        // init basic objects --------
        const scene = opts.optScene ? opts.optScene : new THREE.Scene();

        if (opts.optAxes) {
            const walls = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(1, 1, 1)),
                new THREE.LineBasicMaterial({color: 0xcccccc}));
            walls.position.set(0, 0, 0);
            walls.name = 'walls';
            scene.add(walls);
            const axes = new THREE.AxesHelper(1);
            axes.name = 'axes';
            scene.add(axes);
        }

        return [scene, camera, renderer];
    }

    // log with time splits
    log(...args) {
        if (! this._last) { // first time
            this._last = performance.now()/1000;
        }
        let now = performance.now()/1000;
        console.log(`==== ${now.toFixed(3)} +${(now - this._last).toFixed(3)} ====`);
        console.log(...args);
        console.log(`========`);
        this._last = now;
    }

    resizeCanvas(canvas, force=false) {
        Threelet._resizeCanvasToDisplaySize(
            canvas, this.renderer, this.camera, force);
    }

    // https://stackoverflow.com/questions/29884485/threejs-canvas-size-based-on-container
    static _resizeCanvasToDisplaySize(canvas, renderer, camera, force=false) {
        let width = canvas.clientWidth;
        let height = canvas.clientHeight;

        // adjust displayBuffer size to match
        if (force || canvas.width != width || canvas.height != height) {
            // you must pass false here or three.js sadly fights the browser
            // console.log "resizing: #{canvas.width} #{canvas.height} -> #{width} #{height}"
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    };

    // deprecated; for compat only
    setEventListener(eventName, listener) { this.on(eventName, listener); }

    on(eventName, listener) {
        if (this._eventListenerNames.includes(eventName)) {
            // aliases
            if (eventName === 'mouse-down') eventName = 'mouse-down-left';
            if (eventName === 'mouse-click') eventName = 'mouse-click-left';

            const listeners = eventName.startsWith('vr-') ?
                this._vrcHelper._eventListeners : this._eventListeners;
            listeners[eventName] = listener;
        } else {
            console.error('@@ on(): unsupported eventName:', eventName);
        }
    }
    _initMouseListeners(canvas) {
        // https://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
        let isDragging = false; // in closure
        canvas.addEventListener("mousedown", e => {
            isDragging = false;
            const coords = Threelet.getMouseCoords(e, canvas);
            // console.log('@@ mouse down:', ...coords);
            if (e.button === 0) {
                if (this._eventListeners['mouse-down-left']) {
                    this._eventListeners['mouse-down-left'](...coords);
                }
            } else if (e.button === 1) {
                if (this._eventListeners['mouse-down-middle']) {
                    this._eventListeners['mouse-down-middle'](...coords);
                }
            } else if (e.button === 2) {
                if (this._eventListeners['mouse-down-right']) {
                    this._eventListeners['mouse-down-right'](...coords);
                }
            }
        }, false);
        canvas.addEventListener("mousemove", e => {
            isDragging = true;
            const coords = Threelet.getMouseCoords(e, canvas);
            // console.log('@@ mouse move:', ...coords);
            if (this._eventListeners['mouse-move']) {
                this._eventListeners['mouse-move'](...coords);
            }
        }, false);
        canvas.addEventListener("mouseup", e => {
            // console.log('e:', e);
            const coords = Threelet.getMouseCoords(e, canvas);
            if (isDragging) {
                // console.log("mouseup: drag");
                if (this._eventListeners['mouse-drag-end']) {
                    this._eventListeners['mouse-drag-end'](...coords);
                }
            } else {
                // console.log("mouseup: click");
                if (e.button === 0) {
                    // console.log('@@ mouse click left:', ...coords);
                    if (this._eventListeners['mouse-click-left']) {
                        this._eventListeners['mouse-click-left'](...coords);
                    }
                } else if (e.button === 1) {
                    if (this._eventListeners['mouse-click-middle']) {
                        this._eventListeners['mouse-click-middle'](...coords);
                    }
                } else if (e.button === 2) {
                    // console.log('@@ mouse click right:', ...coords);
                    if (this._eventListeners['mouse-click-right']) {
                        this._eventListeners['mouse-click-right'](...coords);
                    }
                }
            }
        }, false);
    }

    _raycast(meshes, recursive, faceExclude) {
        const isects = this._raycaster.intersectObjects(meshes, recursive);
        if (faceExclude) {
            for (let i = 0; i < isects.length; i++) {
                if (isects[i].face !== faceExclude) {
                    return isects[i];
                }
            }
            return null;
        }
        return isects.length > 0 ? isects[0] : null;
    }
    _raycastFromMouse(mx, my, width, height, cam, meshes, recursive=false) {
        const mouse = new THREE.Vector2( // normalized (-1 to +1)
            (mx / width) * 2 - 1,
            - (my / height) * 2 + 1);
        // https://threejs.org/docs/#api/core/Raycaster
        // update the picking ray with the camera and mouse position
        this._raycaster.setFromCamera(mouse, cam);
        return this._raycast(meshes, recursive, null);
    }
    raycast(origin, direction, meshes, recursive=false, faceExclude=null) {
        this._raycaster.set(origin, direction);
        return this._raycast(meshes, recursive, faceExclude);
    }
    raycastFromMouse(mx, my, meshes, recursive=false) {
        const {width, height} = this.renderer.domElement;
        return this._raycastFromMouse(
            mx, my, width, height, this.camera,
            meshes, recursive);
    }

    raycastFromController(i, meshes, recursive=false) {
        return this._vrcHelper.raycastFromController(
            this._vrcHelper.getControllers()[i], meshes, recursive);
    }

    static getMouseCoords(e, canvas) {
        // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        // console.log('getMouseCoords():', mx, my, canvas.width, canvas.height);
        return [mx, my];
    }

    dispose() {
        this.onDestroy();

        this.updateLoop(0); // stop the loop
        this.update = null;

        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }

        if (this.stats) {
            this.stats.dom.remove();
        }

        if (this.vrButton) {
            this.vrButton.remove();
        }

        // this also ensures releasing memory for objects freed by freeScene()
        this.renderer.dispose();
        this.renderer = null;

        // recursively release child objects in the scene
        Threelet.freeScene(this.scene);
        this.scene = null;

        this.camera = null;
    }

    static freeScene(scene) {
        Threelet._freeChildren(scene, scene.children);
    }
    static _freeChildren(_parent, _children) {
        while (_children.length > 0) {
            let ch = _children[0];
            Threelet._freeChildren(ch, ch.children);
            console.log('@@ freeing: one obj:', ch.name);
            console.log(`@@ freeing obj ${ch.uuid} of ${_parent.uuid}`);
            _parent.remove(ch);
            Threelet.disposeObject(ch);
            ch = null
        }
    }
    static disposeObject(obj) { // https://gist.github.com/j-devel/6d0323264b6a1e47e2ee38bc8647c726
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) Threelet.disposeMaterial(obj.material);
        if (obj.texture) obj.texture.dispose();
    }
    static disposeMaterial(mat) {
        if (mat.map) mat.map.dispose();
        mat.dispose();
    }
}

export default Threelet;
