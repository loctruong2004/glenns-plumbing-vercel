import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { BIZ } from "@/lib/biz";

type QA = { q: string; a: string };

// Single-open accordion (02 §FAQ): first item open by default; .acc-body
// animates max-height between 0 and the answer's measured scrollHeight.
function FaqItem({ item, open, onToggle }: { item: QA; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [max, setMax] = useState(0);
  useEffect(() => {
    setMax(open && ref.current ? ref.current.scrollHeight : 0);
  }, [open, item]);
  return (
    <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
      >
        <span className="font-display font-bold text-navy text-[16.5px] leading-snug">
          {item.q}
        </span>
        <span
          className={
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line transition-colors " +
            (open ? "bg-blue text-white border-blue" : "text-navy/60")
          }
        >
          <Icon name={open ? "minus" : "plus"} className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </button>
      <div className="acc-body" style={{ maxHeight: max }}>
        <div ref={ref} className="px-6 pb-5 -mt-1 text-[15px] text-muted leading-relaxed">
          {item.a}
        </div>
      </div>
    </div>
  );
}

export function Faq({ heading, items }: { heading: string; items: QA[] }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="bg-mist border-y border-line">
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 lg:py-24">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-2 text-blue font-bold text-[13px] tracking-[0.16em] uppercase justify-center">
            <span className="w-6 h-px bg-blue"></span> Questions, answered{" "}
            <span className="w-6 h-px bg-blue"></span>
          </div>
          <h2 className="mt-4 font-display font-extrabold text-navy text-[30px] sm:text-[40px] leading-[1.08]">
            {heading}
          </h2>
        </Reveal>
        <div className="mt-10 flex flex-col gap-3.5">
          {items.map((it, i) => (
            <Reveal key={it.q} delay={(i % 5) * 50}>
              <FaqItem item={it} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p className="mt-8 text-center text-[15px] text-muted">
            Still have a question?{" "}
            <a href={BIZ.phoneHref} className="font-bold text-blue">
              Call {BIZ.phone}
            </a>{" "}
            — a real person answers 24/7.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
