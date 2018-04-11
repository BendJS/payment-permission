const path = require('path');

module.exports = {
  entry: {
    'payment-permission': './src/payment-permission.js'
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