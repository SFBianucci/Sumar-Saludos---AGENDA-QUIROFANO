import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// --- Context ---
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  labels: Record<string, string>;
  registerLabel: (value: string, label: string) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

// --- Components ---

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const registerLabel = (val: string, label: string) => {
    // Only update if not exists to avoid infinite loops
    if (!labels[val] || labels[val] !== label) {
       setLabels(prev => ({ ...prev, [val]: label }));
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, labels, registerLabel }}>
      <div className="relative inline-block w-full text-left" ref={containerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");

  return (
    <button
      type="button"
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={`
        flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm 
        placeholder:text-slate-500 
        focus:outline-none focus:border-sky-500 focus:bg-slate-50
        disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200
        ${className || ""}
      `}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string; children?: React.ReactNode }> = ({ placeholder, children }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within Select");

  let content = children;
  
  if (!content) {
      if (context.value) {
          content = context.labels[context.value] || context.value;
      } else {
          content = placeholder;
      }
  }

  const isPlaceholder = !content || (content === placeholder && !context.value);

  return (
    <span className={`block truncate ${isPlaceholder ? "text-slate-500" : "text-slate-900"}`}>
      {content}
    </span>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within Select");

  if (!context.isOpen) return null;

  return (
    <div className={`
      absolute z-50 mt-1 max-h-60 w-full min-w-[8rem] overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md 
      animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2
      ${className || ""}
    `}>
      {children}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectItem must be used within Select");

  // Register label for the SelectValue to display
  useEffect(() => {
    if (typeof children === 'string') {
        context.registerLabel(value, children);
    }
  }, [value, children]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSelected = context.value === value;

  return (
    <div
      onClick={() => {
        context.onValueChange(value);
        context.setIsOpen(false);
      }}
      className={`
        relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none 
        hover:bg-slate-100 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        ${isSelected ? "bg-slate-50" : ""}
        ${className || ""}
      `}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4 text-sky-600" />}
      </span>
      <span className="truncate text-slate-700">{children}</span>
    </div>
  );
};