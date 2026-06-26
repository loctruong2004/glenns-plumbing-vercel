import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { BIZ } from "@/lib/biz";
import { FORM_SELECT, HOME_SERVICES, SECTIONS, SERVICE_DETAILS } from "@/lib/data";

type Variant = "home" | "pricing" | "service";

// Per-variant copy, verbatim from the prototypes (02 §Book + the three
// design-files). The service variant pre-sets the select to that service's
// nav and submits source "service:<slug>" (B09).
const COPY: Record<
  Variant,
  {
    eyebrow: string;
    lead: string;
    formTitle: string;
    formSub: string;
    submit: string;
    successTail: string;
  }
> = {
  home: {
    eyebrow: "Free quote",
    lead: "Tell us what's going on and we'll call you right back — usually within the hour. Got an emergency? Call now, day or night, and a master plumber will pick up.",
    formTitle: "Tell us what you need",
    formSub: "Free quote, no obligation. Flat-rate price before any work begins.",
    submit: "Request My Free Quote",
    successTail: "free quote",
  },
  pricing: {
    eyebrow: "Ready to book?",
    lead: "Lock in your flat-rate price now and a licensed master plumber will be at your door — often the same day. Tell us what you need and we'll call you right back, usually within the hour.",
    formTitle: "Book your flat-rate service",
    formSub: "No obligation. You approve the price before any work begins.",
    submit: "Book My Service",
    successTail: "flat-rate price",
  },
  service: {
    eyebrow: "Free quote",
    lead: "Tell us what's going on and we'll call you right back — usually within the hour. Got an emergency? Call now, day or night, and a master plumber will pick up.",
    formTitle: "Tell us what you need",
    formSub: "Free quote, no obligation. Flat-rate price before any work begins.",
    submit: "Get My Free Quote",
    successTail: "free quote",
  },
};

const PITCH_BULLETS = (variant: Variant) => [
  { icon: "clock", label: "Available 24/7 — including nights, weekends & holidays" },
  ...(variant === "home"
    ? []
    : [{ icon: "receipt", label: "Flat-rate price approved before any work begins" }]),
  { icon: "shield-check", label: `${BIZ.ownerTitle} · NYC Lic# ${BIZ.licenseNo} · bonded & insured` },
  { icon: "map-pin", label: `Serving ${BIZ.areas.join(", ")}` },
];

const FALLBACK_ERROR = `Something went wrong. Please call us at ${BIZ.phone} or try again.`;

const fieldBase =
  "w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] text-navy placeholder:text-muted/60 outline-none transition-colors focus:border-blue focus:ring-4 focus:ring-blue/10";

