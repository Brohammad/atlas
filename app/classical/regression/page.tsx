import type { Metadata } from "next";
import { RegressionLoader } from "@/components/regression-loader";

export const metadata: Metadata = {
  title: "Atlas — Linear regression",
  description:
    "Predict with a bias, sum the squared errors, compute the partial, take one step, and write the update.",
};

export default function RegressionPage() {
  return <RegressionLoader />;
}
