import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { WalletChart } from "@/components/charts/WalletChart";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Card from "@/components/elements/base/card/Card";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet";
import "react-loading-skeleton/dist/skeleton.css";
import { debounce } from "lodash";
import { useTranslation } from "next-i18next";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import { WALLET_TYPE_METADATA } from "@/utils/transfer-matrix";

const api = "/api/finance/wallet";
const columnConfig: ColumnConfigType[] = [
  {
    field: "currency",
    label: "Currency",
    type: "text",
    sortable: true,
    getValue: (row) => (
      <div className="flex items-center gap-3">
        <Avatar
          alt={row.currency}
          size="sm"
          src={
            row.type === "ECO"
              ? row.icon || "/img/placeholder.svg"
              : `/img/crypto/${row.currency?.toLowerCase()}.webp`
          }
        />
        <span>{row.currency}</span>
      </div>
    ),
  },
  {
    field: "balance",
    label: "Balance",
    type: "number",
    sortable: true,
  },
  {
    field: "inOrder",
    label: "In Order",
    type: "number",
    sortable: true,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    sortable: true,
    options: Object.values(WALLET_TYPE_METADATA).map((meta) => ({
      value: meta.value,
      label: meta.label,
      color: meta.color as
        | "default"
        | "contrast"
        | "muted"
        | "primary"
        | "info"
        | "success"
        | "warning"
        | "danger",
    })),
  },
];

const WalletDashboard = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { pnl, fetchPnl } = useWalletStore();
  const router = useRouter();
  const [togglePnl, setTogglePnl] = useState(false);
  const { isDark, settings } = useDashboardStore();
  const { profile } = useDashboardStore();
  const debounceFetchPnl = debounce(fetchPnl, 100);
  useEffect(() => {
    if (!router.isReady) return;
    debounceFetchPnl();
    setLoading(false);
  }, [router.isReady]);

  const deposit = settings?.deposit !== "false";
  const withdraw = settings?.withdraw !== "false";
  const transfer = settings?.transfer !== "false";

  const checkPermission = (section: string) => {
    if (profile?.customRestrictionPairFields?.length > 0) {
      let isAllowed = true;
      let errMessage = "";
      for (const permission of profile?.customRestrictionPairFields) {
        if (permission?.section?.toLowerCase() === section?.toLowerCase()) {
          isAllowed = permission?.isAllowed;
          errMessage = permission?.reason;
        }
      }
      if (isAllowed) {
        return true;
      }
      toast.error(errMessage);
    } else {
      console.log("customRestrictionPairFields true");
      return true;
    }
  };

  return (
    <Layout color="muted" title={t("Wallets Dashboard")}>
      <Card className="relative mb-2 p-4" color={"mutedContrast"}>
        <div className="mb-6 flex flex-col items-start justify-between gap-5 px-4 sm:mb-0 sm:flex-row sm:items-center">
          <h1 className="font-light font-sans text-muted-800 text-xl uppercase tracking-wide dark:text-muted-200">
            {t("Estimated Balance")}
          </h1>
          <div className="flex w-full items-center justify-between gap-10 sm:w-auto">
            <div>
              <p className="font-semibold text-lg text-muted-800 dark:text-muted-200">
                {pnl?.today ? (
                  `$${pnl.today?.toFixed(2)}`
                ) : loading ? (
                  <Skeleton
                    baseColor={isDark ? "#27272a" : "#f7fafc"}
                    height={12}
                    highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
                    width={60}
                  />
                ) : (
                  "$0.00"
                )}
              </p>
              <p className="text-muted-500 text-sm dark:text-muted-400">
                {t("Total Balance")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-lg text-muted-800 dark:text-muted-200">
                {pnl?.today ? (
                  <>
                    {pnl.today > pnl.yesterday && pnl.yesterday !== 0 ? (
                      <span className="flex items-center gap-2 text-green-500">
                        <span>+${(pnl.today - pnl.yesterday).toFixed(2)}</span>
                        <span className="text-md">
                          (+
                          {pnl.yesterday !== 0
                            ? (
                                ((pnl.today - pnl.yesterday) / pnl.yesterday) *
                                100
                              ).toFixed(2)
                            : "0"}
                          %)
                        </span>
                      </span>
                    ) : pnl.today < pnl.yesterday ? (
                      <span className="flex items-center gap-2 text-red-500">
                        <span>-${(pnl.yesterday - pnl.today).toFixed(2)}</span>
                        <span className="text-md">
                          (-
                          {pnl.yesterday !== 0
                            ? (
                                ((pnl.yesterday - pnl.today) / pnl.yesterday) *
                                100
                              ).toFixed(2)
                            : 0}
                          %)
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-500">
                        <span>$0.00</span>
                        <span className="text-md">(0.00%)</span>
                      </span>
                    )}
                  </>
                ) : loading ? (
                  <Skeleton
                    baseColor={isDark ? "#27272a" : "#f7fafc"}
                    height={12}
                    highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
                    width={60}
                  />
                ) : (
                  "$0.00"
                )}
              </p>
              <p className="text-muted-500 text-sm dark:text-muted-400">
                {t("Today's PnL")}
              </p>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-[50%] flex w-12 -translate-x-1/2 transform cursor-pointer items-center justify-center rounded-t-md border-muted-200 border-x border-t bg-muted-50 text-muted-400 hover:bg-muted-200 hover:text-muted-600 dark:border-muted-700 dark:bg-muted-900 dark:text-muted-400 dark:hover:bg-muted-950 dark:hover:text-muted-300"
            onClick={() => setTogglePnl(!togglePnl)}
          >
            <Icon
              className="h-6 w-6"
              icon={togglePnl ? "mdi:chevron-up" : "mdi:chevron-down"}
            />
          </div>
        </div>
        <AnimatePresence>
          {togglePnl && pnl?.chart && pnl.chart.length > 0 && (
            <motion.div
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <WalletChart data={pnl.chart} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <DataTable
        blank={false}
        canCreate={false}
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasStructure={false}
        isParanoid={false}
        navSlot={
          <div className="flex gap-2">
            {deposit && (
              <Button
                color="primary"
                onClick={() => {
                  if (checkPermission("Deposit")) {
                    router.push("/user/wallet/deposit");
                  }
                }}
                shape="rounded-sm"
                variant="outlined"
              >
                {t("Deposit")}
              </Button>
            )}
            {withdraw && (
              <Button
                color="warning"
                onClick={() => {
                  if (checkPermission("Withdraw")) {
                    router.push("/user/wallet/withdraw");
                  }
                }}
                shape="rounded-sm"
                variant="outlined"
              >
                {t("Withdraw")}
              </Button>
            )}
            {transfer && (
              <Button
                color="info"
                onClick={() => {
                  if (checkPermission("Transfer")) {
                    router.push("/user/wallet/transfer");
                  }
                }}
                shape="rounded-sm"
                variant="outlined"
              >
                {t("Transfer")}
              </Button>
            )}
          </div>
        }
        postTitle=""
        title={t("Wallets")}
        viewPath="/user/wallet/[type]/[currency]"
      />
    </Layout>
  );
};

export default WalletDashboard;
