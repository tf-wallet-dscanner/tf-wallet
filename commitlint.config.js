module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'release',
      ],
    ],
    'subject-case': [0, 'never'],
    'body-empty': [2, 'never'],
    'body-leading-blank': [2, 'always', 1],
    'footer-empty': [0, 'never'],
    'footer-leading-blank': [2, 'always', 1],
  },
};
