const path = require('path');

module.exports = {
  entry: {
    'table': './src/table.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: 'PaymentPermission'
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3000
  }
};