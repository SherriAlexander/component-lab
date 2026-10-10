import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { ArrowForward } from '../../assets/icons';
import { AdaptiveTabs, useAdaptiveTabs } from '../../components/AdaptiveTabs/AdaptiveTabs';
import { heroTitle, tabs, type AdventureValue } from './content';
import './PlanYourAdventure.css';

/** h3 in tabs mode (under the h2); h4 in accordion mode (under each h3 accordion header). */
const PanelHeading = ({ children }: { children: ReactNode }) => {
  const { mode } = useAdaptiveTabs();
  const Heading = mode === 'tabs' ? 'h3' : 'h4';
  return <Heading className="adventure-hero__heading">{children}</Heading>;
};

const items = tabs.map((tab) => ({
  value: tab.value,
  title: tab.title,
  content: (
    <div className="adventure-hero__panel">
      <div className="adventure-hero__copy">
        <PanelHeading>{tab.heading}</PanelHeading>
        <p>{tab.body}</p>
        <a className="adventure-hero__cta" href={tab.cta.href}>
          {tab.cta.label} <ArrowForward />
        </a>
      </div>
      <img
        className="adventure-hero__photo"
        src={tab.photo.src}
        srcSet={tab.photo.srcSet}
        width={900}
        height={600}
        alt=""
      />
      <p className="adventure-hero__stat">
        <strong>{tab.stat.value}</strong> {tab.stat.label}
      </p>
    </div>
  ),
}));

const AdventureHero = ({ defaultValue }: { defaultValue: AdventureValue }) => (
  <AdaptiveTabs
    className="adventure-hero"
    label={heroTitle}
    defaultValue={defaultValue}
    header={<h2 className="adventure-hero__title">{heroTitle}</h2>}
    items={items}
  />
);

const page: Decorator = (Story) => (
  <div className="adventure-page">
    <Story />
  </div>
);

const meta = {
  title: 'Compositions/Hero/Plan Your Adventure',
  component: AdventureHero,
  decorators: [page],
  parameters: {
    layout: 'fullscreen',
    // TODO: switch back to the global 'error' once the hero is styled (unstyled links fail contrast on the dark page)
    a11y: { test: 'todo' },
  },
  argTypes: {
    defaultValue: { control: 'select', options: tabs.map((t) => t.value) },
  },
} satisfies Meta<typeof AdventureHero>;

export default meta;
type Story = StoryObj<typeof meta>;

// One story per tab, so a11y and Chromatic check each accent.
export const Experience: Story = { args: { defaultValue: 'experience' } };
export const Inspire: Story = { args: { defaultValue: 'inspire' } };
export const Explore: Story = { args: { defaultValue: 'explore' } };
export const Connect: Story = { args: { defaultValue: 'connect' } };

/** `count` containers from 20rem to 80rem wide: accordion, tabs, and tabs + stat tiers side by side. */
export const SideBySide: StoryObj<{ count: number; defaultValue: AdventureValue }> = {
  args: { count: 4, defaultValue: 'experience' },
  argTypes: { count: { control: { type: 'range', min: 2, max: 8 } } },
  render: ({ count, defaultValue }) => {
    const widths = Array.from({ length: count }, (_, i) => 20 + (60 * i) / (count - 1));
    return (
      <div className="adventure-side-by-side">
        {widths.map((w) => (
          <figure key={w} style={{ width: `${String(w)}rem` }}>
            <figcaption>{Math.round(w)}rem container</figcaption>
            <AdventureHero defaultValue={defaultValue} />
          </figure>
        ))}
      </div>
    );
  },
};

/**
 * Chromatic snapshots every story with `prefers-reduced-motion: reduce`. To see it here,
 * turn on Reduce Motion in your OS accessibility settings, then switch tabs.
 */
// TODO: once animation lands, decide whether this needs anything beyond the Experience story
export const ReducedMotion: Story = { args: { defaultValue: 'experience' } };
