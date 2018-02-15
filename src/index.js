const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-re');
const commonjs = require('rollup-plugin-commonjs');
const fs = require('fs');
const path = require('path');
const packageJson = require('./../package.json');
const { getFiles, onGenerate, getBaseBabelConfig } = require('./helpers');

/**
 * Get basic config for rollup.
 *
 * @returns {Object} config
 */
function getBasicConfig() {
    return {
        treeshake: {
            propertyReadSideEffects: false,
        },
    };
}

/**
 * Get config for develop bundle.
 *
 * @param {string} dir - Path of project
 * @param {?Object} options - Optional settings
 * @returns {Object} Rollup config
 */
function getDevConfig(dir, options = {}) {
    const basicConfig = getBasicConfig();
    const babelConfig = getBaseBabelConfig(false);

    babelConfig.plugins = [
        [
            'flow-runtime',
            {
                assert: true,
                annotate: true,
            },
        ],
        ...babelConfig.plugins.filter(plugin => plugin !== 'external-helpers'),
    ];

    return {
        ...basicConfig,
        input: path.resolve(dir, 'dev', 'index.js'),
        output: [{
            file: path.resolve(dir, 'dev', 'index.build.js'),
            format: 'umd',
            name: 'dev',
        }],
        plugins: [
            babel(babelConfig),
            resolve({
                jsnext: true,
            }),
            commonjs({}),
        ],
        ...options,
    };
}

/**
 * Default configuration for rollup.
 *
 * @param {Object} packageConfig - Parsed package.json
 * @param {string} baseDir - Base dir of plugin
 * @param {Object} options - Optional parameters
 * @returns {Array<Object>} Rollup settings
 */
function getLibraryConfig(packageConfig = packageJson, baseDir, options = {}) {
    const basicConfig = getBasicConfig(packageConfig);

    return getFiles(baseDir).map((file) => {
        const destinationFile = file.replace('src', 'dist');
        return {
            ...basicConfig,
            input: file,
            output: [{
                file: `${destinationFile.replace('js', 'es.js')}`,
                format: 'es',
            }, {
                file: destinationFile,
                format: 'cjs',
            }],
            plugins: [
                replace({
                    patterns: [
                        {
                            test: 'ui-constants/src',
                            replace: 'ui-constants/dist',
                        },
                        {
                            test: 'ui-models/src',
                            replace: 'ui-models/dist',
                        },
                        {
                            test: 'ui-admin-api-service/src',
                            replace: 'ui-admin-api-service/dist',
                        },
                    ],
                }),
                resolve({
                    modulesOnly: true,
                    customResolveOptions: {
                        moduleDirectory: 'src',
                    },
                }),
                babel(getBaseBabelConfig(false)),
                onGenerate(() => {
                    fs.copyFile(file, `${destinationFile}.flow`, () => {});
                }),
            ],
            ...options,
        };
    });
}

module.exports = {
    default: getLibraryConfig,
    getLibraryConfig,
    getDevConfig,
};
