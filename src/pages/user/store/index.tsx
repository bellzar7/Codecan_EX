"use client";
import { useTranslation } from "next-i18next";
import { BackButton } from "@/components/elements/base/button/BackButton";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/ext/ecommerce/order";
const columnConfig: ColumnConfigType[] = [
  {
    field: "id",
    label: "ID",
    type: "text",
    sortable: true,
  },
  {
    field: "products",
    label: "Products",
    type: "tags",
    key: "name",
    sortable: false,
    filterable: false,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: "PENDING", label: "Pending", color: "warning" },
      { value: "COMPLETED", label: "Completed", color: "success" },
      { value: "CANCELLED", label: "Cancelled", color: "danger" },
      { value: "REJECTED", label: "Rejected", color: "muted" },
    ],
  },
];
const EcommerceOrders = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Store Orders")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        hasStructure={false}
        navSlot={
          <>
            <BackButton href={"/store"} size="lg">
              {t("Back to Store")}
            </BackButton>
          </>
        }
        title={t("Store Orders")}
        viewPath="/user/store/[id]"
      />
    </Layout>
  );
};
export default EcommerceOrders;
