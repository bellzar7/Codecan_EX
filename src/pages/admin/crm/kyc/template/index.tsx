"use client";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Layout from "@/layouts/Default";

const api = "/api/admin/crm/kyc/template";
const columnConfig = [
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
const KYCTemplates = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("KYC Templates Management")}>
      <DataTable
        canCreate={false}
        canView={false}
        columnConfig={columnConfig}
        editPath="/admin/crm/kyc/template/[id]"
        endpoint={api}
        isParanoid={false}
        navSlot={
          <>
            <Link href="/admin/crm/kyc/template/create">
              <IconBox
                className="cursor-pointer"
                color={"success"}
                icon={"mdi:plus"}
                shape="rounded-sm"
                variant={"pastel"}
              />
            </Link>
          </>
        }
        onlySingleActiveStatus
        title={t("KYC Templates")}
      />
    </Layout>
  );
};
export default KYCTemplates;
export const permission = "Access KYC Template Management";
