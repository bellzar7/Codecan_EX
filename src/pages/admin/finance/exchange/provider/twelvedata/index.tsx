import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Alert from "@/components/elements/base/alert/Alert";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import { DataTable } from "@/components/elements/base/datatable";
import Tag from "@/components/elements/base/tag/Tag";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const TwelveDataProviderPage = () => {
  const { t } = useTranslation();
  const _router = useRouter();
  // biome-ignore lint/suspicious/noExplicitAny: Exchange data structure is dynamic
  const [exchange, setExchange] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  // biome-ignore lint/suspicious/noExplicitAny: Import result structure is dynamic
  const [importResult, setImportResult] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchExchangeDetails = useCallback(async () => {
    setLoading(true);
    const { data, error } = await $fetch({
      url: "/api/admin/finance/exchange/provider/twelvedata",
      silent: true,
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setExchange((data as any).exchange);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExchangeDetails();
  }, [fetchExchangeDetails]);

  const handleStatusToggle = async () => {
    const newStatus = !exchange.status;
    const { error } = await $fetch({
      url: `/api/admin/finance/exchange/provider/${exchange.id}/status`,
      method: "PUT",
      body: { status: newStatus },
    });

    if (!error) {
      setExchange({ ...exchange, status: newStatus });
      toast.success(
        newStatus
          ? t("Provider enabled successfully")
          : t("Provider disabled successfully")
      );
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      const { data, error } = await $fetch({
        url: "/api/admin/ext/twd/market/import",
        method: "GET",
        silent: false,
      });

      if (error) {
        // biome-ignore lint/suspicious/noExplicitAny: Error structure is dynamic
        toast.error((error as any).message || t("Failed to import markets"));
        // biome-ignore lint/suspicious/noExplicitAny: Error structure is dynamic
        setImportResult({ success: false, error: (error as any).message });
      } else {
        // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
        const importData = data as any;
        toast.success(
          t("Markets imported successfully!") +
            ` (${importData.imported.forex} forex, ${importData.imported.stocks} stocks, ${importData.imported.indices} indices)`
        );
        setImportResult({ success: true, data });
        // Refresh the DataTable
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t("Import failed");
      toast.error(errorMessage);
      setImportResult({ success: false, error: errorMessage });
    } finally {
      setImporting(false);
    }
  };

  const marketApi = "/api/admin/ext/twd/market";

  const marketColumnConfig: ColumnConfigType[] = [
    {
      field: "symbol",
      label: t("Symbol"),
      type: "text",
      sortable: true,
      filterable: true,
    },
    {
      field: "type",
      label: t("Type"),
      type: "select",
      sortable: true,
      filterable: true,
      options: [
        { value: "forex", label: t("Forex") },
        { value: "stocks", label: t("Stocks") },
        { value: "indices", label: t("Indices") },
      ],
    },
    {
      field: "name",
      label: t("Name"),
      type: "text",
      sortable: true,
    },
    {
      field: "exchange",
      label: t("Exchange"),
      type: "text",
      sortable: true,
    },
    {
      field: "status",
      label: t("Status"),
      type: "switch",
      sortable: true,
      filterable: true,
      api: `${marketApi}/:id/status`,
    },
  ];

  if (loading) {
    return (
      <Layout color="muted" title={t("Loading...")}>
        <div className="flex h-96 flex-col items-center justify-center gap-5">
          <Icon
            className="h-8 w-8 animate-spin text-primary-500"
            icon="line-md:loading-loop"
          />
          <span className="ml-2 text-muted-600 dark:text-muted-400">
            {t("Loading")} {t("Exchange")}...
          </span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout color="muted" title={`${exchange?.title || "TwelveData"}`}>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col items-start justify-between md:flex-row">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 md:gap-10">
              <div className="flex items-center gap-4">
                <Icon
                  className="h-24 w-24 text-primary-500 md:h-32 md:w-32"
                  icon="mdi:chart-line-variant"
                />
                <div>
                  <h1 className="font-bold text-2xl text-muted-800 md:text-3xl dark:text-muted-100">
                    {exchange?.title}
                  </h1>
                  <p className="text-muted-600 dark:text-muted-400">
                    {t("Paper Trading with Real Market Data")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 text-md">
              <Tag>{exchange?.version}</Tag>
              <Tag color={exchange?.status ? "success" : "danger"}>
                {exchange?.status ? t("Active") : t("Inactive")}
              </Tag>
              <Tag color="info">{t("Paper Trading")}</Tag>
            </div>
          </div>
          <div className="mt-4 flex gap-2 md:mt-0">
            <Button
              color={exchange?.status ? "danger" : "success"}
              onClick={handleStatusToggle}
              shape="rounded-sm"
            >
              {exchange?.status ? t("Disable") : t("Enable")}
            </Button>
            <BackButton href="/admin/finance/exchange" />
          </div>
        </div>

        {/* Description */}
        <Card className="mb-6 p-6">
          <h2 className="mb-3 font-semibold text-lg text-muted-800 dark:text-muted-100">
            {t("About TwelveData Paper Trading")}
          </h2>
          <p className="mb-2 text-muted-600 dark:text-muted-400">
            {t(
              "TwelveData provides real-time and historical market data for forex pairs, stocks, and indices. This integration allows your users to practice trading with virtual funds while experiencing real market conditions."
            )}
          </p>
          <p className="text-muted-600 dark:text-muted-400">
            {t(
              "Users receive a paper trading wallet with virtual funds to place market and limit orders without risking real money."
            )}
          </p>
        </Card>

        {/* Import Markets Section */}
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-muted-800 dark:text-muted-100">
                {t("Import Markets from TwelveData")}
              </h2>
              <p className="mt-1 text-muted-600 text-sm dark:text-muted-400">
                {t(
                  "Fetch the latest forex pairs, stocks, and indices from TwelveData API. This will update existing markets and add new ones."
                )}
              </p>
            </div>
            <Button
              color="primary"
              disabled={importing || !exchange?.status}
              onClick={handleImport}
              shape="rounded-sm"
            >
              {importing ? (
                <>
                  <Icon
                    className="mr-2 h-4 w-4 animate-spin"
                    icon="line-md:loading-loop"
                  />
                  {t("Importing...")}
                </>
              ) : (
                <>
                  <Icon className="mr-2 h-4 w-4" icon="mdi:download" />
                  {t("Import Markets")}
                </>
              )}
            </Button>
          </div>

          {!exchange?.status && (
            <Alert
              className="mt-4"
              color="warning"
              label={t("Provider Disabled")}
              sublabel={t(
                "Please enable the provider before importing markets."
              )}
            />
          )}

          {importResult && (
            <Alert
              className="mt-4"
              color={importResult.success ? "success" : "danger"}
              label={
                importResult.success
                  ? t("Import Successful")
                  : t("Import Failed")
              }
              sublabel={
                importResult.success
                  ? `${t("Imported:")} ${importResult.data.imported.forex} ${t("forex pairs")}, ${importResult.data.imported.stocks} ${t("stocks")}, ${importResult.data.imported.indices} ${t("indices")}`
                  : importResult.error
              }
            />
          )}
        </Card>

        {/* Markets Table */}
        <Card className="p-6">
          <DataTable
            canCreate={false}
            canDelete={true}
            canEdit={true}
            columnConfig={marketColumnConfig}
            editPath="/admin/ext/twd/market/[id]"
            endpoint={marketApi}
            hasAnalytics={false}
            hasStructure={true}
            key={refreshKey}
            title={t("TwelveData Markets")}
          />
        </Card>

        <hr className="my-6 border-muted-300 border-t dark:border-muted-700" />

        {/* Quick Links */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <CardLink
            description={t("View user-facing forex markets")}
            href="/forex"
            icon="mdi:currency-usd"
            label={t("Forex Pairs")}
          />
          <CardLink
            description={t("View user-facing stock markets")}
            href="/stocks"
            icon="mdi:chart-candlestick"
            label={t("Stocks")}
          />
          <CardLink
            description={t("View user-facing index markets")}
            href="/indices"
            icon="mdi:chart-timeline-variant"
            label={t("Indices")}
          />
        </div>
      </main>
    </Layout>
  );
};

const CardLink = ({
  icon,
  label,
  description,
  href,
}: {
  icon: string;
  label: string;
  description: string;
  href: string;
}) => {
  return (
    <Link href={href} target="_blank">
      <Card className="flex h-full cursor-pointer flex-col p-4 hover:bg-muted-100 dark:hover:bg-muted-800">
        <div className="mb-2 flex items-center gap-3">
          <Icon
            className="h-8 w-8 text-primary-500 dark:text-primary-400"
            icon={icon}
          />
          <span className="font-semibold text-muted-800 dark:text-muted-100">
            {label}
          </span>
        </div>
        <p className="text-muted-600 text-sm dark:text-muted-400">
          {description}
        </p>
      </Card>
    </Link>
  );
};

export default TwelveDataProviderPage;
export const permission = "Access Exchange Provider Management";
