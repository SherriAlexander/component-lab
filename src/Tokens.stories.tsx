import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Tokens',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Placeholder so Chromatic has a story to snapshot. Replaced by Palette and Accents once tokens land.
export const Placeholder: Story = {
  render: () => <p>Token stories coming soon.</p>,
};
