import {
  createContext,
  useContext,
  useState,
  ReactNode,
  HTMLAttributes,
  ButtonHTMLAttributes,
} from 'react';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs component');
  }
  return context;
};

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className = '',
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab: handleValueChange }}
    >
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const TabList = ({ children, className = '', ...props }: TabListProps) => {
  return (
    <div
      role="tablist"
      className={`flex flex-wrap bg-gray-50 border-b border-gray-200 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export const Tab = ({
  value,
  children,
  className = '',
  disabled = false,
  ...props
}: TabProps) => {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={`px-3 py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 relative ${
        isActive
          ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export const TabPanel = ({
  value,
  children,
  className = '',
  ...props
}: TabPanelProps) => {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.displayName = 'Tabs';
TabList.displayName = 'TabList';
Tab.displayName = 'Tab';
TabPanel.displayName = 'TabPanel';
