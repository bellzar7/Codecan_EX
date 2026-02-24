"use client";
import { useTranslation } from "next-i18next";
import Alert from "@/components/elements/base/alert/Alert";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/exchange/provider";
const columnConfig: ColumnConfigType[] = [
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
  },
  {
    field: "title",
    label: "Title",
    type: "text",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: false,
    api: `${api}/:id/status`,
  },
];
const Exchanges = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Exchange Management")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasStructure={false}
        isParanoid={false}
        onlySingleActiveStatus={false}
        title={t("Exchanges")}
        viewPath="/admin/finance/exchange/provider/[productId]"
      />
      <div className="mt-8">
        <Alert
          canClose={false}
          color="info"
          label={<div className="text-xl">{t("Important Notice")}</div>}
          sublabel={
            <div className="text-md">
              {t(
                "Multiple exchanges can be enabled simultaneously. Each exchange provides market data independently."
              )}
              <br />
              {t(
                "You need to view the exchange to check its status, credentials, and connection status."
              )}
            </div>
          }
        />
      </div>
    </Layout>
  );
};
export default Exchanges;
export const permission = "Access Exchange Provider Management";
