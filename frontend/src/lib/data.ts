/* ============================================================================
 * Glenn's Plumbing — SINGLE SOURCE OF TRUTH for all site content
 * ----------------------------------------------------------------------------
 * Every string below is verified VERBATIM against the three prototype HTML
 * pages (Homepage, Pricing, Service Detail). 534 strings total.
 *
 * ⚠️  This file SUPERSEDES the legacy root drafts `pricing-data.ts` /
 *     `PricingSection.tsx` / `data.jsx`. See RESOLUTIONS.md (R-2). Those
 *     drafts have DIFFERENT category names, tiers, badges and testimonials and
 *     must NOT be used. If anything here disagrees with a prototype, the
 *     PROTOTYPE wins — fix this file, never the other way.
 *
 * Icon strings are lucide-react names in kebab-case. Convert to PascalCase
 * component imports at the edge, e.g. "shield-check" -> <ShieldCheck/>.
 * A ready-made map is at the bottom (ICONS).
 * ========================================================================== */

/* ----------------------------------------------------------------------------
 * BUSINESS
 * -------------------------------------------------------------------------- */
export const BIZ = {
  name:       "Glenn's Plumbing",
  legalName:  "Glenn's Plumbing Services, Inc.",
  owner:      "David Glenn",
  ownerTitle: "Licensed Master Plumber",
  phone:      "(646) 963-2616",
  phoneHref:  "tel:+16469632616",
  email:      "info@gpsnyc.org",
  address:    "342 W 71st St, New York, NY 10023",
  areas:      ["Manhattan", "Queens", "Bronx", "Brooklyn"] as const,
  hours:      "24/7 — nights, weekends & holidays",
  licenseNo:  "1927",
  rating:     "4.9",
  homes:      "2,000+",
} as const;

/* ----------------------------------------------------------------------------
 * TYPES
 * -------------------------------------------------------------------------- */
export interface ServiceCard {
  icon: string;
  slug: string;
  title: string;
  benefit: string;
  price: string;
  bigTicket?: boolean;
}

export interface Tier {
  name: string;
  price: string;
  note: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  badgeTone?: "amber"; // absent = blue
}

export interface PricingSection {
  icon: string;
  name: string;
  description: string;
  financing?: string;
  tiers: Tier[];
}

export interface Problem { icon: string; title: string; desc: string; }

export interface ServiceDetail {
  slug: string;
  icon: string;
  nav: string;
  image: string | null;
  imageLabel?: string;        // monospace caption for the striped placeholder
  title: string;
  lead: string;
  price: { value: string; note: string };
  highlights: string[];
  problems: Problem[];
  tiers: Tier[];
}

/* ----------------------------------------------------------------------------
 * HOMEPAGE — service cards (6)
 * -------------------------------------------------------------------------- */
export const HOME_SERVICES: ServiceCard[] = [
  { icon: "wrench",      slug: "plumbing-repair",          title: "Plumbing Repair",            benefit: "Leaks, fixtures & toilets, fixed right.",       price: "Starting from $350" },
  { icon: "droplets",    slug: "pipe-leak-sump-pump",      title: "Pipe, Leak & Sump Pump",     benefit: "Stop drips & basement floods.",                price: "Starting from $350" },
  { icon: "waves",       slug: "drain-cleaning",           title: "Drain Cleaning",             benefit: "Flat-rate clearing, no hourly meter.",         price: "Starting from $375" },
  { icon: "flame",       slug: "water-heater-installation",title: "Water Heater Installation",  benefit: "Same-day hot water, hauled away free.",        price: "Starting from $3,000", bigTicket: true },
  { icon: "thermometer", slug: "heating-hvac",             title: "Heating & HVAC",             benefit: "Cold rooms & gas safety, handled.",            price: "Starting from $350" },
  { icon: "gauge",       slug: "boiler-maintenance",       title: "Boiler Maintenance",         benefit: "Avoid $3,000 winter emergencies.",             price: "Starting from $350" },
];

