// CategoryItemClient.tsx
import ArticleDetailLayout from "../../articleDetailLayout/ArticleDetaiLayout";
import { toDisplayDocFromArticle } from "@/lib/articlePage/toDisplayDocFromArticle";
import { CATEGORY_LABELS } from "@/constants/constants";
import type { ArticleDTO } from "@/components/articlePageComponents/getArticleBySlug/getArticleBySlug";
import RelatedArticlesClient from "../../sidebar/relatedArticlesClient/RelatedArticlesClient";

type ArticleClientPageProps = {
  article: ArticleDTO;
};

export default function ArticleClientPage({
  article,
}: ArticleClientPageProps) {
  const doc = toDisplayDocFromArticle(article);

  return (
    <ArticleDetailLayout
      doc={doc}
      sidebar={
        <RelatedArticlesClient
          currentCategory={doc.category}
          category={article.category}
          currentSlug={article.slug}
          take={6}
          pool={300}
          show={3}
        />
      }
      backHref={`/${doc.category}`}
      backLabel={`Back to ${
        CATEGORY_LABELS[doc.category as keyof typeof CATEGORY_LABELS] ?? doc.category
      } Articles`}
    />
  );
}
