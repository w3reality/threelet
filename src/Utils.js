
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
        loader.load(path, collada => {
            const avatar = collada.scene;
            console.log('@@ avatar:', avatar);
            avatar.traverse(node => {
                // console.log('@@ node:', node);
                // console.log('@@ node.type:', node.type);
                if (node.isSkinnedMesh) {
                    node.frustumCulled = false;
                    // node.material.wireframe = true; // @@ debug
                }
            });
            const mixer = new THREE.AnimationMixer(avatar);
            const action = mixer.clipAction(collada.animations[0]).play();
            cb(avatar, mixer);
        });
    }

    // <script src="../deps/inflate.min.js"></script>
    // <script src="../deps/FBXLoader.js"></script>
    static loadFBX(path, cb) {
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_fbx.html
        const loader = new THREE.FBXLoader();
        loader.load(path, object => {
            const mixer = new THREE.AnimationMixer(object);
            const action = mixer.clipAction(object.animations[0]);
            action.play();
            object.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            cb(object, mixer);
        });
    }
}

export default Utils;
