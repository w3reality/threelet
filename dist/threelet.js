// Threelet - https://github.com/w3reality/threelet
// A portable standalone viewer for THREE objects (MIT License)

class Threelet {
    constructor(params) {
        this.version = "0.9.0"
        const defaults = {
            canvas: null,
            optClassControls: null,
            optClassStats: null,
            optScene: null,
        };
        const actual = Object.assign({}, defaults, params);

        const canvas = actual.canvas;
        const classControls = actual.optClassControls;
        const classStats = actual.optClassStats;
        const optScene = actual.optScene;

        if (! canvas) {
            console.error('error: canvas not provided');
            return;
        }

        // basic rendering
        [this.camera, this.scene, this.renderer, this.render] =
            Threelet._init(canvas, classControls, classStats, optScene);

        // mouse interaction
        this.onClickLeft = null;
        this.onClickRight = null;
        this._initMouseListeners(canvas);

        // raycasting
        this._raycaster = new THREE.Raycaster();;

        // rendering loop and scene logic update
        this.clock = new THREE.Clock();
        this.timeLast = this.clock.getElapsedTime();
        this.iid = null;
        this.update = null;

        this.onCreate();
    }
    onCreate() {
        this.render(); // first time
    }
    onDestroy() {
        // TODO ??
    }

    updateLoop(fps) {
        if (this.iid !== null) {
            // console.log('@@ updateLoop(): clearing interval:', this.iid);
            clearInterval(this.iid);
        }

        if (fps <= 0) return; // stop the loop

        // FIXME for this naive dev version, not looping with rAF()...
        this.iid = setInterval(() => {
            const time = this.clock.getElapsedTime();
            const dt = time - this.timeLast;
            this.timeLast = time;
            if (this.update) { // update for the scene logic
                this.update(time, dt);
            }
            this.render();
        }, 1000/fps);
        // console.log('@@ updateLoop(): new interval:', this.iid);
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

    static _init(canvas, classControls, classStats, optScene) {
        const camera = new THREE.PerspectiveCamera(75, canvas.width/canvas.height, 0.001, 1000);
        camera.position.set(0, 0, 5.0);
        camera.up.set(0, 0, 1); // important for OrbitControls

        const renderer = new THREE.WebGLRenderer({
            // alpha: true,
            canvas: canvas,
        });
        console.log('renderer:', renderer);

        const resizeCanvas = (force=false) => {
            Threelet._resizeCanvasToDisplaySize(
                renderer, canvas, camera, force);
        };
        resizeCanvas(true); // first time

        // init basic objects --------
        const scene = optScene ? optScene : new THREE.Scene();
        const walls = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(1, 1, 1)),
            new THREE.LineBasicMaterial({color: 0xcccccc}));
        walls.position.set(0, 0, 0);
        walls.name = 'walls';
        scene.add(walls);
        const axes = new THREE.AxesHelper(1);
        axes.name = 'axes';
        scene.add(axes);

        // init render stuff --------
        let stats = null;
        if (classStats) {
            stats = new classStats();
            stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            const statsDom = stats.dom;
            // statsDom.style.top = '90%';
            document.body.appendChild(statsDom);
        }
        const render = () => {
            if (stats) {
                stats.update();
            }
            resizeCanvas();
            renderer.render(scene, camera);
        };

        if (classControls) {
            const controls = new classControls(camera, renderer.domElement);
            controls.addEventListener('change', render);
        }

        return [camera, scene, renderer, render];
    }

    // TODO freeRendererAndScenes()

    // https://stackoverflow.com/questions/29884485/threejs-canvas-size-based-on-container
    static _resizeCanvasToDisplaySize(renderer, canvas, camera, force=false) {
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

    _initMouseListeners(canvas) {
        // https://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
        let isDragging = false; // in closure
        canvas.addEventListener("mousedown", e => {
            isDragging = false;
        }, false);
        canvas.addEventListener("mousemove", e => {
            isDragging = true;
            // const coords = Threelet.getMouseCoords(e);
            // console.log('@@ mouse move:', coords[0], coords[1]);
        }, false);
        canvas.addEventListener("mouseup", e => {
            // console.log('e:', e);
            if (isDragging) {
                // console.log("mouseup: drag");
                // nop
            } else {
                // console.log("mouseup: click");
                const coords = Threelet.getMouseCoords(e);
                if (e.button === 0) {
                    // console.log('@@ mouse click left:', coords[0], coords[1]);
                    if (this.onClickLeft) {
                        this.onClickLeft(coords[0], coords[1]);
                    }
                } else if (e.button === 2) {
                    // console.log('@@ mouse click right:', coords[0], coords[1]);
                    if (this.onClickRight) {
                        this.onClickRight(coords[0], coords[1]);
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
    _raycastFromCamera(mx, my, width, height, cam, meshes, recursive=false) {
        const mouse = new THREE.Vector2( // normalized (-1 to +1)
            (mx / width) * 2 - 1,
            - (my / height) * 2 + 1);
        // https://threejs.org/docs/#api/core/Raycaster
        // update the picking ray with the camera and mouse position
        this._raycaster.setFromCamera(mouse, cam);
        return this._raycast(meshes, recursive, null);
    }
    raycast(origin, direction, meshes, faceExclude=null, recursive=false) {
        this._raycaster.set(origin, direction);
        return this._raycast(meshes, recursive, faceExclude);
    }
    raycastFromCamera(mx, my, meshes, recursive=false) {
        const {width, height} = this.renderer.domElement;
        return this._raycastFromCamera(
            mx, my, width, height, this.camera,
            meshes, recursive);
    }

    static freeObjects(scene, namePrefix) {
        // https://stackoverflow.com/questions/35060831/how-to-remove-all-mesh-objects-from-the-scene-in-three-js
        for (let i = scene.children.length - 1; i >= 0; i--) {
            let ch = scene.children[i];
            if (ch.name.startsWith(namePrefix)) {
                scene.remove(ch);
                Threelet.disposeObject(ch);
            }
        }
    }
    static disposeMaterial(mat) {
        if (mat.map) mat.map.dispose();
        mat.dispose();
    }
    static disposeObject(obj) { // cf. https://gist.github.com/j-devel/6d0323264b6a1e47e2ee38bc8647c726
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) Threelet.disposeMaterial(obj.material);
        if (obj.texture) obj.texture.dispose();
    }

    static getMouseCoords(e) {
        // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        // console.log('getMouseCoords():', mx, my, canvas.width, canvas.height);
        return [mx, my];
    }
}
export default Threelet;
