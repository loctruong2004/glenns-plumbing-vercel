// R-17: the single place the public phone number lives. When the Twilio
// tracking number is purchased (roadmap B36), do the swap HERE — replace the
// re-export with an override, e.g.:
//   import { BIZ as DATA_BIZ } from "./data";
//   export const BIZ = { ...DATA_BIZ, phone: "(xxx) xxx-xxxx", phoneHref: "tel:+1xxxxxxxxxx" } as const;
// (+ meta descriptions). lib/data.ts stays verbatim to the handoff's
// 03-data.ts (golden rule 1) — never edit the number there.
export { BIZ } from "./data";
