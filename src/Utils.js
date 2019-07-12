
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
    static loadCollada(path, cb=null) {
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_collada_skinning.html
        const loader = new THREE.ColladaLoader();
        const filter = collada => {
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
            return [object, collada];
        };
        return Utils.fetchModelData(loader, path, filter, cb);
    }

    // <script src="../deps/inflate.min.js"></script>
    // <script src="../deps/FBXLoader.js"></script>
    static loadFBX(path, cb=null) {
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_loader_fbx.html
        const loader = new THREE.FBXLoader();
        const filter = object => {
            console.log('@@ object:', object);
            object.traverse(node => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            return [object, object];
        };
        return Utils.fetchModelData(loader, path, filter, cb);
    }

    // <script src="../deps/GLTFLoader.js"></script>
    static loadGLTF(path, file, cb=null) {
        const loader = new THREE.GLTFLoader().setPath(path);
        const filter = gltf => {
            console.log('@@ gltf:', gltf);
            const object = gltf.scene;
            object.traverse(node => {
                // if (node.isMesh) {
                //     node.material.envMap = envMap;
                // }
            });
            return [object, gltf];
        };
        return Utils.fetchModelData(loader, file, filter, cb);
    }

    // filter: raw => [object, raw]
    static fetchModelData(loader, file, filter, cb=null, cbError=null) {
        // e.g. https://threejs.org/docs/#examples/loaders/GLTFLoader
        const _doLoad = (url, onSuccess, onError, onProgress=null) => {
            loader.load(url,
                raw => onSuccess(Utils._resolveAnimations(...filter(raw))),
                onProgress, // (xhr) => {}
                onError); // (error) => {}
        };

        // not using onProgress
        return Utils._cbOrPromise(_doLoad, file, cb, cbError);
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

    static createDataFlipY(data, shape) {
        const [w, h, size] = shape;
        const out = new Uint8Array(data.length);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w * size; x += size) {
                for (let i = 0; i < size; i++) {
                    out[(h-1-y) * w * size + x + i] = data[y * w * size + x + i];
                }
            }
        }
        return out;
    }

    static _cbOrPromise(f, arg0, cb, cbError) {
        return cb ? f(arg0, cb, cbError) :
            new Promise((res, rej) => f(arg0, res, rej));
    }

    static createCanvasFromImage(src, cb=null, cbError=null) {
        const _doLoad = (_src, onSuccess, onError) => {
            const img = new Image();
            img.onload = () => {
                const can = document.createElement('canvas');
                can.width = img.width;
                can.height = img.height;
                can.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                onSuccess(can);
            };
            img.onerror = (event) => onError ? onError(event) : null;
            img.src = _src;
        };
        return Utils._cbOrPromise(_doLoad, src, cb, cbError);
    }

    // https://threejs.org/docs/#api/en/geometries/PlaneGeometry
    static createCanvasPlane(can, width=1, height=1,
        widthSegments=1, heightSegments=1) {
        const geom = new THREE.PlaneGeometry(
            width, height, widthSegments, heightSegments);
        const mat = new THREE.MeshBasicMaterial({
            map: new THREE.Texture(can),
            // color: 0xffff00,
            side: THREE.DoubleSide});
        mat.map.needsUpdate = true;
        return new THREE.Mesh(geom, mat);
    }

    static createCanvasSprite(can, pixelsPerUnit=512) {
        return Utils._createSprite(
            [can.width, can.height], // shape
            new THREE.Texture(can), // map
            pixelsPerUnit);
    }
    static createDataSprite(texData, shape, pixelsPerUnit=512) {
        return Utils._createSprite(shape,
            new THREE.DataTexture(texData, shape[0], shape[1], THREE.RGBAFormat),
            pixelsPerUnit);
    }
    static _createSprite(shape, map, pixelsPerUnit) {
        const mat = new THREE.SpriteMaterial({
            map: map,
            // opacity: 0.7,
            color: 0xffffff,
        });
        mat.map.needsUpdate = true;
        const sp = new THREE.Sprite(mat);
        sp.scale.set(shape[0]/pixelsPerUnit, shape[1]/pixelsPerUnit, 1.0);
        return sp;
    }

    static downloadDataURL(dataURL, filename) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    static formatDate(date, format='YYYY-MM-DD-hh.mm.ss') {
        format = format.replace(/YYYY/g, date.getFullYear());
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
        format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
        return format;
    }

    static loadWasmBindgen(name, jsImports) {
        return new Promise(async (res, rej) => {
            try {
                // https://stackoverflow.com/questions/52239924/webassembly-instantiatestreaming-wrong-mime-type
                const response = await fetch(`${name}_bg.wasm`);
                const buffer = await response.arrayBuffer();
                // https://stackoverflow.com/questions/48039547/webassembly-typeerror-webassembly-instantiation-imports-argument-must-be-pres
                const obj = await WebAssembly.instantiate(
                    buffer, {[`${name}.js`]: jsImports});
                Object.assign(jsImports.wasm, obj.instance.exports);
                res(jsImports);
            } catch (e) {
                rej(e);
            }
        });
    }
}

export default Utils;
