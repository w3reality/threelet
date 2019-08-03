
class TemplateUtils {

    // some math stuff...
    static sum(arr) { return arr.reduce((acc, val) => acc + val, 0); }
    static ave(arr) { return this.sum(arr) / arr.length; }
    static std(arr, unbiased=true) {
        // https://en.wikipedia.org/wiki/Standard_deviation#Corrected_sample_standard_deviation
        // https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4175406/
        const _ave = this.ave(arr);
        return Math.sqrt(this.sum(arr.map(val => (val - _ave)**2))
            / (unbiased ? arr.length - 1 : arr.length));
    }

    static createStatsFromSamples(samples) {
        // tests agrees with the results in https://mathjs.org/docs/reference/functions/std.html
        // const y = [2, 4, 6, 8];
        // console.log(this.ave(y), this.std(y), this.std(y, false));
        //----
        const ave = this.ave(samples);
        const std = this.std(samples);
        console.log('ave, std:', ave, std);

        // sprite
        const can = Threelet.Utils.createCanvasFromText(
            `ave: ${ave.toFixed(3)} std: ${std.toFixed(3)}`, 256, 64, {tfg: '#0cc'});
        const sp = Threelet.Utils.createCanvasSprite(can, 1024*3.0);
        sp.position.x = -0.1;
        sp.position.y = ave + 0.02;

        // bar
        const ls = Threelet.Utils.createLineBox([0.05, ave, 0.05], 0x00cccc);
        ls.position.y = ave / 2;

        // std bar
        const sq = Threelet.Utils.createLineBox([0.025, 2*std, 0.025], 0x00cccc);
        sq.position.y = ave;

        return (new THREE.Group()).add(sp, ls, sq);
    }
    static createSamplesObject(samples) {
        const group = new THREE.Group();

        samples.forEach((sample, idx) => {
            const height = sample;
            const offset = [(idx+1)/10, 0, 0]; // TODO; 10 hardcoded

            // sprite
            const can = Threelet.Utils.createCanvasFromText(
                `${height.toFixed(3)}`, 256, 64, {tfg: '#000'});
            const sp = Threelet.Utils.createCanvasSprite(can, 1024*3.0);
            sp.position.x = offset[0];
            sp.position.y = offset[1] + height + 0.02;
            sp.position.z = offset[2];

            // bar
            const ls = Threelet.Utils.createLineBox(
                [0.05, height, 0.05], 0xcccccc); // TODO; 0.5 hardcoded
            ls.position.x = offset[0];
            ls.position.y = offset[1] + height/2;
            ls.position.z = offset[2];

            group.add(sp, ls);
        });
        return group;
    }

}
Threelet.TemplateUtils = TemplateUtils;
