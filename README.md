# SOCIFI Default Rollup Configuration

[![npm version](https://badge.fury.io/js/socifi-rollup-config.svg)](https://badge.fury.io/js/socifi-rollup-config)

This is default configuration for rollup that compile javascript libraries.

## What is included

It parse ECMAScript 6 javascript syntax using Babel env preset. Supported browsers are defined from package.json of compiled library. Default configuration can also handle Flow Type syntax.

All files are bundled separately. It allowed to create smaller files with compilers that does not have tree shaking like webpack.

To the destination folder are copied .js.flow so the library can be use with Flow Types.

## How to use it

First, install this package:

```nodemon
npm install socifi-rollup-config --save-dev
```

Then create your rollup.config.js file:

```javascript
import getConfig from 'ui-rollup-config';
import path from 'path';
import packageJson from './package.json';

export default getConfig(packageJson, path.resolve(__dirname, 'src'), {
    custom: 'settings',
});
```
