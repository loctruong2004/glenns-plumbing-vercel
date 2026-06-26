import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { BIZ } from "@/lib/biz";
import { SERVICE_DETAILS } from "@/lib/data";

export type FooterVariant = "home" | "pricing" | "service";

// Footer (02 §Footer): column 3 + bottom links differ per page.
export function Footer({ variant }: { variant: FooterVariant }) {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-deep text-white/70 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/glenns-logo.png"
                alt="Glenn's Plumbing Services"
                className="h-[46px] w-auto object-contain"
                style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))" }}
              />
              <div className="leading-none">
                <div className="font-display font-extrabold text-[18px] text-white">
                  Glenn's Plumbing
                </div>
                <div className="text-[10.5px] font-bold tracking-[0.2em] text-white/45 uppercase mt-1">
                  Master Plumber · Lic# {BIZ.licenseNo}
                </div>
              </div>
            </div>
            <p className="mt-5 text-[14.5px] leading-relaxed max-w-sm">
              Honest, around-the-clock plumbing for NYC. Licensed master plumber under {BIZ.owner},
              fully insured, and trusted by {BIZ.homes} local homes.
            </p>
            <a
              href={BIZ.phoneHref}
              className="mt-5 inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-blue text-white font-bold hover:bg-blue-deep transition-colors"
            >
              <span className="pulse-dot text-white inline-flex">
                <Icon name="phone-call" className="w-4 h-4" />
              </span>
              24/7 line · {BIZ.phone}
            </a>
          </div>

          <div>
            <div className="font-display font-bold text-white text-[15px]">Visit & contact</div>
            <ul className="mt-4 space-y-3 text-[14px]">
              <li className="flex items-start gap-2.5">
                <Icon name="map-pin" className="w-[18px] h-[18px] mt-0.5 text-white/45 shrink-0" />
                <span>{BIZ.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="clock" className="w-[18px] h-[18px] mt-0.5 text-white/45 shrink-0" />
                <span>Open {BIZ.hours}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="mail" className="w-[18px] h-[18px] mt-0.5 text-white/45 shrink-0" />
                <a
                  href={"mailto:" + BIZ.email}
                  className="hover:text-white transition-colors break-all"
                >
                  {BIZ.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="badge-check" className="w-[18px] h-[18px] mt-0.5 text-white/45 shrink-0" />
                <span>NYC Licensed Master Plumber · Lic# {BIZ.licenseNo}</span>
              </li>
            </ul>
          </div>

          <div>
            {variant === "service" ? (
              <>
                <div className="font-display font-bold text-white text-[15px]">Services</div>
                <ul className="mt-4 space-y-2.5 text-[14px]">
                  {SERVICE_DETAILS.map((s) => (
                    <li key={s.slug}>
                      <Link
                        to={`/services/${s.slug}`}
                        className="inline-flex items-center gap-2.5 hover:text-white transition-colors"
                      >
                        <Icon name={s.icon} className="w-[16px] h-[16px] text-white/45 shrink-0" />{" "}
                        {s.nav}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <div className="font-display font-bold text-white text-[15px]">Service areas</div>
                <ul className="mt-4 space-y-2.5 text-[14px]">
                  {BIZ.areas.map((a) => (
                    <li key={a} className="flex items-center gap-2.5">
                      <Icon name="map-pin" className="w-[16px] h-[16px] text-white/45 shrink-0" />{" "}
                      {a}
                    </li>
                  ))}
                </ul>
                <a
                  href="#book"
                  className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-white hover:text-amber-soft transition-colors"
                >
                  {variant === "pricing" ? "Book a service" : "Get a free quote"}{" "}
                  <Icon name="arrow-right" className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-white/45">
          <div>
            © {year} {BIZ.legalName}. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            {variant === "home" ? (
              <Link to="/pricing" className="hover:text-white/80 transition-colors">
                Pricing
              </Link>
            ) : (
              <Link to="/" className="hover:text-white/80 transition-colors">
                Home
              </Link>
            )}
            {variant === "service" ? (
              <Link to="/pricing" className="hover:text-white/80 transition-colors">
                Pricing
              </Link>
            ) : (
              <>
                <a href="#" className="hover:text-white/80 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-white/80 transition-colors">
                  Terms
                </a>
              </>
            )}
            <span>Lic# {BIZ.licenseNo}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
