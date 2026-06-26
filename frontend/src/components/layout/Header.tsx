import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { BIZ } from "@/lib/biz";
import { SERVICE_DETAILS } from "@/lib/data";

export type HeaderVariant = "home" | "pricing" | "service";

const SERVICE_LINKS = SERVICE_DETAILS.map((s) => ({
  label: s.nav,
  slug: s.slug,
  icon: s.icon,
}));

// Nav links per page variant (02 §Header, links mapped to routes per R-7).
const NAV_BY_VARIANT: Record<
  HeaderVariant,
  { label: string; href: string; active?: boolean }[]
> = {
  home: [
    { label: "Why Glenn's", href: "#why" },
    { label: "How it works", href: "#how" },
    { label: "Reviews", href: "#reviews" },
  ],
  pricing: [
    { label: "Services", href: "/#services" },
    { label: "Pricing", href: "#pricing", active: true },
    { label: "Why Glenn's", href: "/#why" },
    { label: "Reviews", href: "/#reviews" },
  ],
  // Service pages mirror the homepage header (Services dropdown + Pricing are
  // rendered separately); these are the trailing links, pointing back home.
  service: [
    { label: "Why Glenn's", href: "/#why" },
    { label: "How it works", href: "/#how" },
    { label: "Reviews", href: "/#reviews" },
  ],
};

function TrustBar({ variant }: { variant: HeaderVariant }) {
  const middle =
    variant === "pricing"
      ? { icon: "receipt", label: "Upfront Flat-Rate Pricing" }
      : { icon: "shield-check", label: "Licensed Master Plumber" };
  return (
    <div className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-10 flex items-center justify-between text-[12.5px] sm:text-[13px]">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap">
            <Icon name="star" className="w-4 h-4 text-amber-soft fill-current" /> {BIZ.rating} rating
          </span>
          <span className="hidden sm:inline text-white/25">·</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-white/90">
            <Icon name={middle.icon} className="w-4 h-4 text-white/70" /> {middle.label}
          </span>
          <span className="hidden lg:inline text-white/25">·</span>
          <span className="hidden lg:inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-white/90">
            <Icon name="clock" className="w-4 h-4 text-white/70" /> Same-Day Service
          </span>
        </div>
        <a
          href={BIZ.phoneHref}
          className="group flex items-center gap-2 font-bold text-white hover:text-amber-soft transition-colors shrink-0"
        >
          <span className="pulse-dot text-amber-soft inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-soft inline-block"></span>
          </span>
          <Icon name="phone-call" className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{BIZ.phone}</span>
        </a>
      </div>
    </div>
  );
}

function LogoLockup({ variant }: { variant: HeaderVariant }) {
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/glenns-logo.png"
        alt="Glenn's Plumbing Services"
        className="h-[46px] w-auto object-contain"
      />
      <div className="leading-none">
        <div className="font-display font-extrabold text-[18px] text-navy whitespace-nowrap">
          Glenn's Plumbing
        </div>
        <div className="text-[10.5px] font-bold tracking-[0.2em] text-muted uppercase mt-1 whitespace-nowrap">
          Master Plumber · Lic# {BIZ.licenseNo}
        </div>
      </div>
    </>
  );
  return variant === "home" ? (
    <a href="#top" className="flex items-center gap-3 shrink-0">
      {inner}
    </a>
  ) : (
    <Link to="/" className="flex items-center gap-3 shrink-0">
      {inner}
    </Link>
  );
}

