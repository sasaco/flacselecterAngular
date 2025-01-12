const webpack = require('webpack');
const isElectron = process.env.ELECTRON === 'true';

module.exports = {
  target: isElectron ? 'electron-renderer' : 'web',
  devtool: 'eval-source-map',
  node: {
    global: true,
    __dirname: false,
    __filename: false
  },
  resolve: {
    fallback: {
      "path": false,
      "fs": false,
      "crypto": false,
      "electron": false,
      "@electron/remote": false
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ELECTRON': JSON.stringify(isElectron)
    })
  ],
  devServer: {
    historyApiFallback: true
  }
};
