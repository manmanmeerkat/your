// components/top/hero/HeroSection.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Slider from "../slider/Slider";

export default function HeroSection() {
  return (
    <section className="relative text-white md:px-16">
      <div className="absolute inset-0 z-0">
        <Slider />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-40">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Explore Japan&apos;s hidden charms
        </h1>
        <p className="text-xl mb-8 drop-shadow-md">
          Ancient myths, seasonal festivals, and rich traditional culture.
          <br />
          We will introduce you to a side of Japan you may not have known
          before.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link href="#categories" scroll={true}>
            <Button
              size="lg"
              className="w-[260px] font-normal
                      border border-rose-700 bg-rose-700 text-white
                      hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                      shadow hover:shadow-lg"
            >
              Explore Categories ≫
            </Button>
          </Link>
          <Link href="#latest-articles" scroll={true}>
            <Button
              size="lg"
              variant="outline"
              className="font-normal w-[220px] text-center
                      border-white text-white
                      hover:bg-white hover:text-black hover:font-bold"
            >
              Latest Articles ≫
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
