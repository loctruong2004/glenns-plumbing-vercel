import { Link } from "react-router-dom";
import { TierCarousel } from "@/components/pricing/TierCarousel";
import { Reveal } from "@/components/ui/Reveal";
import type { ServiceDetail } from "@/lib/data";

// Focused pricing — the 3 tiers for THIS service (04 §3).
export function ServicePricing({ svc }: { svc: ServiceDetail }) {
  return (
    <section id="pricing" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-24">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase">
            <span className="w-6 h-px bg-blue"></span> {svc.nav} pricing
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[30px] sm:text-[40px] leading-[1.08]">
            Upfront flat-rate options
          </h2>
          <p className="mt-4 text-[16px] text-muted leading-relaxed">
            Pick the option that fits, or just call — we'll confirm the flat price before any work
            begins. No hourly meters, no surprise add-ons.
          </p>
        </Reveal>
        <TierCarousel tiers={svc.tiers} service={svc.nav} className="mt-10" />
        <Reveal delay={120}>
          <p className="mt-8 text-[14.5px] text-muted">
            See every service price in one place on our{" "}
            <Link to="/pricing" className="font-bold text-blue">
              full pricing page
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
