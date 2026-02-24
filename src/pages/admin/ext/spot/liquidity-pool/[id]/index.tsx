import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import ListBox from "@/components/elements/form/listbox/Listbox";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

interface Option {
  value: string;
  label: string;
}

interface LiquidityPool {
  id: string;
  currency: string;
  pair: string;
  baseBalance: number;
  quoteBalance: number;
  baseInOrder: number;
  quoteInOrder: number;
  adminPrice: number | null;
  priceSource: string;
  minOrderSize: number;
  maxOrderSize: number;
  spreadPercentage: number;
  status: boolean;
}

const priceSourceOptions: Option[] = [
  { value: "BINANCE", label: "Binance" },
  { value: "TWD", label: "TWD Provider" },
  { value: "ADMIN", label: "Admin Price" },
  { value: "ORDERBOOK", label: "Order Book" },
];

const LiquidityPoolEdit: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [pool, setPool] = useState<LiquidityPool | null>(null);
  const [adminPrice, setAdminPrice] = useState<string>("");
  const [priceSource, setPriceSource] = useState<Option | null>(null);
  const [minOrderSize, setMinOrderSize] = useState<string>("0");
  const [maxOrderSize, setMaxOrderSize] = useState<string>("0");
  const [spreadPercentage, setSpreadPercentage] = useState<string>("0");
  const [depositBaseAmount, setDepositBaseAmount] = useState<string>("");
  const [depositQuoteAmount, setDepositQuoteAmount] = useState<string>("");
  const [withdrawBaseAmount, setWithdrawBaseAmount] = useState<string>("");
  const [withdrawQuoteAmount, setWithdrawQuoteAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchPoolData = useCallback(async () => {
    const { data, error } = await $fetch({
      url: `/api/admin/ext/spot/liquidity-pool/${id}`,
      silent: true,
    });
    if (!error && data) {
      const poolData = data as LiquidityPool;
      setPool(poolData);
      setAdminPrice(poolData.adminPrice?.toString() ?? "");
      setPriceSource(
        priceSourceOptions.find((opt) => opt.value === poolData.priceSource) ??
          null
      );
      setMinOrderSize(poolData.minOrderSize.toString());
      setMaxOrderSize(poolData.maxOrderSize.toString());
      setSpreadPercentage(poolData.spreadPercentage.toString());
    }
  }, [id]);

  useEffect(() => {
    if (router.isReady && id) {
      fetchPoolData();
    }
  }, [router.isReady, id, fetchPoolData]);

  const handleUpdate = async () => {
    setIsSubmitting(true);

    const body = {
      adminPrice: adminPrice ? Number.parseFloat(adminPrice) : undefined,
      priceSource: priceSource?.value,
      minOrderSize: Number.parseFloat(minOrderSize) || 0,
      maxOrderSize: Number.parseFloat(maxOrderSize) || 0,
      spreadPercentage: Number.parseFloat(spreadPercentage) || 0,
    };

    const { error } = await $fetch({
      url: `/api/admin/ext/spot/liquidity-pool/${id}`,
      method: "PUT",
      body,
    });

    setIsSubmitting(false);

    if (!error) {
      fetchPoolData();
    }
  };

  const handleDeposit = async () => {
    const baseAmount = Number.parseFloat(depositBaseAmount) || 0;
    const quoteAmount = Number.parseFloat(depositQuoteAmount) || 0;

    if (baseAmount <= 0 && quoteAmount <= 0) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await $fetch({
      url: `/api/admin/ext/spot/liquidity-pool/${id}/deposit`,
      method: "POST",
      body: { baseAmount, quoteAmount },
    });

    setIsSubmitting(false);

    if (!error) {
      setDepositBaseAmount("");
      setDepositQuoteAmount("");
      fetchPoolData();
    }
  };

  const handleWithdraw = async () => {
    const baseAmount = Number.parseFloat(withdrawBaseAmount) || 0;
    const quoteAmount = Number.parseFloat(withdrawQuoteAmount) || 0;

    if (baseAmount <= 0 && quoteAmount <= 0) {
      return;
    }

    setIsSubmitting(true);

    const { error } = await $fetch({
      url: `/api/admin/ext/spot/liquidity-pool/${id}/withdraw`,
      method: "POST",
      body: { baseAmount, quoteAmount },
    });

    setIsSubmitting(false);

    if (!error) {
      setWithdrawBaseAmount("");
      setWithdrawQuoteAmount("");
      fetchPoolData();
    }
  };

  if (!pool) {
    return (
      <Layout color="muted" title={t("Loading...")}>
        <Card className="p-5">
          <p>{t("Loading pool data...")}</p>
        </Card>
      </Layout>
    );
  }

  const availableBase = pool.baseBalance - pool.baseInOrder;
  const availableQuote = pool.quoteBalance - pool.quoteInOrder;

  return (
    <Layout color="muted" title={t("Edit Liquidity Pool")}>
      <div className="space-y-6">
        {/* Pool Info Card */}
        <Card className="p-5 text-muted-800 dark:text-muted-100">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <h1 className="mb-4 text-lg md:mb-0">
              {t("Liquidity Pool")}: {pool.currency}/{pool.pair}
            </h1>
            <div className="flex gap-2">
              <Button
                color="muted"
                onClick={() => router.push("/admin/ext/spot/liquidity-pool")}
                shape="rounded-sm"
                size="md"
                variant="outlined"
              >
                {t("Back")}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-800">
              <p className="text-muted-500 text-sm">{t("Base Balance")}</p>
              <p className="font-bold text-xl">
                {pool.baseBalance} {pool.currency}
              </p>
              <p className="text-muted-400 text-xs">
                {t("In Order")}: {pool.baseInOrder}
              </p>
            </div>
            <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-800">
              <p className="text-muted-500 text-sm">{t("Quote Balance")}</p>
              <p className="font-bold text-xl">
                {pool.quoteBalance} {pool.pair}
              </p>
              <p className="text-muted-400 text-xs">
                {t("In Order")}: {pool.quoteInOrder}
              </p>
            </div>
            <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-800">
              <p className="text-muted-500 text-sm">{t("Available Base")}</p>
              <p className="font-bold text-success-500 text-xl">
                {availableBase} {pool.currency}
              </p>
            </div>
            <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-800">
              <p className="text-muted-500 text-sm">{t("Available Quote")}</p>
              <p className="font-bold text-success-500 text-xl">
                {availableQuote} {pool.pair}
              </p>
            </div>
          </div>
        </Card>

        {/* Settings Card */}
        <Card className="p-5 text-muted-800 dark:text-muted-100">
          <h2 className="mb-4 text-lg">{t("Pool Settings")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ListBox
              label={t("Price Source")}
              options={priceSourceOptions}
              selected={priceSource}
              setSelected={setPriceSource}
            />
            <Input
              label={t("Admin Price")}
              onChange={(e) => setAdminPrice(e.target.value)}
              placeholder={t("Enter admin-set price")}
              type="number"
              value={adminPrice}
            />
            <Input
              label={t("Minimum Order Size")}
              onChange={(e) => setMinOrderSize(e.target.value)}
              placeholder={t("Enter minimum order size")}
              type="number"
              value={minOrderSize}
            />
            <Input
              label={t("Maximum Order Size (0 = unlimited)")}
              onChange={(e) => setMaxOrderSize(e.target.value)}
              placeholder={t("Enter maximum order size")}
              type="number"
              value={maxOrderSize}
            />
            <Input
              label={t("Spread Percentage")}
              onChange={(e) => setSpreadPercentage(e.target.value)}
              placeholder={t("Enter spread percentage")}
              type="number"
              value={spreadPercentage}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              color="primary"
              disabled={isSubmitting}
              onClick={handleUpdate}
              shape="rounded-sm"
              size="md"
            >
              {isSubmitting ? t("Saving...") : t("Save Settings")}
            </Button>
          </div>
        </Card>

        {/* Deposit Card */}
        <Card className="p-5 text-muted-800 dark:text-muted-100">
          <h2 className="mb-4 text-lg">{t("Deposit Liquidity")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label={`${t("Base Amount")} (${pool.currency})`}
              onChange={(e) => setDepositBaseAmount(e.target.value)}
              placeholder={t("Enter amount to deposit")}
              type="number"
              value={depositBaseAmount}
            />
            <Input
              label={`${t("Quote Amount")} (${pool.pair})`}
              onChange={(e) => setDepositQuoteAmount(e.target.value)}
              placeholder={t("Enter amount to deposit")}
              type="number"
              value={depositQuoteAmount}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              color="success"
              disabled={isSubmitting}
              onClick={handleDeposit}
              shape="rounded-sm"
              size="md"
            >
              {isSubmitting ? t("Depositing...") : t("Deposit")}
            </Button>
          </div>
        </Card>

        {/* Withdraw Card */}
        <Card className="p-5 text-muted-800 dark:text-muted-100">
          <h2 className="mb-4 text-lg">{t("Withdraw Liquidity")}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label={`${t("Base Amount")} (${pool.currency}) - ${t("Available")}: ${availableBase}`}
              onChange={(e) => setWithdrawBaseAmount(e.target.value)}
              placeholder={t("Enter amount to withdraw")}
              type="number"
              value={withdrawBaseAmount}
            />
            <Input
              label={`${t("Quote Amount")} (${pool.pair}) - ${t("Available")}: ${availableQuote}`}
              onChange={(e) => setWithdrawQuoteAmount(e.target.value)}
              placeholder={t("Enter amount to withdraw")}
              type="number"
              value={withdrawQuoteAmount}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              color="warning"
              disabled={isSubmitting}
              onClick={handleWithdraw}
              shape="rounded-sm"
              size="md"
            >
              {isSubmitting ? t("Withdrawing...") : t("Withdraw")}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default LiquidityPoolEdit;
export const permission = "Access Liquidity Pool Management";
