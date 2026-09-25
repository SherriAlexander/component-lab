import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import './AdaptiveTabs.css';

export type AdaptiveTabsMode = 'tabs' | 'accordion';
export type AdaptiveTabsActivation = 'automatic' | 'manual';
export type AdaptiveTabsHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface AdaptiveTabsProps {
  /** Accessible name for the tablist (tabs mode) or accordion group. */
  label: string;
  /** Initially open item. `null` = all collapsed (accordion only; tabs mode falls back). */
  defaultValue?: string | null;
  /** Current item changed: selected tab, or last-opened accordion item still open (`null` = none). */
  onValueChange?: (value: string | null) => void;
  /** Tabs mode: `automatic` selects on arrow keys; `manual` waits for Enter/Space. */
  activation?: AdaptiveTabsActivation;
  /** Heading level wrapping each accordion header button. */
  headingLevel?: AdaptiveTabsHeadingLevel;
  className?: string;
  /** Rendered inside the root, before the tablist (tabs) or first header (accordion). E.g. a section heading. */
  header?: ReactNode;
  /** One entry per tab / accordion section, in order. */
  items: AdaptiveTabsItem[];
}

export interface AdaptiveTabsItem {
  /** Unique id; what `value` / `onValueChange` refer to. */
  value: string;
  /** Tab label in tabs mode, header button text in accordion mode. */
  title: ReactNode;
  /** Panel content. */
  content: ReactNode;
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

// TODO: mode detection, tabs
export function AdaptiveTabs({
  className,
  header,
  defaultValue,
  items,
  onValueChange,
}: AdaptiveTabsProps) {
  const [mode, setMode] = useState<AdaptiveTabsMode>('accordion');
  const [openItems, setOpenItems] = useState<string[]>(defaultValue ? [defaultValue] : []);
  const value = openItems.at(-1) ?? null;

  const lastReported = useRef(value);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastReported.current === value) return;
    lastReported.current = value;
    onValueChange?.(value);
  }, [value, onValueChange]);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const cssMode = getComputedStyle(el).getPropertyValue('--adaptive-tabs-mode').trim();
    setMode(cssMode === 'tabs' ? 'tabs' : 'accordion');
  }, []);

  const handleToggle = (itemValue: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenItems((prev) => (prev.includes(itemValue) ? prev : [...prev, itemValue]));
    } else {
      setOpenItems((prev) => prev.filter((v) => v !== itemValue));
    }
  };

  const allClassNames = className ? 'adaptive-tabs ' + className : 'adaptive-tabs';

  return (
    <AdaptiveTabsContext value={{ mode, value }}>
      <div className={allClassNames} data-part="root" data-mode={mode}>
        <div className="adaptive-tabs__inner" ref={innerRef}>
          {header && <div data-part="header">{header}</div>}
          {mode === 'accordion' && (
            <div className="accordion-group">
              {items.map((item) => (
                <details
                  key={item.value}
                  className="accordion"
                  open={openItems.includes(item.value)}
                  onToggle={(event) => {
                    handleToggle(item.value, event.currentTarget.open);
                  }}
                >
                  <summary className="accordion__title">
                    <h3>{item.title}</h3>
                  </summary>
                  <div className="accordion__content">{item.content}</div>
                </details>
              ))}
            </div>
          )}
          {mode === 'tabs' && <p>Hi I'm tabs</p>}
        </div>
      </div>
    </AdaptiveTabsContext>
  );
}
