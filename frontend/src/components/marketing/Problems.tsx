import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import type { ServiceDetail } from "@/lib/data";

export function Problems({ svc }: { svc: ServiceDetail }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-24">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase">
            <span className="w-6 h-px bg-blue"></span> Problems we fix
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[30px] sm:text-[40px] leading-[1.08]">
            Sound familiar? We handle it every day.
          </h2>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {svc.problems.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 70}>
              <div className="lift h-full bg-white rounded-2xl border border-line p-6 shadow-soft hover:shadow-lift">
                <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center">
                  <Icon name={p.icon} className="w-6 h-6 text-blue" />
                </div>
                <h3 className="mt-4 font-display font-bold text-navy text-[17px] leading-snug">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-[14px] text-muted leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
