import type { Metadata } from "next";
import { LabLoader } from "@/components/lab-loader";

export const metadata: Metadata = {
  title: "Atlas — The run",
  description: "Predict a step, choose a learning rate, diagnose a broken update, and write the step.",
};

export default function LabPage() {
  return <LabLoader />;
}
