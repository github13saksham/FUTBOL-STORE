const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('public/logo.png')
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function() {
        let minX = this.width, minY = this.height, maxX = 0, maxY = 0;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let idx = (this.width * y + x) << 2;
                let a = this.data[idx+3];

                if (a > 10) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        
        console.log(`Bounding Box: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`);
        console.log(`Content Width: ${maxX - minX}, Content Height: ${maxY - minY}`);
    });
