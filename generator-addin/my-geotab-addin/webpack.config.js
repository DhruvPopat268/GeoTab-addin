const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
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
  let response = JSON.stringify(config, null, 2);
  return response;
}

const jsFileName = () => {
  let fileName = '[name]-[contenthash].js'
  return fileName
}

module.exports = (env) => {
  // Load environment variables from .env file
  const envKeys = dotenv.config().parsed || {};

  // Create an object of environment variables to pass to DefinePlugin
  const envVars = Object.keys(envKeys).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(envKeys[next]);
    return prev;
  }, {});

  return {
    mode: 'production',
    entry: {
      bundle: path.resolve(__dirname, 'src/app/index.js'),
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      publicPath: './',
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
      historyApiFallback: true
    },
    devtool: 'source-map',

    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
          ]
        },
        {
          test: /\.(js|jsx)$/,
          exclude: [/node_modules/],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                ["@babel/preset-react", {
                  "runtime": "automatic"
                }]
              ]
            }
          }
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: 'tsconfig.json'
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "styles.css",
        chunkFilename: "styles.css"
      }),
      new HtmlWebpackPlugin({
        title: 'prayoshaAddIn',
        filename: `prayoshaAddIn.html`,
        template: 'src/app/prayoshaAddIn.html',
        inject: 'body'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: './src/app/images/icon.svg', to: 'images/' },
          {
            from: './src/config.json',
            transform: transform,
            to: 'configuration.json'
          },
          { from: path.resolve(__dirname, 'public', 'addin.js'), to: path.resolve(__dirname, 'dist') },
          { from: path.resolve(__dirname, 'public', 'manifest.json'), to: path.resolve(__dirname, 'dist') },
          { from: path.resolve(__dirname, 'public', '_redirects'), to: path.resolve(__dirname, 'dist') },
          { from: path.resolve(__dirname, 'public', 'translations'), to: path.resolve(__dirname, 'dist', 'translations') },
        ]
      }),
      new webpack.DefinePlugin(envVars),
    ],

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
};