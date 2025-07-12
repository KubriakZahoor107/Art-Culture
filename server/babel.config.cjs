/** @type {import('@babel/core').TransformOptions} */
module.exports = {

  presets: [
    ['@babel/preset-env', { targets: { node: '20' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-syntax-import-meta'
  ]
};
