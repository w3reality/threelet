
class PlaneApp extends Threelet {
    // override
    onCreate(params={}) {
        const controls = this.setup('mod-controls', THREE.OrbitControls);
        controls.enableRotate = false;
        // controls.enablePan = false;
        this.controls = controls;

        // this.setup('mod-stats', window.Stats, {panelType: 0}); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.setup('mod-webvr', window.WEBVR);
        this.setup('mod-sky', THREE.Sky);

        const _planeCanvas = PlaneApp.createPlaneCanvas(params.paintAreaColor);
        this.planeCtx = _planeCanvas.getContext('2d');
        this.selector = PlaneApp.createSelector(_planeCanvas);
        this.plane = this.selector.getObjectByName('plane');
        this.drawTitle(this.planeCtx);
        this.drawCommands(this.planeCtx);

        this.selector.add(PlaneApp.createMarker('commandMarker'));

        const group = this.getInteractiveGroup();
        group.add(this.selector); // for ray not passing ghrough the selector surface
        this.scene.add(group);

        this.scene.add(Threelet.Utils.createTestHemisphereLight());
        this.scene.add(Threelet.Utils.createTestDirectionalLight());
        this.scene.add(new THREE.GridHelper(10, 20));

        const inputCallbacks = {
            onClick: (mx, my) => {
                const isec = this.mouseToPlaneIntersect(mx, my);
                // console.log('@@ onClick(): isec:', isec);
                if (isec && PlaneApp.isPointOnLeftSquare(isec.point)) {
                    // console.log('@@ isec.faceIndex:', isec.faceIndex);
                    this.onLeftPlaneClicked(isec.faceIndex);
                }
            },
        };

        if (1) {
            if (Threelet.isVrSupported()) { // Oculus Go, desktop-firefox
                // KLUDGE - when in desktop mode, Oculus browser triggers
                //   both mouse/touch events at a time.
                //   also, mouse-drag events seems not being fired...
                //   So, enabling only pointer events here
                //   (touch events NG for desktop-firefox).
                this.setupPointerInterface(inputCallbacks);
            } else { // desktop-chrome, desktop-safari
                this.setupMouseInterface(inputCallbacks);
                this.setupTouchInterface(inputCallbacks);
            }
        } else { // requires iOS >= 13
            this.setupPointerInterface(inputCallbacks);
        }


        this._vrPressPlaneStart = [-1, -1]; // faceIndex per controller i
        this.on('vr-trigger-press-start', (i) => {
            const isec = this.vrcontrollerToPlaneIntersect(i);
            if (isec) {
                console.log('@@ vr-press-start');
                this._vrPressPlaneStart[i] = isec.faceIndex;
                // this.invokeSigPadCall('_strokeBegin', isec.point.x, isec.point.y);
            } else {
                this._vrPressPlaneStart[i] = -1;
            }
        });
        this.on('vr-trigger-press-end', (i) => {
            // this.invokeSigPadCall('_strokeEnd', -1, -1);
            if (this._vrPressPlaneStart[i] < 0) return;

            const lastFaceIndex = this._vrPressPlaneStart[i];
            this._vrPressPlaneStart[i] = -1;

            // check vr-click
            const isec = this.vrcontrollerToPlaneIntersect(i);
            if (isec) {
                const faceIndex = isec.faceIndex;
                console.log('@@ vr-press-end; faceIndex:', faceIndex);
                if (Math.floor(faceIndex/2) ===
                    Math.floor(lastFaceIndex/2)) {
                    console.log('@@ vr-click fulfilled for faceIndex:', faceIndex);
                    if (isec && PlaneApp.isPointOnLeftSquare(isec.point)) {
                        this.onLeftPlaneClicked(isec.faceIndex);
                    }
                }
            }
        });

        this.scene.add(this.getInteractiveGroup());

        if (params.debugCube) {
            this.cube = Threelet.Utils.createTestCube([0.4, 0.1, 0.4], 0xff00ff);
            this.scene.add(this.cube);
        }
    } // end onCreate()

    setPlaneNeedsUpdate(tf) {
        this.plane.material.map.needsUpdate = tf;
    }

