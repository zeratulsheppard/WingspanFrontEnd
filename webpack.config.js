const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// Configuration constants
const isDevelopment = process.env.NODE_ENV !== 'production';
const OUTPUT_PATH = path.resolve(__dirname, 'dest');

// Plugin configurations
const extractVueSCSS = new MiniCssExtractPlugin({
  filename: 'css/vue.css'
});

const config = {
  mode: process.env.NODE_ENV,
  entry: {
    app: './src/js/app.js',
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: OUTPUT_PATH
  },
  externals: {
    axios: 'axios',
    localforage: 'localforage',
    moment: 'moment',
    vue: 'Vue',
    vuex: 'Vuex',
    'vue-router': 'VueRouter'
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        'dest/css/vue*',
        'dest/images',
        'dest/js',
      ]
    }),
    new VueLoaderPlugin(),
    extractVueSCSS
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          isDevelopment ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              resources: path.resolve(__dirname, './src/sass/_inject.scss')
            }
          }
        ]
      },
      {
        test: /\.(png|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
            outputPath: '/images/'
          }
        }]
      },
      {
        test: /\.(woff|woff2)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]',
            outputPath: '/fonts/'
          }
        }]
      }
    ]
  }
};

module.exports = config;
