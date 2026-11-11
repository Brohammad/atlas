import type { Metadata } from "next";
import { ResidLoader } from "@/components/resid-loader";

export const metadata: Metadata = {
  title: "Atlas — Residuals",
  description:
    "The residual is the prediction minus the label. A small sum can hide the loss, and a negative residual means the prediction is too low.",
};

export default function ResidualsPage() {
  return <ResidLoader />;
}
