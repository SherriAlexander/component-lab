import type { Meta, StoryObj } from '@storybook/react-vite';
import { contrastRatio } from './tokens/contrast';
import tokens from './tokens/tokens.json';

const meta = {
  title: 'Foundations/Tokens',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Flattens nested color groups into [css-var-name, hex] pairs, e.g. ['color-gray-100', '#f9f9f9'].
type Tree = { [key: string]: string | Tree };
const flatten = (obj: Tree, prefix: string): [string, string][] =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === 'string' ? [[`${prefix}-${key}`, value]] : flatten(value, `${prefix}-${key}`),
  );

const page = {
  fontFamily: 'var(--font-family-system)',
  color: 'var(--neutral-text)',
  background: 'var(--neutral-surface)',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))',
  gap: 'var(--space-2)',
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const swatch = {
  height: '4rem',
  borderRadius: 4,
  border: '1px solid var(--neutral-border-subtle)',
};

const ratio = (a: string, b: string) => `${contrastRatio(a, b).toFixed(1)}:1`;

/** Primitive colors. Swatches paint from the generated CSS variables; labels show the resolved hex. */
export const Palette: Story = {
  render: () => (
    <ul style={{ ...page, ...grid }}>
      {flatten(tokens.color, 'color').map(([name, hex]) => (
        <li key={name}>
          <div style={{ ...swatch, background: `var(--${name})` }} />
          <code>--{name}</code>
          <div>{hex}</div>
        </li>
      ))}
    </ul>
  ),
};

/** Per-tab gradient accents with `on` text contrast against each stop (≥ 4.5:1 enforced by the contrast test). */
export const Accents: Story = {
  render: () => (
    <ul style={{ ...page, ...grid, gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))' }}>
      {Object.entries(tokens.accent).map(([hue, { start, end, on }]) => (
        <li key={hue}>
          <div
            style={{
              ...swatch,
              height: '6rem',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-family-heading)',
              fontSize: '1.5rem',
              color: `var(--accent-${hue}-on)`,
              background: `linear-gradient(to right, var(--accent-${hue}-start), var(--accent-${hue}-end))`,
            }}
          >
            {hue}
          </div>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '0 var(--space-1)',
              margin: 'var(--space-1) 0 0',
            }}
          >
            <dt>start</dt>
            <dd style={{ margin: 0 }}>
              {start} · {ratio(on, start)}
            </dd>
            <dt>end</dt>
            <dd style={{ margin: 0 }}>
              {end} · {ratio(on, end)}
            </dd>
            <dt>on</dt>
            <dd style={{ margin: 0 }}>{on}</dd>
          </dl>
        </li>
      ))}
    </ul>
  ),
};
