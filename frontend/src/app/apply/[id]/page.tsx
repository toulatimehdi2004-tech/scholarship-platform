import { Suspense } from "react";
import ApplyClient from "./ApplyClient";

export function generateStaticParams() {
  return Array.from({ length: 600 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ApplyClient />
    </Suspense>
  );
}
