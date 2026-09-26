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
  /** Accessible name for the tablist. Tabs mode only; accordion mode has no group element to name. */
  label: string;
  /** Initially open item. `null` = all collapsed (accordion only; tabs mode falls back). */
  defaultValue?: string | null;
  /** Current item changed: selected tab, or last-opened accordion item still open (`null` = none). */
  onValueChange?: (value: string | null) => void;
  /** Tabs mode: `automatic` selects on arrow keys; `manual` waits for Enter/Space. */
  activation?: AdaptiveTabsActivation;
  /** Heading level wrapping each accordion header (default 3). */
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

export function AdaptiveTabs({
  activation = 'automatic',
  className,
  defaultValue,
  header,
  headingLevel = 3,
  items,
  label,
  onValueChange,
}: AdaptiveTabsProps) {
  const [mode, setMode] = useState<AdaptiveTabsMode>('accordion');
  const [openItems, setOpenItems] = useState<string[]>(defaultValue ? [defaultValue] : []);
  const [lastOpened, setLastOpened] = useState(defaultValue ?? items[0]?.value ?? null);

  const value = openItems.at(-1) ?? null;
  const activeTabValue = value ?? lastOpened ?? items[0]?.value ?? null;
  const currentValue = mode === 'tabs' ? activeTabValue : value;

  const id = useId();
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastReported = useRef(currentValue);
  const innerRef = useRef<HTMLDivElement>(null);
  const focusedTriggerValue = useRef<string | null>(null);

  useEffect(() => {
    if (lastReported.current === currentValue) return;
    lastReported.current = currentValue;
    onValueChange?.(currentValue);
  }, [currentValue, onValueChange]);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const readMode = () => {
      const cssMode = getComputedStyle(el).getPropertyValue('--adaptive-tabs-mode').trim();
      const next = cssMode === 'tabs' ? 'tabs' : 'accordion';
      const focused = document.activeElement;
      focusedTriggerValue.current =
        focused instanceof HTMLElement && el.contains(focused)
          ? (focused.closest<HTMLElement>('[data-part="trigger"]')?.dataset.value ?? null)
          : null;
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

  useLayoutEffect(() => {
    const value = focusedTriggerValue.current;
    if (!value) return;
    focusedTriggerValue.current = null;
    innerRef.current
      ?.querySelector<HTMLElement>(`[data-part="trigger"][data-value="${CSS.escape(value)}"]`)
      ?.focus();
  }, [mode]);

  const handleToggle = (itemValue: string, isOpen: boolean) => {
    if (isOpen) {
      setOpenItems((prev) => (prev.includes(itemValue) ? prev : [...prev, itemValue]));
      setLastOpened(itemValue);
    } else {
      setOpenItems((prev) => prev.filter((v) => v !== itemValue));
    }
  };

  const handleTabNavKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextTabIndex: number;
    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        nextTabIndex = (index + 1) % items.length;
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        nextTabIndex = (index - 1 + items.length) % items.length;
        break;
      }
      case 'Home': {
        event.preventDefault();
        nextTabIndex = 0;
        break;
      }
      case 'End': {
        event.preventDefault();
        nextTabIndex = items.length - 1;
        break;
      }
      default:
        return;
    }

    tabButtonRefs.current[nextTabIndex]?.focus();
    if (activation === 'automatic') {
      const nextTabValue = items[nextTabIndex]?.value ?? null;
      if (nextTabValue) {
        selectTab(nextTabValue);
      }
    }
  };

  const selectTab = (itemValue: string) => {
    setOpenItems([itemValue]);
    setLastOpened(itemValue);
  };

  const Heading = `h${String(headingLevel)}` as `h${AdaptiveTabsHeadingLevel}`;
  const allClassNames = className ? 'adaptive-tabs ' + className : 'adaptive-tabs';

  return (
    <AdaptiveTabsContext value={{ mode, value: currentValue }}>
      <div className={allClassNames} data-part="root" data-mode={mode} data-value={currentValue}>
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
                  <summary data-part="trigger" data-value={item.value}>
                    <Heading>{item.title}</Heading>
                  </summary>
                  <div data-part="panel">{item.content}</div>
                </details>
              ))}
            </div>
          )}
          {mode === 'tabs' && (
            <>
              <div data-part="tablist" role="tablist" aria-label={label}>
                {items.map((item, index) => {
                  const isSelected = item.value === activeTabValue;
                  return (
                    <button
                      key={item.value}
                      ref={(el) => {
                        tabButtonRefs.current[index] = el;
                      }}
                      data-part="trigger"
                      data-value={item.value}
                      role="tab"
                      id={`${id}-tab-${index}`}
                      aria-selected={isSelected}
                      aria-controls={`${id}-tabpanel-${index}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => {
                        selectTab(item.value);
                      }}
                      onKeyDown={(event) => {
                        handleTabNavKeyDown(event, index);
                      }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>
              <div className="adaptive-tabs__tabpanels">
                {items.map((item, index) => {
                  const isSelected = item.value === activeTabValue;
                  return (
                    <div
                      key={item.value}
                      data-part="panel"
                      data-value={item.value}
                      data-state={isSelected ? 'active' : 'inactive'}
                      role="tabpanel"
                      id={`${id}-tabpanel-${index}`}
                      aria-labelledby={`${id}-tab-${index}`}
                      hidden={!isSelected}
                      inert={!isSelected}
                      tabIndex={0}
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
