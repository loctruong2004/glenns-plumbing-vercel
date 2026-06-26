import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { BIZ } from "@/lib/biz";
import { HOME_SERVICES } from "@/lib/data";

export function Services() {
  return (
    <section id="services" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase">
            <span className="w-6 h-px bg-blue"></span> What we do
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[34px] sm:text-[44px] leading-[1.06]">
            One licensed team for every plumbing job
          </h2>
          <p className="mt-4 text-[17px] text-muted leading-relaxed">
            Emergency or planned, big or small — repaired right, priced upfront, and done to NYC
            code. Pick a service for details, or just call and we'll take it from there.
          </p>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOME_SERVICES.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 80}>
              <Link
                to={`/services/${s.slug}`}
                className="lift group relative flex flex-col h-full bg-white rounded-2xl border border-line p-7 shadow-soft hover:shadow-lift hover:border-transparent"
              >
                <span className="absolute inset-x-0 top-0 h-1 rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-blue"></span>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue/10">
                  <Icon name={s.icon} className="w-7 h-7 text-blue" />
                </div>
                <h3 className="mt-5 font-display font-bold text-navy text-[20px]">{s.title}</h3>
                <p className="mt-2 text-[15px] text-muted leading-relaxed flex-1">{s.benefit}</p>
                <div className="mt-5 pt-5 border-t border-line flex items-center justify-between">
                  <span className="leading-tight">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-muted">
                      {s.bigTicket ? "Free estimate" : "Pricing"}
                    </span>
                    <span className="block font-display font-extrabold text-navy text-[18px]">
                      {s.price}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-navy/70 group-hover:text-blue transition-colors">
                    Learn more
                    <Icon
                      name="arrow-right"
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-[14.5px] text-muted">
            Not sure which you need?{" "}
            <a href={BIZ.phoneHref} className="font-bold text-blue">
              Call {BIZ.phone}
            </a>{" "}
            — we'll diagnose it free over the phone.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
