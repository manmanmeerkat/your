// app/articles/[slug]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ArticleNotFound() {
  return (
    <div className="bg-slate-950 min-h-screen flex flex-col items-center justify-center text-white py-16">
      <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
      <p className="text-lg mb-8">
        The article you&apos;re looking for may not exist or is not publicly
        available.
      </p>
      <Link href="/all-articles">
        <Button
          size="lg"
          className="w-[220px] font-normal
                    border border-rose-700 bg-rose-700 text-white
                    hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                    shadow hover:shadow-lg"
        >
          Browse Articles ≫
        </Button>
      </Link>
    </div>
  );
}
