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

export default function CategoriesSection({
  categories,
}: CategoriesSectionProps) {
  return (
    <section id="categories" className="py-16 md:px-16">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-12 text-center text-[#f3f3f2] bg-[#180614] py-2">
          Categories to Explore
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
