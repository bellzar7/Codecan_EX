import { Icon } from "@iconify/react";
import type React from "react";
import { memo } from "react";
import HeadCell from "./HeadCell";
import MarketRow from "./MarketRow";

interface MarketsTableProps {
  t: (key: string) => string;
  items: any[];
  pagination: {
    total: number;
    lastPage: number;
    currentPage: number;
    from: number;
    to: number;
  };
  perPage: number;
  sorted: { field: string; rule: "asc" | "desc" };
  sort: (field: string, rule: "asc" | "desc") => void;
  isDark: boolean;
  handleNavigation: (symbol: string) => void;
}

const MarketsTable: React.FC<MarketsTableProps> = ({
  t,
  items,
  pagination,
  perPage,
  sorted,
  sort,
  isDark,
  handleNavigation,
}) => {
  const slicedItems = items.slice(
    (pagination.currentPage - 1) * perPage,
    pagination.currentPage * perPage
  );

  return (
    <div className="flex w-full flex-col overflow-x-auto ltablet:overflow-x-visible lg:overflow-x-visible">
      <table className="border border-muted-200 bg-white font-sans dark:border-muted-800 dark:bg-muted-950">
        <thead className="border-fade-grey-2 border-b dark:border-muted-800">
          <tr className="divide-x divide-muted-200 dark:divide-muted-800">
            <th className="w-[30%] p-4">
              <HeadCell
                label={t("Name")}
                sorted={sorted}
                sortField="symbol"
                sortFn={sort}
              />
            </th>
            <th className="w-[20%] p-4">
              <HeadCell
                label={t("Price")}
                sorted={sorted}
                sortField="price"
                sortFn={sort}
              />
            </th>
            <th className="w-[20%] p-4">
              <HeadCell
                label={t("Change")}
                sorted={sorted}
                sortField="change"
                sortFn={sort}
              />
            </th>
            <th className="w-[25%] p-4">
              <HeadCell
                label={t("24h Volume")}
                sorted={sorted}
                sortField="baseVolume"
                sortFn={sort}
              />
            </th>
            <th className="w-[5%] text-end" />
          </tr>
        </thead>

        <tbody>
          {slicedItems.map((item, i) => (
            <MarketRow
              handleNavigation={handleNavigation}
              isDark={isDark}
              item={item}
              key={item.symbol || i}
            />
          ))}
          {pagination.total === 0 && (
            <tr>
              <td className="py-3 text-center" colSpan={5}>
                <div className="py-32">
                  <Icon
                    className="mx-auto h-20 w-20 text-muted-400"
                    icon="arcticons:samsung-finder"
                  />
                  <h3 className="mb-2 font-sans text-muted-700 text-xl dark:text-muted-200">
                    {t("Nothing found")}
                  </h3>
                  <p className="mx-auto max-w-[280px] font-sans text-md text-muted-400">
                    {t(
                      "Sorry, looks like we couldn't find any matching records. Try different search terms."
                    )}
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default memo(MarketsTable);
