import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { BIZ } from "@/lib/biz";
import type { ServiceDetail } from "@/lib/data";

// Service hero (04 §3): split content + photo (or striped .ph placeholder for
// the 4 services without photography, R-8), floating price chip + trust badge.
export function ServiceHero({ svc }: { svc: ServiceDetail }) {
  return (
    <section className="relative overflow-hidden bg-white border-b border-line">
      <div
        className="absolute -top-28 -right-24 w-[28rem] h-[28rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,.08), transparent 70%)" }}
      ></div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
          {/* Content */}
          <div>
            <Reveal>
              <nav className="flex items-center gap-2 text-[13px] font-semibold text-muted">
                <Link to="/" className="hover:text-blue transition-colors">
                  Home
                </Link>
                <Icon name="chevron-right" className="w-3.5 h-3.5" />
                <a href="/#services" className="hover:text-blue transition-colors">
                  Services
                </a>
                <Icon name="chevron-right" className="w-3.5 h-3.5" />
                <span className="text-navy">{svc.nav}</span>
              </nav>
            </Reveal>
            <Reveal delay={70}>
              <div className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-blue/10 px-3.5 py-1.5">
                <Icon name={svc.icon} className="w-4 h-4 text-blue" />
                <span className="text-[13px] font-bold text-blue">{svc.nav}</span>
              </div>
            </Reveal>
            <Reveal delay={130}>
              <h1 className="mt-4 font-display font-extrabold text-navy leading-[1.06] text-[34px] sm:text-[44px] lg:text-[50px]">
                {svc.title}
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-5 text-[17px] lg:text-[18px] text-muted leading-relaxed max-w-xl">
                {svc.lead}
              </p>
            </Reveal>

            {/* Price chip */}
            <Reveal delay={260}>
              <div className="mt-7 inline-flex items-center gap-3.5 rounded-2xl border border-line bg-mist px-5 py-3.5 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue text-white shrink-0">
                  <Icon name="tag" className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <div className="font-display font-extrabold text-navy text-[20px]">
                    {svc.price.value}
                  </div>
                  <div className="text-[13px] font-semibold text-muted">{svc.price.note}</div>
                </div>
              </div>
            </Reveal>

            {/* Highlight pills */}
            <Reveal delay={320}>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {svc.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[13.5px] font-bold text-navy/80 shadow-soft"
                  >
                    <Icon name="check" className="w-4 h-4 text-blue" strokeWidth={3} /> {h}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={380}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                <a
                  href="#book"
                  className="btn sheen inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-blue text-white font-bold text-[17px] shadow-lift hover:bg-blue-deep"
                >
                  Get a Free Quote <Icon name="arrow-right" className="w-5 h-5" />
                </a>
                <a
                  href={BIZ.phoneHref}
                  className="btn inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-navy font-bold text-[17px] shadow-soft border border-line hover:border-blue/40"
                >
                  <Icon name="phone-call" className="w-5 h-5 text-blue" /> Call 24/7
                </a>
              </div>
            </Reveal>
          </div>

          {/* Photo / placeholder */}
          <Reveal delay={200}>
            <div className="relative">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-lift border border-line">
                {svc.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={"/" + svc.image}
                    alt={svc.nav + " — Glenn's Plumbing"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="ph absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <Icon name={svc.icon} className="w-12 h-12 text-navy/30" />
                    <span className="ph-label mt-4 text-[11px] font-bold uppercase text-navy/40">
                      {svc.imageLabel}
                    </span>
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, transparent 55%, rgba(15,28,46,.55) 100%)",
                  }}
                ></div>
              </div>
              {/* Floating trust badge */}
              <div className="absolute -bottom-5 -left-3 sm:left-6 bg-white rounded-2xl shadow-lift border border-line px-5 py-3.5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Icon name="badge-check" className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="leading-tight">
                  <div className="font-display font-extrabold text-navy text-[14px]">
                    {BIZ.homes} NYC homes
                  </div>
                  <div className="text-[12px] font-semibold text-muted">
                    {BIZ.rating}★ · Lic# {BIZ.licenseNo}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
