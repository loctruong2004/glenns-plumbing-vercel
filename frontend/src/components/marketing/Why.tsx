import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { WHY } from "@/lib/data";

export function Why() {
  return (
    <section id="why" className="bg-navy relative overflow-hidden">
      <div
        className="absolute -top-24 -right-16 w-80 h-80 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,.20), transparent 70%)" }}
      ></div>
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-20">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-amber-soft font-bold text-[13px] tracking-[0.16em] uppercase">
            <span className="w-6 h-px bg-amber-soft"></span> Why Glenn's
          </div>
          <h2 className="mt-4 font-display font-extrabold text-white text-[30px] sm:text-[40px] leading-[1.08]">
            The reasons NYC homeowners keep our number
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={(i % 4) * 70}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="w-12 h-12 rounded-xl bg-amber/15 flex items-center justify-center">
                  <Icon name={w.icon} className="w-6 h-6 text-amber-soft" />
                </div>
                <h3 className="mt-4 font-display font-bold text-white text-[17px] leading-snug">
                  {w.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-white/55 leading-relaxed">{w.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
