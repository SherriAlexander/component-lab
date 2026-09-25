import {
  createContext,
  useContext,
  useEffect,
  useId,
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

// TODO: tabs
export function AdaptiveTabs({
  className,
  defaultValue,
  header,
  items,
  label,
  onValueChange,
}: AdaptiveTabsProps) {
  const [mode, setMode] = useState<AdaptiveTabsMode>('accordion');
  const [openItems, setOpenItems] = useState<string[]>(defaultValue ? [defaultValue] : []);
  const [lastOpened, setLastOpened] = useState(defaultValue ?? null);
  const value = openItems.at(-1) ?? null;
  const selectedTab = value ?? lastOpened ?? items[0]?.value ?? null;
  const current = mode === 'tabs' ? selectedTab : value;

  const id = useId();
  const lastReported = useRef(current);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastReported.current === current) return;
    lastReported.current = current;
    onValueChange?.(current);
  }, [current, onValueChange]);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const readMode = () => {
      const cssMode = getComputedStyle(el).getPropertyValue('--adaptive-tabs-mode').trim();
      const next = cssMode === 'tabs' ? 'tabs' : 'accordion';
      setMode(next);
      if (next === 'tabs') {
        setOpenItems((prev) => (prev.length > 1 ? prev.slice(-1) : prev));
      }
    };

    readMode();

    const observer = new ResizeObserver(readMode);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleToggle = (itemValue: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenItems((prev) => (prev.includes(itemValue) ? prev : [...prev, itemValue]));
      setLastOpened(itemValue);
    } else {
      setOpenItems((prev) => prev.filter((v) => v !== itemValue));
    }
  };

  const selectTab = (itemValue: string) => {
    setOpenItems([itemValue]);
    setLastOpened(itemValue);
  };

  const allClassNames = className ? 'adaptive-tabs ' + className : 'adaptive-tabs';

  return (
    <AdaptiveTabsContext value={{ mode, value: current }}>
      <div className={allClassNames} data-part="root" data-mode={mode} data-value={current}>
        <div className="adaptive-tabs__inner" ref={innerRef}>
          {header && <div data-part="header">{header}</div>}

          {mode === 'accordion' && (
            <div className="adaptive-tabs__accordion-group">
              {items.map((item) => (
                <details
                  key={item.value}
                  data-part="item"
                  data-value={item.value}
                  open={openItems.includes(item.value)}
                  onToggle={(event) => {
                    handleToggle(item.value, event.currentTarget.open);
                  }}
                >
                  <summary data-part="trigger">
                    <h3>{item.title}</h3>
                  </summary>
                  <div data-part="panel">{item.content}</div>
                </details>
              ))}
            </div>
          )}
          {mode === 'tabs' && (
            <>
              <div data-part="tablist" role="tablist" aria-label={label}>
                {items.map((item) => {
                  const isSelected = item.value === selectedTab;
                  return (
                    <button
                      key={item.value}
                      data-part="trigger"
                      data-value={item.value}
                      role="tab"
                      id={`${id}-tab-${item.value}`}
                      aria-selected={isSelected}
                      aria-controls={`${id}-tabpanel-${item.value}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => {
                        selectTab(item.value);
                      }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
              <div className="adaptive-tabs__tabpanels">
                {items.map((item) => {
                  const isSelected = item.value === selectedTab;
                  return (
                    <div
                      key={item.value}
                      data-part="panel"
                      data-value={item.value}
                      data-state={isSelected ? 'active' : 'inactive'}
                      role="tabpanel"
                      id={`${id}-tabpanel-${item.value}`}
                      aria-labelledby={`${id}-tab-${item.value}`}
                      hidden={!isSelected}
                      inert={!isSelected}
                    >
                      {item.content}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AdaptiveTabsContext>
  );
}
