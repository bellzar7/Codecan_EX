"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/content/comment";
const columnConfig: ColumnConfigType[] = [
  {
    field: "post",
    label: "Post",
    sublabel: "post.slug",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
    getValue: (item) => item.post?.title,
    path: "/admin/content/post?slug=[post.slug]",
    getSubValue: (item) => item.post?.slug,
  },
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
    field: "content",
    label: "Comment",
    type: "text",
    sortable: true,
  },
];
const Comments = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Comments")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Comments")}
      />
    </Layout>
  );
};
export default Comments;
export const permission = "Access Comment Management";
