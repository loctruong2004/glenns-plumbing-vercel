import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { TRUST_BAND } from "@/lib/data";

// Service pages — 4 reassurance items rendered AFTER the Book section.
export function TrustBand() {
  return (
    <section className="bg-white border-b border-line">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_BAND.map((it, i) => (
            <Reveal key={it.title} delay={(i % 4) * 70}>
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
                  <Icon name={it.icon} className="w-[22px] h-[22px]" />
                </span>
                <div>
                  <div className="font-display font-bold text-navy text-[16px]">{it.title}</div>
                  <div className="mt-0.5 text-[13.5px] text-muted leading-relaxed">{it.sub}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
