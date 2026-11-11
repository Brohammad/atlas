import type { Metadata } from "next";
import { WebLoader } from "@/components/web-loader";

export const metadata: Metadata = {
  title: "Atlas — Say the next value",
  description:
    "A fifteen-minute gradient descent lab. No account. Commit the next value before the chart moves.",
};

export default function Home() {
  return <WebLoader />;
}
