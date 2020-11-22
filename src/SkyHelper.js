import * as THREE from 'three';

// credits: SkyHelper is based on the sky example -
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_shaders_sky.html
class SkyHelper {
    constructor(classSky) {
        this._classSky = classSky;
        this._effectController = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, // Facing front,
            // exposure: renderer.toneMappingExposure // TODO
        };
        this._updateUniforms = null;
    }

    init() {
        // Add Sky
        const sky = new this._classSky();
        sky.scale.setScalar( 450000 );
        // scene.add( sky );

        const sun = new THREE.Vector3();

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

            sun.x = Math.cos( phi );
            sun.y = Math.sin( phi ) * Math.sin( theta );
            sun.z = Math.sin( phi ) * Math.cos( theta );

            uniforms[ "sunPosition" ].value.copy( sun );

            // renderer.toneMappingExposure = effectController.exposure;
            // renderer.render( scene, camera );
        };

        // var gui = new dat.GUI();
        // gui.add( effectController, "turbidity", 0.0, 20.0, 0.1 ).onChange( guiChanged );
        // gui.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
        // gui.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
        // gui.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
        // gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
        // gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
        // gui.add( effectController, "exposure", 0, 1, 0.0001 ).onChange( guiChanged );
        // guiChanged();
        //--------
        this._updateUniforms(); // first time
        return sky;
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
