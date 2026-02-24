import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import type { NoItemsFoundProps } from "./NoItemsFound.types";

const NoItemsFoundBase = ({ cols }: NoItemsFoundProps) => {
  const { t } = useTranslation();
  return (
    <tr>
      <td className="py-3 text-center" colSpan={cols}>
        <div className="py-32">
          <Icon
            className="mx-auto h-20 w-20 text-muted-400"
            icon="arcticons:samsung-finder"
          />
          <h3 className="mb-2 font-sans text-muted-800 text-xl dark:text-muted-100">
            {t("Nothing found")}
          </h3>
          <p className="mx-auto max-w-[280px] font-sans text-muted-400 text-sm">
            {t(
              "Sorry, looks like we couldn't find any matching records. Try different search terms."
            )}
          </p>
        </div>
      </td>
    </tr>
  );
};
export const NoItemsFound = NoItemsFoundBase;
