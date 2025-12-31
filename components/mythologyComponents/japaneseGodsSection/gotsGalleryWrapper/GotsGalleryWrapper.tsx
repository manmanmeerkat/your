import GodsGalleryDetail from "./gotsGalleryDetail/GodsGalleryDetail";
import { JAPANESE_GODS } from "@/constants/constants";

export async function GodsGalleryWrapper({
  godsSlugMapPromise,
}: {
  godsSlugMapPromise: Promise<Record<string, string>>;
}) {
  try {
    const godsSlugMap = await godsSlugMapPromise;
    const optimizedGods = JAPANESE_GODS.filter((god) => god.name && god.img && god.gender);
    return <GodsGalleryDetail gods={optimizedGods} slugMap={godsSlugMap} />;
  } catch (e) {
    console.error("Error loading gods gallery:", e);
    return (
      <div className="text-center text-white py-8">
        <p>The gods gallery is currently unavailable.</p>
      </div>
    );
  }
}
