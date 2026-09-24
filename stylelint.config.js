/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: [
    'dist/**',
    'storybook-static/**',
    'coverage/**',
    'original-codepen/**',
    'src/tokens/tokens.css',
  ],
};
