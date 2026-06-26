import { Link } from "react-router-dom";
import { BIZ } from "@/lib/biz";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-5 bg-white">
      <div className="font-display font-extrabold text-navy text-[96px] leading-none opacity-10">
        404
      </div>
      <h1 className="mt-4 font-display font-extrabold text-navy text-[32px]">Page not found</h1>
      <p className="mt-3 text-[16px] text-muted max-w-sm">
        The page you're looking for doesn't exist. Try going back home or give us a call.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="btn sheen inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue text-white font-bold hover:bg-blue-deep"
        >
          Back to Home
        </Link>
        <a
          href={BIZ.phoneHref}
          className="btn inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-line font-bold text-navy hover:border-blue/40"
        >
          Call {BIZ.phone}
        </a>
      </div>
    </div>
  );
}
