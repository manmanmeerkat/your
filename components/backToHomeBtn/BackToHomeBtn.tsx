import Link from "next/link";
import { Button } from "../ui/button";

export const BackToHomeBtn = () => {
  return (
    <div className="flex justify-center mb-20">
      <Link href="/">
        <Button
          size="lg"
          className="
            min-w-[240px] h-12
            flex items-center justify-center
            leading-none font-semibold tracking-wide
            border border-[#c96a5d] bg-[#c96a5d] text-[#f3f3f2]
            hover:brightness-110 hover:-translate-y-[1px]
            transition-all duration-200
            shadow-md hover:shadow-lg
            disabled:opacity-70 disabled:cursor-not-allowed
            group
          "
        >
          Back to Home
          <span className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Button>
      </Link>
    </div>
  );
};
