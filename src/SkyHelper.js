import * as THREE from 'three';

// credits: SkyHelper is based on the sky example -
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
class SkyHelper {
    constructor(classSky) {
        this._classSky = classSky;
        this._effectController = {
            turbidity: 5.2,
            rayleigh: 0.01,
            mieCoefficient: 0.002,
            mieDirectionalG: 0.9,
            inclination: 0.02,
            azimuth: 0.1,
            sun: !true
        };
        this._updateUniforms = null;
    }

    init() {
        // Add Sky
        const sky = new this._classSky();
        sky.scale.setScalar( 450000 );
        // scene.add( sky );
        // Add Sun Helper
        const sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        sunSphere.position.y = - 700000;
        sunSphere.visible = false;
        // scene.add( sunSphere );
        /// GUI
        var distance = 400000;

        // function guiChanged() {
        //-------
        this._updateUniforms = () => {
            const effectController = this._effectController;

            var uniforms = sky.material.uniforms;
            uniforms[ "turbidity" ].value = effectController.turbidity;
            uniforms[ "rayleigh" ].value = effectController.rayleigh;
            uniforms[ "mieCoefficient" ].value = effectController.mieCoefficient;
            uniforms[ "mieDirectionalG" ].value = effectController.mieDirectionalG;
            var theta = Math.PI * ( effectController.inclination - 0.5 );
            var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
            sunSphere.position.x = distance * Math.cos( phi );
            sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
            sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
            sunSphere.visible = effectController.sun;
            uniforms[ "sunPosition" ].value.copy( sunSphere.position );
            // renderer.render( scene, camera );
        };

        // var gui = new dat.GUI();
        // gui.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
        // gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
        // gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
        // gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
        // gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
        // gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
        // gui.add( effectController, "sun" ).onChange( guiChanged );
        // guiChanged();
        //--------
        this._updateUniforms(); // first time
        return [sky, sunSphere];
    }

    updateUniforms(params={}) {
        if (! this._updateUniforms) {
            throw 'updateUniforms(): error; init() must be called first';
        }
        Object.assign(this._effectController, params);
        this._updateUniforms();
    }
}

export default SkyHelper;
