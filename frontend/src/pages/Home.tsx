import { useEffect } from "react";
import { BookForm } from "@/components/forms/BookForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileCallButton } from "@/components/layout/MobileCallButton";
import { HomeHero } from "@/components/marketing/HomeHero";
import { How } from "@/components/marketing/How";
import { Reviews } from "@/components/marketing/Reviews";
import { Services } from "@/components/marketing/Services";
import { Why } from "@/components/marketing/Why";
import { RevealObserver } from "@/components/ui/RevealObserver";

export default function Home() {
  useEffect(() => {
    document.title = "Glenn's Plumbing — Licensed Master Plumber in NYC · Same-Day Repairs";
  }, []);

  return (
    <>
      <RevealObserver />
      <Header variant="home" />
      <main>
        <HomeHero />
        <Services />
        <Why />
        <How />
        <Reviews />
        <BookForm variant="home" heading="Request your free quote" />
      </main>
      <Footer variant="home" />
      <MobileCallButton />
    </>
  );
}
