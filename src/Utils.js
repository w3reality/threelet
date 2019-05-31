
class Utils {
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
    static createTestObjects(offset=[0, 1, -2]) {
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
            object.position.set(
                2*Math.random() -1 + offset[0],
                2*Math.random() -1 + offset[1],
                2*Math.random() -1 + offset[2]);
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

    static createTestCube(size=[0.4, 0.1, 0.4], color=0xff00ff, wireframe=false) {
        const cube = new THREE.Mesh(
                new THREE.BoxGeometry(...size),
                new THREE.MeshBasicMaterial({
                    color: color,
                    wireframe: wireframe,
                }));
        cube.position.set(0, 0.5, -1.5);
        return cube;
    }


    // <script src="../deps/ColladaLoader.js"></script>
    static loadCollada(path, cb) {
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_collada_skinning.html
        const loader = new THREE.ColladaLoader();
        const onLoaded = (collada, _cb) => {
            const object = collada.scene;
            console.log('@@ object:', object);
            object.traverse(node => {
                // console.log('@@ node:', node);
                // console.log('@@ node.type:', node.type);
                if (node.isSkinnedMesh) {
                    node.frustumCulled = false;
                    // node.material.wireframe = true; // @@ debug
                }
            });
            _cb(Utils._resolveAnimations(object, collada));
        };
        return Utils._returnModelData(loader, path, onLoaded, cb);
    }

    // <script src="../deps/inflate.min.js"></script>
    // <script src="../deps/FBXLoader.js"></script>
    static loadFBX(path, cb=null) {
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_fbx.html
        const loader = new THREE.FBXLoader();
        const onLoaded = (object, _cb) => {
            console.log('@@ object:', object);
            object.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            _cb(Utils._resolveAnimations(object, object));
        };
        return Utils._returnModelData(loader, path, onLoaded, cb);
    }

    // <script src="../deps/GLTFLoader.js"></script>
    static loadGLTF(path, file, cb=null) {
        const loader = new THREE.GLTFLoader().setPath(path);
        const onLoaded = (gltf, _cb) => {
            console.log('@@ gltf:', gltf);
            const object = gltf.scene;
            object.traverse(node => {
                // if (node.isMesh) {
                //     node.material.envMap = envMap;
                // }
            });
            _cb(Utils._resolveAnimations(object, gltf));
        };
        return Utils._returnModelData(loader, file, onLoaded, cb);
    }

    static _returnModelData(loader, file, onLoaded, cb) {
        return cb ? loader.load(file, raw => onLoaded(raw, cb)) :
            new Promise((res, rej) => {
                loader.load(file, raw => onLoaded(raw, res));
            });
    }

    // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_gltf_extensions.html
    // https://threejs.org/docs/manual/en/introduction/Animation-system.html
    static _resolveAnimations(object, raw) {
        const animations = raw.animations;
        let mixer = null;
        const actions = [];
        if (animations && animations.length) {
            mixer = new THREE.AnimationMixer(object);
            for (let anim of animations) {
                actions.push(mixer.clipAction(anim).play());
            }
        }
        console.log('@@ actions:', actions);
        return { // modelData
            object: object,
            mixer: mixer,
            actions: actions,
            raw: raw,
        };
    }
}

export default Utils;
