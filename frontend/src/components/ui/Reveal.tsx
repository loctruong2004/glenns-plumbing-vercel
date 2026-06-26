import type { ElementType, ReactNode } from "react";

// Scroll-reveal wrapper (02 §atoms). Server-safe: just renders the element
// with [data-reveal] + a stagger delay; ui/RevealObserver adds `.in` when
// ~12% in view. Reduced-motion is handled in globals.css.
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
} & Record<string, unknown>) {
  return (
    <Tag data-reveal className={className} style={{ transitionDelay: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
