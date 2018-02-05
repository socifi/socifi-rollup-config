const path = require('path');
const fs = require('fs');

/**
 * Get all files in directory, subdirectories include.
 *
 * @param {string} baseDir - Base dir
 * @returns {Array<string>} list of all files
 */
module.exports.getFiles = (baseDir) => {
    // get all items from base directory
    const items = fs.readdirSync(baseDir);

    // go through
    return Object.keys(items).map((key) => {
        const item = items[key];

        // check if item is directory
        if (fs.lstatSync(path.join(baseDir, item)).isDirectory()) {
            // if so, ready all files in it
            return module.exports.getFiles(path.join(baseDir, item));
        }

        // otherwise just return full path
        return path.join(baseDir, item);
    }).reduce((a, b) => a.concat(b), []);
};

/**
 * Call callback on bundle finished.
 *
 * @param {Function} callback - Callback function
 * @returns {{name: string, ongenerate: Function}} Rollup plugin properties
 */
module.exports.onGenerate = (callback) => {
    return {
        name: 'on-generate',
        ongenerate: callback,
    }
};
