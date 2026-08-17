const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'portalmedico_icon.png');
const outputPath = path.join(__dirname, 'electron', 'portalmedico_icon.png');

sharp(inputPath)
    .resize(256, 256, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(outputPath)
    .then(() => {
        console.log("Image successfully resized to 256x256!");
    })
    .catch(err => {
        console.error("Error resizing image:", err);
    });
