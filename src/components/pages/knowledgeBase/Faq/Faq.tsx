import { debounce } from "lodash";
import { useTranslation } from "next-i18next";
import { memo, useEffect } from "react";
import ReactPlayer from "react-player";
import Card from "@/components/elements/base/card/Card";
import ToggleBox from "@/components/elements/base/toggle-box/ToggleBox";
import { useKnowledgeBaseStore } from "@/stores/knowledgeBase";

type FaqProps = {
  category: string;
};

const FaqBase = ({ category }: FaqProps) => {
  const { t } = useTranslation();
  const { faqs, setCategory } = useKnowledgeBaseStore();
  const debouncedSetCategory = debounce(setCategory, 100);

  useEffect(() => {
    debouncedSetCategory(category);
  }, [category, setCategory]);

  return faqs.length > 0 ? (
    <Card className="mt-10 grid grid-cols-2 gap-4 p-5" color={"muted"}>
      <div className="col-span-2">
        <h1 className="text-primary-500 text-xl dark:text-primary-400">
          {t("Frequently Asked Questions")}
        </h1>
      </div>
      {faqs.map((faq) => (
        <div className="col-span-2 md:col-span-1" key={faq.id}>
          <ToggleBox color="contrast" title={faq.question}>
            <p className="font-sans text-muted-500 text-sm dark:text-muted-400">
              {faq.answer}
            </p>
            {faq.videoUrl && (
              <div className="mt-4">
                <ReactPlayer
                  controls
                  height="100%"
                  url={faq.videoUrl}
                  width="100%"
                />
              </div>
            )}
          </ToggleBox>
        </div>
      ))}
    </Card>
  ) : null;
};
export const Faq = memo(FaqBase);
