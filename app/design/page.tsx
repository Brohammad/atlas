import type { Metadata } from "next";
import { DesignBoard } from "@/components/design-board";

export const metadata: Metadata = {
  title: "Atlas — Page and app",
  description: "The public page and the run, on a desk and on a phone.",
};

export default function DesignPage() {
  return <DesignBoard />;
}
