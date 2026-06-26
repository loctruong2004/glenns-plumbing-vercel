import { TierCarousel } from "@/components/pricing/TierCarousel";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { PricingSection } from "@/lib/data";
import { slugify } from "@/lib/slugify";

// One pricing category (04 §2): background alternates by index (even = white,
// odd = mist); the financing note renders only when the data provides it
// (Water Heater Installation).
export function PricingCategory({
  section,
  index,
}: {
  section: PricingSection;
  index: number;
}) {
  return (
    <section id={"cat-" + slugify(section.name)} className={index % 2 === 1 ? "bg-mist" : "bg-white"}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-20">
        {/* Header — left-aligned icon + name + description */}
        <Reveal className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue/10 text-blue">
            <Icon name={section.icon} className="w-7 h-7" />
          </span>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display font-extrabold tracking-tight text-navy text-[28px] sm:text-[32px] leading-tight">
                {section.name}
              </h2>
              <span className="hidden sm:inline-flex items-center rounded-full bg-navy/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                {section.tiers.length} options
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-[15.5px] text-muted leading-relaxed">
              {section.description}
            </p>
          </div>
        </Reveal>

        {/* Financing note (water heater) */}
        {section.financing && (
          <Reveal delay={60}>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue/20 bg-blue/[0.05] px-5 py-4">
              <Icon name="hand-coins" className="w-5 h-5 text-blue shrink-0 mt-0.5" />
              <p className="text-[14.5px] font-semibold text-navy/80 leading-relaxed">
                {section.financing}
              </p>
            </div>
          </Reveal>
        )}

        {/* 3-up grid on desktop → horizontal swipe carousel on mobile */}
        <TierCarousel tiers={section.tiers} service={section.name} className="mt-9" />
      </div>
    </section>
  );
}
