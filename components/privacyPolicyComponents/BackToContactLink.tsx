// app/privacy-policy/_components/BackToContactLink.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function BackToContactLink({ className = "" }: { className?: string }) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  if (from !== "contact") return null;

  return (
    <Link
      href="/contact"
      className={[
        "inline-flex items-center gap-1 text-sm text-white/70 hover:text-white underline underline-offset-4",
        className,
      ].join(" ")}
    >
      ← Back to Contact
    </Link>
  );
}
