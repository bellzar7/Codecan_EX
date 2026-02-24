"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/content/post";
const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Title",
    sublabel: "slug",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "author.user",
    label: "Author",
    sublabel: "author.user.email",
    type: "text",
    getValue: (item) =>
      `${item.author?.user?.firstName} ${item.author?.user?.lastName}`,
    getSubValue: (item) => item.author?.user?.email,
    path: "/admin/crm/user?email=[author.user.email]",
    sortable: true,
    sortName: "author.user.firstName",
    hasImage: true,
    imageKey: "author.user.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "category",
    label: "Category",
    type: "tag",
    sortable: true,
    sortName: "category.name",
    getValue: (row) => row.category?.name,
    path: "/admin/content/category?name=[category.name]",
    color: "primary",
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: "DRAFT", label: "Draft", color: "warning" },
      { value: "PUBLISHED", label: "Published", color: "success" },
    ],
  },
  {
    field: "createdAt",
    label: "Created At",
    type: "datetime",
    sortable: true,
    filterable: false,
    getValue: (row) => formatDate(new Date(row.createdAt), "yyyy-MM-dd"),
  },
];
const Posts = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Posts")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        editPath="/admin/content/post/[category.slug]/[id]"
        endpoint={api}
        hasStructure={false}
        title={t("Posts")}
        viewPath="/blog/post/[slug]"
      />
    </Layout>
  );
};
export default Posts;
export const permission = "Access Post Management";
