import { SectionTitle } from "@/components/sectionTitle/SectionTitle";
import CategoryCard from "../categoryCard/categoryCard";

type CategoryItem = {
  href: string;
  title: string;
  img: string;
  description: string;
};

type CategoriesSectionProps = {
  categories: CategoryItem[];
};

export default function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section id="categories" className="py-16 md:px-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <SectionTitle>Categories to Explore</SectionTitle>
          <p className="mt-3 text-sm md:text-base text-[#f3f3f2]/80">
            Choose a path and start exploring Japan’s stories, seasons, and traditions.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((item) => (
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
  );
}
