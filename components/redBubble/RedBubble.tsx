// Redbubble.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { REDBUBBLE_LISTS } from "@/constants/constants";
import { Button } from "../ui/button";

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function RedbubbleGrid({ max = 15 }: { max?: number }) {
  const [items, setItems] = useState<typeof REDBUBBLE_LISTS>([]);

  useEffect(() => {
    setItems(getRandomItems(REDBUBBLE_LISTS, max));
  }, [max]);

  return (
  <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-8">
    <h2 className="text-3xl font-bold mb-8 text-center text-white">Our Redbubble Products</h2>
    <p className="text-center text-lg mb-8 max-w-2xl mx-auto text-white">
      Discover unique items inspired by the beauty and spirit of Japan—from ancient traditions to everyday wonders. <br />
      Bring a little piece of Japan into your life.
    </p>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
      {items.map((item, index) => (
        <Link
          key={index}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="relative group block overflow-hidden rounded shadow hover:shadow-lg transform transition-transform duration-300 hover:scale-105 border border-transparent hover:border-white hover:border-2"
        >
          <Image
            src={item.img}
            alt={item.title}
            width={300}
            height={300}
            className="w-full h-auto object-cover"
            unoptimized
          />
        </Link>
      ))}
    </div>

    <div className="mt-24 max-w-xs sm:max-w-md mx-auto px-4 text-center">
      <Link href="https://www.redbubble.com/people/manmanmeerkat/shop?asc=u" passHref>
        <Button
          size="lg"
          className="font-normal border border-rose-700 bg-rose-700 text-white hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold shadow hover:shadow-lg whitespace-normal sm:whitespace-nowrap w-full"
        >
          Explore the full collection on Redbubble ≫
        </Button>
      </Link>
    </div>
  </div>
  );
}