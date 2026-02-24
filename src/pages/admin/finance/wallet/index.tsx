"use client";
import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import { DataTable } from "@/components/elements/base/datatable";
import Modal from "@/components/elements/base/modal/Modal";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const api = "/api/admin/finance/wallet";

interface WalletItem {
  id: string;
  currency: string;
  balance: number;
  type: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}
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
    field: "currency",
    label: "Currency",
    type: "text",
    sortable: true,
  },
  {
    field: "type",
    label: "Type",
    type: "text",
    sortable: true,
    options: [
      { value: "FIAT", label: "Fiat" },
      { value: "SPOT", label: "Spot" },
      { value: "ECO", label: "Eco" },
    ],
    placeholder: "Select wallet type",
  },
  {
    field: "balance",
    label: "Balance",
    type: "number",
    sortable: true,
  },
  {
    field: "inOrder",
    label: "In Order",
    type: "number",
    sortable: true,
  },
  {
    field: "hasCustomAddress",
    label: "Has Custom Address",
    type: "boolean",
    sortable: false,
    getValue: (item) => {
      let addresses = item.user?.customAddressWalletsPairFields;

      // Parse JSON string if needed
      if (typeof addresses === "string") {
        try {
          addresses = JSON.parse(addresses);
        } catch (_e) {
          addresses = [];
        }
      }

      return Array.isArray(addresses) && addresses.length > 0;
    },
  },
  {
    field: "customAddresses",
    label: "Custom Addresses",
    type: "text",
    sortable: false,
    getValue: (item) => {
      let addresses = item.user?.customAddressWalletsPairFields;

      // Parse JSON string if needed
      if (typeof addresses === "string") {
        try {
          addresses = JSON.parse(addresses);
        } catch (e) {
          console.error("Failed to parse customAddressWalletsPairFields:", e);
          addresses = [];
        }
      }

      // Validate array
      if (!Array.isArray(addresses) || addresses.length === 0) {
        return "-";
      }

      return addresses
        .map(
          (a: { currency: string; network: string; address: string }) =>
            `${a.currency}/${a.network}: ${a.address}`
        )
        .join(", ");
    },
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: false,
    api: `${api}/:id/status`,
  },
];
const Wallets = () => {
  const { t } = useTranslation();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [balanceType, setBalanceType] = useState<"ADD" | "SUBTRACT">("ADD");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenBalanceModal = (wallet: WalletItem) => {
    setSelectedWallet(wallet);
    setBalanceType("ADD");
    setBalanceAmount("");
    setIsBalanceModalOpen(true);
  };

  const handleCloseBalanceModal = () => {
    setIsBalanceModalOpen(false);
    setSelectedWallet(null);
    setBalanceAmount("");
  };

  const handleSubmitBalance = async () => {
    if (!(selectedWallet && balanceAmount)) {
      toast.error(t("Please enter an amount"));
      return;
    }

    const amount = Number.parseFloat(balanceAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error(t("Please enter a valid positive amount"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await $fetch({
        url: `${api}/${selectedWallet.id}/balance`,
        method: "POST",
        body: {
          type: balanceType,
          amount,
        },
      });

      if (response.error) {
        const errorMessage =
          typeof response.error === "string"
            ? response.error
            : t("Failed to update balance");
        toast.error(errorMessage);
      } else {
        toast.success(
          t(
            `Successfully ${balanceType === "ADD" ? "added" : "subtracted"} ${amount} ${selectedWallet.currency}`
          )
        );
        handleCloseBalanceModal();
        setRefreshKey((prev) => prev + 1);
      }
    } catch {
      toast.error(t("An error occurred while updating balance"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom dropdown actions slot for balance adjustment
  const dropdownActionsSlot = (item: WalletItem): ReactNode => (
    <button
      className="flex w-full items-center gap-2 px-3 py-2 text-muted-500 text-sm hover:bg-muted-100 hover:text-success-500 dark:text-muted-400 dark:hover:bg-muted-800 dark:hover:text-success-400"
      onClick={() => handleOpenBalanceModal(item)}
      type="button"
    >
      <Icon className="h-4 w-4" icon="mdi:cash-plus" />
      {t("Adjust Balance")}
    </button>
  );

  return (
    <Layout color="muted" title={t("Wallets Management")}>
      <DataTable
        canCreate={false}
        canEdit={true}
        canView={false}
        columnConfig={columnConfig}
        dropdownActionsSlot={dropdownActionsSlot}
        editPath="/admin/crm/user?email=[user.email]"
        endpoint={api}
        hasAnalytics
        key={refreshKey}
        title={t("Wallets")}
      />

      {/* Balance Adjustment Modal */}
      <Modal open={isBalanceModalOpen} size="sm">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-muted-800 dark:text-muted-100">
              {t("Adjust Wallet Balance")}
            </h3>
            <button
              className="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200"
              onClick={handleCloseBalanceModal}
              type="button"
            >
              <Icon className="h-5 w-5" icon="mdi:close" />
            </button>
          </div>

          {selectedWallet && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-800">
                <div className="text-muted-500 text-sm dark:text-muted-400">
                  {t("Wallet")}
                </div>
                <div className="font-medium text-muted-800 dark:text-muted-100">
                  {selectedWallet.user?.firstName}{" "}
                  {selectedWallet.user?.lastName} - {selectedWallet.currency} (
                  {selectedWallet.type})
                </div>
                <div className="mt-1 text-muted-500 text-sm dark:text-muted-400">
                  {t("Current Balance")}:{" "}
                  <span className="font-semibold">
                    {selectedWallet.balance}
                  </span>
                </div>
              </div>

              <Select
                label={t("Operation Type")}
                onChange={(e) =>
                  setBalanceType(e.target.value as "ADD" | "SUBTRACT")
                }
                options={[
                  { value: "ADD", label: t("Add Balance") },
                  { value: "SUBTRACT", label: t("Subtract Balance") },
                ]}
                value={balanceType}
              />

              <Input
                label={t("Amount")}
                min="0"
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder={t("Enter amount")}
                step="0.00000001"
                type="number"
                value={balanceAmount}
              />

              <div className="mt-6 flex gap-3">
                <Button
                  className="flex-1"
                  color="muted"
                  onClick={handleCloseBalanceModal}
                  type="button"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  className="flex-1"
                  color={balanceType === "ADD" ? "success" : "warning"}
                  loading={isSubmitting}
                  onClick={handleSubmitBalance}
                  type="button"
                >
                  <Icon
                    className="mr-2 h-4 w-4"
                    icon={balanceType === "ADD" ? "mdi:plus" : "mdi:minus"}
                  />
                  {balanceType === "ADD" ? t("Add") : t("Subtract")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
};
export default Wallets;
export const permission = "Access Wallet Management";
