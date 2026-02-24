import { capitalize } from "lodash";
import Skeleton from "react-loading-skeleton";
import type { FilterChartsProps } from "./FilterCharts.types";
import "react-loading-skeleton/dist/skeleton.css";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { themeColors } from "@/components/charts/chart-colors";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";

const FilterChartsBase = ({
  availableFilters,
  filterResults,
  timeframe,
  cardName,
  modelName,
  timeframes,
}: FilterChartsProps) => {
  return (
    <div className="flex flex-col">
      {Object.keys(availableFilters).map((filterCategory) => {
        const isLastCategory =
          Object.keys(availableFilters).indexOf(filterCategory) ===
          Object.keys(availableFilters).length;

        return (
          <div key={filterCategory}>
            {!isLastCategory && (
              <div className="relative mb-4">
                <hr className="border-muted-200 dark:border-muted-700" />
                <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
                  <span className="bg-muted-50 px-2 dark:bg-muted-900">
                    {capitalize(filterCategory)}
                  </span>
                </span>
              </div>
            )}

            <div
              className={
                "grid grid-cols-1 gap-4 pb-4 md:grid-cols-2 lg:grid-cols-4"
              }
            >
              {availableFilters[filterCategory].map((filterOption) => {
                const filterValue = filterOption.value as string;
                const value =
                  filterResults[filterCategory]?.[filterValue] || {};

                const filterChange =
                  value.percentage !== undefined ? (
                    value.percentage > 0 ? (
                      `+${value.percentage.toFixed(1)}%`
                    ) : (
                      `${value.percentage.toFixed(1)}%`
                    )
                  ) : (
                    <Skeleton borderRadius={24} height={12} width={32} />
                  );

                const label = availableFilters[filterCategory].find(
                  (item) => item.value === filterValue
                )?.label;

                return (
                  <Card
                    className="flex justify-between p-4"
                    color="contrast"
                    key={`${filterCategory}_${filterValue}`}
                    shape="smooth"
                  >
                    <div className="relative flex flex-col items-start justify-between">
                      <h4 className="font-medium font-sans text-muted-500 text-xs uppercase dark:text-muted-400">
                        <span
                          className={`text-${filterOption.color}-500 dark:text-${filterOption.color}-400`}
                        >
                          {capitalize(label)}{" "}
                        </span>
                        <span className="font-semibold text-muted-700 dark:text-muted-200">
                          {cardName}
                        </span>
                      </h4>
                      <span className="font-bold font-sans text-2xl text-muted-800 dark:text-muted-300">
                        {value.count !== undefined ? (
                          value.count
                        ) : (
                          <Skeleton borderRadius={24} height={12} width={40} />
                        )}
                      </span>
                      <Link href={filterOption.path || "#"}>
                        <Tooltip
                          content={`View ${capitalize(label)} ${modelName}`}
                        >
                          <div className="flex items-center gap-2 pt-2">
                            <IconButton
                              aria-label="Records"
                              color={
                                (filterOption.color === "yellow"
                                  ? "warning"
                                  : (filterOption.color as any)) || "primary"
                              }
                              shape="full"
                              variant="pastel"
                            >
                              <Icon
                                className="h-7 w-7"
                                color={filterOption.color}
                                icon={filterOption.icon}
                              />
                            </IconButton>
                            <div>
                              <p className="flex gap-1 font-sans text-muted-500 text-xs dark:text-muted-400">
                                <span
                                  className={`font-semibold text-${filterOption.color}-500 dark:text-${filterOption.color}-400`}
                                >
                                  {filterChange}
                                </span>
                                {
                                  timeframes.find(
                                    (item) => item.value === timeframe.value
                                  )?.text
                                }
                              </p>
                            </div>
                          </div>
                        </Tooltip>
                      </Link>
                    </div>

                    <Tooltip
                      content={`${
                        value.percentage?.toFixed(2) || 0
                      }% of ${modelName} by ${capitalize(filterCategory)}`}
                    >
                      <div className="relative min-h-[100px] w-2 rounded-full bg-muted-100 dark:bg-muted-800">
                        <div
                          className="animated-bar absolute right-0 bottom-0 z-1 w-full rounded-full transition-all duration-500 ease-in-out"
                          style={{
                            height: `${value.percentage || 0}%`,
                            backgroundColor: themeColors[filterOption.color],
                          }}
                        />
                      </div>
                    </Tooltip>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FilterCharts = FilterChartsBase;
