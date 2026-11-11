import type { Metadata } from "next";
import { ClassicalLoader } from "@/components/classical-loader";

export const metadata: Metadata = {
  title: "Atlas — Traditional machine learning",
  description:
    "A separate track. Twelve modules on the map. The open unit is linear regression: loss, partial, update, and the step you write.",
};

export default function ClassicalPage() {
  return <ClassicalLoader />;
}
