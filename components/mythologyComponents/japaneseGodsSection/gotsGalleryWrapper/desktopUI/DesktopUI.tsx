import { GetGodsItem } from "../getGodsItem/GetGodsItem";
import { GodData } from "@/types/types";
import { GetGodsSlug } from "../getGodsSlug/GetGodsSlug";

export const DesktopUI = ({
  gods,
  slugMap,
}: {
  gods: GodData[];
  slugMap: Record<string, string>;
}) => {
  return (
    <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center text-center">
      {gods.map((god, index) => {
        const slug = GetGodsSlug(god.name, slugMap); // デスクトップはデバッグモード
        return (
          <GetGodsItem
            key={`${god.name}-${index}`}
            god={god}
            slug={slug}
            isMobile={false}
          />
        );
      })}
    </div>
  );
};