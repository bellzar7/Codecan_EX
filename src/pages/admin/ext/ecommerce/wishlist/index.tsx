"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ecommerce/wishlist";
const columnConfig: ColumnConfigType[] = [
  {
    field: "user",
    label: "User",
    sublabel: "user.email",
    type: "text",
    getValue: (item) => `${item.user?.firstName} ${item.user?.lastName}`,
    getSubValue: (item) => item.user?.email,
    path: "/admin/crm/user?email=[user.email]",
    sortable: true,
    sortName: "user.firstName",
    hasImage: true,
    imageKey: "user.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "products",
    label: "Products",
    type: "tags",
    key: "name",
    sortable: false,
    filterable: false,
    path: "/admin/ext/ecommerce/product?name={name}",
  },
];
const EcommerceWishlists = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Ecommerce Wishlists")}>
      <DataTable
        canCreate={false}
        canEdit={false}
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasStructure={false}
        title={t("Ecommerce Wishlists")}
      />
    </Layout>
  );
};
export default EcommerceWishlists;
export const permission = "Access Ecommerce Wishlist Management";
