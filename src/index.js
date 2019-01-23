/* eslint-disable sonarjs/no-duplicate-string */
const fs = require('fs');
const path = require('path');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const serve = require('rollup-plugin-serve');
const replaceDist = require('rollup-plugin-replace');
const commonjs = require('rollup-plugin-commonjs');
const json = require('rollup-plugin-json');

const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

function getFiles(baseDir) {
    // get all items from base directory
    const items = fs.readdirSync(baseDir);

    // go through
    return Object.keys(items).map((key) => {
        const item = items[key];

        // check if item is directory
        if (fs.lstatSync(path.join(baseDir, item)).isDirectory()) {
            // if so, ready all files in it
            return getFiles(path.join(baseDir, item));
        }

        // otherwise just return full path
        return path.join(baseDir, item);
    }).reduce((a, b) => a.concat(b), []);
}

function getFileConfig(file, settings = {}) {
    const destinationFile = file.replace('src', 'dist');
    const fileName = path.parse(file).base;

    return {
        treeshake: {
            propertyReadSideEffects: false,
            pureExternalModules: true,
        },
        input: file,
        output: [
            {
                file: destinationFile.replace(/\.(tsx|ts)$/, '.js'),
                format: 'cjs',
                freeze: false,
            },
            {
                file: destinationFile.replace(/\.(tsx|ts)$/, '.esm.js'),
                format: 'es',
                freeze: false,
            },
        ],
        plugins: [
            babel({
                exclude: 'node_modules/**',
                extensions: supportedExtensions,
            }),
            resolve({
                modulesOnly: true,
                customResolveOptions: {
                    moduleDirectory: 'src',
                },
                extensions: supportedExtensions,
            }),
            json(),
        ],
        ...settings,
    };
}

function getDirectoryConfig(dir, settings) {
    return getFiles(dir).map(file => getFileConfig(file, settings));
}

function getDevelopConfig(file) {
    const base = getFileConfig(file);
    const destinationFile = file.replace(/dev/, '/build/').replace(/\.(tsx|ts)$/, '.js');

    fs.copyFileSync(
        path.resolve(__dirname, '..', 'assets', 'index.html'),
        path.resolve(path.parse(destinationFile).dir, 'index.html'),
    );

    return {
        ...base,
        plugins: [
            replaceDist({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            commonjs({
                include: 'node_modules/**',
                namedExports: {
                    'node_modules/react/index.js': [
                        'Children',
                        'Component',
                        'PureComponent',
                        'PropTypes',
                        'createElement',
                        'Fragment',
                        'cloneElement',
                        'StrictMode',
                        'createFactory',
                        'createRef',
                        'createContext',
                        'isValidElement',
                        'isValidElementType',
                        'forwardRef',
                    ],
                    'node_modules/react-dom/index.js': [
                        'render',
                        'hydrate',
                    ],
                },
            }),
            resolve({
                browser: true,
                extensions: supportedExtensions,
            }),
            babel({
                exclude: 'node_modules/**',
                extensions: supportedExtensions,
            }),
            serve({
                contentBase: 'build',
                port: 8080,
            }),
        ],
        output: [
            {
                file: destinationFile,
                format: 'cjs',
                freeze: false,
            },
        ],
    };
}

module.exports = {
    getFileConfig,
    getDirectoryConfig,
    getDevelopConfig,
};
