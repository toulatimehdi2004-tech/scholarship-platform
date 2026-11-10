import UniversityClient from "./UniversityClient";

export function generateStaticParams() {
  return Array.from({ length: 102 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page() {
  return <UniversityClient />;
}