"use client";

import dynamic from "next/dynamic";

const ClassicalMap = dynamic(() => import("@/components/classical-map").then((mod) => mod.ClassicalMap), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
    </main>
  ),
});

export function ClassicalLoader() {
  return <ClassicalMap />;
}
