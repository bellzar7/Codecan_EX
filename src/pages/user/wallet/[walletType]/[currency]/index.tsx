import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/elements/base/button/BackButton";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { statusOptions, transactionTypeOptions } from "@/utils/constants";

const api = "/api/finance/transaction";
const columnConfig: ColumnConfigType[] = [
  {
    field: "id",
    label: "ID",
    type: "text",
    sortable: true,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    options: transactionTypeOptions,
    sortable: true,
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "fee",
    label: "Fee",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
    sortable: true,
  },
  {
    field: "createdAt",
    label: "Date",
    type: "date",
    sortable: true,
    filterable: false,
    getValue: (item) => new Date(item.createdAt).toLocaleString(),
  },
];
const WalletTransactions = () => {
  const { t } = useTranslation();
  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();
  useEffect(() => {
    if (
      router.isReady &&
      getSetting("walletRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to access wallet transactions"));
    }
  }, [router.isReady, profile?.kyc?.status]);
  const { walletType, currency } = router.query;
  if (!(walletType && currency)) {
    return null;
  }
  return (
    <Layout color="muted" title={t("Transactions")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        navSlot={
          <>
            <BackButton href={"/user/wallet"} />
          </>
        }
        params={{ walletType, currency }}
        postTitle={currency as string}
        title={t("Transactions")}
      />
    </Layout>
  );
};
export default WalletTransactions;
