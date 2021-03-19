import * as THREE from 'three';

// credits: VRControlHelper is based on the dragging example -
// r104 - https://github.com/mrdoob/three.js/blob/master/examples/webvr_dragging.html
class VRControlHelper {
    constructor(rendererXr, camera) {
        // this.controllerArmLength = 0;
        this.controllerArmLength = 0.25;
        this.controllerLineLength = 5;

        this.tempMatrix = new THREE.Matrix4();
        this.intersected = [];

        this.raycaster = new THREE.Raycaster();

        // Work around the error: "Raycaster.camera" needs to be set in order to raycast against sprites.
        //   https://threejs.org/docs/#api/en/core/Raycaster.camera
        //   https://github.com/mrdoob/three.js/pull/16423
        this.raycaster.camera = camera;

        this.group = new THREE.Group();

        this.controllers = this._createControllers(rendererXr);
        this.controllersState = {
            touchpads: [],
            triggers: [],
            poses: [],
            ids: [],
        };

        this._eventListeners = {};
        this._initInputListenersXR();
    }
    getInteractiveGroup() { return this.group; }
    getControllers() { return this.controllers; }
    getControllersState() { return this.controllersState; }

    toggleTriggerPressVisibility(i, tf) {
        this.controllers[i].getObjectByName('trigger-press').visible = tf;
    }
    toggleTouchpadPointVisibility(i, type, tf) {
        const obj = this.controllers[i].getObjectByName(`touchpad-${type}`);
        obj.visible = tf;
        if (tf === false) {
            obj.position.z = 99999; // kludge: workaround flickering
        }
    }
    updateTouchpadPoint(i, type) {
        const touchpad = this.controllersState.touchpads[i];
        const obj = this.controllers[i].getObjectByName(`touchpad-${type}`);
        obj.position.set(touchpad.axes0 * 0.025, 0.0125,
            touchpad.axes1 * 0.025 - this.controllerArmLength - 0.025);
    }
    _createControllers(rendererXr) {
        // maybe load a 3D model instead of the box
        // https://github.com/mrdoob/three.js/blob/master/examples/webvr_paint.html
        const walls = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(0.05, 0.025, 0.1)),
            new THREE.LineBasicMaterial({color: 0xcccccc}));
        walls.position.set(0, 0, - this.controllerArmLength); // customize Z for "arm" length

        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -1)]),
            new THREE.LineBasicMaterial({color: 0xcccccc}));
        line.position.set(0, 0, - this.controllerArmLength);
        line.name = 'controller-line';
        line.scale.z = this.controllerLineLength - this.controllerArmLength;

        const triggerLoop = new THREE.LineLoop(
            new THREE.CircleGeometry(0.0125, 64),
            new THREE.LineBasicMaterial({color: 0xcccccc}));
        triggerLoop.position.set(0, 0, - this.controllerArmLength - 0.05);

        const triggerCircle = new THREE.Mesh(
            new THREE.CircleGeometry(0.0125, 64),
            new THREE.MeshBasicMaterial({color: 0x00cccc}));
        triggerCircle.position.set(0, 0, - this.controllerArmLength - 0.05);
        triggerCircle.material.side = THREE.DoubleSide;
        triggerCircle.visible = false;
        triggerCircle.name = 'trigger-press';

        const padLoop = new THREE.LineLoop(
            new THREE.CircleGeometry(0.025, 64),
            new THREE.LineBasicMaterial({color: 0xcccccc}));
        padLoop.position.set(0, 0.0125, - this.controllerArmLength - 0.025);
        padLoop.rotation.x = Math.PI/2;

        const padLoopTouch = new THREE.LineLoop(
            new THREE.CircleGeometry(0.005, 64),
            new THREE.LineBasicMaterial({color: 0x00cccc}));
        padLoopTouch.position.set(0, 0.0125, - this.controllerArmLength - 0.025);
        padLoopTouch.rotation.x = Math.PI/2;
        padLoopTouch.visible = false;
        padLoopTouch.name = 'touchpad-touch';

        const padCircleTouch = new THREE.Mesh(
            new THREE.CircleGeometry(0.005, 64),
            new THREE.MeshBasicMaterial({color: 0x00cccc}));
        padCircleTouch.position.set(0, 0.0125, - this.controllerArmLength - 0.025);
        padCircleTouch.rotation.x = Math.PI/2;
        padCircleTouch.material.side = THREE.DoubleSide;
        padCircleTouch.visible = false;
        padCircleTouch.name = 'touchpad-press';

        // https://github.com/mrdoob/three.js/blob/master/examples/webvr_dragging.html
        const controllers = [0, 1].map(i => rendererXr.getController(i)
            .add(walls.clone())
            .add(line.clone())
            .add(triggerLoop.clone())
            .add(triggerCircle.clone())
            .add(padLoop.clone())
            .add(padLoopTouch.clone())
            .add(padCircleTouch.clone()));
        console.log('@@ controllers:', controllers);

        if (0) { // debug!! force show cont0 in desktop mode
            this.group.add(controllers[0]);
            controllers[0].visible = true;
        }

        return controllers;
    }

    _addSelectListener(eventName, listener) {
        this.controllers.forEach(cont => {
            cont.addEventListener(eventName, listener.bind(this));
        });
    }

    enableDragInteractiveGroup() {
        this._addSelectListener('selectstart', this.onSelectStartDrag);
        this._addSelectListener('selectend', this.onSelectEndDrag);
    }
    onSelectStartDrag( event ) {
        const controller = event.target;
        const intersections = this.getIntersections( controller, false );
        console.log('@@ onSelectStart(): intersections.length:', intersections.length);

        if ( intersections.length > 0 ) {
            const intersection = intersections[ 0 ];

            this.tempMatrix.getInverse( controller.matrixWorld );

            const object = intersection.object;
            object.matrix.premultiply( this.tempMatrix );
            object.matrix.decompose( object.position, object.quaternion, object.scale );
            if (object.material.emissive) {
                object.material.emissive.b = 1;
            }
            controller.add( object );

            controller.userData.selected = object;
        }
    }

    onSelectEndDrag( event ) {
        console.log('@@ onSelectEnd(): hi');
        const controller = event.target;
        if ( controller.userData.selected !== undefined ) {
            const object = controller.userData.selected;
            object.matrix.premultiply( controller.matrixWorld );
            object.matrix.decompose( object.position, object.quaternion, object.scale );
            if (object.material.emissive) {
                object.material.emissive.b = 0;
            }
            this.group.add( object );

            controller.userData.selected = undefined;
        }
    }

    getIntersections(controller, recursive=true) {
        // console.log('@@ getIntersections(): hi');
        return this.raycastFromController(
            controller, this.group.children, recursive);
    }
    raycastFromController(controller, objs, recursive=true) {
        this.tempMatrix.identity().extractRotation( controller.matrixWorld );
        this.raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
        this.raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( this.tempMatrix );
        return this.raycaster.intersectObjects( objs, recursive );
    }

    // DEPRECATED - valid only for WebVR 1.1
    // mod of findGamepad() of three.js r104
    static _findGamepad(id) {
        const gamepads = navigator.getGamepads && navigator.getGamepads();
        for ( let i = 0, j = 0, l = gamepads.length; i < l; i ++ ) {
            const gamepad = gamepads[ i ];
            if ( gamepad && ( gamepad.id === 'Daydream Controller' ||
                gamepad.id === 'Gear VR Controller' || gamepad.id === 'Oculus Go Controller' ||
                gamepad.id === 'OpenVR Gamepad' || gamepad.id.startsWith( 'Oculus Touch' ) ||
                gamepad.id.startsWith( 'HTC Vive Focus' ) ||
                gamepad.id.startsWith( 'Spatial Controller' ) ) ) {
                if ( j === id ) return gamepad;
                j ++;
            }
        }
    }

    // DEPRECATED - valid only for WebVR 1.1
    // mod of updateControllers() of three.js r104
    updateControllers() {
        const stat = this.controllersState;

        for (let i = 0; i < this.controllers.length; i ++ ) {
            const controller = this.controllers[i];
            const gamepad = VRControlHelper._findGamepad(i);
            // console.log('@@ updateControllers(): i, gamepad:', i, gamepad);

            if (gamepad === undefined ||
                gamepad.pose === undefined ||
                gamepad.pose === null) {
                // this controller seems lost; reset the state
                stat.triggers[i] = undefined;
                stat.touchpads[i] = undefined;
                stat.poses[i] = undefined;
                stat.ids[i] = undefined;
                return;
            }

            const buttonId = gamepad.id === 'Daydream Controller' ? 0 : 1; // for trigger
            const buttonIdTouchpad = 0;

            stat.poses[i] = gamepad.pose;
            stat.ids[i] = gamepad.id;

            if (0) { // debug with Oculus Go controller
                const [b0, b1] = gamepad.buttons; // touchpad, trigger in case of Oculus Go
                if (b0.pressed || b0.touched || b1.pressed || b1.touched) {
                    console.log('@@ ======== pressed/touched ========');
                    console.log('@@ i, b0, b1:', i, b0, b1);
                    // @@ observations on Oculus Go (always i == 0)
                    // b0 (touchpad) {pressed: false, value: 0, touched: true}
                    // b0 (touchpad) {pressed: true, value: 1, touched: true}
                    // b1 (trigger) {pressed: true, value: 1, touched: true}
                    console.log('@@ gamepad.axes:', gamepad.axes);
                    //             axes[1]=-1.0
                    // axes[0]=-1.0            axes[0]=+1.0
                    //             axes[1]=+1.0
                    //----
                    console.log('@@ gamepad:', gamepad);
                }
            }

            //-------- begin touchpad handling --------
            const touched = gamepad.buttons[buttonIdTouchpad].touched;
            const pressed = gamepad.buttons[buttonIdTouchpad].pressed;
            const axes0 = gamepad.axes[0];
            const axes1 = gamepad.axes[1];

            if (stat.touchpads[i] === undefined) {
                stat.touchpads[i] = {
                    touched: false,
                    pressed: false,
                    axes0: 0,
                    axes1: 0,
                };
            };
            const touchpad = stat.touchpads[i];

            if (touchpad.touched !== touched) {
                const func = touched === true ?
                    this._eventListeners['vr-touchpad-touch-start'] :
                    this._eventListeners['vr-touchpad-touch-end'];
                if (func) func(i, axes0, axes1);
            }

            if (touchpad.pressed !== pressed) {
                const func = pressed === true ?
                    this._eventListeners['vr-touchpad-press-start'] :
                    this._eventListeners['vr-touchpad-press-end'];
                if (func) func(i, axes0, axes1);
            }

            // diff touchpad states done; record the new state now
            touchpad.touched = touched;
            touchpad.pressed = pressed;
            touchpad.axes0 = axes0;
            touchpad.axes1 = axes1;
            //-------- end touchpad handling --------

            const trigger = gamepad.buttons[buttonId].pressed;

            if (stat.triggers[i] === undefined) stat.triggers[i] = false;

            if (stat.triggers[i] !== trigger) {
                stat.triggers[i] = trigger;
                const func = stat.triggers[i] === true ?
                    this._eventListeners['vr-trigger-press-start'] :
                    this._eventListeners['vr-trigger-press-end'];
                if (func) func(i);
            }
        }
    }

    // TODO: establish `xr-touchpad-{touch,press}-{start,end}` listeners
    _initInputListenersXR() {
        const listenerFor = name => event => {
            const cb = this._eventListeners[name];
            if (cb) {
                const uuid = event.target.uuid;
                for (let idx of [0, 1]) {
                    const cont = this.controllers[idx];
                    if (cont && cont.uuid === uuid) cb(idx);
                }
            }
        };
        this._addSelectListener(
            'selectstart', listenerFor('xr-trigger-press-start'));
        this._addSelectListener(
            'selectend', listenerFor('xr-trigger-press-end'));
    }

    intersectObjects() {
        this._cleanIntersected();
        for (let cont of this.controllers) {
            if (cont) this._intersectObjects(cont);
        }
    }
    _intersectObjects( controller ) {
        // console.log('@@ intersectObjects(): hi');
        // Do not highlight when already selected
        if ( controller.userData.selected !== undefined ) return;

        const intersections = this.getIntersections( controller );
        // console.log('@@ intersections:', intersections);

        const line = controller.getObjectByName( 'controller-line' );
        if ( intersections.length > 0 ) {
            const intersection = intersections[ 0 ];
            const object = intersection.object;
            if (object.material.emissive) {
                object.material.emissive.r = 1;
            }
            this.intersected.push( object );
            // console.log('@@ intersection.distance:', intersection.distance);
            line.scale.z = intersection.distance - this.controllerArmLength;
        } else {
            line.scale.z = this.controllerLineLength - this.controllerArmLength;
        }
    }

    _cleanIntersected() {
        // console.log('@@ cleanIntersected(): hi');
        while ( this.intersected.length ) {
            const object = this.intersected.pop();
            if (object.material.emissive) {
                object.material.emissive.r = 0;
            }
        }
    }
}

export default VRControlHelper;
