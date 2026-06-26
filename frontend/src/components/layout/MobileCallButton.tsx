import { Icon } from "@/components/ui/Icon";
import { BIZ } from "@/lib/biz";

// Fixed "Call 24/7" pill — visible below lg only (02 §MobileCallButton).
export function MobileCallButton() {
  return (
    <a
      href={BIZ.phoneHref}
      className="lg:hidden fixed bottom-5 right-5 z-50 btn inline-flex items-center gap-2.5 pl-4 pr-5 py-3.5 rounded-full bg-blue text-white font-bold shadow-lift"
    >
      <span className="pulse-dot text-white inline-flex">
        <Icon name="phone-call" className="w-5 h-5" />
      </span>
      Call 24/7
    </a>
  );
}
