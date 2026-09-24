import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { AdaptiveTabs } from './AdaptiveTabs';

// Stories tagged `wip` are skipped by `npm test` (pre-push, CI) and run by `npm run test:wip`.
// Remove the tag once a story passes.

const WIDE = '48rem';
const NARROW = '24rem';

/** Sets the container width the component adapts to. Plays resize it via `setWidth`. */
const container =
  (width: string): Decorator =>
  (Story) => (
    <div data-testid="container" style={{ width }}>
      <Story />
    </div>
  );

const setWidth = (canvasElement: HTMLElement, width: string) => {
  const el = canvasElement.querySelector<HTMLElement>('[data-testid="container"]');
  if (!el) throw new Error('container decorator missing');
  el.style.width = width;
};

const items = [
  <AdaptiveTabs.Item key="one" value="one" title="One">
    <p>
      First panel. <a href="#one">Read more about one</a>
    </p>
  </AdaptiveTabs.Item>,
  <AdaptiveTabs.Item key="two" value="two" title="Two">
    <p>Second panel, no focusable content.</p>
  </AdaptiveTabs.Item>,
  <AdaptiveTabs.Item key="three" value="three" title="Three">
    <p>Third panel, no focusable content.</p>
  </AdaptiveTabs.Item>,
];

const meta = {
  title: 'Components/AdaptiveTabs',
  component: AdaptiveTabs,
  args: {
    label: 'Placeholder tabs',
    defaultValue: 'one',
    onValueChange: fn(),
    children: items,
  },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof AdaptiveTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TabsMode: Story = {
  tags: ['wip'],
  decorators: [container(WIDE)],
  play: async ({ canvas, canvasElement }) => {
    const tablist = canvas.getByRole('tablist', { name: 'Placeholder tabs' });
    const [one, two, three] = canvas.getAllByRole('tab');
    await expect(canvas.getAllByRole('tab')).toHaveLength(3);
    await expect(canvas.queryByRole('button')).toBeNull();

    // Selection + roving tabindex
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(two).toHaveAttribute('aria-selected', 'false');
    await expect(three).toHaveAttribute('aria-selected', 'false');
    await expect(one).toHaveAttribute('tabindex', '0');
    await expect(two).toHaveAttribute('tabindex', '-1');
    await expect(three).toHaveAttribute('tabindex', '-1');

    // Only the selected panel is exposed, and it points back at its tab
    const panel = canvas.getByRole('tabpanel');
    await expect(panel).toHaveAccessibleName('One');
    await expect(one).toHaveAttribute('aria-controls', panel.id);

    // State → motion contract
    const root = canvasElement.querySelector('[data-part="root"]');
    await expect(root).toHaveAttribute('data-mode', 'tabs');
    await expect(root).toHaveAttribute('data-value', 'one');
    await expect(tablist).toBeVisible();
    const panels = canvasElement.querySelectorAll('[data-part="panel"]');
    await expect(panels).toHaveLength(3);
    for (const p of panels) {
      const active = p.getAttribute('data-value') === 'one';
      await expect(p).toHaveAttribute('data-state', active ? 'active' : 'inactive');
      if (!active) {
        await expect(p).toHaveAttribute('hidden');
        await expect(p).toHaveAttribute('inert');
      }
    }
  },
};

export const AccordionMode: Story = {
  tags: ['wip'],
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    await expect(canvas.queryByRole('tablist')).toBeNull();
    await expect(canvasElement.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-mode',
      'accordion',
    );

    // Headers: <h3><button aria-expanded aria-controls>
    const headers = canvas.getAllByRole('heading', { level: 3 });
    await expect(headers).toHaveLength(3);
    const one = canvas.getByRole('button', { name: 'One' });
    const two = canvas.getByRole('button', { name: 'Two' });
    const three = canvas.getByRole('button', { name: 'Three' });
    await expect(headers[0]).toContainElement(one);

    await expect(one).toHaveAttribute('aria-expanded', 'true');
    await expect(two).toHaveAttribute('aria-expanded', 'false');
    await expect(three).toHaveAttribute('aria-expanded', 'false');
    const region = canvas.getByRole('region', { name: 'One' });
    await expect(one).toHaveAttribute('aria-controls', region.id);

    // Opening another closes the current one
    await userEvent.click(two);
    await expect(two).toHaveAttribute('aria-expanded', 'true');
    await expect(one).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('two');

    // Clicking the open header collapses it
    await userEvent.click(two);
    await expect(two).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('region')).toBeNull();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
  },
};

