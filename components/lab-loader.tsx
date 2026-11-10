"use client";

import dynamic from "next/dynamic";

const Lab = dynamic(() => import("@/components/lab-app").then((mod) => mod.Lab), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs tracking-[0.2em] text-copper">ATLAS</p>
    </main>
  ),
});

export function LabLoader() {
  return <Lab />;
}