/* HOMEPAGE — Why Glenn's (4 trust cards) */
export const WHY = [
  { icon: "shield-check", title: "Licensed Master Plumber",            sub: "NYC Lic# 1927 · bonded & insured" },
  { icon: "receipt",      title: "Upfront flat-rate pricing",          sub: "Approve the price before we start" },
  { icon: "clock",        title: "Same-day service",                   sub: "Slots fill fast — call early" },
  { icon: "badge-check",  title: "12-month workmanship guarantee",     sub: "Every repair, backed in writing" },
];

/* HOMEPAGE — How it works (4 steps) */
export const STEPS = [
  { icon: "phone-call",     title: "Call or book",        desc: "Tell us what's wrong. A real person answers 24/7 and books a slot — or rolls a truck now for emergencies." },
  { icon: "clipboard-list", title: "Diagnose & quote",    desc: "Your master plumber pinpoints the problem and gives a flat-rate price upfront. No hourly meter, no surprises." },
  { icon: "wrench",         title: "Fix it to last",      desc: "We repair on the spot with quality parts, then test it twice to be sure it holds. Done right the first time." },
  { icon: "sparkles",       title: "Tidy up & guarantee", desc: "We leave your home spotless and back the work with our 12-month workmanship guarantee." },
];

/* HOMEPAGE — Reviews (4). initials are pre-computed in the prototype. */
export const REVIEWS = [
  { name: "Maria R.",  area: "Astoria, Queens",            initials: "MR", quote: "Water heater died on a Sunday and they had someone here within the hour. The price was exactly what they quoted — no surprises at all." },
  { name: "James O.",  area: "Park Slope, Brooklyn",       initials: "JO", quote: "Best plumbing experience in years. Explained everything, fixed the leak fast, and left the place spotless. Genuinely impressed." },
  { name: "Elena P.",  area: "Riverdale, Bronx",           initials: "EP", quote: "Flat-rate quote upfront, no hourly meter ticking the whole time. Honest, tidy, and clearly licensed. I'll only call Glenn's now." },
  { name: "Marcus L.", area: "Upper West Side, Manhattan", initials: "ML", quote: "Called for a main-line backup at 2am. Calm, kind, and had it flowing again before sunrise. The only plumber we'll ever call." },
];

/* ----------------------------------------------------------------------------
 * PRICING PAGE — 6 categories × 3 tiers (the price catalog).
 * One tier per category is `highlight: true`. The Heating & HVAC middle tier
 * is the ONLY amber-toned one (badgeTone: "amber").
 * -------------------------------------------------------------------------- */
