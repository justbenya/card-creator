const fs = require('fs');
const path = require('path');
const byline = require('byline');
const {LOCAL_IMAGES_DIRS, LOCAL_IMAGES_EXTENSION} = require('./constants');

function readFile(fileName, callback) {
    const stream = byline(fs.createReadStream(__dirname + '/' + fileName));
    const result = {};

    stream.on('data', buf => {
        const line = buf.toString();
        const match = line.match(/([0-9]+)[\s\t]+(.*)/);

        if (!match) return;

        const cardCount = Number(match[1]);
        const cardName = match[2];

        if (!result[cardName]) {
            result[cardName] = 0;
        }

        result[cardName] += cardCount;
    });

    stream.on('end', () => callback(null, result));
}

function fetchLocalImage(name, callback) {
    let result = null;

    LOCAL_IMAGES_DIRS.forEach(localDir => {
        LOCAL_IMAGES_EXTENSION.forEach(ext => {
            const imagePath = path.join(localDir, name + '.' + ext);

            if (fs.existsSync(imagePath)) {
                result = imagePath;
            }
        });
    });

    if (!result) {
        console.error('WARNING: \'' + name + '\' not found!');
    }

    callback(null, result);
}

module.exports = {
    readFile,
    fetchLocalImage,
}
