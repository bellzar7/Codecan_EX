import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import { ObjectTable } from "@/components/elements/base/object-table";
import Input from "@/components/elements/form/input/Input";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const ViewCustodialWallet = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nativeTransferModalOpen, setNativeTransferModalOpen] = useState(false);
  const [tokenTransferModalOpen, setTokenTransferModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    tokenAddress: "",
  });
  useEffect(() => {
    if (id) {
      fetchCustodialWallet(id);
    }
  }, [id]);
  const fetchCustodialWallet = async (walletId) => {
    setLoading(true);
    const { data, error } = await $fetch({
      url: `/api/admin/ext/ecosystem/wallet/custodial/${walletId}`,
      silent: true,
    });
    if (!error) {
      setWallet(data);
    }
    setLoading(false);
  };
  const handleTransfer = async (type) => {
    const url = `/api/admin/ext/ecosystem/wallet/custodial/${id}/transfer/${type}`;
    const payload =
      type === "native"
        ? { recipient: formData.recipient, amount: formData.amount }
        : {
            recipient: formData.recipient,
            amount: formData.amount,
            tokenAddress: formData.tokenAddress,
          };
    const { error } = await $fetch({
      url,
      method: "POST",
      body: payload,
    });
    if (!error) {
      fetchCustodialWallet(id);
    }
    // Close the modal after the transfer
    if (type === "native") {
      setNativeTransferModalOpen(false);
    } else {
      setTokenTransferModalOpen(false);
    }
  };
  const columns: ColumnConfigType[] = [
    {
      field: "currency",
      label: "Currency",
      sublabel: "name",
      type: "text",
      sortable: true,
      hasImage: true,
      imageKey: "icon",
      placeholder: "/img/placeholder.svg",
      className: "rounded-full",
    },
    {
      field: "tokenAddress",
      label: "Token Address",
      type: "text",
      sortable: false,
    },
    { field: "balance", label: "Balance", type: "text", sortable: false },
  ];
  if (!wallet) {
    return null;
  }
  return (
    <Layout color="muted" title={t("Custodial Wallet")}>
      <main className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="font-light font-sans text-2xl text-muted-800 leading-[1.125] dark:text-muted-100">
              {t("Custodial Wallet")}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              color={"primary"}
              onClick={() => setNativeTransferModalOpen(true)}
              type="button"
            >
              {t("Transfer Native Tokens")}
            </Button>
            <Button
              color={"primary"}
              onClick={() => setTokenTransferModalOpen(true)}
              type="button"
            >
              {t("Transfer ERC-20 Tokens")}
            </Button>
            <BackButton href="/admin/ext/ecosystem/wallet/custodial" />
          </div>
        </div>

        <ObjectTable columnConfig={columns} items={wallet.tokenBalances} />
        <Modal open={nativeTransferModalOpen} size="sm">
          <Card shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
                {t("Transfer Native Tokens")}
              </p>
              <IconButton
                onClick={() => setNativeTransferModalOpen(false)}
                shape="full"
                size="md"
              >
                <Icon className="h-4 w-4" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 md:px-6 md:pb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTransfer("native");
                }}
              >
                <Input
                  label={t("Recipient Address")}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient: e.target.value })
                  }
                  placeholder={t("Recipient Address")}
                  required
                  value={formData.recipient}
                />
                <Input
                  label={t("Amount")}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder={t("Amount")}
                  required
                  value={formData.amount}
                />
                <div className="mt-4 flex w-full justify-end gap-2">
                  <Button
                    color="primary"
                    disabled={loading}
                    loading={loading}
                    shape="smooth"
                    type="submit"
                    variant="solid"
                  >
                    {t("Transfer")}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </Modal>
        <Modal open={tokenTransferModalOpen} size="sm">
          <Card shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
                {t("Transfer ERC-20 Tokens")}
              </p>
              <IconButton
                onClick={() => setTokenTransferModalOpen(false)}
                shape="full"
                size="md"
              >
                <Icon className="h-4 w-4" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 md:px-6 md:pb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTransfer("token");
                }}
              >
                <Input
                  label={t("Recipient Address")}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient: e.target.value })
                  }
                  placeholder={t("Recipient Address")}
                  required
                  value={formData.recipient}
                />
                <Input
                  label={t("Amount")}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder={t("Amount")}
                  required
                  value={formData.amount}
                />
                <Input
                  label={t("Token Address")}
                  onChange={(e) =>
                    setFormData({ ...formData, tokenAddress: e.target.value })
                  }
                  placeholder={t("Token Address")}
                  required
                  value={formData.tokenAddress}
                />
                <div className="mt-4 flex w-full justify-end gap-2">
                  <Button
                    color="primary"
                    disabled={loading}
                    loading={loading}
                    shape="smooth"
                    type="submit"
                    variant="solid"
                  >
                    {t("Transfer")}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </Modal>
      </main>
    </Layout>
  );
};
export default ViewCustodialWallet;
export const permission = "Access Ecosystem Custodial Wallet Management";
