import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { BIZ } from "@/lib/biz";

export function HomeHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-navy-deep">
      {/* Photo background + dark overlay */}
      <div
        className="absolute inset-0 hero-photo"
        style={{ backgroundImage: "url('/images/hero-pipe-leak-repair.jpg')" }}
      ></div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(15,28,46,.94) 0%, rgba(15,28,46,.86) 42%, rgba(21,41,63,.55) 100%)",
        }}
      ></div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(15,28,46,.85) 0%, transparent 38%)" }}
      ></div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 pt-16 sm:pt-20 lg:pt-24 pb-16 lg:pb-24">
        <div className="max-w-2xl">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-3.5 py-1.5">
              <span className="pulse-dot text-emerald-400 inline-flex">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              </span>
              <span className="text-[13px] font-bold text-white/90">
                Master plumber on call now · 24/7 emergency line
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display font-extrabold text-white leading-[1.05] text-[38px] sm:text-[50px] lg:text-[58px]">
              NYC's Licensed Master Plumber.
              <br className="hidden sm:block" />
              <span className="text-amber-soft">Same-day repairs,</span> upfront flat-rate pricing.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 text-[18px] lg:text-[19px] text-white/75 leading-relaxed max-w-xl">
              You approve a fixed price before we start — no hourly meter, no padded invoices, no
              surprises. Serving {BIZ.areas.slice(0, 3).join(", ")} &amp; {BIZ.areas[3]}.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <a
                href="#book"
                className="btn sheen inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-blue text-white font-bold text-[17px] shadow-lift hover:bg-blue-deep"
              >
                Get a Free Quote
                <Icon name="arrow-right" className="w-5 h-5" />
              </a>
              <a
                href={BIZ.phoneHref}
                className="btn inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-navy font-bold text-[17px] shadow-soft hover:bg-white/90"
              >
                <Icon name="phone-call" className="w-5 h-5 text-blue" />
                Call 24/7
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] font-semibold text-white/80">
              <span className="inline-flex items-center gap-2">
                <Icon name="shield-check" className="w-[18px] h-[18px] text-amber-soft" /> Licensed
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30"></span>
              <span className="inline-flex items-center gap-2">
                <Icon name="badge-check" className="w-[18px] h-[18px] text-amber-soft" /> Insured
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30"></span>
              <span className="inline-flex items-center gap-2">
                <Icon name="home" className="w-[18px] h-[18px] text-amber-soft" /> {BIZ.homes} NYC
                homes
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30"></span>
              <span className="inline-flex items-center gap-2">
                <Icon name="star" className="w-[18px] h-[18px] text-amber-soft fill-current" />{" "}
                {BIZ.rating}★
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
