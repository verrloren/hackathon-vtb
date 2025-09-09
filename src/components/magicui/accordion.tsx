"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type RootContext = {
  expanded: string[];
  setExpanded: (next: string[]) => void;
};

const AccordionRootContext = createContext<RootContext | null>(null);

type RootProps = {
  type?: "single" | "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  dir?: "ltr" | "rtl" | undefined;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

function Root({
  type = "multiple",
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...rest
}: RootProps) {
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const expanded = isControlled ? (value as string[]) : internal;

  const setExpanded = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const ctx = useMemo(() => ({ expanded, setExpanded }), [expanded]);

  return (
    <AccordionRootContext.Provider value={ctx}>
      <div className={className} {...rest}>
        {children}
      </div>
    </AccordionRootContext.Provider>
  );
}

type ItemContext = { value: string };
const AccordionItemContext = createContext<ItemContext | null>(null);

type ItemProps = {
  value: string;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ value, className, children, ...rest }, ref) => {
    return (
      <AccordionItemContext.Provider value={{ value }}>
        <div ref={ref} className={className} {...rest}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  }
);
Item.displayName = "AccordionItem";

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children?: React.ReactNode;
};

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ className, children, onClick, ...rest }, ref) => {
    const root = useContext(AccordionRootContext);
    const item = useContext(AccordionItemContext);
    if (!root || !item) return null;

    const isOpen = root.expanded.includes(item.value);
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      const next = isOpen
        ? root.expanded.filter((v) => v !== item.value)
        : [...root.expanded, item.value];
      root.setExpanded(next);
    };

    return (
      <div
        ref={ref}
        onClick={handleClick}
        data-state={isOpen ? "open" : "closed"}
        className={className}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Trigger.displayName = "AccordionTrigger";

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: React.ReactNode;
};

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, children, ...rest }, ref) => {
    const root = useContext(AccordionRootContext);
    const item = useContext(AccordionItemContext);
    if (!root || !item) return null;

    const isOpen = root.expanded.includes(item.value);
    return (
      <div
        ref={ref}
        hidden={!isOpen}
        data-state={isOpen ? "open" : "closed"}
        className={className}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Content.displayName = "AccordionContent";

export { Root, Item, Trigger, Content };
