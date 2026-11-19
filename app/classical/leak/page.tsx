import type { Metadata } from "next";
import { LeakLoader } from "@/components/leak-loader";

export const metadata: Metadata = {
  title: "Atlas — Target leakage",
  description:
    "A column that copies y drives training loss to zero. At prediction time that column is not available.",
};

export default function LeakPage() {
  return <LeakLoader />;
}