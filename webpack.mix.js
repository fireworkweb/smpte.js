/* global require, process */
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
    .then(() => unlinkSync('mix-manifest.json'));

if (process.argv.findIndex(arg => arg === 'disable-notifications') !== -1) {
    mix.disableNotifications();
}
