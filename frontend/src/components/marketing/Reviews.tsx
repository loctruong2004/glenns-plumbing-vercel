import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";
import { BIZ } from "@/lib/biz";
import { REVIEWS } from "@/lib/data";

export function Reviews() {
  return (
    <section id="reviews" className="bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
        <Reveal className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase justify-center">
            <span className="w-6 h-px bg-blue"></span> Loved by neighbors{" "}
            <span className="w-6 h-px bg-blue"></span>
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[34px] sm:text-[44px] leading-[1.06]">
            Trusted across {BIZ.homes} NYC homes
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Stars className="w-5 h-5" />
            <span className="text-[15px] font-bold text-navy">{BIZ.rating}/5</span>
            <span className="text-[15px] text-muted font-semibold">· verified reviews</span>
          </div>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 4) * 70}>
              <figure className="lift h-full bg-white rounded-2xl border border-line p-6 shadow-soft hover:shadow-lift flex flex-col">
                <Stars className="w-4 h-4" />
                <blockquote className="mt-3 text-[14.5px] text-navy/85 leading-relaxed flex-1">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-5 pt-5 border-t border-line flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-white text-[14px]"
                    style={{ background: "linear-gradient(140deg, var(--blue), var(--navy))" }}
                  >
                    {t.initials}
                  </span>
                  <span className="leading-tight">
                    <span className="block font-bold text-navy text-[14.5px]">{t.name}</span>
                    <span className="block text-[12.5px] text-muted font-semibold">{t.area}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
