import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { BIZ } from "@/lib/biz";
import { SECTIONS } from "@/lib/data";
import { slugify } from "@/lib/slugify";

export function PricingIntro() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-mist border-b border-line">
      <div
        className="absolute -top-28 -right-20 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,.10), transparent 70%)" }}
      ></div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-20">
        <div className="max-w-3xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase">
              <span className="w-6 h-px bg-blue"></span> Upfront, Flat-Rate Pricing
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-4 font-display font-extrabold text-navy leading-[1.05] text-[36px] sm:text-[48px] lg:text-[54px]">
              Know the price <span className="text-blue">before we ring the bell.</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 text-[18px] lg:text-[19px] text-muted leading-relaxed max-w-2xl">
              Most plumbers hide their prices. We publish ours. No hourly meters, no surprise
              add-ons — every job below is a flat rate you approve before any work begins, backed
              by our fixed-price guarantee.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <a
                href="#book"
                className="btn sheen inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-blue text-white font-bold text-[17px] shadow-lift hover:bg-blue-deep"
              >
                Book Now
                <Icon name="arrow-right" className="w-5 h-5" />
              </a>
              <a
                href={BIZ.phoneHref}
                className="btn inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-navy font-bold text-[17px] shadow-soft border border-line hover:border-blue/40"
              >
                <Icon name="phone-call" className="w-5 h-5 text-blue" />
                Call {BIZ.phone}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] font-semibold text-navy/70">
              <span className="inline-flex items-center gap-2">
                <Icon name="shield-check" className="w-[18px] h-[18px] text-blue" /> Licensed
                Master Plumber · Lic# {BIZ.licenseNo}
              </span>
              <span className="w-1 h-1 rounded-full bg-navy/25"></span>
              <span className="inline-flex items-center gap-2">
                <Icon name="badge-check" className="w-[18px] h-[18px] text-blue" /> Fixed-price
                guarantee
              </span>
              <span className="w-1 h-1 rounded-full bg-navy/25"></span>
              <span className="inline-flex items-center gap-2">
                <Icon name="map-pin" className="w-[18px] h-[18px] text-blue" />{" "}
                {BIZ.areas.join(", ")}
              </span>
            </div>
          </Reveal>
        </div>

        {/* Category quick-jump */}
        <Reveal delay={360}>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {SECTIONS.map((s) => (
              <a
                key={s.name}
                href={"#cat-" + slugify(s.name)}
                className="btn inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-line text-[14px] font-bold text-navy/80 hover:text-blue hover:border-blue/40 shadow-soft"
              >
                <Icon name={s.icon} className="w-[17px] h-[17px] text-blue" /> {s.name}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
