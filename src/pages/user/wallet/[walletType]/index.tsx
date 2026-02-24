import { useRouter } from "next/router";
import Avatar from "@/components/elements/base/avatar/Avatar";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";

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
];
const WalletDashboard = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { walletType } = router.query;
  return (
    <Layout color="muted" title={t("Wallets Dashboard")}>
      {walletType && (
        <DataTable
          blank={false}
          canCreate={false}
          canDelete={false}
          canEdit={false}
          columnConfig={columnConfig}
          endpoint={api}
          hasStructure={false}
          navSlot={
            <div className="flex items-center gap-2">
              {[
                { value: "", label: "ALL", color: "muted" },
                { value: "FIAT", label: "Fiat", color: "warning" },
                { value: "SPOT", label: "Spot", color: "info" },
                { value: "ECO", label: "Funding", color: "primary" },
              ]
                .filter((option) => option.value !== walletType)
                .map((option) => (
                  <Link
                    href={`/user/wallet/${option.value}`}
                    key={option.value}
                  >
                    <Button
                      color={option.color as any}
                      key={option.value}
                      variant={
                        option.value === router.query.walletType
                          ? "solid"
                          : "outlined"
                      }
                    >
                      {option.label}
                    </Button>
                  </Link>
                ))}
            </div>
          }
          postTitle={t("Wallets")}
          title={`${walletType}`}
          viewPath="/user/wallet/[type]/[currency]"
        />
      )}
    </Layout>
  );
};
export default WalletDashboard;
