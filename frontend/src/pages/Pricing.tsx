import { useEffect } from "react";
import { BookForm } from "@/components/forms/BookForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileCallButton } from "@/components/layout/MobileCallButton";
import { GuaranteeStrip } from "@/components/pricing/GuaranteeStrip";
import { PricingCategory } from "@/components/pricing/PricingCategory";
import { PricingIntro } from "@/components/pricing/PricingIntro";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { SECTIONS } from "@/lib/data";

export default function Pricing() {
  useEffect(() => {
    document.title = "Plumber Prices NYC — Upfront Flat-Rate Pricing | Glenn's Plumbing";
  }, []);

  return (
    <>
      <RevealObserver />
      <Header variant="pricing" />
      <main>
        <PricingIntro />
        {SECTIONS.map((section, i) => (
          <PricingCategory key={section.name} section={section} index={i} />
        ))}
        <GuaranteeStrip />
        <BookForm variant="pricing" heading="Same-day slots fill fast" source="pricing" />
      </main>
      <Footer variant="pricing" />
      <MobileCallButton />
    </>
  );
}
