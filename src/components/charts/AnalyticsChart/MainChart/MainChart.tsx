import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useTranslation } from "next-i18next";
import { themeColors } from "@/components/charts/chart-colors";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import ListBox from "@/components/elements/form/listbox/Listbox";
import type { MainChartProps } from "./MainChart.types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function safeNumber(val: unknown): number {
  return typeof val === "number" && !Number.isNaN(val) ? val : 0;
}

export const MainChart = ({
  availableFilters,
  filters,
  handleFilterChange,
  data,
  color,
  timeframe,
  setTimeframe,
  timeframes,
}: MainChartProps) => {
  const { t } = useTranslation();
  const safeData = Array.isArray(data) ? data : [];

  // If no data, show a fallback and do NOT render the chart
  if (safeData.length === 0) {
    return null;
  }

  const seriesData = safeData.map((item) => safeNumber(item.count));
  const categories = safeData.map((_, idx) => idx + 1);

  const selectedFilterColor =
    availableFilters.status?.find((item) => item.value === filters.status)
      ?.color || color;

  const chartColor = themeColors[selectedFilterColor] || themeColors.primary;

  const chartOptions: ApexOptions = {
    series: [
      {
        name: "Count",
        data: seriesData,
      },
    ],
    chart: {
      height: 300,
      type: "area",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: [chartColor],
    dataLabels: { enabled: false },
    stroke: { width: 2, curve: "smooth" },
    fill: { type: "gradient" },
    grid: {
      row: { colors: ["transparent", "transparent"], opacity: 0.5 },
    },
    tooltip: {
      x: {
        formatter: (_val, { dataPointIndex }) => {
          if (
            typeof dataPointIndex !== "number" ||
            dataPointIndex < 0 ||
            dataPointIndex >= safeData.length
          ) {
            return "";
          }
          const point = safeData[dataPointIndex];
          return point?.date || "";
        },
      },
    },
    xaxis: {
      categories,
    },
    yaxis: {
      labels: {
        formatter: (val) => (Number.isNaN(Number(val)) ? "0" : String(val)),
      },
    },
  };

  const { series, ...options } = chartOptions;

  return (
    <Card className="p-4" color="contrast" shape="smooth">
      <div className="flex flex-col items-center justify-between gap-5 px-4 md:flex-row">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          {Object.keys(availableFilters).map((key) => (
            <ListBox
              classNames="max-w-full md:max-w-[200px]"
              key={key}
              label={`Select ${key.toUpperCase()}`}
              options={[{ value: "", label: "All" }, ...availableFilters[key]]}
              selected={
                filters[key]
                  ? availableFilters[key].find(
                      (item) => item.value === filters[key]
                    )
                  : { value: "", label: "All" }
              }
              setSelected={(selection) => handleFilterChange(key, selection)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1 pt-2">
          <span className="font-medium font-sans text-muted-500 text-xs dark:text-muted-400">
            {t("Timeframe")}
          </span>
          <div className="flex gap-2">
            {timeframes.map(({ value, label }) => (
              <Button
                color={timeframe.value === value ? "primary" : "muted"}
                key={value}
                onClick={() => setTimeframe({ value, label })}
                shape={"rounded-sm"}
                variant="outlined"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <Chart
        height={options.chart?.height}
        options={options}
        series={series}
        type="area"
      />
    </Card>
  );
};
