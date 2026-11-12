"use client";

import dynamic from "next/dynamic";

const RateLab = dynamic(() => import("@/components/rate-lab").then((mod) => mod.RateLab), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
    </main>
  ),
});

export function RateLoader() {
  return <RateLab />;
}
