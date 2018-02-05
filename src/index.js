const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const fs = require('fs');
const { getFiles, onGenerate } = require('./helpers');

/**
 * Default configuration for rollup.
 *
 * @param {Object} packageJson - Parsed package.json
 * @param {string} baseDir - Base dir of plugin
 * @param {Object} options - Optional parameters
 * @returns {Array<Object>} Rollup settings
 */
module.exports = (packageJson, baseDir, options = {}) => {
    return getFiles(baseDir).map((file) => {
        const destinationFile = file.replace('src', 'dist');

        return {
            input: file,
            output: [{
                file: `${destinationFile.replace('js', 'es.js')}`,
                format: 'es',
            }, {
                file: destinationFile,
                format: 'cjs',
            }],
            treeshake: {
                propertyReadSideEffects: false,
            },
            plugins: [
                resolve(),
                babel({
                    presets: [
                        [
                            'env',
                            {
                                modules: false,
                                targets: {
                                    browsers: packageJson.browserslist,
                                },
                            },
                        ],
                        'flow',
                    ],
                    plugins: [
                        'transform-object-rest-spread'
                    ],
                }),
                onGenerate(() => {
                    fs.copyFile(file, `${destinationFile}.flow`, () => {});
                }),
            ],
            ...options,
        };
    });
};
