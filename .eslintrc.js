module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    /**
     * @see https://medium.com/hackernoon/absolute-imports-with-create-react-app-4c6cfb66c35d
     */
    'import/resolver': {
      node: {
        paths: ['src'],
      },
    },
  },
  /**
   * @see https://github.com/facebook/create-react-app/issues/12070
   */
  parser: '@babel/eslint-parser',
  parserOptions: {
    project: './jsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: [
        ['babel-preset-react-app', false],
        'babel-preset-react-app/prod',
      ],
    },
  },
  plugins: ['react', 'react-hooks', 'prettier', 'unused-imports'],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-param-reassign': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/no-array-index-key': 'off',
    'no-restricted-exports': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'react/prefer-stateless-function': 'off',
    'import/prefer-default-export': 'off',
    'import/newline-after-import': 'off',
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/jsx-one-expression-per-line': 'off',
    'no-nested-ternary': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': 'off',
    'global-require': 'off',
    'linebreak-style': [
      'error',
      require('os').EOL === '\r\n' ? 'windows' : 'unix',
    ],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-debugger': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'no-else-return': 'off',
    'no-console': 'off',
    'consistent-return': 'off',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'jsx-a11y/label-has-associated-control': 'off',
  },
  globals: {
    React: 'writable',
    document: false,
    Map: false,
    Promise: false,
  },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'config/',
    '.pnp.cjs',
    '.yarn/',
    'scripts/',
  ],
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js', '**/*.test.jsx', '**/*.spec.jsx'],
      env: {
        jest: true,
      },
    },
  ],
};
