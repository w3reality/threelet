// TODO to be more categorically organized in future

class Logger {
    constructor(opts={}) {
        const defaults = {
            mute: true,
        };
        const actual = Object.assign({}, defaults, opts);
        this._mute = actual.mute;

        this.times = [];
        this.splits = [];
        this.arg0s = [];

        this._last = performance.now()/1000;
    }

    static _consoleLog(...args) {
        const _log = console.log; // for eluding uglify
        _log(...args);
    }

    log(...args) {
        const now = performance.now()/1000;
        const splits = now - this._last;
        this.times.push(now);
        this.splits.push(splits);
        this.arg0s.push(args[0]);

        this._last = now;
        if (! this._mute) {
            Logger._consoleLog(`==== ${now.toFixed(3)} +${splits.toFixed(3)} ====`, ...args);
        }
    }
    grep(query) {
        const idxs = this.arg0s.reduce((acc, val, idx) => {
            if (typeof val !== 'string') {
                Logger._consoleLog('grep(): warning: not a string');
                return acc;
            } else if (val.includes(query)) {
                acc.push(idx);
            }
            return acc;
        }, []);
        // console.log('idxs:', idxs);

        return {
            times: idxs.map(i => this.times[i]),
            splits: idxs.map(i => this.splits[i]),
            arg0s: idxs.map(i => this.arg0s[i]),
        }
    }
}

class Utils {
    //======== begin test obj utils ========
    static createLineBox(dim, color=0xcccccc) {
        return new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxBufferGeometry(...dim)),
            new THREE.LineBasicMaterial({color: color}));
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
    //======== end test obj utils ========

    //======== begin 3D model utils ========

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

    //======== end 3D model utils ========

    //======== begin composition utils ========

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

    static createCanvasFromText(text, width, height, opts={}) {
        const defaults = {
            bg: "#fff",
            tbg: "#fff",
            tfg: "#000",
            fontSize: "13px",
            // fontFamily: "Times",
            fontFamily: "monospace", // https://stackoverflow.com/questions/4686754/making-every-character-on-a-web-page-the-same-width
            offset: [25, 35],
        };
        const actual = Object.assign({}, defaults, opts);

        const can = document.createElement("canvas");
        can.width = width;
        can.height = height;

        const ctx = can.getContext("2d");
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        text = text.replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/, "\"");
        const [w, h] = [ctx.measureText(text).width + 16, 45];

        // ctx.font = `48px ${actual.fontFamily}`;
        // ctx.font = `36px ${actual.fontFamily}`;
        ctx.font = `${actual.fontSize} ${actual.fontFamily}`;

        ctx.fillStyle = actual.bg;
        ctx.fillRect(0, 0, can.width, can.height);

        ctx.fillStyle = actual.tbg;
        ctx.fillRect(0, 0, w, 45);

        ctx.fillStyle = actual.tfg;
        // ctx.fillText(text, 25, 35+25); // ok for 256, 128
        // ctx.fillText(text, 25, 35); // ok for 256, 64
        ctx.fillText(text, ...actual.offset);

        return can;
    }

    // https://threejs.org/docs/#api/en/geometries/PlaneGeometry
    static createCanvasPlane(can, width=1, height=1, widthSegments=1, heightSegments=1) {
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

    static pixelsToMesh(pixels) {
        const positions = [];
        const colors = [];

        // positions.push(0,0,0,  0.5,0,0,  0,0.5,0);
        // colors.push(0,255,0,100,  0,255,0,100,  0,255,0,100);
        //----
        let x = 0, y = pixels.shape[1] - 1, z = 0;
        for (let e = 0; e < pixels.data.length; e += 4) {
            let [r, g, b, a] = [pixels.data[e], pixels.data[e+1], pixels.data[e+2], pixels.data[e+3]];
            colors.push(r,g,b,a,  r,g,b,a,  r,g,b,a);
            z = (r + g + b) / (255*3) * 0.01; // "normalized" intensity x maxThickness
            positions.push(x/1000,y/1000,z,  x/1000+0.001,y/1000,z,  x/1000,y/1000+0.001,z);
            x++;
            if (x === pixels.shape[0]) { // wrap
                x = 0;
                y--;
            }
        }

        // console.log('positions:', positions);
        // console.log('colors:', colors);
        return this.vertsToMesh(positions, colors);
    }

    static vertsToMesh(positions, colors) {
        const colorAttribute = new THREE.Uint8BufferAttribute(colors, 4); // note: "dupe" the colors array
        colorAttribute.normalized = true; // map to 0.0f - +1.0f in the shader
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute('position',
            new THREE.Float32BufferAttribute(positions, 3)); // note: "dupe" the positions array
        geometry.addAttribute('color', colorAttribute);
        const vs = `
            precision mediump float;
            precision mediump int;
            uniform mat4 modelViewMatrix; // optional
            uniform mat4 projectionMatrix; // optional
            attribute vec3 position;
            attribute vec4 color;
            varying vec3 vPosition;
            varying vec4 vColor;
            void main()	{
                vPosition = position;
                vColor = color;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `;
        const fs = `
            precision mediump float;
            precision mediump int;
            uniform float time;
            varying vec3 vPosition;
            varying vec4 vColor;
            void main()	{
                vec4 color = vec4( vColor );
                //color.r += sin( vPosition.x * 10.0 + time ) * 0.5;
                gl_FragColor = color;
            }
        `;
        const uni = {
            time: { value: 1.0 },
        };
        const material = new THREE.RawShaderMaterial({
            uniforms: uni,
            vertexShader: vs,
            fragmentShader: fs,
            side: THREE.DoubleSide,
            transparent: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        return {
            mesh: mesh,
            uniforms: uni,
        };
    }
    static createBufferGeometryMesh(positions, colors, scale=1.0) {
        const mesh = this.vertsToMesh(positions, colors).mesh;
        mesh.geometry.scale(scale, scale, scale);
        return mesh;
    }

    //======== end composition utils ========

    //======== begin misc utils ========

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
            // https://rustwasm.github.io/docs/book/reference/deploying-to-production.html
            // This approach is not the fastest like using WebAssembly.instantiateStreaming,
            // but it can work around the application/wasm MIME Type requirement.
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

    static createLogger(opts) {
        return new Logger(opts);
    }
    //======== end misc utils ========
}

Utils.Logger = Logger;

export default Utils;
