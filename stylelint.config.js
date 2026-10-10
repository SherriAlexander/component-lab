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
  rules: {
    // Kebab-case, plus px-to-rem helpers like --14px
    'custom-property-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^[0-9]+px$',
      {
        message: (name) =>
          `Expected custom property "${name}" to be kebab-case or a px size like --14px`,
      },
    ],
    // BEM with kebab-case parts: block, block__element, block--modifier, block__element--modifier
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: (selector) => `Expected class selector "${selector}" to be kebab-case BEM` },
    ],
  },
};
