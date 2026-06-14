import React from "react";

export default function AuthLayout({ role, children }) {
  const isLawyer = role === "lawyer";

  const brandHeadline = isLawyer
    ? "Connect with clients who need your expertise"
    : "Find the right lawyer for your case";

  const brandSub = isLawyer
    ? "Build your profile once. Get matched to relevant cases. Grow your practice on merit."
    : "Describe your legal issue and we'll surface the most qualified advocates for you.";

  const stats = isLawyer
    ? [
        { value: "18,000+", label: "LSK advocates" },
        { value: "6", label: "practice areas" },
        { value: "Merit-based", label: "visibility" },
      ]
    : [
        { value: "Fast", label: "matching" },
        { value: "Verified", label: "advocates only" },
        { value: "Transparent", label: "ratings" },
      ];

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col justify-between p-10 xl:p-14"
        style={{ backgroundColor: "#0F2744" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: "#1D9E75" }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L3 6v4c0 3.5 2.5 6.5 6 7.5C13.5 16.5 16 13.5 16 10V6L9 2z"
                fill="white"
                fillOpacity="0.9"
              />
              <path
                d="M6.5 9.5l2 2 3.5-3.5"
                stroke="#0F2744"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            LegalMatch
          </span>
        </div>

        {/* Main copy */}
        <div className="max-w-sm">
          <div
            className="text-xs font-medium uppercase tracking-widest mb-4"
            style={{ color: "#1D9E75" }}
          >
            {isLawyer ? "For Advocates" : "For Clients"}
          </div>
          <h1 className="text-3xl xl:text-4xl font-semibold text-white leading-tight mb-4">
            {brandHeadline}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#8BA8C4" }}>
            {brandSub}
          </p>

          {/* Stats row */}
          <div className="mt-10 flex gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-white font-semibold text-lg">{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "#8BA8C4" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs" style={{ color: "#4A6B8A" }}>
          Serving the Kenyan legal market · LSK-verified advocates only
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-10 bg-gray-50">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ backgroundColor: "#0F2744" }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L3 6v4c0 3.5 2.5 6.5 6 7.5C13.5 16.5 16 13.5 16 10V6L9 2z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <span className="font-semibold text-base" style={{ color: "#0F2744" }}>
            LegalMatch
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
