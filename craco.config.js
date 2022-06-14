/**
 * @see https://jwchang0206.medium.com/make-create-react-app-faster-with-rust-6c75ffa8fdfd
 * @see https://github.com/gsoft-inc/craco/issues/298
 */
const CracoSwcPlugin = require('craco-swc');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const rewireEntries = [
  {
    name: 'pages',
    entry: path.resolve(__dirname, './src/ui/pages/index.tsx'),
    template: path.resolve(__dirname, 'public/index.html'),
    outPath: 'pages.html',
  },
  {
    name: 'popup',
    entry: path.resolve(__dirname, './src/ui/popup/index.tsx'),
    template: path.resolve(__dirname, 'public/popup.html'),
    outPath: 'popup.html',
  },
];

const appEntry = {
  background: path.resolve(__dirname, './src/app/background.js'),
  content: path.resolve(__dirname, './src/app/content.js'),
};

const defaultEntryName = 'main';

const appIndexes = ['js', 'tsx', 'ts', 'jsx'].map((ext) =>
  path.resolve(__dirname, `src/app/background.${ext}`),
);

function webpackMultipleEntries(config) {
  // Multiple Entry JS
  const defaultEntryHTMLPlugin = config.plugins.find((plugin) => {
    return plugin.constructor.name === 'HtmlWebpackPlugin';
  });
  defaultEntryHTMLPlugin.userOptions.chunks = [defaultEntryName];

  // config.entry is not an array in Create React App 4
  if (!Array.isArray(config.entry)) {
    config.entry = [config.entry];
  }

  // If there is only one entry file then it should not be necessary for the rest of the entries
  const necessaryEntry =
    config.entry.length === 1
      ? []
      : config.entry.filter((file) => !appIndexes.includes(file));
  const multipleEntry = {};
  multipleEntry[defaultEntryName] = config.entry;

  rewireEntries.forEach((entry) => {
    multipleEntry[entry.name] = necessaryEntry.concat(entry.entry);
    // Multiple Entry HTML Plugin
    config.plugins.unshift(
      new defaultEntryHTMLPlugin.constructor(
        Object.assign({}, defaultEntryHTMLPlugin.userOptions, {
          filename: entry.outPath,
          template: entry.template,
          chunks: [entry.name],
        }),
      ),
    );
  });
  config.entry = { ...multipleEntry, ...appEntry };

  config.output.filename = '[name].bundle.js';
  config.output.clean = true;

  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/manifest.json',
          to: path.join(__dirname, 'build'),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              }),
            );
          },
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/logo192.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public/logo512.png',
          to: path.join(__dirname, 'build'),
          force: true,
        },
      ],
    }),
  );
  return config;
}

module.exports = {
  webpack: {
    configure: webpackMultipleEntries,
  },
  plugins: [
    {
      plugin: CracoSwcPlugin,
      options: {
        swcLoaderOptions: {
          jsc: {
            externalHelpers: true,
            target: 'es5',
            parser: {
              syntax: 'typescript',
              tsx: true,
              dynamicImport: true,
              exportDefaultFrom: true,
            },
          },
        },
      },
    },
  ],
};
