import type { Metadata } from "next";
import { BaselineLoader } from "@/components/baseline-loader";

export const metadata: Metadata = {
  title: "Atlas — Mean baseline",
  description:
    "Compare the mean of y to a fitted line. Training loss can favor the line while a holdout still prefers the baseline.",
};

export default function BaselinePage() {
  return <BaselineLoader />;
}