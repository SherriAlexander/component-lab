import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // TODO: restore '../src/**/*.stories.@(ts|tsx)' once the hero is ready to publish
  stories: [
    '../src/**/*.mdx',
    '../src/*.stories.@(ts|tsx)',
    '../src/components/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
};

export default config;
