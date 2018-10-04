const fs = require('fs');
const path = require('path');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const serve = require('rollup-plugin-serve');
const getBabelConfig = require('@socifi/babel-config');

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
            ...(fileName.indexOf('index') >= 0 ? [
                {
                    file: `${destinationFile.replace(/\.(tsx|ts)$/, '.es.js')}`,
                    format: 'es',
                    freeze: false,
                },
            ] : []),
        ],
        plugins: [
            babel(getBabelConfig(undefined, false)),
            resolve({
                modulesOnly: true,
                customResolveOptions: {
                    moduleDirectory: 'src',
                },
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
            }),
        ],
        ...settings,
    };
}

function getDirectoryConfig(dir, settings) {
    return getFiles(dir).map(file => getFileConfig(file, settings));
}

function getDevelopConfig(file) {
    const base = getFileConfig(file);
    const destinationFile = file.replace(/dev$/, 'build').replace(/\.(tsx|ts)$/, '.js');

    fs.copyFileSync(
        path.resolve(__dirname, '..', 'assets', 'index.html'),
        path.resolve(path.parse(destinationFile).dir, 'index.html')
    );

    return {
        ...base,
        plugins: [
            ...base.plugins,
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
