import { Icon } from "@/components/ui/Icon";

export function Stars({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((n) => (
        <Icon key={n} name="star" className={className + " text-amber-soft fill-current"} />
      ))}
    </span>
  );
}
