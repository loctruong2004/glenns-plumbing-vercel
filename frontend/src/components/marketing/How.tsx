import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { STEPS } from "@/lib/data";

export function How() {
  return (
    <section id="how" className="bg-mist">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase">
            <span className="w-6 h-px bg-blue"></span> How it works
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[34px] sm:text-[44px] leading-[1.06]">
            Four simple steps, zero surprises
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 80}>
              <div className="lift relative h-full bg-white rounded-2xl border border-line p-6 shadow-soft hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center">
                    <Icon name={s.icon} className="w-6 h-6 text-blue" />
                  </div>
                  <span className="font-display font-extrabold text-[34px] leading-none text-navy/10">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display font-bold text-navy text-[18px]">{s.title}</h3>
                <p className="mt-2 text-[14.5px] text-muted leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
