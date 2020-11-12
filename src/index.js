// Threelet - https://github.com/w3reality/threelet
// 3D/WebXR app framework based on three.js (MIT License)

import pkg from '../package.json';
const __version = pkg.version;

import 'regenerator-runtime/runtime.js';

import * as THREE from 'three';
import VRControlHelper from './VRControlHelper.js';
import SkyHelper from './SkyHelper.js';
import Utils from './Utils.js';

import { VRButton } from './deps/VRButton.js';
import { ARButton } from './deps/ARButton.js';

class Threelet {
    constructor(params) {
        this.version = __version;
        Utils.Logger._consoleLog(`Threelet ${__version} with THREE r${THREE.REVISION}`);

        const defaults = {
            canvas: null,
            width: 480,
            height: 320,
            // ---- viewer options ----
            optScene: null,
            optAxes: true, // axes and a unit lattice
            optCameraPosition: [0, 1, 2], // initial camera position in desktop mode
            //--
            optVR: false,
            optAR: false,
            optVRAppendButtonTo: null,
            optARAppendButtonTo: null,
            optXR: false, // shorthand for enabling both VR and AR
            //--
        };
        const actual = Object.assign({}, defaults, params);

        // for setting width, height of canvas
        const _applySizeStyle = (_canvas, _params) => {
            Object.assign(_canvas.style, {
                width: typeof _params.width === 'string' ?
                    _params.width : `${_params.width}px`,
                height: typeof _params.height === 'string' ?
                    _params.height : `${_params.height}px`,
            });
        };

        // create domElement in case canvas is not provided
        this.domElement = null;
        let canvas = actual.canvas;
        if (! canvas) {
            // <div style="display: inline-block; position: relative;">
            //     <canvas style="width: 480px; height: 320px;"></canvas>
            // </div>
            canvas = document.createElement('canvas');
            _applySizeStyle(canvas, actual);
            const div = document.createElement('div');
            Object.assign(div.style, {
                display: 'inline-block',
                position: 'relative',
            });
            div.appendChild(canvas);
            this.domElement = div;
        } else {
            if (params.width !== undefined && params.height !== undefined) {
                _applySizeStyle(canvas, params);
            }
        }
        this.canvas = canvas;


        // basics
        [this.scene, this.camera, this.renderer] =
            Threelet._initBasics(canvas, actual);

        this.resizeCanvas(true); // first time

        // render function
        this.render = (isPresenting=false) => {
            // console.log('@@ render(): isPresenting:', isPresenting);
            if (this._stats) { this._stats.update(); }
            if (! isPresenting) { this.resizeCanvas(); }
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
            'mouse-move',
            'mouse-up',
            'mouse-click', // alias of 'mouse-click-left'
            'mouse-click-left',
            'mouse-click-middle',
            'mouse-click-right',
            'mouse-drag-end',
            'pointer-down',
            'pointer-move',
            'pointer-up',
            'pointer-click',
            'pointer-drag-end',
            'touch-start',
            'touch-move',
            'touch-end',
            'touch-click',
            'touch-drag-end',
            'xr-touchpad-touch-start',
            'xr-touchpad-touch-end',
            'xr-touchpad-press-start',
            'xr-touchpad-press-end',
            'xr-trigger-press-start',
            'xr-trigger-press-end',
        ];

        this._initTouchListeners(this.renderer.domElement);
        this._initPointerListeners(this.renderer.domElement);

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
            'mod-sky': this._setupSky,
        };

        // for controls module
        this._controls = null;

        // for stats module
        this._stats = null;

        // for sky module
        this.skyHelper = null;

        // for WebXR
        this._fpsDesktopLast = 0;
        this._vrcHelper = new VRControlHelper(this.renderer.xr, this.camera);
        this._vrButton = null;
        this._arButton = null;
        this.setupWebXR(actual);

