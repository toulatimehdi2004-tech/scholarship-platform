import ApplyClient from "./ApplyClient";

export function generateStaticParams() {
  return Array.from({ length: 400 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page() {
  return <ApplyClient />;
}