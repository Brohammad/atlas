"use client";

import dynamic from "next/dynamic";

const ClassicalLab = dynamic(() => import("@/components/classical-lab").then((mod) => mod.ClassicalLab), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
    </main>
  ),
});

export function RegressionLoader() {
  return <ClassicalLab />;
}