        // https://stackoverflow.com/questions/49471653/in-three-js-while-using-webvr-how-do-i-move-the-camera-position
        // this.dolly = new THREE.Group();
        // this.dolly.add(this.camera);

        // api
        this.onCreate(params);
    }
    onCreate(params) {
        this.render(); // _first _time
    }

    // note: onUpdate() is not called in case this.update is defined
    onUpdate(t, dt) {
        // nop by default
    }

    onDestroy() {
        // nop for the moment
    }

    // plugin module setup function
    setup(modTitle, Module, opts={}) {
        if (modTitle in this.modTable) {
            return this.modTable[modTitle].bind(this)(Module, opts);
        } else {
            console.warn('setup(): unsupported module title:', modTitle);
        }
    }

    _setupControls(Module, opts) {
        this._controls = new Module(this.camera, this.renderer.domElement);
        this._controls.addEventListener('change', this.render.bind(null, false));

        // Threelet.hasVrDisplay(tf => {
        //     if (tf) {
        //         // KLUDGE - OrbitControl breaks _initMouseListeners() on Oculus Go
        //         console.warn('not enabling OrbitControls (although requested) on this browser with VR display.');
        //         this._controls.enabled = false; // https://stackoverflow.com/questions/20058579/threejs-disable-orbit-camera-while-using-transform-control
        //     }
        // });
        //====
        // !!!!!!!! TODO check after `xr` support added
        // if (Threelet._isXrSupported()) {
        //     // KLUDGE - OrbitControl breaks _initMouseListeners() on Oculus Go
        //     console.warn('not enabling OrbitControls (although requested) on this browser with VR display.');
        //     this._controls.enabled = false; // https://stackoverflow.com/questions/20058579/threejs-disable-orbit-camera-while-using-transform-control
        // }

        return this._controls;
    }

    _setupStats(Module, opts) {
        const defaults = {
            panelType: 0, // 0: fps, 1: ms, 2: mb, 3+: custom
            appendTo: this.domElement ? this.domElement : document.body,
        };
        const actual = Object.assign({}, defaults, opts);

        const stats = this._stats = new Module();
        stats.showPanel(actual.panelType);
        if (actual.appendTo !== document.body) {
            stats.dom.style.position = 'absolute';
        }
        actual.appendTo.appendChild(stats.dom);
        return this._stats;
    }

    getSkyHelper() { return this.skyHelper; }

    _setupSky(Module, opts) {
        this.skyHelper = new SkyHelper(Module);
        // console.log('@@ this.skyHelper:', this.skyHelper);

        const [sky, sunSphere] = this.skyHelper.init();
        this.scene.add(sky, sunSphere);
        this.skyHelper.updateUniforms({
            //---- drawn
            // turbidity: 1,
            //---- yingyang
            mieCoefficient: 0.01,
            luminance: 1.185,
            inclination: 0.2,
            azimuth: 0.35,
            //----
        });
        return [sky, sunSphere];
    }

    setupVRControlHelperTest() {
        this.scene.add(Utils.createTestHemisphereLight());
        this.scene.add(Utils.createTestDirectionalLight());

        this.enableInteractiveGroup('drag');
        const group = this.getInteractiveGroup();
        Utils.createTestObjects([0,0,0]).forEach(obj => group.add(obj));
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
        if (what === 'xr-trigger-press') {
            this._vrcHelper.toggleTriggerPressVisibility(i, tf);
        } else if (what === 'xr-touchpad-touch') {
            this._vrcHelper.toggleTouchpadPointVisibility(i, 'touch', tf);
        } else if (what === 'xr-touchpad-press') {
            this._vrcHelper.toggleTouchpadPointVisibility(i, 'press', tf);
        } else {
            console.warn('@@ unsupported what:', what);
        }
    }
    updateControllerTouchpad(i, what) {
        // only for updating the position based on the current axes values
        if (what === 'xr-touchpad-touch') {
            this._vrcHelper.updateTouchpadPoint(i, 'touch');
        } else if (what === 'xr-touchpad-press') {
            this._vrcHelper.updateTouchpadPoint(i, 'press');
        } else {
            console.warn('@@ unsupported what:', what);
        }
    }

    static isVrSupported() { return this._isXrSupported(); } // exposed
    static _isXrSupported() { return 'xr' in navigator; }
    static _createXRButton(buttonClass, renderer, onEnter) {
        const btn = buttonClass.createButton(renderer);

        if (Threelet._isXrSupported()) {
            btn.addEventListener('click', ev => {
                console.log('@@ btn.textContent:', btn.textContent);
                if (btn.textContent === 'ENTER VR' ||
                    btn.textContent === 'START AR') {
                    onEnter();
                }
            });
        }
        return btn;
    }
    setupWebXR(actual) {
        const { optVR, optAR, optXR,
            optVRAppendButtonTo, optARAppendButtonTo } = actual;
        const styler = Threelet._getXRButtonStyler();

        if (optVR || optXR) {
            const isDuo = optAR || optXR;
            this._vrButton = this._setupXRButton(
                VRButton, optVRAppendButtonTo, styler('vr', isDuo));
        }
        if (optAR || optXR) {
            const isDuo = optVR || optXR;
            this._arButton = this._setupXRButton(
                ARButton, optARAppendButtonTo, styler('ar', isDuo));
        }
        if (optVR || optAR || optXR) {
            if (Threelet._isXrSupported()) {
                this.renderer.xr.enabled = true;

                this._vrcHelper.getControllers()
                    .forEach(cont => this.scene.add(cont));
            }
        }
    }
    static _getXRButtonStyler() {
        return (type, isDuo) => btn => {
            let shift = 'calc(50% + 0px)'; // https://developer.mozilla.org/en-US/docs/Web/CSS/calc
            if (isDuo) {
                const rect = btn.getBoundingClientRect(); // https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
                shift = type === 'vr' ? `- ${rect.width + 5}px` : '+ 4px';
            }
            // console.log('shift:', shift);

            Object.assign(btn.style, {
                top: btn.style.bottom,
                bottom: '',
                left: `calc(50% ${shift})`,
            });
        };
    }
    async _setupXRButton(buttonClass, appendButtonTo, overrideStyle=null) {
        const btn = Threelet._createXRButton(buttonClass, this.renderer, () => { /* onEnter */
            this.enterXR(() => { /* onError */
                console.log('@@ enterXR(): onError() called.');
                // console.log('@@ controller 0:', this.renderer.xr.getController(0));
                // TODO (how to programmatically exit the VR session????)
                // this.updateLoop(this._fpsDesktopLast); // wanna call this after exiting the vr session...
            });
        });

        const defaults = this.domElement ? this.domElement : document.body;
        const _appendButtonTo =
            appendButtonTo ? appendButtonTo : defaults;
        // console.log('_appendButtonTo:', _appendButtonTo);
        _appendButtonTo.appendChild(btn);

        if (overrideStyle) {
            // kludge: ensure style overriding happens *after* VRButton/ARButton
            try {
                const token = `immersive-${buttonClass === VRButton ? 'vr' : 'ar'}`;
                const supported = await navigator.xr.isSessionSupported(token);
                // console.log('token, supported:', token, supported);
            } catch (err) {
                console.log('err:', err);
            }
            setTimeout(() => {
                overrideStyle(btn);
            }, 1);
        }

        return btn;
    }

    enterXR(onError=null) {
        // try entering VR for at most tryCountMax * delay (ms)
        const tryCountMax = 30, delay = 400;
        let tryCount = 0;
        const _enterXR = () => {
            setTimeout(() => {
                tryCount++;
                if (this.renderer.xr.isPresenting) {
                    console.log(`@@ transition to vr loop!! (tryCount: ${tryCount})`);
                    this.updateLoop(-1); // negative fps 'means' vr loop
                } else {
                    console.log(`@@ vr not ready after: ${tryCount*delay} ms (tryCount: ${tryCount})`);
                    if (tryCount < tryCountMax) {
                        _enterXR(tryCountMax, delay); // try harder
                    } else if (onError) {
                        console.error('@@ enter vr failed!!');
                        onError();
                    }
                }
            }, delay); // need some delay for this.renderer.xr.isPresenting to become true
        };

        this.updateLoop(0); // first, make sure desktop loop is stopped
        _enterXR(tryCountMax, delay);
    }


    updateMechanics() { // update for the scene logic
        const time = this.clock.getElapsedTime();
        const dt = time - this.timeLast;
        this.timeLast = time;
        (this.update ? this.update : this.onUpdate.bind(this))(time, dt);
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
                if (! this.renderer.xr.isPresenting) {
                    this.renderer.setAnimationLoop(null); // stop the vr loop
                    console.log('@@ transition back to desktop');

                    this.render(); // move one tick to refresh the buffer

                    // console.log('fps last:', this._fpsDesktopLast);
                    return this.updateLoop(this._fpsDesktopLast);
                }

                this.render(true);
                this.updateMechanics();
                this._vrcHelper.intersectObjects();

                // DEPRECATED - valid only for WebVR 1.1
                // this._vrcHelper.updateControllers();
            });
            return;
        }

        // FIXME for this naive dev version, not looping with rAF()...
        this._fpsDesktopLast = fps;
        this.iid = setInterval(() => {
            this.render(); // make sure image dump is available; https://stackoverflow.com/questions/30628064/how-to-toggle-preservedrawingbuffer-in-three-js
            this.updateMechanics();
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
            const { walls, axes } = this.createAxes();
            scene.add(walls, axes);
        }

        return [scene, camera, renderer];
    }

    static createAxes() {
        const walls = Utils.createLineBox([1, 1, 1], 0xcccccc);
        walls.position.set(0, 0, 0);
        walls.name = 'walls';
        const axes = new THREE.AxesHelper(1);
        axes.name = 'axes';
        return { walls, axes };
    }

    resizeCanvas(force=false) {
        Threelet._resizeCanvasToDisplaySize(
            this.canvas, this.renderer, this.camera, force);
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

            const listeners = eventName.startsWith('xr-') ?
                this._vrcHelper._eventListeners : this._eventListeners;
            listeners[eventName] = listener;
        } else {
            console.error('@@ on(): unsupported eventName:', eventName);
            if (eventName.startsWith('vr-')) {
                Utils.Logger._consoleLog(`${eventName} is deprecated; use 'xr-' instead`);
            }
        }
    }
    _callIfDefined(name, coords) {
        const fn = this._eventListeners[name];
        if (fn) fn(...coords);
    }
    _initMouseListeners(canvas) {
        // https://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
        let isDragging = false;
        canvas.addEventListener("mousedown", e => {
            isDragging = false;
            const coords = Threelet.getInputCoords(e, canvas);
            // console.log('@@ mouse down:', ...coords);
            if (e.button === 0) {
                this._callIfDefined('mouse-down-left', coords);
            } else if (e.button === 1) {
                this._callIfDefined('mouse-down-middle', coords);
            } else if (e.button === 2) {
                this._callIfDefined('mouse-down-right', coords);
            }
        }, false);
        canvas.addEventListener("mousemove", e => {
            isDragging = true;
            const coords = Threelet.getInputCoords(e, canvas);
            // console.log('@@ mouse move:', ...coords);
            this._callIfDefined('mouse-move', coords);
        }, false);
        canvas.addEventListener("mouseup", e => {
            // console.log('e:', e);
            const coords = Threelet.getInputCoords(e, canvas);

            // console.log('@@ mouse up:', ...coords);
            this._callIfDefined('mouse-up', coords);

            if (isDragging) {
                // console.log("mouseup: drag");
                this._callIfDefined('mouse-drag-end', coords);
            } else {
                // console.log("mouseup: click");
                if (e.button === 0) {
                    // console.log('@@ mouse click left:', ...coords);
                    this._callIfDefined('mouse-click-left', coords);
                } else if (e.button === 1) {
                    this._callIfDefined('mouse-click-middle', coords);
                } else if (e.button === 2) {
                    // console.log('@@ mouse click right:', ...coords);
                    this._callIfDefined('mouse-click-right', coords);
                }
            }
        }, false);
    }
    _initPointerListeners(canvas) {
        let isDragging = false;
        canvas.addEventListener("pointerdown", e => {
            isDragging = false;
            const coords = Threelet.getInputCoords(e, canvas);
            // console.log('@@ pointer down:', ...coords);
            this._callIfDefined('pointer-down', coords);
        }, false);
        canvas.addEventListener("pointermove", e => {
            isDragging = true;
            const coords = Threelet.getInputCoords(e, canvas);
            // console.log('@@ pointer move:', ...coords);
            this._callIfDefined('pointer-move', coords);
        }, false);
        canvas.addEventListener("pointerup", e => {
            const coords = Threelet.getInputCoords(e, canvas);

            // console.log('@@ pointer up:', ...coords);
            this._callIfDefined('pointer-up', coords);

            if (isDragging) {
                console.log("pointerup: drag");
                this._callIfDefined('pointer-drag-end', coords);
            } else {
                console.log("pointerup: click");
                this._callIfDefined('pointer-click', coords);
            }
        }, false);
    }
    _initTouchListeners(canvas) {
        let isDragging = false;
        canvas.addEventListener("touchstart", e => {
            isDragging = false;
            const coords = Threelet.getInputCoords(e, canvas);
            // console.log('@@ touch start:', ...coords);
            this._callIfDefined('touch-start', coords);
        }, false);
        canvas.addEventListener("touchmove", e => {
            isDragging = true;
            const coords = Threelet.getInputCoords(e, canvas);
            // console.log('@@ touch move:', ...coords);
            this._callIfDefined('touch-move', coords);
        }, false);
        canvas.addEventListener("touchend", e => {
            const coords = Threelet.getInputCoords(e, canvas);

            // console.log('@@ touch end:', ...coords);
            this._callIfDefined('touch-end', coords);

            if (isDragging) {
                console.log("touchup: drag");
                this._callIfDefined('touch-drag-end', coords);
            } else {
                console.log("touchup: click");
                this._callIfDefined('touch-click', coords);
            }
        }, false);
    }

    // highlevel utils for binding input device events
    setupMouseInterface(cbs) { this._setupInputInterface('mouse', cbs); }
    setupPointerInterface(cbs) { this._setupInputInterface('pointer', cbs); }
    setupTouchInterface(cbs) { this._setupInputInterface('touch', cbs); }
    _setupInputInterface(device, callbacks) {
        const { onClick, onDrag, onDragStart, onDragEnd } = callbacks;
        let _isDragging = false;

        const downEventName = `${device}-${device === 'touch' ? 'start' : 'down'}`;
        this.on(downEventName, (mx, my) => {
            _isDragging = true;
            // console.log('@@ ifce down:', device, mx, my);
            if (onDragStart) onDragStart(mx, my);
        });

        this.on(`${device}-move`, (mx, my) => {
            if (onDrag && _isDragging) onDrag(mx, my);
        });
        this.on(`${device}-drag-end`, (mx, my) => {
            _isDragging = false;
            // console.log('@@ ifce drag end:', device, mx, my);
            if (onDragEnd) onDragEnd(mx, my);
        });
        this.on(`${device}-click`, (mx, my) => {
            _isDragging = false;
            // console.log('@@ ifce click:', device, mx, my);
            if (onClick) onClick(mx, my);
            if (onDragEnd) onDragEnd(mx, my);
        });
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

        // Work around the error: "Raycaster.camera" needs to be set in order to raycast against sprites.
        //   https://threejs.org/docs/#api/en/core/Raycaster.camera
        //   https://github.com/mrdoob/three.js/pull/16423
        this._raycaster.camera = this.camera;

        return this._raycast(meshes, recursive, faceExclude);
    }
    raycastFromMouse(mx, my, meshes, recursive=false) {
        //---- NG: 2x when starting with Chrome's inspector mobile
        // const {width, height} = this.renderer.domElement;
        // const {width, height} = this.canvas;
        //---- OK
        const {clientWidth, clientHeight} = this.canvas;

        return this._raycastFromMouse(
            mx, my, clientWidth, clientHeight, this.camera,
            meshes, recursive);
    }

    raycastFromController(i, meshes, recursive=false) {
        return this._vrcHelper.raycastFromController(
            this._vrcHelper.getControllers()[i], meshes, recursive);
    }

    static getInputCoords(e, canvas) {
        // console.log('@@ e:', e, e.type);
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch/clientX
        let x, y;
        if (e.type === 'touchend') {
            [x, y] = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
        } else if (e.type === 'touchstart' || e.type === 'touchmove') {
            [x, y] = [e.touches[0].clientX, e.touches[0].clientY];
        } else {
            [x, y] = [e.clientX, e.clientY];
        }
        // console.log('getInputCoords(): x, y:', x, y);

        // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        const rect = canvas.getBoundingClientRect();
        const [mx, my] = [x - rect.left, y - rect.top];
        // console.log('getInputCoords():', mx, my, canvas.width, canvas.height);
        return [mx, my];
    }

    capture() {
        // Without this pre-rendering, on the Silk browser,
        // the result is blacked out second time in successive captures.
        // Also relevant to this -- https://stackoverflow.com/questions/30628064/how-to-toggle-preservedrawingbuffer-in-three-js
        this.render();

        Utils.capture(this.renderer.domElement);
    }

    dispose() {
        this.onDestroy();

        this.updateLoop(0); // stop the loop
        this.update = null;

        if (this._controls) {
            this._controls.dispose();
            this._controls = null;
        }

        if (this._stats) {
            this._stats.dom.remove();
        }

        if (this._vrButton) {
            this._vrButton.remove();
        }
        if (this._arButton) {
            this._arButton.remove();
        }

        // this also ensures releasing memory for objects freed by freeScene()
        this.renderer.dispose();
        this.renderer = null;

        // recursively release child objects in the scene
        Threelet.freeScene(this.scene);
        this.scene = null;

        this.camera = null;
    }
    clearScene(opts={}) {
        const defaults = {
            needAxes: false,
        };
        const actual = Object.assign({}, defaults, opts);

        if (! this.scene) return;

        // clear objs in the scene
        this.renderer.dispose();
        Threelet.freeScene(this.scene);

        if (actual.needAxes) {
            const { walls, axes } = Threelet.createAxes();
            this.scene.add(walls, axes);
        }
    }
    static freeScene(scene) {
        this.freeChildObjects(scene, scene.children);
    }
    static freeChildObjects(_parent, _children) {
        while (_children.length > 0) {
            let ch = _children[0];
            this.freeChildObjects(ch, ch.children);
            console.log('@@ freeing: one obj:', ch.name);
            console.log(`@@ freeing obj ${ch.uuid} of ${_parent.uuid}`);
            _parent.remove(ch);
            this.disposeObject(ch);
            ch = null;
        }
    }
    static disposeObject(obj) { // https://gist.github.com/j-devel/6d0323264b6a1e47e2ee38bc8647c726
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) this.disposeMaterial(obj.material);
        if (obj.texture) obj.texture.dispose();
    }
    static disposeMaterial(mat) {
        if (mat.map && typeof mat.map.dispose === 'function') mat.map.dispose();
        if (mat && typeof mat.dispose === 'function') mat.dispose();
    }
}

Threelet.Utils = Utils;

export default Threelet;