type Errors = Partial<Record<"name" | "phone" | "email" | "address" | "service" | "message", string>>;

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export function BookForm({
  variant,
  heading,
  presetService,
  source,
}: {
  variant: Variant;
  /** H2 text — service pages pass `Book your ${svc.nav.toLowerCase()}` */
  heading: string;
  /** Service pages pre-set the select to the service's nav (still editable). */
  presetService?: string;
  /** Lead attribution (B09): omitted on home, "pricing", "service:<slug>". */
  source?: string;
}) {
  const copy = COPY[variant];
  const initial = {
    name: "",
    phone: "",
    email: "",
    address: "",
    state: "NY",
    service: presetService ?? "",
    package: "",
    message: "",
  };
  const [form, setForm] = useState(initial);
  const [company, setCompany] = useState(""); // honeypot — humans never see it
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  // Changing the service resets the package (each service has its own packages).
  const setService = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, service: e.target.value, package: "" }));
    setErrors((er) => ({ ...er, service: undefined }));
  };

  // A pricing-tier CTA ("Schedule Installation", "Book My …") jumps to #book and
  // fires this so the form arrives pre-filled with that service + package.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<{ service?: string; package?: string }>).detail;
      setForm((f) => ({
        ...f,
        service: detail?.service ?? f.service,
        package: detail?.package ?? "",
      }));
    };
    window.addEventListener("glenns:select-package", onSelect);
    return () => window.removeEventListener("glenns:select-package", onSelect);
  }, []);

  const validate = (): Errors => {
    const er: Errors = {};
    if (!form.name.trim()) er.name = "Please enter your name";
    if (!/[0-9]{7,}/.test(form.phone.replace(/\D/g, ""))) er.phone = "Enter a valid phone number";
    return er;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length > 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const apiBase = import.meta.env.VITE_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/lead`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          at: new Date().toISOString(),
          ...(source ? { source } : {}),
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address ? `${form.address}, ${form.state}` : "",
          service: form.service
            ? form.package
              ? `${form.service} — ${form.package}${
                  selectedPackagePrice ? ` (${selectedPackagePrice})` : ""
                }`
              : form.service
            : "Not sure",
          message: form.message,
          company,
        }),
      });
      const data: { ok?: boolean; errors?: Errors; error?: string } | null = await res
        .json()
        .catch(() => null);
      if (res.ok && data?.ok) {
        setSent(true);
      } else if (res.status === 400 && data?.errors) {
        setErrors(data.errors);
      } else {
        setServerError(data?.error ?? FALLBACK_ERROR);
      }
    } catch {
      setServerError(FALLBACK_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  // Select options per page (02 §Book): home maps HOME_SERVICES titles,
  // pricing maps SECTIONS names, service pages map SERVICE_DETAILS navs
  // with no placeholder (the select is pre-set to this service).
  const serviceOptions =
    variant === "home"
      ? HOME_SERVICES.map((s) => s.title)
      : variant === "pricing"
        ? SECTIONS.map((s) => s.name)
        : SERVICE_DETAILS.map((s) => s.nav);

  // Package options depend on the selected service. Pricing pages key off the
  // SECTIONS catalog; service pages off SERVICE_DETAILS. Home (free quote) has
  // no flat-rate packages, so the package select simply never appears there.
  const packagesByService: Record<string, { name: string; price: string }[]> =
    variant === "pricing"
      ? Object.fromEntries(
          SECTIONS.map((s) => [s.name, s.tiers.map((t) => ({ name: t.name, price: t.price }))])
        )
      : variant === "service"
        ? Object.fromEntries(
            SERVICE_DETAILS.map((s) => [s.nav, s.tiers.map((t) => ({ name: t.name, price: t.price }))])
          )
        : // home: the select shows HOME_SERVICES titles — link each to its
          // service detail by slug so the same flat-rate packages appear.
          Object.fromEntries(
            HOME_SERVICES.map((h) => {
              const detail = SERVICE_DETAILS.find((s) => s.slug === h.slug);
              return [h.title, detail?.tiers.map((t) => ({ name: t.name, price: t.price })) ?? []];
            })
          );
  const packageOptions = packagesByService[form.service] ?? [];
  const selectedPackagePrice = packageOptions.find((p) => p.name === form.package)?.price ?? "";

  return (
    <section id="book" className="bg-navy-deep relative overflow-hidden">
      <div
        className="absolute -top-32 -right-24 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,.22), transparent 70%)" }}
      ></div>
      <div
        className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,.06), transparent 70%)" }}
      ></div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 items-start">
          {/* Pitch */}
          <Reveal>
            <div className="inline-flex items-center gap-2 text-amber-soft font-bold text-[13px] tracking-[0.16em] uppercase">
              <span className="w-6 h-px bg-amber-soft"></span> {copy.eyebrow}
            </div>
            <h2 className="mt-4 font-display font-extrabold text-white text-[34px] sm:text-[46px] leading-[1.05]">
              {heading}
            </h2>
            <p className="mt-4 text-[17px] text-white/65 leading-relaxed max-w-md">{copy.lead}</p>

            <a
              href={BIZ.phoneHref}
              className="btn sheen mt-7 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue text-white font-bold text-[18px] shadow-lift hover:bg-blue-deep"
            >
              <Icon name="phone-call" className="w-5 h-5" /> {BIZ.phone}
            </a>

            <div className="mt-9 space-y-3">
              {PITCH_BULLETS(variant).map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon name={c.icon} className="w-[18px] h-[18px] text-white" />
                  </div>
                  <span className="text-[14.5px] font-semibold text-white/80">{c.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={120}>
            <div className="bg-white rounded-3xl shadow-lift p-6 sm:p-8">
              {sent ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Icon name="check" className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="mt-5 font-display font-extrabold text-navy text-[24px]">
                    Request received
                  </h3>
                  <p className="mt-2 text-[15px] text-muted max-w-sm mx-auto">
                    Thanks, {form.name.split(" ")[0] || "there"}! We'll call you at{" "}
                    <span className="font-semibold text-navy">{form.phone}</span> shortly to confirm
                    your {copy.successTail}.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={BIZ.phoneHref}
                      className="btn inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue text-white font-bold hover:bg-blue-deep"
                    >
                      <Icon name="phone-call" className="w-4 h-4" /> Or call now
                    </a>
                    <button
                      onClick={() => {
                        setSent(false);
                        setForm(initial);
                        setCompany("");
                        setServerError(null);
                      }}
                      className="btn inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-line font-bold text-navy hover:border-blue/40"
                    >
                      Send another request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <h3 className="font-display font-bold text-navy text-[22px]">{copy.formTitle}</h3>
                  <p className="mt-1 text-[14px] text-muted">{copy.formSub}</p>

                  <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-bold text-navy mb-1.5">Name</label>
                      <input
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Jane Doe"
                        className={fieldBase + " " + (errors.name ? "border-red-400" : "border-line")}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-[12.5px] font-semibold text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-navy mb-1.5">
                        Phone <span className="text-blue">*</span>
                      </label>
                      <input
                        value={form.phone}
                        onChange={set("phone")}
                        inputMode="tel"
                        placeholder={BIZ.phone}
                        className={
                          fieldBase + " " + (errors.phone ? "border-red-400" : "border-line")
                        }
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-[12.5px] font-semibold text-red-500">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email — optional, for the auto-reply confirmation (R-15, 06 §2) */}
                  <div className="mt-4">
                    <label className="block text-[13px] font-bold text-navy mb-1.5">
                      Email <span className="font-medium text-muted">(optional — for confirmation)</span>
                    </label>
                    <input
                      value={form.email}
                      onChange={set("email")}
                      inputMode="email"
                      placeholder="jane@example.com"
                      className={fieldBase + " " + (errors.email ? "border-red-400" : "border-line")}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-[12.5px] font-semibold text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Địa chỉ + tiểu bang */}
                  <div className="mt-4">
                    <label className="block text-[13px] font-bold text-navy mb-1.5">
                      Address <span className="font-medium text-muted">(optional — helps us plan the visit)</span>
                    </label>
                    <div className="grid sm:grid-cols-[1fr_180px] gap-3">
                      <input
                        value={form.address}
                        onChange={set("address")}
                        placeholder="123 Main St, Apt 4B"
                        className={fieldBase + " " + (errors.address ? "border-red-400" : "border-line")}
                      />
                      <div className="relative">
                        <select
                          value={form.state}
                          onChange={set("state")}
                          className={fieldBase + " pr-9 border-line text-navy"}
                        >
                          {US_STATES.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.code} — {s.name}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="chevron-down"
                          className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>
                    </div>
                    {errors.address && (
                      <p className="mt-1.5 text-[12.5px] font-semibold text-red-500">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-[13px] font-bold text-navy mb-1.5">
                      Service needed
                    </label>
                    <div className="relative">
                      <select
                        value={form.service}
                        onChange={setService}
                        className={
                          fieldBase +
                          " pr-10 border-line " +
                          (variant === "service" || form.service ? "text-navy" : "text-muted/60")
                        }
                      >
                        {variant !== "service" && (
                          <option value="">{FORM_SELECT.placeholder}</option>
                        )}
                        <option value={FORM_SELECT.emergency}>{FORM_SELECT.emergency}</option>
                        {serviceOptions.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                        <option value={FORM_SELECT.fallback}>{FORM_SELECT.fallback}</option>
                      </select>
                      <Icon
                        name="chevron-down"
                        className="w-5 h-5 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Package — appears once a service with flat-rate options is
                      chosen; pre-filled when arriving from a pricing-tier CTA. */}
                  {packageOptions.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-[13px] font-bold text-navy mb-1.5">
                        Package <span className="font-medium text-muted">(optional)</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.package}
                          onChange={set("package")}
                          className={
                            fieldBase +
                            " pr-10 border-line " +
                            (form.package ? "text-navy" : "text-muted/60")
                          }
                        >
                          <option value="">Not sure — recommend one for me</option>
                          {packageOptions.map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.name} — {p.price}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="chevron-down"
                          className="w-5 h-5 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-[13px] font-bold text-navy mb-1.5">
                      Message <span className="font-medium text-muted">(optional)</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={set("message")}
                      rows={4}
                      placeholder="Tell us what's going on…"
                      className={fieldBase + " border-line resize-none"}
                    ></textarea>
                  </div>

                  {/* Honeypot — visually hidden; bots that fill it get a silent drop (06 §2.2) */}
                  <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                    <label>
                      Company
                      <input
                        name="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="off"
                        tabIndex={-1}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn sheen mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue text-white font-bold text-[17px] shadow-soft hover:bg-blue-deep hover:shadow-lift disabled:opacity-60"
                  >
                    {copy.submit} <Icon name="arrow-right" className="w-5 h-5" />
                  </button>
                  {serverError && (
                    <p className="mt-3 text-center text-[13px] font-semibold text-red-500">
                      {serverError}
                    </p>
                  )}
                  <p className="mt-3 text-center text-[12.5px] text-muted">
                    We reply within 1 hour · No spam · Licensed & insured.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
