import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ecosystem/wallet/master";
const columnConfig = [
  {
    field: "chain",
    label: "Chain",
    sublabel: "address",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "chain",
    getImage: (item) => `/img/crypto/${item.chain?.toLowerCase()}.webp`,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];
const MasterWallets = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Ecosystem Master Wallets")}>
      <DataTable
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Master Wallets")}
      />
    </Layout>
  );
};
export default MasterWallets;
export const permission = "Access Ecosystem Master Wallet Management";
