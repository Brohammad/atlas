"use client";

import dynamic from "next/dynamic";

const BaselineLab = dynamic(() => import("@/components/baseline-lab").then((mod) => mod.BaselineLab), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
    </main>
  ),
});

export function BaselineLoader() {
  return <BaselineLab />;
}