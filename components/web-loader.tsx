"use client";

import dynamic from "next/dynamic";

const WebPage = dynamic(() => import("@/components/web-page").then((mod) => mod.WebPage), {
  ssr: false,
  loading: () => (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-copper">ATLAS</p>
    </main>
  ),
});

export function WebLoader() {
  return <WebPage />;
}
