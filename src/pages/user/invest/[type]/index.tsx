"use client";

import { formatDate } from "date-fns";
import { capitalize } from "lodash";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { DataTable } from "@/components/elements/base/datatable";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import Layout from "@/layouts/Default";

const api = "/api/finance/investment";
const ForexInvestments = () => {
  const router = useRouter();
  const { type } = router.query as { type: string };
  const [columnConfig, setColumnConfig] = React.useState<ColumnConfigType[]>(
    []
  );

  useEffect(() => {
    if (router.isReady && type) {
      const config: ColumnConfigType[] = [
        {
          field: "plan",
          label: "Plan",
          sublabel: "plan.currency",
          type: "text",
          getValue: (item) => item.plan?.title,
          getSubValue: (item) => item.plan?.currency,
          path: `/user/invest/plan/${
            type?.toLowerCase() || "general"
          }/[plan.id]`,
          sortable: true,
          sortName: "plan.title",
          hasImage: true,
          imageKey: "plan.image",
          placeholder: "/img/placeholder.svg",
          className: "rounded-sm",
        },
        {
          field: "amount",
          label: "Amount",
          type: "number",
          sortable: true,
        },
        {
          field: "profit",
          label: "ROI",
          type: "number",
          sortable: true,
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "ACTIVE", label: "Active", color: "primary" },
            { value: "COMPLETED", label: "Completed", color: "success" },
            { value: "CANCELLED", label: "Cancelled", color: "danger" },
            { value: "REJECTED", label: "Rejected", color: "warning" },
          ],
          sortable: true,
        },
        {
          field: "endDate",
          label: "End Date",
          type: "date",
          sortable: true,
          filterable: false,
          getValue: (item) =>
            item.endDate
              ? formatDate(new Date(item.endDate), "yyyy-MM-dd HH:mm")
              : "N/A",
        },
      ];

      setColumnConfig(config);
    }
  }, [router.isReady, type]);

  return (
    <Layout color="muted" title={`${capitalize(type)} Investments`}>
      {api && columnConfig.length > 0 && (
        <DataTable
          canCreate={false}
          canDelete={false}
          canEdit={false}
          columnConfig={columnConfig}
          endpoint={api}
          hasAnalytics
          hasStructure={false}
          title={`${capitalize(type)} Investments`}
          viewPath={`/user/invest/${type}/[plan.id]`}
        />
      )}

      <Faq category="INVESTMENT" />
    </Layout>
  );
};

export default ForexInvestments;
