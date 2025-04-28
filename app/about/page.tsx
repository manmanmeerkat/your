import Image from "next/image";
import { WhiteLine } from "@/components/whiteLine/whiteLine";
import { CATEGORY_ITEMS } from "@/constants/constants";
import CategoryCard from "@/components/top/categoryCard/categoryCard";
import { SimpleContact } from "@/components/getInTouch/simpleContact/SimpleContact";
import Redbubble from "@/components/redBubble/RedBubble";
import { BackToHomeBtn } from "@/components/backToHomeBtn/BackToHomeBtn";

export default function AboutPage() {
  return (
    <div>
      {/* ヘッダーセクション */}
      <section className="relative bg-slate-950 text-white pt-40 pb-40">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/images/category-top/about.jpg"
              alt="About us"
              className="w-full h-full object-cover"
              width={1024}
              height={280}
              style={{ objectPosition: "center" }}
            />
          </div>
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About us
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-justify">
            Your Secret Japan is a project dedicated to sharing the richness of Japan’s cultural heritage and traditions with the world. Through stories of mythology, timeless arts, seasonal festivals, and everyday beauty, we invite you to explore the depth and charm of Japanese culture.
          </p>
        </div>
      </section>

      {/* ミッションセクション */}
      <section className="pt-16 md:px-16 ">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">
            Our mission
          </h2>
          <div className="shadow-md p-8">
            <p className="mb-4 text-lg text-white text-justify">
              Your Secret Japan is passionate about discovering and sharing the deep charm of Japan.<br/>
              We present the real Japan that you won't find in a tourist guidebook.
            </p>
            <p className="mb-4 text-lg text-white text-justify">
              Japanese culture is diverse, from ancient myths, seasonal festivals, and traditional crafts that are meticulously crafted. <br/>
              We aim to introduce this rich cultural heritage in an accessible and engaging way.
            </p>
            <p className="mb-4 text-lg text-white text-justify">
              Whether you're a beginner wanting to learn about Japan or a knowledgeable enthusiast, Your Secret Japan will leave you with new discoveries and insights.
            </p>
          </div>
        </div>
      </section>
      <WhiteLine/>

      {/* コンテンツセクション */}
      <section className="pt-8 pb-24 bg-slate-950 md:px-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Our Contents</h2>
          <p className="text-lg mb-8 text-white">
            Here are the categories we offer on this website.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {CATEGORY_ITEMS.map((item) => (
              <CategoryCard
                key={item.href}
                href={item.href}
                title={item.title}
                img={item.img}
                description={item.description}
              />
            ))}
          </div>
        </div>
  
      </section>
      <WhiteLine/>
      <Redbubble/>
      <WhiteLine/>
      <SimpleContact/>
      <BackToHomeBtn/>
      <WhiteLine/>
    </div>
  );
}
