import { useEffect, useRef } from "react";
import { PricingCard } from "@/components/pricing/PricingCard";
import { Reveal } from "@/components/ui/Reveal";
import type { Tier } from "@/lib/data";

// The key responsive interaction (02 §TierCarousel, R-3): static 3-col grid at
// lg; horizontal scroll-snap carousel below it with the highlighted (middle)
// tier auto-centered on mount + resize and the neighbours peeking. Never a
// vertical stack, never order-first.
export function TierCarousel({
  tiers,
  service,
  className = "",
}: {
  tiers: Tier[];
  service?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const center = () => {
      const c = ref.current;
      if (!c) return;
      if (c.scrollWidth <= c.clientWidth + 4) return; // desktop grid — nothing to scroll
      const hi = c.querySelector("[data-tier-highlight]");
      if (!hi) return;
      const cRect = c.getBoundingClientRect();
      const hRect = hi.getBoundingClientRect();
      // behavior:"auto" — reduced-motion friendly (golden rule 5)
      c.scrollTo({
        left: c.scrollLeft + (hRect.left - cRect.left) - (c.clientWidth - hRect.width) / 2,
        behavior: "auto",
      });
    };
    const t = setTimeout(center, 420);
    window.addEventListener("resize", center);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", center);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-carousel
      className={
        "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pt-6 pb-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:snap-none lg:px-0 lg:pt-0 lg:pb-0 lg:items-stretch " +
        className
      }
    >
      {tiers.map((tier, i) => (
        <Reveal
          key={tier.name}
          delay={(i % 3) * 80}
          className="snap-center shrink-0 basis-[72%] sm:basis-[56%] lg:basis-auto lg:shrink"
          {...(tier.highlight ? { "data-tier-highlight": "" } : {})}
        >
          <PricingCard tier={tier} service={service} />
        </Reveal>
      ))}
    </div>
  );
}
