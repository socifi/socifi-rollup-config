const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-re');
const fs = require('fs');
const packageJson = require('./../package.json');
const { getFiles, onGenerate, getBaseBabelConfig } = require('./helpers');

/**
 * Default configuration for rollup.
 *
 * @param {Object} packageConfig - Parsed package.json
 * @param {string} baseDir - Base dir of plugin
 * @param {Object} options - Optional parameters
 * @returns {Array<Object>} Rollup settings
 */
module.exports = (packageConfig = packageJson, baseDir, options = {}) => {
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
                replace({
                    patterns: [
                        {
                            test: 'ui-constants\/src',
                            replace: 'ui-constants/dist',
                        },
                        {
                            test: 'ui-models\/src',
                            replace: 'ui-models/dist',
                        },
                    ],
                }),
                resolve({
                    modulesOnly: true,
                    customResolveOptions: {
                        moduleDirectory: 'src'
                    },
                }),
                babel(getBaseBabelConfig(false, packageConfig)),
                onGenerate(() => {
                    fs.copyFile(file, `${destinationFile}.flow`, () => {});
                }),
            ],
            ...options,
        };
    });
};
