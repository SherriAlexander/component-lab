import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { AdaptiveTabs, type AdaptiveTabsItem } from './AdaptiveTabs';

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

/**
 * Accordion mode is `<details><summary><hN>title</hN></summary>…</details>`.
 * `<summary>` has no ARIA role to query by, so find sections by their title text.
 */
const section = (canvasElement: HTMLElement, title: string) => {
  const details = [...canvasElement.querySelectorAll('details')].find(
    (d) => d.querySelector('summary')?.textContent.trim() === title,
  );
  const summary = details?.querySelector('summary');
  if (!details || !summary) throw new Error(`no <details> titled "${title}"`);
  return { details, summary };
};

const items: AdaptiveTabsItem[] = [
  {
    value: 'one',
    title: 'One',
    content: (
      <p>
        First panel. <a href="#one">Read more about one</a>
      </p>
    ),
  },
  { value: 'two', title: 'Two', content: <p>Second panel, no focusable content.</p> },
  { value: 'three', title: 'Three', content: <p>Third panel, no focusable content.</p> },
];

const meta = {
  title: 'Components/AdaptiveTabs',
  component: AdaptiveTabs,
  args: {
    label: 'Placeholder tabs',
    defaultValue: 'one',
    onValueChange: fn(),
    items,
  },
  argTypes: {
    items: { control: false },
  },
} satisfies Meta<typeof AdaptiveTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TabsMode: Story = {
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
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    await expect(canvas.queryByRole('tablist')).toBeNull();
    await expect(canvasElement.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-mode',
      'accordion',
    );

    // Headers: <details><summary><h3>
    await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    const one = section(canvasElement, 'One');
    const two = section(canvasElement, 'Two');
    const three = section(canvasElement, 'Three');
    await expect(one.summary).toContainElement(
      canvas.getByRole('heading', { level: 3, name: 'One' }),
    );

    await expect(one.details).toHaveAttribute('open');
    await expect(two.details).not.toHaveAttribute('open');
    await expect(three.details).not.toHaveAttribute('open');
    await expect(canvas.getByText(/First panel/)).toBeVisible();
    await expect(canvas.getByText(/Second panel/)).not.toBeVisible();

    // Items open independently; the last one opened becomes the value
    await expect(one.details).not.toHaveAttribute('name');
    await userEvent.click(two.summary);
    await expect(two.details).toHaveAttribute('open');
    await expect(one.details).toHaveAttribute('open');
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith('two'));

    // Closing the current item falls back to the last-opened item still open
    await userEvent.click(two.summary);
    await expect(two.details).not.toHaveAttribute('open');
    await expect(canvas.getByText(/Second panel/)).not.toBeVisible();
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith('one'));

    // Closing a non-current item doesn't change the value
    await userEvent.click(three.summary);
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith('three'));
    await userEvent.click(one.summary);
    await expect(one.details).not.toHaveAttribute('open');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('three');

    // Closing the last open item → null
    await userEvent.click(three.summary);
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith(null));
  },
};

export const Collapsed: Story = {
  args: { defaultValue: null },
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement }) => {
    const all = canvasElement.querySelectorAll('details');
    await expect(all).toHaveLength(3);
    for (const d of all) await expect(d).not.toHaveAttribute('open');

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
  play: async ({ canvasElement, userEvent, args }) => {
    const one = section(canvasElement, 'One');
    const two = section(canvasElement, 'Two');
    const three = section(canvasElement, 'Three');

    await userEvent.tab();
    await expect(one.summary).toHaveFocus();

    // Up/Down/Home/End move focus without changing what's open
    await userEvent.keyboard('{ArrowDown}');
    await expect(two.summary).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(one.summary).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(three.summary).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(one.summary).toHaveFocus();
    await expect(one.details).toHaveAttribute('open');
    await expect(args.onValueChange).not.toHaveBeenCalled();

    // Enter/Space toggle (native <summary> behavior)
    await userEvent.keyboard('{Enter}');
    await expect(one.details).not.toHaveAttribute('open');
    await waitFor(() => expect(args.onValueChange).toHaveBeenLastCalledWith(null));
    await userEvent.keyboard(' ');
    await expect(one.details).toHaveAttribute('open');
    await userEvent.keyboard('{Enter}');

    // Closed panel's link is unreachable: Tab goes header → header
    await userEvent.tab();
    await expect(two.summary).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(two.details).toHaveAttribute('open');
    await expect(one.details).not.toHaveAttribute('open');
    await userEvent.tab();
    await expect(three.summary).toHaveFocus();
  },
};

export const ResizePreservesSelectionAndFocus: Story = {
  name: 'Resize Preserves Selection & Focus',
  tags: ['wip'],
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(section(canvasElement, 'Two').summary);
    await expect(section(canvasElement, 'Two').summary).toHaveFocus();

    // Accordion → tabs: same value selected, focus moves to its tab
    setWidth(canvasElement, WIDE);
    await waitFor(() => expect(canvas.getByRole('tablist')).toBeVisible());
    const tab = canvas.getByRole('tab', { name: 'Two' });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toHaveFocus();

    // Tabs → accordion: same value open, focus moves to its summary
    setWidth(canvasElement, NARROW);
    await waitFor(() => expect(canvas.queryByRole('tablist')).toBeNull());
    const two = section(canvasElement, 'Two');
    await expect(two.details).toHaveAttribute('open');
    await expect(two.summary).toHaveFocus();

    // Collapse to null, then widen: tabs fall back to the last non-null value
    await userEvent.click(two.summary);
    await expect(two.details).not.toHaveAttribute('open');
    setWidth(canvasElement, WIDE);
    await waitFor(() => expect(canvas.getByRole('tablist')).toBeVisible());
    await expect(canvas.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
  },
};

export const ResizeWithSeveralOpen: Story = {
  decorators: [container(NARROW)],
  play: async ({ canvas, canvasElement, userEvent }) => {
    // One is open by default; open Three, then Two, then close Two → Three is current
    await userEvent.click(section(canvasElement, 'Three').summary);
    await userEvent.click(section(canvasElement, 'Two').summary);
    await userEvent.click(section(canvasElement, 'Two').summary);

    // Accordion → tabs: the last-opened item still open is selected
    setWidth(canvasElement, WIDE);
    await waitFor(() => expect(canvas.getByRole('tablist')).toBeVisible());
    await expect(canvas.getByRole('tab', { name: 'Three' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Tabs → accordion: only the selected item is open
    setWidth(canvasElement, NARROW);
    await waitFor(() => expect(canvas.queryByRole('tablist')).toBeNull());
    await expect(section(canvasElement, 'Three').details).toHaveAttribute('open');
    await expect(section(canvasElement, 'One').details).not.toHaveAttribute('open');
    await expect(section(canvasElement, 'Two').details).not.toHaveAttribute('open');
  },
};

export const WithHeader: Story = {
  args: { header: <h2>Section heading</h2> },
  decorators: [container(WIDE)],
  play: async ({ canvas, canvasElement }) => {
    const root = canvasElement.querySelector('[data-part="root"]');
    const heading = canvas.getByRole('heading', { level: 2, name: 'Section heading' });
    await expect(root).toContainElement(heading);

    // Tabs: header comes before the tablist
    const tablist = canvas.getByRole('tablist');
    await expect(
      heading.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    // Accordion: header comes before the first <summary>
    setWidth(canvasElement, NARROW);
    await waitFor(() => expect(canvas.queryByRole('tablist')).toBeNull());
    const first = section(canvasElement, 'One').summary;
    await expect(
      canvas.getByRole('heading', { level: 2 }).compareDocumentPosition(first) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  },
};
