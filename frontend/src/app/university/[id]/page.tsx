import UniversityClient from "./UniversityClient";

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({ id: String(i + 1) }));
}

export default function Page() {
  return <UniversityClient />;
}
