import type { Metadata } from "next";
import { RateLoader } from "@/components/rate-loader";

export const metadata: Metadata = {
  title: "Atlas — Learning rate",
  description:
    "The same rate can finish a shallow line and step past the best weight on a steeper one. Ten steps, then the last loss.",
};

export default function RatePage() {
  return <RateLoader />;
}
