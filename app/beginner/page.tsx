import type { Metadata } from "next";
import { BeginnerLoader } from "@/components/beginner-loader";

export const metadata: Metadata = {
  title: "Atlas — Fit a line",
  description:
    "Six questions. One weight, three points, no bias, squared error summed, then why trying every weight does not scale.",
};

export default function BeginnerPage() {
  return <BeginnerLoader />;
}
