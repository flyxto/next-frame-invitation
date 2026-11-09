import type { Metadata } from "next";
import Closed from "./components/Closed";

export const metadata: Metadata = {
  title: "Page not available",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <Closed />;
}
