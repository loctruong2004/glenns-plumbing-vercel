import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// One observer per page (02 §Reveal observer). Mounted in each page (not the
// layout) so client-side navigations re-observe the fresh [data-reveal] nodes.
// Keyed on pathname so param-only route changes (e.g. /services/a -> /services/b,
// where the page component is reused, not remounted) re-observe the new nodes.
export function RevealObserver() {
  const { pathname } = useLocation();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    const observe = () =>
      document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    observe();
    const t = setTimeout(observe, 300); // catch late-mounted nodes
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);
  return null;
}
