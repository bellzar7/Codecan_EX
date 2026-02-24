import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import { Panel } from "@/components/elements/base/panel";
import useNewsStore from "@/stores/news";
import type { NewsProps } from "./News.types";

const NewsBase = ({}: NewsProps) => {
  const { t } = useTranslation();
  const {
    news,
    setupInterval,
    cleanupInterval,
    setActiveArticle,
    activeArticle,
  } = useNewsStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    setupInterval();
    return () => cleanupInterval();
  }, [setupInterval, cleanupInterval]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const handleReadMore = (article) => {
    setActiveArticle(article);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setActiveArticle(null);
  };

  if (!news.length) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-5 text-2xl">
        <span className="text-primary-500">{t("Popular")} </span>
        <span className="text-muted-800 dark:text-muted-200">{t("News")}</span>
      </h2>
      <div className="space-y-4">
        {news.map((article, index) => (
          <Card
            className="flex flex-col items-start gap-4 transition-shadow duration-300 hover:shadow-lg sm:flex-row sm:gap-8"
            color="contrast"
            key={article.id || index}
          >
            <div className="h-48 w-full overflow-hidden sm:h-auto sm:w-64">
              <img
                alt={article.source}
                className="h-full w-full rounded-t-lg object-cover sm:rounded-l-lg sm:rounded-tr-none"
                src={article.imageurl}
              />
            </div>
            <div className="flex-1 p-4 sm:py-4">
              <h2 className="mb-2 font-bold text-muted-700 text-xl dark:text-muted-300">
                {article.title}
              </h2>
              <div className="mb-2 flex items-center">
                <div className="mr-2 h-6 w-6 overflow-hidden rounded-full">
                  <img
                    alt={article.source}
                    className="h-full w-full object-cover"
                    src={article.imageurl}
                  />
                </div>
                <span className="text-gray-500 text-sm">{article.source}</span>
                <span className="ml-2 text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(article.published_on * 1000), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {truncateText(article.body, 200)}
              </p>
              <Button
                className="mt-2 inline-block text-blue-500 hover:underline"
                onClick={() => handleReadMore(article)}
              >
                {t("Read more")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Panel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        side="right"
        size="lg"
        title={t("News Article")}
      >
        {activeArticle && (
          <div className="space-y-4">
            <img
              alt={activeArticle.source}
              className="h-64 w-full rounded-lg object-cover"
              src={activeArticle.imageurl}
            />
            <h2 className="font-bold text-2xl text-muted-800 dark:text-muted-200">
              {activeArticle.title}
            </h2>
            <div className="flex items-center">
              <div className="mr-2 h-8 w-8 overflow-hidden rounded-full">
                <img
                  alt={activeArticle.source}
                  className="h-full w-full object-cover"
                  src={activeArticle.imageurl}
                />
              </div>
              <span className="text-gray-500 text-sm">
                {activeArticle.source}
              </span>
              <span className="ml-2 text-gray-500 text-sm">
                {formatDistanceToNow(
                  new Date(activeArticle.published_on * 1000),
                  {
                    addSuffix: true,
                  }
                )}
              </span>
            </div>
            <p className="text-muted-600 dark:text-muted-300">
              {activeArticle.body}
            </p>
            <a
              className="mt-4 inline-block text-blue-500 hover:underline"
              href={activeArticle.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("Read full article")}
            </a>
          </div>
        )}
      </Panel>
    </div>
  );
};

export const News = memo(NewsBase);
