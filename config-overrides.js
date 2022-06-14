const {
  override,
  overrideDevServer,
  addWebpackPlugin,
} = require('customize-cra');
const CopyPlugin = require('copy-webpack-plugin');
const RewireMultipleEntry = require('react-app-rewire-multiple-entry');
const path = require('path');

const multipleEntry = RewireMultipleEntry([
  {
    entry: path.join(__dirname, 'src/ui/popup/index.tsx'),
    template: 'public/popup.html',
    outPath: '/popup.html',
  },
  {
    entry: path.join(__dirname, 'src/ui/pages/index.tsx'),
    template: 'public/index.html',
    outPath: '/index.html',
  },
]);

const devServerConfig = () => (config) => {
  return {
    ...config,
    writeToDisk: true,
  };
};

const copyPlugin = new CopyPlugin({
  patterns: [
    { from: 'public', to: '' },
    { from: 'src/app/background.js', to: '' },
  ],
});

module.exports = {
  webpack: override(addWebpackPlugin(copyPlugin), multipleEntry.addMultiEntry),
  devServer: overrideDevServer(devServerConfig()),
};
