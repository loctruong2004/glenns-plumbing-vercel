import { Reveal } from "@/components/ui/Reveal";
import { PROCESS } from "@/lib/data";

// Service-page "How it works" — 4 numbered steps with a connecting line on lg.
export function Process() {
  return (
    <section className="bg-mist border-y border-line">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 lg:py-24">
        <Reveal className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase">
            <span className="w-6 h-px bg-blue"></span> How it works
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[30px] sm:text-[40px] leading-[1.08]">
            Four simple steps, zero surprises
          </h2>
        </Reveal>
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {PROCESS.map((s, i) => (
            <Reveal key={s.title} delay={(i % 4) * 80}>
              <div className="relative">
                {i < PROCESS.length - 1 && (
                  <span className="hidden lg:block absolute top-7 left-16 right-[-1.5rem] h-px bg-navy/15"></span>
                )}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white border border-line shadow-soft">
                  <span className="font-display font-extrabold text-[20px] text-blue leading-none">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display font-bold text-navy text-[19px] leading-tight">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[15px] text-muted leading-snug">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
