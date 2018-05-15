/* global require */
const mix = require('laravel-mix');
const { unlinkSync } = require('fs');

mix
    .webpackConfig({
        output: {
            library: 'SMPTE',
            libraryExport: 'default',
            libraryTarget: 'umd',
        },
    })
    .js('src/index.js', 'dist')
    .sourceMaps(false)
    .disableSuccessNotifications()
    .then(() => unlinkSync('mix-manifest.json'));