export const SECTIONS: PricingSection[] = [
  {
    icon: "wrench",
    name: "Plumbing Repair",
    description: "Leaks, fixtures and toilets fixed right — you approve the flat price before we touch anything.",
    tiers: [
      { name: "Risk-Free Assessment", price: "$200", note: "100% applied to your repair",
        features: ["On-site diagnosis by a master plumber", "Written, flat-rate estimate before work starts", "Fee fully waived when you book the repair"], cta: "Book Assessment" },
      { name: "Standard Fixture Repair", price: "From $350", note: "Final flat price confirmed on-site",
        features: ["Toilet reset from $400", "Lavatory from $350", "Brass P-trap from $375", "Supply line & shutoff $350–$400", "Parts & labor included"], cta: "Schedule Repair", highlight: true, badge: "Most Popular" },
      { name: "Full Fixture Replacement", price: "From $400", note: "Parts, labor & old-fixture disposal",
        features: ["Kitchen sink from $450", "Toilet fill & anti-siphon valve $400", "Old fixture removal & disposal", "Code-compliant — passes NYC inspection", "Post-install pressure test"], cta: "Get a Quote" },
    ],
  },
  {
    icon: "droplets",
    name: "Pipe, Leak & Sump Pump",
    description: "Stop slow drips and basement floods before they become ceiling-down emergencies.",
    tiers: [
      { name: "Shutoff, Supply & Insulation", price: "From $350", note: "Parts & labor included",
        features: ["Speedy shutoff valve $350", "Supply line + valves w/ escutcheon $400", "Copper insulation $20/ft exposed · $40/ft buried", "Under-sink leak inspection included"], cta: "Book Repair" },
      { name: "Trap & Connection Repair", price: "$375", note: "Flat-rate — approve before we start",
        features: ["Brass P-trap replacement", "Drain connection re-sealing", "Leak test after every install", "One flat price, nothing extra"], cta: "Schedule Now", highlight: true, badge: "Best Value" },
      { name: "Sump Pump Service", price: "Free estimate", note: "Scoped & priced on-site",
        features: ["Install, replacement & repair", "Battery-backup option", "Pit clean-out & float-switch check", "Basement flood prevention"], cta: "Request Free Estimate" },
    ],
  },
  {
    icon: "waves",
    name: "Drain Cleaning",
    description: "Flat-rate clearing — most plumbers bill by the hour, we never do.",
    tiers: [
      { name: "Kitchen Drain Snake", price: "$375", note: "Flat-rate — billed exactly as quoted",
        features: ["Professional electric snake / auger", "Kitchen sink & branch line", "Grease & food-buildup removal", "Post-service flow test"], cta: "Book Drain Cleaning" },
      { name: "Bathroom Drain Snake", price: "$425", note: "Flat-rate — billed exactly as quoted",
        features: ["Tub, shower & sink drains", "Professional electric snake / auger", "Hair & soap-scum removal", "Post-service flow test"], cta: "Book Drain Cleaning", highlight: true, badge: "Best Value" },
      { name: "Main Sewer Line", price: "$550", note: "Camera inspection included · flat-rate",
        features: ["Mainline snaking & power clearing", "Camera inspection of the line", "Root & grease removal", "Full post-service report"], cta: "Get a Quote" },
    ],
  },
  {
    icon: "flame",
    name: "Water Heater Installation",
    description: "Right-sized hot water, installed and hauled away the same day.",
    financing: "Big-ticket job? Ask about flexible financing — spread the cost over easy monthly payments.",
    tiers: [
      { name: "75 Gallon Install", price: "$4,500", note: "Parts, labor & haul-away",
        features: ["Commercial-grade 75-gallon tank", "Old unit haul-away", "Heavy-duty gas line connection", "Permit included", "1-year labor warranty"], cta: "Schedule Installation" },
      { name: "50 Gallon Install", price: "$3,000", note: "Save $1,500 vs. 75-gal",
        features: ["Perfect for 2–4 people", "Old unit haul-away", "Same-day hot water restored", "Permit included", "1-year labor warranty"], cta: "Schedule Installation", highlight: true, badge: "Most Popular · Save $1,500" },
      { name: "Water Heater Repair & Diagnostic", price: "Free estimate", note: "Honest repair-vs-replace advice",
        features: ["No-hot-water & leak diagnosis", "Thermostat / pilot / valve repairs", "Straight repair-vs-replace guidance", "Same-day service where possible"], cta: "Request Free Estimate" },
    ],
  },
  {
    icon: "thermometer",
    name: "Heating & HVAC",
    description: "Cold rooms, failed inspections and gas-appliance work — handled to NYC code.",
    tiers: [
      { name: "Valve & Radiator Repair", price: "From $350", note: "Per unit, parts & labor",
        features: ["Air valve replacement $350", "Radiator bleed & repair", "Cold-room diagnosis included"], cta: "Book Repair" },
      { name: "Backflow & Gas Inspection", price: "From $350", note: "Backflow $350 · Gas meter cert $500",
        features: ["Backflow testing $350", "Gas meter certification $500", "Gas flex hose, existing stove $375", "Official DOB compliance report"], cta: "Schedule Inspection", highlight: true, badge: "NYC Law — Annual Deadline", badgeTone: "amber" },
      { name: "Pump & Gas Appliance Work", price: "$1,000", note: "Full install & pressure test",
        features: ["Circulator pump replacement $1,000", "Gas stove replacement w/ LAA permit $1,000", "Full install & pressure test", "1-year warranty"], cta: "Get a Quote" },
    ],
  },
  {
    icon: "gauge",
    name: "Boiler Maintenance",
    description: "Catch small faults now before they become $3,000 winter emergencies.",
    tiers: [
      { name: "Diagnostic & Pilot Relight", price: "From $350", note: "Diagnostic $350 · Pilot relight $400",
        features: ["Full boiler diagnostic $350", "Pilot relight $400", "Error-code & flue safety check"], cta: "Book Diagnostic" },
      { name: "Annual Boiler Inspection", price: "$500", note: "Recommended every 12 months",
        features: ["Full system tune-up", "Pressure-relief valve test", "Combustion analysis", "Signed inspection certificate", "Priority scheduling for clients"], cta: "Schedule Inspection", highlight: true, badge: "Best Value" },
      { name: "Aquastat & Safety Controls", price: "From $650", note: "Recalibration & full cycle test",
        features: ["New aquastat $650", "Low-water cut-off from $1,000", "Control recalibration", "Full boiler cycle test"], cta: "Book Service" },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * SERVICE DETAIL — keyed by slug. Route: /services/[slug]
 * `tiers` here MUST stay in sync with the matching SECTIONS category. Two of
 * the six "note" strings are abbreviated vs the Pricing page — kept verbatim:
 *   • drain-cleaning  middle tier note: "No hidden fees — billed as quoted"
 *     (Pricing page: "...billed exactly as quoted")
 * If you centralize tiers, prefer the SECTIONS copy and drop the duplication.
 * -------------------------------------------------------------------------- */
export const SERVICE_DETAILS: ServiceDetail[] = [
  {
    slug: "plumbing-repair", icon: "wrench", nav: "Plumbing Repair",
    image: "images/hero-plumbing-repair.jpg",
    title: "Plumbing Repairs Done Right — The First Time",
    lead: "Dripping faucets, running toilets, weak pressure, or a pipe that just won't stop leaking? A licensed master plumber diagnoses fast, quotes a flat rate upfront, and fixes it to last — same day, with 24/7 emergency cover.",
    price: { value: "From $350", note: "$200 diagnosis · 100% waived when you book the repair" },
    highlights: ["Same-day repairs", "Upfront flat-rate", "12-month guarantee"],
    problems: [
      { icon: "droplets",       title: "Leaking faucets & taps",     desc: "Constant drips wasting water and quietly inflating your bill." },
      { icon: "waves",          title: "Running & weak toilets",     desc: "Phantom running, weak flushes, or a toilet that won't clear." },
      { icon: "gauge",          title: "Low water pressure",         desc: "Weak showers and slow taps from hidden blockages or leaks." },
      { icon: "shower-head",    title: "Dripping showers & valves",  desc: "Worn cartridges and seals causing endless, maddening drips." },
      { icon: "alert-triangle", title: "Burst & leaking pipes",      desc: "Sudden leaks under sinks, beneath floors, or behind walls." },
      { icon: "wrench",         title: "Faulty fixtures & fittings", desc: "Wobbly faucets, loose connections, and worn-out fixtures." },
    ],
    tiers: [
      { name: "Risk-Free Assessment", price: "$200", note: "100% applied to your repair",
        features: ["On-site diagnosis by a master plumber", "Written, flat-rate estimate before work", "Fee fully waived when you book the repair"], cta: "Book Assessment" },
      { name: "Standard Fixture Repair", price: "From $350", note: "Final flat price confirmed on-site",
        features: ["Toilet reset from $400", "Lavatory from $350", "Brass P-trap from $375", "Supply line & shutoff $350–$400", "Parts & labor included"], cta: "Schedule Repair", highlight: true, badge: "Most Popular" },
      { name: "Full Fixture Replacement", price: "From $400", note: "Parts, labor & old-fixture disposal",
        features: ["Kitchen sink from $450", "Toilet fill & anti-siphon valve $400", "Old fixture removal & disposal", "Code-compliant — passes NYC inspection", "Post-install pressure test"], cta: "Get a Quote" },
    ],
  },
  {
    slug: "pipe-leak-sump-pump", icon: "droplets", nav: "Pipe, Leak & Sump Pump",
    image: "images/hero-pipe-leak-repair.jpg",
    title: "Stop the Drip — Before It Becomes a Flood",
    lead: "A slow drip under the sink or a sump pump that won't keep up can turn into a ceiling-down emergency overnight. We trace leaks, replace valves and supply lines, insulate pipes, and keep basements dry — flat-rate and same-day.",
    price: { value: "From $350", note: "free sump-pump estimates · approve the price before we start" },
    highlights: ["Same-day leak repair", "Upfront flat-rate", "Flood prevention"],
    problems: [
      { icon: "droplets",       title: "Under-sink & supply leaks",  desc: "Drips from shutoffs, supply lines, and worn connections." },
      { icon: "alert-triangle", title: "Burst & hidden pipe leaks",  desc: "Water behind walls or under floors that won't let up." },
      { icon: "snowflake",      title: "Frozen & exposed pipes",     desc: "Uninsulated copper at risk of freezing and splitting." },
      { icon: "home",           title: "Wet & flooding basement",    desc: "Water pooling after heavy rain with no working pump." },
      { icon: "power",          title: "Failed or no-backup pump",   desc: "A pump that won't kick on, or none for power outages." },
      { icon: "git-merge",      title: "Leaking traps & joints",     desc: "Corroded P-traps and joints seeping under the cabinet." },
    ],
    tiers: [
      { name: "Shutoff, Supply & Insulation", price: "From $350", note: "Parts & labor included",
        features: ["Speedy shutoff valve $350", "Supply line + valves w/ escutcheon $400", "Copper insulation $20/ft exposed · $40/ft buried", "Under-sink leak inspection included"], cta: "Book Repair" },
      { name: "Trap & Connection Repair", price: "$375", note: "Flat-rate — approve before we start",
        features: ["Brass P-trap replacement", "Drain connection re-sealing", "Leak test after every install", "One flat price, nothing extra"], cta: "Schedule Now", highlight: true, badge: "Best Value" },
      { name: "Sump Pump Service", price: "Free estimate", note: "Scoped & priced on-site",
        features: ["Install, replacement & repair", "Battery-backup option", "Pit clean-out & float-switch check", "Basement flood prevention"], cta: "Request Free Estimate" },
    ],
  },
  {
    slug: "drain-cleaning", icon: "waves", nav: "Drain Cleaning",
    image: "images/drain-cleaning.jpg",
    title: "Clear Drains & Sewers, Flowing Like New",
    lead: "Slow sinks, gurgling pipes, or a backed-up main line? We clear blockages fast and cleanly with power-snaking, camera inspection, and hydro-jetting — flat-rate, no hourly meter, and we show you exactly what was wrong.",
    price: { value: "From $375", note: "kitchen, bathroom & main sewer — priced by drain" },
    highlights: ["No-mess clearing", "Camera inspection", "Same-day service"],
    problems: [
      { icon: "waves",          title: "Slow & gurgling drains",  desc: "Sinks, showers, and tubs that drain slowly or bubble back." },
      { icon: "alert-triangle", title: "Blocked main sewer line", desc: "Several drains backing up at once — a main-line clog." },
      { icon: "wind",           title: "Bad drain odors",         desc: "Persistent smells from grease, food, or organic buildup." },
      { icon: "git-branch",     title: "Tree-root intrusion",     desc: "Roots cracking into and choking older underground pipes." },
      { icon: "repeat",         title: "Recurring blockages",     desc: "The same drain clogging again despite repeated plunging." },
      { icon: "home",           title: "Outdoor & storm drains",  desc: "Overflowing yard drains and catch basins after heavy rain." },
    ],
    tiers: [
      { name: "Kitchen Drain Snake", price: "$375", note: "Flat-rate — billed exactly as quoted",
        features: ["Professional electric snake / auger", "Kitchen sink & branch line", "Grease & food-buildup removal", "Post-service flow test"], cta: "Book Drain Cleaning" },
      { name: "Bathroom Drain Snake", price: "$425", note: "Flat-rate — billed exactly as quoted",
        features: ["Tub, shower & sink drains", "Professional electric snake / auger", "Hair & soap-scum removal", "Post-service flow test"], cta: "Book Drain Cleaning", highlight: true, badge: "Best Value" },
      { name: "Main Sewer Line", price: "$550", note: "Camera inspection included · flat-rate",
        features: ["Mainline snaking & power clearing", "Camera inspection of the line", "Root & grease removal", "Full post-service report"], cta: "Get a Quote" },
    ],
  },
  {
    slug: "water-heater-installation", icon: "flame", nav: "Water Heater Installation",
    image: "images/water-heater-installation.jpg",
    title: "Same-Day Hot Water, Expertly Installed",
    lead: "Cold showers, rusty water, or a heater on its last legs? We install right-sized tank water heaters — hauled away, permitted, and running the same day. Big-ticket job? Ask about flexible financing so a failed heater isn't a budget emergency.",
    price: { value: "From $3,000", note: "free estimate + financing · save $1,500 on the 50-gallon" },
    highlights: ["Same-day hot water", "Free estimate + financing", "1-year warranty"],
    problems: [
      { icon: "thermometer",    title: "No or weak hot water",    desc: "Lukewarm showers or hot water that runs out far too fast." },
      { icon: "droplets",       title: "Rusty or smelly water",   desc: "Discolored or odd-smelling hot water from a corroding tank." },
      { icon: "alert-triangle", title: "Leaking or noisy tank",   desc: "Pooling water, banging, or rumbling from a failing unit." },
      { icon: "zap",            title: "High energy bills",       desc: "An old, inefficient heater quietly inflating your bill." },
      { icon: "gauge",          title: "Wrong size for the home", desc: "A unit too small for your household's real hot-water demand." },
      { icon: "clock",          title: "Aging unit (8+ years)",   desc: "An older heater overdue for replacement before it fails." },
    ],
    tiers: [
      { name: "75 Gallon Install", price: "$4,500", note: "Parts, labor & haul-away",
        features: ["Commercial-grade 75-gallon tank", "Old unit haul-away", "Heavy-duty gas line connection", "Permit included", "1-year labor warranty"], cta: "Schedule Installation" },
      { name: "50 Gallon Install", price: "$3,000", note: "Save $1,500 vs. 75-gal",
        features: ["Perfect for 2–4 people", "Old unit haul-away", "Same-day hot water restored", "Permit included", "1-year labor warranty"], cta: "Schedule Installation", highlight: true, badge: "Most Popular · Save $1,500" },
      { name: "Water Heater Repair & Diagnostic", price: "Free estimate", note: "Honest repair-vs-replace advice",
        features: ["No-hot-water & leak diagnosis", "Thermostat / pilot / valve repairs", "Straight repair-vs-replace guidance", "Same-day service where possible"], cta: "Request Free Estimate" },
    ],
  },
  {
    slug: "heating-hvac", icon: "thermometer", nav: "Heating & HVAC",
    image: "images/heating-hvac.jpg",
    title: "Warm Rooms, Safe Gas, Inspections Passed",
    lead: "Cold radiators, a failing circulator pump, or a DOB-required gas inspection deadline looming? Our licensed master plumber handles heating repairs and gas-appliance work to NYC code — with official compliance reports filed for you.",
    price: { value: "From $350", note: "official DOB compliance reports included" },
    highlights: ["Same-day repairs", "NYC-code gas work", "DOB compliance reports"],
    problems: [
      { icon: "thermometer",    title: "Cold rooms & radiators",  desc: "Radiators cold at the bottom or never fully heating up." },
      { icon: "wind",           title: "Failed air valves",       desc: "Hissing or dead air valves leaving rooms cold." },
      { icon: "shield-alert",   title: "Gas inspection due",      desc: "A DOB-required backflow or gas-meter deadline approaching." },
      { icon: "flame",          title: "Gas stove & flex hose",   desc: "Replacing an existing stove or its gas flex connection." },
      { icon: "alert-triangle", title: "Failing circulator pump", desc: "One dead pump can knock out your whole heating loop." },
      { icon: "file-check",     title: "Compliance paperwork",    desc: "Reports that must be filed correctly with the city." },
    ],
    tiers: [
      { name: "Valve & Radiator Repair", price: "From $350", note: "Per unit, parts & labor",
        features: ["Air valve replacement $350", "Radiator bleed & repair", "Cold-room diagnosis included"], cta: "Book Repair" },
      { name: "Backflow & Gas Inspection", price: "From $350", note: "Backflow $350 · Gas meter cert $500",
        features: ["Backflow testing $350", "Gas meter certification $500", "Gas flex hose, existing stove $375", "Official DOB compliance report"], cta: "Schedule Inspection", highlight: true, badge: "NYC Law — Annual Deadline", badgeTone: "amber" },
      { name: "Pump & Gas Appliance Work", price: "$1,000", note: "Full install & pressure test",
        features: ["Circulator pump replacement $1,000", "Gas stove replacement w/ LAA permit $1,000", "Full install & pressure test", "1-year warranty"], cta: "Get a Quote" },
    ],
  },
  {
    slug: "boiler-maintenance", icon: "gauge", nav: "Boiler Maintenance",
    image: "images/boiler-maintenance.jpg",
    title: "Catch Boiler Faults Before They Cost $3,000",
    lead: "A pilot that won't relight, an error code, or a winter tune-up overdue? Our annual inspection and diagnostics catch small faults before they become freezing-night emergencies — signed certificate included, priority scheduling for clients.",
    price: { value: "From $350", note: "annual inspection $500 · signed certificate included" },
    highlights: ["Signed certificate", "Priority scheduling", "12-month guarantee"],
    problems: [
      { icon: "power",          title: "Pilot won't stay lit",        desc: "A pilot or burner that keeps going out, or repeated lockouts." },
      { icon: "alert-triangle", title: "Error codes & lockouts",      desc: "A boiler throwing faults and refusing to fire." },
      { icon: "gauge",          title: "Losing pressure",             desc: "The gauge dropping and needing constant topping up." },
      { icon: "thermometer",    title: "Erratic heat & wasted fuel",  desc: "A failing aquastat causing wild temperatures and high bills." },
      { icon: "wind",           title: "Flue & safety concerns",      desc: "Venting or combustion issues that need a safety check." },
      { icon: "calendar-check", title: "Annual tune-up overdue",      desc: "A yearly service due to stay efficient and warranty-valid." },
    ],
    tiers: [
      { name: "Diagnostic & Pilot Relight", price: "From $350", note: "Diagnostic $350 · Pilot relight $400",
        features: ["Full boiler diagnostic $350", "Pilot relight $400", "Error-code & flue safety check"], cta: "Book Diagnostic" },
      { name: "Annual Boiler Inspection", price: "$500", note: "Recommended every 12 months",
        features: ["Full system tune-up", "Pressure-relief valve test", "Combustion analysis", "Signed inspection certificate", "Priority scheduling for clients"], cta: "Schedule Inspection", highlight: true, badge: "Best Value" },
      { name: "Aquastat & Safety Controls", price: "From $650", note: "Recalibration & full cycle test",
        features: ["New aquastat $650", "Low-water cut-off from $1,000", "Control recalibration", "Full boiler cycle test"], cta: "Book Service" },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * SERVICE DETAIL — universal 4-step process (themed per service via tokens)
 * -------------------------------------------------------------------------- */
export const PROCESS = [
  { icon: "phone-call",     title: "Call or book",      desc: "A real person answers 24/7." },
  { icon: "clipboard-list", title: "Flat-rate quote",   desc: "Upfront price before we start." },
  { icon: "wrench",         title: "Fixed on the spot", desc: "Code-compliant parts, done right." },
  { icon: "sparkles",       title: "Clean & guaranteed", desc: "Spotless, backed 12 months." },
];

/* ----------------------------------------------------------------------------
 * SERVICE DETAIL — FAQ generator (5 Q&A, auto-built per service).
 * Reproduce these strings EXACTLY, including the capitalization of price.note.
 * -------------------------------------------------------------------------- */
export function faqFor(s: ServiceDetail) {
  const cap = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  return [
    { q: `How much does ${s.nav.toLowerCase()} cost?`,
      a: `Flat-rate and upfront. ${s.price.value} for this service — you approve a fixed price before any work begins, with no hourly meter and no surprise add-ons. ${cap(s.price.note)}.` },
    { q: "Can you come the same day?",
      a: "Most jobs are handled same-day. Call early — same-day slots fill fast, especially in peak season." },
    { q: "Do you offer 24/7 emergency service?",
      a: `Yes. Our emergency line is staffed 24/7 — nights, weekends, and holidays — so a burst pipe or no-heat night is never just you and a bucket. Call ${BIZ.phone} any time.` },
    { q: "Is the work guaranteed, and are you licensed?",
      a: `Every job runs under ${BIZ.owner}, NYC Master Plumber Lic# ${BIZ.licenseNo} — bonded and insured. Work is backed by our 12-month workmanship guarantee in writing.` },
    { q: "Which areas do you serve?",
      a: `We serve ${BIZ.areas.slice(0, 3).join(", ")} and ${BIZ.areas[3]} across the NYC metro. Not sure if you're in range? Call and we'll confirm in seconds.` },
  ];
}

/* ----------------------------------------------------------------------------
 * GUARANTEE STRIP (pricing page, 4 items)
 * -------------------------------------------------------------------------- */
export const GUARANTEES = [
  { icon: "receipt",      title: "No hourly meters",      sub: "One flat price, agreed before we start." },
  { icon: "shield-check", title: "Licensed & insured",    sub: `Master plumber · NYC Lic# ${BIZ.licenseNo}.` },
  { icon: "badge-check",  title: "Fixed-price guarantee", sub: "The quote is the price. No add-ons." },
  { icon: "clock",        title: "Same-day availability", sub: "Slots fill fast — call early." },
];

/* ----------------------------------------------------------------------------
 * TRUST BAND (service pages — 4 items, rendered AFTER the Book section)
 * -------------------------------------------------------------------------- */
export const TRUST_BAND = [
  { icon: "shield-check", title: "Licensed master plumber", sub: `NYC Lic# ${BIZ.licenseNo} · bonded & insured` },
  { icon: "receipt",      title: "Upfront flat-rate",       sub: "Approve the price before we start" },
  { icon: "clock",        title: "Same-day & 24/7",         sub: "Nights, weekends & holidays" },
  { icon: "badge-check",  title: "12-month guarantee",      sub: "Every job, backed in writing" },
];

/* ----------------------------------------------------------------------------
 * OTHER SERVICES STRIP (service pages — after TrustBand)
 * Heading: "Explore other services". Items = the 5 entries of SERVICE_DETAILS
 * whose slug !== current slug (icon + nav), linking to /services/<slug>.
 * No separate data needed — derive from SERVICE_DETAILS.
 * -------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------
 * BOOKING FORM — <select> options (verbatim, in order)
 * Homepage uses HOME_SERVICES titles; Pricing uses SECTIONS names. Both wrap
 * with the same first/last sentinel options below.
 * -------------------------------------------------------------------------- */
export const FORM_SELECT = {
  placeholder: "Select a service…",
  emergency:   "Emergency — burst pipe / no heat",
  fallback:    "Other / Not sure",
};

/* ----------------------------------------------------------------------------
 * ICON MAP — every lucide-react name used across the 3 pages (40 total).
 * import as: import { ShieldCheck, ... } from "lucide-react"
 * -------------------------------------------------------------------------- */
export const ICONS = [
  // chrome / nav
  "star", "shield-check", "clock", "phone-call", "phone", "chevron-down",
  "chevron-right", "arrow-right", "menu", "x", "map-pin", "mail", "check",
  // service + category icons
  "wrench", "droplets", "waves", "flame", "thermometer", "gauge",
  // trust / steps / misc
  "receipt", "badge-check", "clipboard-list", "sparkles", "home", "tag",
  "alert-triangle", "hand-coins", "plus", "minus",
  // service-detail problem icons
  "shower-head", "snowflake", "power", "git-merge", "wind", "git-branch",
  "repeat", "zap", "shield-alert", "file-check", "calendar-check",
] as const;
