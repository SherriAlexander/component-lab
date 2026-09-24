import '../src/tokens/tokens.css';
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Fail tests (and CI) on any a11y violation.
      test: 'error',
    },
    chromatic: {
      // Deterministic snapshots; also makes the reduced-motion path the one visually tested.
      prefersReducedMotion: 'reduce',
    },
  },
  loaders: [
    // Don't render (or snapshot) until web fonts are ready.
    async () => {
      await document.fonts.ready;
      return {};
    },
  ],
};

export default preview;
