import type { ApexOptions } from "apexcharts";
import { format, isValid, parseISO } from "date-fns";
import dynamic from "next/dynamic";
import { memo } from "react";
import { themeColors } from "@/components/charts/chart-colors";
import { useDashboardStore } from "@/stores/dashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Helper function to ensure numeric values
const numOrZero = (val) => {
  if (typeof val === "number" && !Number.isNaN(val)) {
    return val;
  }
  // If it's not a valid number, return 0
  return 0;
};

const WalletChartBase = ({ data }) => {
  const { hasExtension } = useDashboardStore();

  if (!data) {
    return null;
  }

  // Validate and prepare chart data
  const validData = data.filter((item) => {
    const date = parseISO(item.date);
    // Ensure FIAT and SPOT are not null and date is valid
    return item.FIAT != null && item.SPOT != null && isValid(date);
  });

  // If no valid data, show a fallback instead of rendering an invalid chart
  if (validData.length === 0) {
    return <div className="p-4 text-center">No data available</div>;
  }

  // Construct the series with guaranteed numeric data
  const series = [
    {
      name: "Fiat",
      data: validData.map((item) => numOrZero(item.FIAT)),
    },
    {
      name: "Spot",
      data: validData.map((item) => numOrZero(item.SPOT)),
    },
  ];

  if (hasExtension("ecosystem")) {
    series.push({
      name: "Funding",
      data: validData.map((item) => numOrZero(item.FUNDING)),
    });
  }

  const categories = validData.map((item) => {
    const date = parseISO(item.date);
    return isValid(date) ? format(date, "MM-dd") : "Invalid date";
  });

  const chartOptions: ApexOptions = {
    series,
    chart: {
      height: 300,
      type: "area",
      zoom: { enabled: false },
      toolbar: { show: false },
    },
    colors: [themeColors.blue, themeColors.green, themeColors.orange],
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    fill: { type: "gradient" },
    grid: {
      row: { colors: ["transparent", "transparent"], opacity: 0.5 },
    },
    yaxis: {
      opposite: true,
      labels: {
        formatter(val) {
          return `$${val}`;
        },
      },
    },
    xaxis: {
      categories,
    },
  };

  return (
    <div className="w-full overflow-hidden">
      <Chart height={300} options={chartOptions} series={series} type="area" />
    </div>
  );
};

export const WalletChart = memo(WalletChartBase);
