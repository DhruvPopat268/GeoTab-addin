const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = require('./src/config.json');

const { name: appName } = config;

const transform = function (content, path) {
  let config = JSON.parse(content);
  let host = config.dev.dist.host;
  let len = config.items.length;
  const { name } = config;

  for (let i = 0; i < len; i++) {
    config.items[i].url = `${name}/` + config.items[i].url;
    config.items[i].icon = `${name}/` + config.items[i].icon;
  }

  delete config['dev'];
  return JSON.stringify(config, null, 2);
}

module.exports = {
  mode: 'production',
  entry: {
    bundle: path.resolve(__dirname, 'src/app/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    publicPath: '/',
    clean: true
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist')
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true, // Ensure files are written to disk for inspection
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', {
                runtime: 'automatic',
                development: process.env.NODE_ENV === 'development'
              }]
            ]
          }
        }
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    new HtmlWebpackPlugin({
      title: 'prayoshaAddIn',
      filename: 'prayoshaAddIn.html',
      template: 'src/app/prayoshaAddIn.html',
      inject: 'body',
      scriptLoading: 'defer',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
        description: 'Prayosha Geotab Add-in'
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        { 
          from: './src/app/images/icon.svg', 
          to: 'images/[name][ext]' 
        },
        {
          from: './src/config.json',
          transform: transform,
          to: 'configuration.json'
        },
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};