    // override
    onUpdate(t, dt) {
        if (this.cube) {
            this.cube.position.set(Math.cos(t), 0.5, Math.sin(t));
            this.cube.rotation.z += dt;
        }
    }

    // px, py:
    // -2,2    0,2    2,2
    //     left   right
    // -2,0    0,0    2,0
    static isPointOnLeftSquare(pt) {
        return pt.x < 0 && pt.x > -2 && pt.y > 0 && pt.y < 2;
    }
    static isPointOnRightSquare(pt) {
        return pt.x > 0 && pt.x < 2 && pt.y > 0 && pt.y < 2;
    }
    mouseToPlaneIntersect(mx, my) {
        const isec = this.raycastFromMouse(mx, my, [this.plane], false);
        return isec ? isec : null;
    }
    vrcontrollerToPlaneIntersect(i) {
        return this.raycastFromController(i, [this.plane], false)[0];
    };

    static createMarker(name) {
        const markerCanvas = document.createElement('canvas');
        markerCanvas.width = 64;
        markerCanvas.height = 32;
        const ctx = markerCanvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, -6+32, markerCanvas.width, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, -4+32, markerCanvas.width, 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, -2+32, markerCanvas.width, 2);
        const marker = Threelet.Utils.createCanvasPlane(markerCanvas, 0.5, 0.25);
        marker.material.map.magFilter = THREE.NearestFilter;
        marker.material.map.minFilter = THREE.NearestFilter;
        marker.material.transparent = true;
        marker.material.opacity = 0.5;
        marker.name = name;
        marker.visible = false;
        return marker;
    }
    static createSelector(planeCanvas) {
        const selector = new THREE.Group();
        Threelet.hasVrDisplay(tf => selector.position.set(0, 1, tf ? -3.5 : -0.5));

        const plane = Threelet.Utils.createCanvasPlane(planeCanvas, 4, 2, 8, 8);
        if (0) { // control tex opacity
            plane.material.transparent = true;
            plane.material.opacity = 0.9;
        }
        if (1) { // control tex sharpness
            plane.material.map.magFilter = THREE.NearestFilter;
            plane.material.map.minFilter = THREE.NearestFilter;
        }

        plane.name = 'plane';
        selector.add(plane);

        return selector;
    }

    drawInfo(lines) {
        const ctx = this.planeCtx;
        ctx.fillStyle = '#cccccc';
        ctx.font = '13px monospace';

        let offset = 3;
        for (let line of lines) {
            ctx.fillText(line, 8, (offset++)*32+20);
        }
    }
    clearPaintArea(color='#fff') {
        PlaneApp._clearPaintArea(this.planeCtx, color);
    }
    static _clearPaintArea(ctx, color='#fff') {
        // ctx.fillStyle = '#000';
        // ctx.fillRect(256, 0, 256, 256);
        // ctx.fillStyle = '#fff';
        // ctx.fillRect(256+16, 16, 224, 224);
        //----
        // const clearColor = '#fff';
        // const clearColor = `#${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}${Math.floor(Math.random()*9)}`;
        // console.log('clearColor:', clearColor);
        // ctx.fillStyle = clearColor;
        // ctx.fillRect(256, 0, 256, 256);
        //----
        ctx.fillStyle = color;
        ctx.fillRect(256, 0, 256, 256);
    }

    static createPlaneCanvas(paintAreaColor='#fff') {
        const planeCanvas = document.createElement('canvas');
        planeCanvas.width = 512;
        planeCanvas.height = 256;

        const planeCtx = planeCanvas.getContext('2d');
        planeCtx.fillStyle = '#222';
        planeCtx.fillRect(0, 0, 256, 256);
        PlaneApp._clearPaintArea(planeCtx, paintAreaColor);

        return planeCanvas;
    }

    getMarker(name) {
        return this.selector.getObjectByName(name);
    }

    // abstract
    drawTitle(ctx) {
        throw 'drawTitle() not implemented';
    }

    // abstract
    drawCommands(ctx) {
        throw 'drawCommands() not implemented';
    }

    // abstract
    onLeftPlaneClicked(faceIndex) {
        throw 'onLeftPlaneClicked() not implemented';
    }
}
Threelet.PlaneApp = PlaneApp;
