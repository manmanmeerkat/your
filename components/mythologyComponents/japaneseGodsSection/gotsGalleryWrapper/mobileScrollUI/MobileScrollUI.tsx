import { GetGodsItem } from "../getGodsItem/GetGodsItem";
import { GodData } from "@/types/types";
import { GetGodsSlug } from "../getGodsSlug/GetGodsSlug";

export const MobileScrollUI = ({
  gods,
  slugMap,
}: {
  gods: GodData[];
  slugMap: Record<string, string>;
}) => {
  return (
    <div className="lg:hidden overflow-x-auto px-6 scrollbar-custom">
      <div className="inline-flex gap-8 pr-6">
        {gods.map((god, index) => {
          const slug = GetGodsSlug(god.name, slugMap); // モバイルは簡潔ログ
          return (
            <GetGodsItem
              key={`mobile-${god.name}-${index}`}
              god={god}
              slug={slug}
              isMobile={true}
            />
          );
        })}
      </div>
    </div>
  );
};