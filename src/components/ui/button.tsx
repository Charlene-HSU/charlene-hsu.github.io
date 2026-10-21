import { Button as BaseButton } from "@base-ui/react/button";
import { cn, type WithClassName } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "inverted";
export type ButtonSize = "default" | "lg" | "icon";

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-mono font-bold transition-colors select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-disabled:pointer-events-none data-disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-green text-background border border-green hover:bg-green/90",
  outline: "bg-surface text-foreground border border-rule hover:border-foreground hover:bg-rule/40",
  ghost:
    "bg-transparent text-gray border border-transparent hover:text-foreground hover:bg-surface",
  inverted: "bg-background text-foreground border border-background hover:bg-surface",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-control px-4 rounded-md text-body",
  lg: "h-control-lg px-5 rounded-md text-lead",
  icon: "size-control-icon rounded-full p-0 text-body",
};

export function buttonVariants({
  variant = "outline",
  size = "default",
  className,
}: ButtonStyleOptions = {}): string {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

export type ButtonProps = WithClassName<BaseButton.Props> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "outline",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return <BaseButton className={buttonVariants({ variant, size, className })} {...props} />;
}
