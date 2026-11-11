"use client";

import dynamic from "next/dynamic";

const ResidLab = dynamic(() => import("@/components/resid-lab").then((mod) => mod.ResidLab), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
    </main>
  ),
});

export function ResidLoader() {
  return <ResidLab />;
}
