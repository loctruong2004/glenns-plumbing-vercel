import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SERVICE_DETAILS } from "@/lib/data";

// Service pages — the 5 sibling services (current slug filtered out).
export function OtherServices({ currentSlug }: { currentSlug: string }) {
  const others = SERVICE_DETAILS.filter((s) => s.slug !== currentSlug);
  return (
    <section className="bg-mist border-b border-line">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <Reveal>
          <h2 className="font-display font-extrabold text-navy text-[22px]">
            Explore other services
          </h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {others.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 5) * 50}>
              <Link
                to={`/services/${s.slug}`}
                className="lift group flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-4 shadow-soft hover:shadow-lift hover:border-blue/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue/10 text-blue">
                  <Icon name={s.icon} className="w-5 h-5" />
                </span>
                <span className="font-display font-bold text-navy text-[14px] leading-tight group-hover:text-blue transition-colors">
                  {s.nav}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
