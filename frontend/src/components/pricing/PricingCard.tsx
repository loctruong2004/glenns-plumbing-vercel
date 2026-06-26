import { Icon } from "@/components/ui/Icon";
import type { Tier } from "@/lib/data";

// One tier card (02 §PricingCard). Accent is driven purely by tier.badgeTone:
// "amber" → amber (the single Heating & HVAC compliance tier), else blue (R-5).
// `service` (when provided) lets the CTA pre-fill the booking form's service +
// package fields as it scrolls to #book, via a `glenns:select-package` event.
export function PricingCard({ tier, service }: { tier: Tier; service?: string }) {
  const highlighted = Boolean(tier.highlight);
  const amber = tier.badgeTone === "amber";
  const accent = amber ? "var(--amber)" : "var(--blue)";

  return (
    <div
      className={
        "lift relative flex h-full flex-col rounded-2xl bg-white p-7 sm:p-8 " +
        (highlighted ? "z-10 shadow-lift" : "border border-line shadow-soft hover:shadow-lift")
      }
      style={
        highlighted
          ? {
              border: "2px solid " + accent,
              boxShadow:
                "0 26px 64px -22px rgba(30,58,95,0.30), 0 0 0 4px " +
                (amber ? "rgba(245,158,11,0.12)" : "rgba(37,99,235,0.10)"),
            }
          : undefined
      }
    >
      {/* Badge */}
      {highlighted && tier.badge && (
        <div className="absolute -top-3.5 left-7 sm:left-8">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wide text-white shadow-soft"
            style={{ background: accent }}
          >
            {amber && <Icon name="alert-triangle" className="w-3.5 h-3.5" />}
            {tier.badge}
          </span>
        </div>
      )}

      {/* Tier name */}
      <p
        className={
          "mt-1 text-[12px] font-bold uppercase tracking-[0.12em] " +
          (amber ? "text-amber" : "text-blue")
        }
      >
        {tier.name}
      </p>

      {/* Price */}
      <div className="mt-3">
        <span className="font-display font-extrabold tracking-tight text-navy text-[36px] leading-none">
          {tier.price}
        </span>
        <p className="mt-2 text-[13.5px] font-semibold text-muted">{tier.note}</p>
      </div>

      <div className="my-6 h-px w-full bg-line"></div>

      {/* Features */}
      <ul className="flex flex-1 flex-col gap-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[14.5px] text-navy/80 leading-snug">
            <span
              className={
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
                (amber ? "bg-amber/15" : "bg-blue/10")
              }
            >
              <Icon
                name="check"
                className={"w-3.5 h-3.5 " + (amber ? "text-amber" : "text-blue")}
                strokeWidth={3}
              />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA — also tells the booking form which service + package to pre-fill */}
      <a
        href="#book"
        onClick={() =>
          window.dispatchEvent(
            new CustomEvent("glenns:select-package", {
              detail: { service, package: tier.name },
            })
          )
        }
        className={
          "btn sheen mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-white shadow-soft " +
          (highlighted
            ? amber
              ? "bg-amber hover:brightness-95"
              : "bg-blue hover:bg-blue-deep"
            : "bg-navy hover:bg-navy-deep")
        }
      >
        {tier.cta}
        <Icon name="arrow-right" className="w-4 h-4" />
      </a>

      {/* Micro-trust footer */}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] font-semibold text-muted">
        <Icon name="shield-check" className="w-3.5 h-3.5 shrink-0" />
        Licensed &amp; insured · Fixed-price guarantee
      </p>
    </div>
  );
}
