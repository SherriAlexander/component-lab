import { createContext, useContext, type ReactNode } from 'react';

export type AdaptiveTabsMode = 'tabs' | 'accordion';
export type AdaptiveTabsActivation = 'automatic' | 'manual';
export type AdaptiveTabsHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AdaptiveTabsProps {
  /** Accessible name for the tablist (tabs mode) or accordion group. */
  label: string;
  /** Controlled open item. `null` = all collapsed (accordion only; tabs mode falls back). */
  value?: string | null;
  /** Uncontrolled initial open item. */
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Tabs mode: `automatic` selects on arrow keys; `manual` waits for Enter/Space. */
  activation?: AdaptiveTabsActivation;
  /** Heading level wrapping each accordion header button. */
  headingLevel?: AdaptiveTabsHeadingLevel;
  className?: string;
  children: ReactNode;
}

export interface AdaptiveTabsItemProps {
  value: string;
  /** Tab label in tabs mode, header button text in accordion mode. */
  title: ReactNode;
  /** Panel content. */
  children: ReactNode;
}

export interface AdaptiveTabsState {
  mode: AdaptiveTabsMode;
  value: string | null;
}

const AdaptiveTabsContext = createContext<AdaptiveTabsState | null>(null);

/** Current mode and open value, for content that adapts (e.g. panel heading levels). */
export function useAdaptiveTabs(): AdaptiveTabsState {
  const state = useContext(AdaptiveTabsContext);
  if (!state) throw new Error('useAdaptiveTabs must be used inside <AdaptiveTabs>');
  return state;
}

// TODO: state, mode detection, rendering. Shell only.
function Root({ className, children }: AdaptiveTabsProps) {
  const state: AdaptiveTabsState = { mode: 'accordion', value: null };
  return (
    <AdaptiveTabsContext value={state}>
      <div className={className} data-part="root" data-mode={state.mode}>
        {children}
      </div>
    </AdaptiveTabsContext>
  );
}

// TODO: Root reads Item props to render either mode's DOM.
const Item: (props: AdaptiveTabsItemProps) => ReactNode = () => null;

export const AdaptiveTabs = Object.assign(Root, { Item });
