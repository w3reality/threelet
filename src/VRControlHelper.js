
// credits: VRControlHelper is based on the dragging example -
// https://github.com/mrdoob/three.js/blob/master/examples/webvr_dragging.html
class VRControlHelper {
    constructor(renderer) {
        // this.controllerArmLength = 0;
        this.controllerArmLength = 0.25;
        this.controllerLineLength = 5;

        this.tempMatrix = new THREE.Matrix4();
        this.raycaster = new THREE.Raycaster();
        this.intersected = [];

        this.group = new THREE.Group();

        this.controllers = this._createControllers(renderer);
        this.controllersState = {
            touchpads: [],
            triggers: [],
            poses: [],
            ids: [],
        }

        this._eventListeners = {};
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
    _createControllers(renderer) {
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
        triggerLoop.geometry.vertices.shift(); // remove the center vertex
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
        padLoop.geometry.vertices.shift(); // remove the center vertex
        padLoop.position.set(0, 0.0125, - this.controllerArmLength - 0.025);
        padLoop.rotation.x = Math.PI/2;

        const padLoopTouch = new THREE.LineLoop(
            new THREE.CircleGeometry(0.005, 64),
            new THREE.LineBasicMaterial({color: 0x00cccc}));
        padLoopTouch.geometry.vertices.shift(); // remove the center vertex
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
        const controllers = [0, 1].map(i => renderer.vr.getController(i)
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

    // mod of findGamepad() of three.js r104
    static _findGamepad(id) {
        const gamepads = navigator.getGamepads && navigator.getGamepads();
        for ( let i = 0, j = 0, l = gamepads.length; i < l; i ++ ) {
            const gamepad = gamepads[ i ];
            if ( gamepad && ( gamepad.id === 'Daydream Controller' ||
                gamepad.id === 'Gear VR Controller' || gamepad.id === 'Oculus Go Controller' ||
                gamepad.id === 'OpenVR Gamepad' || gamepad.id.startsWith( 'Oculus Touch' ) ||
                gamepad.id.startsWith( 'Spatial Controller' ) ) ) {
                if ( j === id ) return gamepad;
                j ++;
            }
        }
    }
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

    intersectObjects() {
        this._cleanIntersected();
        if (this.controllers[0]) {
            this._intersectObjects(this.controllers[0]);
        }
        if (this.controllers[1]) {
            this._intersectObjects(this.controllers[1]);
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

    static createTestHemisphereLight() {
        return new THREE.HemisphereLight(0x808080, 0x606060);
    }
    static createTestDirectionalLight() {
        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 6, 0 );
        light.castShadow = true;
        light.shadow.camera.top = 2;
        light.shadow.camera.bottom = - 2;
        light.shadow.camera.right = 2;
        light.shadow.camera.left = - 2;
        light.shadow.mapSize.set( 4096, 4096 );
        return light;
    }
    static createTestObjects() {
        const objs = [];
        const geoms = [
            new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 ),
            new THREE.ConeBufferGeometry( 0.2, 0.2, 64 ),
            new THREE.CylinderBufferGeometry( 0.2, 0.2, 0.2, 64 ),
            new THREE.IcosahedronBufferGeometry( 0.2, 3 ),
            new THREE.TorusBufferGeometry( 0.2, 0.04, 64, 32 )
        ];
        for (let geom of geoms) {
            const object = new THREE.Mesh(geom,
                new THREE.MeshStandardMaterial({
                    color: Math.random() * 0xffffff,
                    roughness: 0.7,
                    metalness: 0.0
                }));
            object.position.set(2*Math.random(), 2*Math.random(), -1);
            // console.log('@@ object:', object);
            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;
            object.scale.setScalar( Math.random() + 0.5 );
            object.castShadow = true;
            object.receiveShadow = true;
            objs.push(object);
        }
        return objs;
    }
}

export default VRControlHelper;
