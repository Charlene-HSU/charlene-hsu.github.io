import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { cn, type WithClassName } from "@/lib/utils";

export type CollapsibleRootProps = WithClassName<BaseCollapsible.Root.Props>;
export function CollapsibleRoot({ className, ...props }: CollapsibleRootProps) {
  return <BaseCollapsible.Root className={cn("flex flex-col", className)} {...props} />;
}

export type CollapsibleTriggerProps = WithClassName<BaseCollapsible.Trigger.Props>;
export function CollapsibleTrigger({ className, ...props }: CollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger
      className={cn(
        "group inline-flex items-center gap-2 rounded-md py-1.5 font-mono text-body font-bold text-gray transition-colors select-none cursor-pointer hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-panel-open:text-green",
        className,
      )}
      {...props}
    />
  );
}

export type CollapsiblePanelProps = WithClassName<BaseCollapsible.Panel.Props>;
export function CollapsiblePanel({ className, ...props }: CollapsiblePanelProps) {
  return (
    <BaseCollapsible.Panel
      className={cn("overflow-hidden pt-2 text-paragraph text-foreground", className)}
      {...props}
    />
  );
}

export type AccordionRootProps = WithClassName<BaseAccordion.Root.Props>;
export function AccordionRoot({ className, ...props }: AccordionRootProps) {
  return <BaseAccordion.Root className={cn("flex flex-col gap-2", className)} {...props} />;
}

export type AccordionItemProps = WithClassName<BaseAccordion.Item.Props>;
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <BaseAccordion.Item
      className={cn(
        "overflow-hidden border border-rule bg-surface transition-colors data-open:border-green/60",
        className,
      )}
      {...props}
    />
  );
}

export type AccordionHeaderProps = WithClassName<BaseAccordion.Header.Props>;
export function AccordionHeader({ className, ...props }: AccordionHeaderProps) {
  return <BaseAccordion.Header className={cn("m-0 flex", className)} {...props} />;
}

export type AccordionTriggerProps = WithClassName<BaseAccordion.Trigger.Props>;
export function AccordionTrigger({ className, ...props }: AccordionTriggerProps) {
  return (
    <BaseAccordion.Trigger
      className={cn(
        "flex w-full items-center justify-between gap-4 p-5 text-left font-mono transition-colors cursor-pointer hover:bg-rule/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
        className,
      )}
      {...props}
    />
  );
}

export type AccordionPanelProps = WithClassName<BaseAccordion.Panel.Props>;
export function AccordionPanel({ className, ...props }: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      className={cn("border-t border-rule bg-background p-5", className)}
      {...props}
    />
  );
}
