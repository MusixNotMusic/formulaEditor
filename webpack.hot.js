const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.config.js');
// const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
// const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports =  merge(common, {
  entry: {
    module: ['webpack-dev-server/client?http://localhost:4001',  path.resolve(__dirname, 'src/module.ts')],
  },

  devtool: 'inline-source-map',

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    // libraryTarget: 'window',
  },

//   optimization: {
//     removeAvailableModules: false,
//     removeEmptyChunks: false,
//     splitChunks: false,
//   },


  devServer: {
    publicPath: '/dist',
    hot: true,
    port: 4001,
  },

  plugins: [
    // new CleanWebpackPlugin('dist', { allowExternal: true }),
    // new webpack.optimize.OccurrenceOrderPlugin(),
    // new CopyWebpackPlugin([
    //   { from: '../README.md', to: '.' },
    //   { from: '../LICENSE', to: '.' },
    //   { from: 'partials/*', to: '.' },
    //   { from: 'img/*', to: '.' },
    // ]),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
        filename: path.resolve(__dirname, 'index.html'),
        template: path.resolve(__dirname, 'src/index.html'),
        inject: 'body',
        alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ]
});
