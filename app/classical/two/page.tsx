import type { Metadata } from "next";
import { TwoLoader } from "@/components/two-loader";

export const metadata: Metadata = {
  title: "Atlas — Two inputs",
  description: "Linear regression with two weights. The partial for a weight only sees that weight’s input.",
};

export default function TwoPage() {
  return <TwoLoader />;
}
