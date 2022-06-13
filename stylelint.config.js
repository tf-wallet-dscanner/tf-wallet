module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-prettier/recommended'],
  customSyntax: 'postcss-scss',
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extends', 'tailwind'],
      },
    ],
    'block-no-empty': null,
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'declaration-block-no-duplicate-properties': null,
    'font-family-no-duplicate-names': null,
  },
};
