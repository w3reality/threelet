/* global __dirname, require, module */

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env; 
const pkg = require('./package.json');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Var2EsmPlugin = require('webpack-var2esm-plugin');

const libraryName = 'threelet'; // pkg.name;
const libraryObjName = 'Threelet'; // name for script tag loading

const plugins = [];
let outputFile, minimize, target;
if (env === 'build') {
    minimize = true;
    outputFile = libraryName + '.min.js';
    target = 'umd';
    if (0) {
        plugins.push(new BundleAnalyzerPlugin());
    }
} else if (env === 'esm') {
    minimize = true;
    outputFile = libraryName  + '.esm.min.js';
    target = 'var';
    plugins.push(new Var2EsmPlugin(libraryObjName, outputFile, true));
} else {
    minimize = false;
    outputFile = libraryName + '.js';
    target = 'umd';
}

const config = {
    entry: __dirname + '/src/index.js',
    externals: { // https://webpack.js.org/configuration/externals/
        three: 'THREE'
    },
    output: {
        path: __dirname + '/lib',
        filename: outputFile,
        library: libraryObjName,
        libraryTarget: target,
        libraryExport: 'default', // https://github.com/webpack/webpack/commit/de8fc51a6fe2aff3ea3a1c24d34d429897c3b694
        umdNamedDefine: false // must be 'false' for m to be resolved in require([''], (m) => {});
    },
    optimization: {
        minimize: minimize,
        minimizer: [
            new UglifyJSPlugin({
                uglifyOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })
        ]
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /(\.jsx|\.js)$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [path.resolve('./node_modules'), path.resolve('./src')],
        extensions: ['.json', '.js']
    },
    plugins: plugins
};

module.exports = config;
