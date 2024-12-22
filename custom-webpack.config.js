module.exports = {
  target: "web",
  node: {
    global: true,
    __dirname: false,
    __filename: false
  },
  externals: {
    fs: "commonjs fs",
    path: "commonjs path",
    crypto: "commonjs crypto"
  }
};
