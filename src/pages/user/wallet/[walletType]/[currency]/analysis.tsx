import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";

const TransactionsAnalytics = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, getSetting } = useDashboardStore();
  useEffect(() => {
    if (
      router.isReady &&
      getSetting("walletRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to access wallet analytics"));
    }
  }, [router.isReady, profile?.kyc?.status]);
  const { walletType, currency } = router.query;
  const [path, setPath] = useState<string>();
  const [filters, setFilters] = useState<AvailableFilters>({});
  useEffect(() => {
    if (walletType && currency) {
      const newPath = `/user/wallet/${walletType}/${currency}`;
      setFilters({
        status: [
          {
            value: "PENDING",
            label: "Pending",
            color: "warning",
            icon: "ph:circle",
            path: `${newPath}?status=PENDING`,
          },
          {
            value: "COMPLETED",
            label: "Completed",
            color: "success",
            icon: "ph:check-circle",
            path: `${newPath}?status=COMPLETED`,
          },
          {
            value: "FAILED",
            label: "Failed",
            color: "danger",
            icon: "ph:x-circle",
            path: `${newPath}?status=FAILED`,
          },
          {
            value: "CANCELLED",
            label: "Cancelled",
            color: "danger",
            icon: "ph:x-circle",
            path: `${newPath}?status=CANCELLED`,
          },
          {
            value: "EXPIRED",
            label: "Expired",
            color: "primary",
            icon: "ph:minus-circle",
            path: `${newPath}?status=EXPIRED`,
          },
          {
            value: "REJECTED",
            label: "Rejected",
            color: "danger",
            icon: "ph:x-circle",
            path: `${newPath}?status=REJECTED`,
          },
          {
            value: "REFUNDED",
            label: "Refunded",
            color: "warning",
            icon: "ph:circle",
            path: `${newPath}?status=REFUNDED`,
          },
          {
            value: "TIMEOUT",
            label: "Timeout",
            color: "danger",
            icon: "ph:x-circle",
            path: `${newPath}?status=TIMEOUT`,
          },
        ],
      });
      setPath(newPath);
    }
  }, [walletType, currency, router.isReady]);
  return (
    <Layout color="muted" title={t("Transactions Analytics")}>
      {path && (
        <AnalyticsChart
          availableFilters={filters}
          cardName={t("Transactions")}
          color="primary"
          model="transaction"
          modelName={`${currency} ${walletType}`}
          params={{ walletType, currency }}
          path="/api/finance/transaction/analysis"
          postTitle={t("Wallet Analysis")}
        />
      )}
    </Layout>
  );
};
export default TransactionsAnalytics;
