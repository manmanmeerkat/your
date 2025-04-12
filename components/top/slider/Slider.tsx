import { useEffect, useState } from "react";
import { SLIDE_IMAGES } from "@/constants/constants";

export default function Slider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {SLIDE_IMAGES.map((img, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={img.img}
            alt={`スライド ${i + 1}`}
            className="absolute w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black opacity-40" />
        </div>
      ))}
    </>
  );
}