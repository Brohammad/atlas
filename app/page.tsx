import type { Metadata } from "next";
import { WebLoader } from "@/components/web-loader";

export const metadata: Metadata = {
  title: "Atlas — Say the next value",
  description:
    "Start with a line, then search for the weight. No account. The chart is the search, not the first sitting.",
};

export default function Home() {
  return <WebLoader />;
}
