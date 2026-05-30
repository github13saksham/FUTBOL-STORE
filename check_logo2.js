const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/logo.png')
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function() {
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let idx = (this.width * y + x) << 2;
                let r = this.data[idx];
                let g = this.data[idx+1];
                let b = this.data[idx+2];
                let a = this.data[idx+3];

                if (a > 50) { // Only consider visible pixels
                    sumR += r;
                    sumG += g;
                    sumB += b;
                    count++;
                }
            }
        }
        
        if (count > 0) {
            console.log(`Average Visible Pixel Color: rgb(${Math.round(sumR/count)}, ${Math.round(sumG/count)}, ${Math.round(sumB/count)})`);
            let luma = 0.2126 * (sumR/count) + 0.7152 * (sumG/count) + 0.0722 * (sumB/count);
            console.log(`Perceived Brightness (0-255): ${luma}`);
            if (luma < 128) {
                console.log('The logo is mostly DARK/BLACK.');
            } else {
                console.log('The logo is mostly LIGHT/WHITE.');
            }
        } else {
            console.log('The image is completely transparent.');
        }
    });
