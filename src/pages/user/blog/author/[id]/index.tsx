"use client";
import { formatDate } from "date-fns";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Layout from "@/layouts/Default";

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
  const router = useRouter();
  const { id } = router.query;
  const api = `/api/content/author/${id}`;
  return (
    <Layout color="muted" title={t("Posts")}>
      {router.isReady && (
        <DataTable
          canCreate={false}
          columnConfig={columnConfig}
          editPath="/user/blog/post?category=[category.slug]&id=[id]"
          endpoint={api}
          hasStructure={false}
          navSlot={
            <IconBox
              className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary-500 hover:text-muted-100 hover:shadow-muted-300/30 hover:shadow-sm dark:hover:shadow-muted-800/20"
              color="primary"
              icon="mdi:plus"
              onClick={() => router.push("/user/blog/post")}
              shape={"rounded-sm"}
              size={"sm"}
              variant={"pastel"}
            />
          }
          title={t("Posts")}
          viewPath="/blog/post/[slug]"
        />
      )}
    </Layout>
  );
};
export default Posts;
