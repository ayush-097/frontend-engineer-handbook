import React, {
  createContext, useContext, useState, useCallback, useMemo, useRef, useId
} from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  baseId: string;
  activatedTabs: Set<string>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(component: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  defaultTab?: string;
  value?: string;
  onChange?: (tab: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ defaultTab = "", value, onChange, children, className }: TabsProps) {
  const [internalTab, setInternalTab] = useState(defaultTab);
  const activeTab = value ?? internalTab;

  // Track which tabs have been activated at least once (for lazy rendering)
  const [activatedTabs, setActivatedTabs] = useState(
    () => new Set(defaultTab ? [defaultTab] : [])
  );

  const setActiveTab = useCallback((tab: string) => {
    if (!value) setInternalTab(tab);
    setActivatedTabs(prev => new Set([...prev, tab]));
    onChange?.(tab);
  }, [value, onChange]);

  const baseId = useId();
  const ctxValue = useMemo(
    () => ({ activeTab, setActiveTab, baseId, activatedTabs }),
    [activeTab, setActiveTab, baseId, activatedTabs]
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ─── TabList ──────────────────────────────────────────────────────────────────
function TabList({ children, className }: { children: React.ReactNode; className?: string }) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    const triggers = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!triggers?.length) return;
    const current = document.activeElement as HTMLButtonElement;
    const idx = Array.from(triggers).indexOf(current);

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      triggers[(idx + 1) % triggers.length].focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      triggers[(idx - 1 + triggers.length) % triggers.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      triggers[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      triggers[triggers.length - 1].focus();
    }
  }

  return (
    <div ref={listRef} role="tablist" onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────
interface TriggerProps {
  tab: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

function TabTrigger({ tab, children, disabled, className }: TriggerProps) {
  const { activeTab, setActiveTab, baseId } = useTabsContext("Tabs.Trigger");
  const isActive = activeTab === tab;

  return (
    <button
      role="tab"
      id={`${baseId}-tab-${tab}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${tab}`}
      aria-disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      onClick={() => !disabled && setActiveTab(tab)}
      className={className}
      style={{ fontWeight: isActive ? "bold" : "normal" }}
    >
      {children}
    </button>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────
interface PanelProps {
  tab: string;
  children: React.ReactNode;
  className?: string;
}

function TabPanel({ tab, children, className }: PanelProps) {
  const { activeTab, baseId, activatedTabs } = useTabsContext("Tabs.Panel");
  const isActive = activeTab === tab;

  // Lazy: don't render content until tab is first activated
  if (!activatedTabs.has(tab)) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${tab}`}
      aria-labelledby={`${baseId}-tab-${tab}`}
      hidden={!isActive}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
}

// ─── Attach sub-components ───────────────────────────────────────────────────
Tabs.List    = TabList;
Tabs.Trigger = TabTrigger;
Tabs.Panel   = TabPanel;

export { Tabs };
