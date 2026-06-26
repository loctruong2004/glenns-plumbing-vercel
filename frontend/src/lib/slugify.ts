// Same slugify as the prototype quick-jump chips (04 §2): category anchors
// `#cat-<slugify(name)>` must match between PricingIntro and PricingCategory.
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
