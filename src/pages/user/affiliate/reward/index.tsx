"use client";
import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import { DataTable } from "@/components/elements/base/datatable";
import ActionItem from "@/components/elements/base/dropdown-action/ActionItem";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Modal from "@/components/elements/base/modal/Modal";
import Layout from "@/layouts/Default";
import { useDataTable } from "@/stores/datatable";
import $fetch from "@/utils/api";

const api = "/api/ext/affiliate/reward";
const columnConfig: ColumnConfigType[] = [
  {
    field: "condition.name",
    label: "Condition",
    type: "text",
    sortable: true,
    getValue: (row) => row.condition?.title,
  },
  {
    field: "reward",
    label: "Reward",
    type: "number",
    sortable: true,
    getValue: (row) => `${row.reward} ${row.condition?.rewardCurrency}`,
  },
  {
    field: "isClaimed",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: true, label: "Claimed", color: "success" },
      { value: false, label: "Unclaimed", color: "warning" },
    ],
  },
];
const MlmReferralRewards = () => {
  const { t } = useTranslation();
  const { fetchData } = useDataTable();
  const [isLoading, setIsLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const handleClaim = async () => {
    setIsLoading(true);
    const { error } = await $fetch({
      url: `/api/ext/affiliate/reward/${selectedItem.id}/claim`,
      method: "POST",
    });
    if (!error) {
      fetchData();
    }
    setIsLoading(false);
  };
  return (
    <Layout color="muted" title={t("MLM Referral Rewards")}>
      <DataTable
        columnConfig={columnConfig}
        dropdownActionsSlot={(item) => (
          <>
            <ActionItem
              icon="mdi:wallet-plus-outline"
              key="claim"
              onClick={async () => {
                setSelectedItem(item);
                setIsClaiming(true);
              }}
              subtext="Claim reward"
              text="Claim"
            />
          </>
        )}
        endpoint={api}
        hasAnalytics
        hasStructure={false}
        isCrud={false}
        title={t("MLM Referral Rewards")}
      />

      <Modal open={isClaiming} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Claim Reward")}
            </p>

            <IconButton
              onClick={() => {
                setIsClaiming(false);
              }}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 text-center md:p-6">
            <div className="flex justify-center">
              <IconBox
                className="mb-4"
                color="success"
                icon="mdi:wallet-plus-outline"
                size={"xl"}
                variant={"pastel"}
              />
            </div>
            <p className="mb-4 text-muted-400 text-sm dark:text-muted-600">
              {t("Are you sure you want to claim this reward")}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="success"
                disabled={isLoading}
                loading={isLoading}
                onClick={async () => {
                  await handleClaim();
                  setIsClaiming(false);
                }}
                type="button"
              >
                {t("Claim")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </Layout>
  );
};
export default MlmReferralRewards;