export function Header({ variant }: { variant: HeaderVariant }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = NAV_BY_VARIANT[variant];
  // Home + service pages share the same rich header (Services mega-dropdown,
  // Pricing link, floating mobile panel). Only pricing keeps the simpler nav.
  const richNav = variant === "home" || variant === "service";
  const ghostCta = variant === "pricing" ? "Book Now" : "Free quote";
  const mobileQuoteCta = variant === "pricing" ? "Book Now" : "Get a free quote";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Homepage rich menu locks the page behind the panel while open (02 §mobile A).
  useEffect(() => {
    if (variant === "pricing") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, variant]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50">
      <TrustBar variant={variant} />

      {/* Main navbar */}
      <div
        className={
          "relative transition-all duration-300 border-b " +
          (scrolled
            ? "bg-white/95 backdrop-blur-xl border-line shadow-soft"
            : "bg-white/85 backdrop-blur-md border-transparent")
        }
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 h-[70px] flex items-center justify-between gap-4">
          <LogoLockup variant={variant} />

          <nav className="hidden lg:flex items-center gap-7 shrink-0">
            {richNav && (
              /* Services mega-dropdown — hover + keyboard (focus-within) accessible */
              <div className="relative group">
                <button className="nav-link inline-flex items-center gap-1.5 text-[15px] font-semibold text-navy/75 hover:text-navy transition-colors whitespace-nowrap">
                  Services{" "}
                  <Icon
                    name="chevron-down"
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[314px] invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 z-50">
                  <div className="rounded-2xl border border-line bg-white shadow-lift p-2">
                    {SERVICE_LINKS.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/services/${s.slug}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-mist transition-colors"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue/10 text-blue shrink-0">
                          <Icon name={s.icon} className="w-[18px] h-[18px]" />
                        </span>
                        <span className="text-[14px] font-bold text-navy">{s.label}</span>
                      </Link>
                    ))}
                    <Link
                      to="/pricing"
                      className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 mt-1 border-t border-line text-[13.5px] font-bold text-blue hover:bg-mist transition-colors"
                    >
                      Compare all prices <Icon name="arrow-right" className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {richNav && (
              <Link
                to="/pricing"
                className="nav-link text-[15px] font-semibold text-navy/75 hover:text-navy transition-colors whitespace-nowrap"
              >
                Pricing
              </Link>
            )}
            {nav.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={
                  "nav-link text-[15px] font-semibold transition-colors whitespace-nowrap " +
                  (l.active ? "text-blue" : "text-navy/75 hover:text-navy")
                }
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href="#book"
              className="btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-navy hover:text-blue"
            >
              <span className="text-[15px] whitespace-nowrap">{ghostCta}</span>
            </a>
            <a
              href={BIZ.phoneHref}
              className="btn sheen flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue text-white font-bold shadow-soft hover:bg-blue-deep hover:shadow-lift"
            >
              <Icon name="phone" className="w-4 h-4 shrink-0" />
              <span className="text-[15px] whitespace-nowrap">{BIZ.phone}</span>
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-line text-navy"
          >
            <Icon name={open ? "x" : "menu"} className="w-5 h-5" />
          </button>
        </div>

        {richNav ? (
          <>
            {/* Backdrop — dims the page (still visible) and closes on tap */}
            <div
              onClick={close}
              aria-hidden="true"
              className={
                "lg:hidden fixed inset-x-0 bottom-0 top-full z-40 bg-navy-deep/35 transition-opacity duration-300 " +
                (open ? "opacity-100" : "opacity-0 pointer-events-none")
              }
            ></div>

            {/* Mobile menu — capped floating panel that scrolls inside itself */}
            <div
              className={
                "lg:hidden absolute left-0 right-0 top-full z-50 px-3 transition-all duration-300 " +
                (open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none")
              }
            >
              <div className="mt-2 rounded-2xl border border-line bg-white shadow-lift overflow-hidden">
                <div className="max-h-[58vh] overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-1">
                  <div className="px-2 pt-1 pb-1 text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted">
                    Services
                  </div>
                  {SERVICE_LINKS.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-mist"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue/10 text-blue shrink-0">
                        <Icon name={s.icon} className="w-[17px] h-[17px]" />
                      </span>
                      <span className="text-[15px] font-semibold text-navy/80">{s.label}</span>
                    </Link>
                  ))}
                  <Link
                    to="/pricing"
                    onClick={close}
                    className="mt-1 py-3 px-2 rounded-lg text-[16px] font-semibold text-navy/80 hover:bg-mist border-t border-line"
                  >
                    Pricing
                  </Link>
                  {nav.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      onClick={close}
                      className="py-3 px-2 rounded-lg text-[16px] font-semibold text-navy/80 hover:bg-mist"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
                {/* Pinned CTAs stay visible no matter how far you scroll the list */}
                <div className="px-4 pt-3 pb-4 flex flex-col gap-2 border-t border-line bg-white">
                  <a
                    href={BIZ.phoneHref}
                    onClick={close}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue text-white font-bold"
                  >
                    <Icon name="phone-call" className="w-4 h-4" /> Call {BIZ.phone}
                  </a>
                  <a
                    href="#book"
                    onClick={close}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-line font-bold text-navy"
                  >
                    Get a free quote
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Pricing & service pages: simple max-height accordion (02 §mobile B) */
          <div
            className={
              "lg:hidden overflow-hidden transition-all duration-300 " +
              (open ? "max-h-[28rem] border-t border-line" : "max-h-0")
            }
          >
            <div className="px-5 py-4 flex flex-col gap-1 bg-white">
              {nav.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={close}
                  className={
                    "py-3 px-2 rounded-lg text-[16px] font-semibold hover:bg-mist " +
                    (l.active ? "text-blue" : "text-navy/80")
                  }
                >
                  {l.label}
                </a>
              ))}
              <a
                href={BIZ.phoneHref}
                onClick={close}
                className="mt-2 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue text-white font-bold"
              >
                <Icon name="phone-call" className="w-4 h-4" /> Call {BIZ.phone}
              </a>
              <a
                href="#book"
                onClick={close}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-line font-bold text-navy"
              >
                {mobileQuoteCta}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
