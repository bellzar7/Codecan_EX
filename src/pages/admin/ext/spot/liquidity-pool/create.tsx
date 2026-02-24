import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useState } from "react";
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

const priceSourceOptions: Option[] = [
  { value: "BINANCE", label: "Binance" },
  { value: "TWD", label: "TWD Provider" },
  { value: "ADMIN", label: "Admin Price" },
  { value: "ORDERBOOK", label: "Order Book" },
];

const LiquidityPoolCreate: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [currency, setCurrency] = useState<string>("");
  const [pair, setPair] = useState<string>("");
  const [baseBalance, setBaseBalance] = useState<string>("0");
  const [quoteBalance, setQuoteBalance] = useState<string>("0");
  const [adminPrice, setAdminPrice] = useState<string>("");
  const [priceSource, setPriceSource] = useState<Option | null>(
    priceSourceOptions[0]
  );
  const [minOrderSize, setMinOrderSize] = useState<string>("0");
  const [maxOrderSize, setMaxOrderSize] = useState<string>("0");
  const [spreadPercentage, setSpreadPercentage] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!currency) {
      return;
    }
    if (!pair) {
      return;
    }

    setIsSubmitting(true);

    const body = {
      currency: currency.toUpperCase(),
      pair: pair.toUpperCase(),
      baseBalance: Number.parseFloat(baseBalance) || 0,
      quoteBalance: Number.parseFloat(quoteBalance) || 0,
      adminPrice: adminPrice ? Number.parseFloat(adminPrice) : undefined,
      priceSource: priceSource?.value || "BINANCE",
      minOrderSize: Number.parseFloat(minOrderSize) || 0,
      maxOrderSize: Number.parseFloat(maxOrderSize) || 0,
      spreadPercentage: Number.parseFloat(spreadPercentage) || 0,
      status: true,
    };

    const { error } = await $fetch({
      url: "/api/admin/ext/spot/liquidity-pool",
      method: "POST",
      body,
    });

    setIsSubmitting(false);

    if (!error) {
      router.push("/admin/ext/spot/liquidity-pool");
    }
  };

  return (
    <Layout color="muted" title={t("Create Liquidity Pool")}>
      <Card className="mb-5 p-5 text-muted-800 dark:text-muted-100">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <h1 className="mb-4 text-lg md:mb-0">{t("Create Liquidity Pool")}</h1>
          <div className="flex gap-2">
            <Button
              color="danger"
              onClick={() => router.push("/admin/ext/spot/liquidity-pool")}
              shape="rounded-sm"
              size="md"
              variant="outlined"
            >
              {t("Cancel")}
            </Button>
            <Button
              color="success"
              disabled={isSubmitting || !currency || !pair}
              onClick={handleSubmit}
              shape="rounded-sm"
              size="md"
              variant="outlined"
            >
              {isSubmitting ? t("Creating...") : t("Create")}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label={t("Base Currency")}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder={t("Enter base currency (e.g., BTC)")}
            value={currency}
          />
          <Input
            label={t("Quote Currency")}
            onChange={(e) => setPair(e.target.value)}
            placeholder={t("Enter quote currency (e.g., USDT)")}
            value={pair}
          />
          <Input
            label={t("Initial Base Balance")}
            onChange={(e) => setBaseBalance(e.target.value)}
            placeholder={t("Enter initial base currency balance")}
            type="number"
            value={baseBalance}
          />
          <Input
            label={t("Initial Quote Balance")}
            onChange={(e) => setQuoteBalance(e.target.value)}
            placeholder={t("Enter initial quote currency balance")}
            type="number"
            value={quoteBalance}
          />
          <ListBox
            label={t("Price Source")}
            options={priceSourceOptions}
            selected={priceSource}
            setSelected={setPriceSource}
          />
          <Input
            label={t("Admin Price (Optional)")}
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
      </Card>
    </Layout>
  );
};

export default LiquidityPoolCreate;
export const permission = "Access Liquidity Pool Management";
