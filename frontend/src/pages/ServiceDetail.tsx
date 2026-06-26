import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookForm } from "@/components/forms/BookForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileCallButton } from "@/components/layout/MobileCallButton";
import { Faq } from "@/components/marketing/Faq";
import { OtherServices } from "@/components/marketing/OtherServices";
import { Problems } from "@/components/marketing/Problems";
import { Process } from "@/components/marketing/Process";
import { ServiceHero } from "@/components/marketing/ServiceHero";
import { ServicePricing } from "@/components/marketing/ServicePricing";
import { TrustBand } from "@/components/marketing/TrustBand";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { BIZ } from "@/lib/biz";
import { faqFor, SERVICE_DETAILS } from "@/lib/data";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const svc = SERVICE_DETAILS.find((s) => s.slug === slug);

  useEffect(() => {
    if (!svc) return;
    window.scrollTo(0, 0);
    document.title = `${svc.title} — Glenn's Plumbing NYC`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        `${svc.lead} ${svc.price.value} — ${svc.price.note}. Call 24/7: ${BIZ.phone}.`
      );
  }, [svc]);

  if (!svc) return <Navigate to="/" replace />;

  return (
    <>
      <RevealObserver />
      <Header variant="service" />
      <main>
        <ServiceHero svc={svc} />
        <Problems svc={svc} />
        <Process />
        <ServicePricing svc={svc} />
        <Faq heading={`${svc.nav} FAQs`} items={faqFor(svc)} />
        <BookForm
          variant="service"
          heading={`Book your ${svc.nav.toLowerCase()}`}
          presetService={svc.nav}
          source={`service:${svc.slug}`}
        />
        <TrustBand />
        <OtherServices currentSlug={svc.slug} />
      </main>
      <Footer variant="service" />
      <MobileCallButton />
    </>
  );
}
