import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import $fetch from "@/utils/api";
import type { AnalyticsChartProps } from "./AnalyticsChart.types";
import { FilterCharts } from "./FilterCharts";
import { Header } from "./Header";
import { MainChart } from "./MainChart";

const timeframes = [
  { value: "d", label: "D", text: "Today" },
  { value: "w", label: "W", text: "This Week" },
  { value: "m", label: "M", text: "This Month" },
  { value: "6m", label: "6M", text: "These 6 Months" },
  { value: "y", label: "Y", text: "This Year" },
];

const removeEmptyFilters = (obj: {
  [key: string]: unknown;
}): { [key: string]: unknown } => {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const value = obj[key];
      if (typeof value === "object" && value !== null) {
        const nested = removeEmptyFilters(value as Record<string, unknown>);
        if (Object.keys(nested).length > 0) {
          acc[key] = nested;
        }
      } else if (value !== "" && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as { [key: string]: unknown }
  );
};

const AnalyticsChartBase = ({
  model,
  modelName,
  postTitle,
  cardName = modelName,
  availableFilters = {},
  color = "primary",
  params,
  path,
  pathModel,
}: AnalyticsChartProps) => {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [filterResults, setFilterResults] = useState<{
    [key: string]: {
      [filterValue: string]: {
        count: number;
        change: number;
        percentage: number;
      };
    };
  }>({});
  const [timeframe, setTimeframe] = useState({ value: "m", label: "Month" });
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const isMountedRef = useRef(true);
  const [chartVisible, setChartVisible] = useState(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      // On unmount, prevent state updates
      isMountedRef.current = false;
    };
  }, []);

  // Hide chart when route is changing to avoid apexcharts computations mid-transition
  useEffect(() => {
    const handleRouteChange = () => {
      setChartVisible(false);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    let didCancel = false;

    const fetchData = async () => {
      const effectiveFilters = removeEmptyFilters(filters);
      const { data: responseData, error } = await $fetch({
        url: path || "/api/admin/analysis",
        method: "POST",
        params: {
          ...params,
          ...(path ? (pathModel ? { model } : {}) : { model }),
          timeframe: timeframe.value,
          ...(Object.keys(effectiveFilters).length
            ? { filter: JSON.stringify(effectiveFilters) }
            : {}),
        },
        body: {
          availableFilters,
        },
        silent: true,
      });

      // If component is unmounted or route changed before fetch completes, stop
      if (didCancel || !isMountedRef.current) {
        return;
      }

      if (!error && responseData) {
        const chartData = Array.isArray((responseData as any).chartData)
          ? (responseData as any).chartData
          : [];
        const cleanedData = chartData.map((item: any) => ({
          ...item,
          count:
            typeof item.count === "number" && !Number.isNaN(item.count)
              ? item.count
              : 0,
        }));

        setData(cleanedData);
        setFilterResults((responseData as any).filterResults || {});
      } else {
        setData([]);
        setFilterResults({});
      }
      // After successful data load, ensure chart is visible if still on same page
      if (isMountedRef.current) {
        setChartVisible(true);
      }
    };
    fetchData();

    return () => {
      didCancel = true;
    };
  }, [timeframe, filters, model, path, params, availableFilters, pathModel]);

  const handleFilterChange = (key: string, selection: { value: string }) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        [key]: selection.value || "",
      };
      return removeEmptyFilters(updated) as { [key: string]: string };
    });
  };

  return (
    <>
      <Header modelName={modelName} postTitle={postTitle} />

      <FilterCharts
        availableFilters={availableFilters}
        cardName={cardName}
        filterResults={filterResults}
        modelName={modelName}
        timeframe={timeframe}
        timeframes={timeframes}
      />

      {chartVisible && (
        <MainChart
          availableFilters={availableFilters}
          color={color}
          data={data}
          filters={filters}
          handleFilterChange={handleFilterChange}
          setTimeframe={setTimeframe}
          timeframe={timeframe}
          timeframes={timeframes}
        />
      )}
    </>
  );
};

export const AnalyticsChart = AnalyticsChartBase;
