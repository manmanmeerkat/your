import RelatedArticles from "../../sidebar/RelatedArticles";
import ArticleDetailLayout from "../../articleDetailLayout/ArticleDetaiLayout";
import { toDisplayDocFromArticle } from "@/lib/articlePage/toDisplayDocFromArticle";
import { CATEGORY_LABELS } from "@/constants/constants";
import type { ArticleDTO } from "@/components/articlePageComponents/getArticleBySlug/getArticleBySlug";

type RelatedArticleItem = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

type ArticleClientPageProps = {
  article: ArticleDTO;
  relatedArticles: RelatedArticleItem[];
};

export default function ArticleClientPage({
  article,
  relatedArticles,
}: ArticleClientPageProps) {
  const doc = toDisplayDocFromArticle(article);

  const relatedItems = relatedArticles.slice(0, 3).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    href: `/articles/${a.slug}`, 
    imageUrl: a.imageUrl ?? null,
    imageAlt: a.imageAlt ?? a.title,
  }));

  return (
    <ArticleDetailLayout
      doc={doc}
      sidebar={
        <RelatedArticles items={relatedItems} currentCategory={doc.category} />
      }
      backHref={`/${doc.category}`}
      backLabel={`Back to ${
        CATEGORY_LABELS[doc.category as keyof typeof CATEGORY_LABELS] ?? doc.category
      } Articles`}
    />
  );
}
