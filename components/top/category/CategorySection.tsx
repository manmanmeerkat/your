// components/top/category/CategorySection.tsx
import CategoryCard from "../categoryCard/categoryCard";

interface CategoryItem {
  href: string;
  title: string;
  img: string;
  description: string;
}

interface CategorySectionProps {
  categories: CategoryItem[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
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
  );
}