export const Collapsed: Story = {
  tags: ['wip'],
  args: { defaultValue: null },
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement }) => {
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
    await expect(canvas.queryByRole('region')).toBeNull();

    // Tabs mode never shows null: no prior value → first item
    setWidth(canvasElement, WIDE);
    await waitFor(() => expect(canvas.getByRole('tablist')).toBeVisible());
    await expect(canvas.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
  },
};

export const ManualActivation: Story = {
  tags: ['wip'],
  args: { activation: 'manual' },
  decorators: [container(WIDE)],
  play: async ({ canvas, userEvent, args }) => {
    const one = canvas.getByRole('tab', { name: 'One' });
    const two = canvas.getByRole('tab', { name: 'Two' });
    const three = canvas.getByRole('tab', { name: 'Three' });

    await userEvent.tab();
    await expect(one).toHaveFocus();

    // Arrows move focus only
    await userEvent.keyboard('{ArrowRight}');
    await expect(two).toHaveFocus();
    await expect(one).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{Enter}');
    await expect(two).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('two');

    await userEvent.keyboard('{ArrowRight}');
    await expect(three).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(three).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('three');
  },
};

export const KeyboardTabs: Story = {
  name: 'Keyboard: Tabs',
  tags: ['wip'],
  decorators: [container(WIDE)],
  play: async ({ canvas, userEvent, args }) => {
    const one = canvas.getByRole('tab', { name: 'One' });
    const two = canvas.getByRole('tab', { name: 'Two' });
    const three = canvas.getByRole('tab', { name: 'Three' });

    // Tab lands on the selected tab
    await userEvent.tab();
    await expect(one).toHaveFocus();

    // Automatic activation: arrows move focus and select, wrapping
    await userEvent.keyboard('{ArrowRight}');
    await expect(two).toHaveFocus();
    await expect(two).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('two');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(three).toHaveFocus();
    await expect(three).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    await expect(one).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(three).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(one).toHaveFocus();
    await expect(one).toHaveAttribute('aria-selected', 'true');

    // Panel with focusable content: Tab goes to the content, not the panel
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Read more about one' })).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).not.toHaveAttribute('tabindex');

    // Panel without focusable content is itself focusable; closed panel One's link is skipped
    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.tab();
    const panel = canvas.getByRole('tabpanel', { name: 'Two' });
    await expect(panel).toHaveAttribute('tabindex', '0');
    await expect(panel).toHaveFocus();
  },
};

export const KeyboardAccordion: Story = {
  name: 'Keyboard: Accordion',
  tags: ['wip'],
  decorators: [container(NARROW)],
  play: async ({ canvas, userEvent, args }) => {
    const one = canvas.getByRole('button', { name: 'One' });
    const two = canvas.getByRole('button', { name: 'Two' });
    const three = canvas.getByRole('button', { name: 'Three' });

    await userEvent.tab();
    await expect(one).toHaveFocus();

    // Up/Down/Home/End move focus without changing what's open
    await userEvent.keyboard('{ArrowDown}');
    await expect(two).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(one).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(three).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(one).toHaveFocus();
    await expect(one).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    // Enter/Space toggle
    await userEvent.keyboard('{Enter}');
    await expect(one).toHaveAttribute('aria-expanded', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(null);
    await userEvent.keyboard(' ');
    await expect(one).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Enter}');

    // Closed panel's link is unreachable: Tab goes header → header
    await userEvent.tab();
    await expect(two).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(two).toHaveAttribute('aria-expanded', 'true');
    await expect(one).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab();
    await expect(three).toHaveFocus();
  },
};

export const ResizePreservesSelectionAndFocus: Story = {
  name: 'Resize Preserves Selection & Focus',
  tags: ['wip'],
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Two' }));
    await expect(canvas.getByRole('button', { name: 'Two' })).toHaveFocus();

    // Accordion → tabs: same value selected, focus moves to its tab
    setWidth(canvasElement, WIDE);
    await waitFor(() => expect(canvas.getByRole('tablist')).toBeVisible());
    const tab = canvas.getByRole('tab', { name: 'Two' });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveFocus();

    // Tabs → accordion: same value expanded, focus moves to its header
    setWidth(canvasElement, NARROW);
    await waitFor(() => expect(canvas.queryByRole('tablist')).toBeNull());
    const header = canvas.getByRole('button', { name: 'Two' });
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(header).toHaveFocus();

    // Collapse to null, then widen: tabs fall back to the last non-null value
    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    setWidth(canvasElement, WIDE);
    await waitFor(() => expect(canvas.getByRole('tablist')).toBeVisible());
    await expect(canvas.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
  },
};
