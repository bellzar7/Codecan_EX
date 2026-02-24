import { Icon } from "@iconify/react";
import { capitalize } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";
import RangeSlider from "@/components/elements/addons/range-slider/RangeSlider";
import Button from "@/components/elements/base/button/Button";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import CompactInput from "@/components/elements/form/input/compactInput";
import Select from "@/components/elements/form/select/Select";
import { useDashboardStore } from "@/stores/dashboard";
import useFuturesMarketStore from "@/stores/futures/market";
import { useFuturesOrderStore } from "@/stores/futures/order";

const OrderInputBase = ({ type, side }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, getSetting } = useDashboardStore();
  const { market } = useFuturesMarketStore();
  const getPrecision = (type) => {
    const precision = Number(market?.precision?.[type] || 8);
    return Math.min(Math.max(precision, 0), 100);
  };

  const minAmount = Number(market?.limits?.amount?.min || 0);
  const maxAmount = Number(market?.limits?.amount?.max || 0);
  const minPrice = Number(market?.limits?.price?.min || 0);
  const maxPrice = Number(market?.limits?.price?.max || 0);
  const { placeOrder, pairBalance, ask, bid } = useFuturesOrderStore();
  const [amount, setAmount] = useState<number>(0);
  console.log("market.limits.leverage", market?.limits?.leverage);
  const leverageValues =
    market?.limits?.leverage?.length > 0
      ? market.limits.leverage.split(",").map(Number)
      : [0];

  const leverageOptions = leverageValues.map((value) => ({
    label: `${value}x`,
    value,
  }));

  const [leverage, setLeverage] = useState(leverageOptions[0].value);

  const [stopPrice, setStopPrice] = useState<number | undefined>(undefined);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number | undefined>(
    undefined
  );

  const options =
    type === "MARKET"
      ? [
          { value: "AMOUNT", label: "Amount" },
          { value: "TOTAL", label: "Total" },
        ]
      : [];

  const [inputType, setInputType] = useState("AMOUNT");
  const [price, setPrice] = useState<number>(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    setPercentage(0);
    if (type === "MARKET") {
      setPrice(0);
    } else if (price === 0) {
      console.log(" ask : bid", ask, bid);
      setPrice(side === "BUY" ? ask : bid);
    }
    setInputType("AMOUNT");
  }, [type, side, ask, bid]);

  const handleSliderChange = (value: number) => {
    setPercentage(value);
    let total = 0;

    const calculateTotal = (
      balance: number,
      divisor: number | null,
      precisionType: string
    ) => {
      const divisorValue = divisor ? Number(divisor) : 1; // Ensure divisor is a number
      return Number.parseFloat(
        ((balance * value) / 100 / divisorValue).toFixed(
          getPrecision(precisionType)
        )
      );
    };

    if (type === "MARKET") {
      if (side === "BUY") {
        total =
          inputType === "AMOUNT"
            ? calculateTotal(pairBalance, ask, "amount")
            : calculateTotal(pairBalance, null, "price");
      } else {
        total = calculateTotal(pairBalance, null, "amount");
      }
    } else if (side === "BUY") {
      total = calculateTotal(pairBalance, price, "amount");
    } else {
      total = calculateTotal(pairBalance, null, "amount");
    }

    setAmount(total);
  };

  const handlePlaceOrder = async () => {
    if (
      getSetting("tradeRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      await router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to start trading"));
      return;
    }

    let calculatedAmount = amount;
    if (type === "MARKET" && inputType === "TOTAL")
      calculatedAmount = amount / (side === "BUY" ? ask : bid);

    await placeOrder(
      market?.currency,
      market?.pair,
      type,
      side,
      calculatedAmount,
      type === "MARKET" ? undefined : price,
      leverage,
      stopPrice,
      takeProfitPrice
    );

    setPercentage(0);
    setStopPrice(undefined);
    setTakeProfitPrice(undefined);
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-2">
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-400 text-xs dark:text-muted-400">
              {t("Available")} {pairBalance.toFixed(getPrecision("amount"))}{" "}
              {market?.pair}
            </span>
            <Tooltip content={`Transfer ${market?.pair}`}>
              <Link
                href={
                  profile?.id
                    ? "/user/wallet/transfer"
                    : "/login?return=/user/wallet/deposit"
                }
              >
                <Icon
                  className="h-3 w-3 cursor-pointer rounded-full border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
                  icon="mdi:plus"
                />
              </Link>
            </Tooltip>
          </div>
          {type !== "MARKET" && (
            <span
              className="cursor-pointer text-primary-500 text-xs dark:text-primary-400"
              onClick={() => setPrice(side === "BUY" ? ask : bid)}
            >
              {t("Best")} {side === "BUY" ? "Ask" : "Bid"}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <CompactInput
            className="input"
            disabled={type === "MARKET"}
            label={t("Price")}
            max={maxPrice}
            min={minPrice}
            onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
            placeholder={type === "MARKET" ? "Market" : price.toString()}
            postLabel={market?.pair}
            shape={"rounded-xs"}
            step={minPrice > 0 ? minPrice : 10 ** -getPrecision("price")}
            type="number"
            value={type === "MARKET" ? "" : price}
          />
        </div>
        <div className="flex flex-col gap-1">
          <CompactInput
            className="input"
            label={type === "MARKET" ? "" : "Amount"}
            max={maxAmount}
            min={minAmount}
            onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
            options={options}
            placeholder="0.0"
            postLabel={inputType === "AMOUNT" ? market?.currency : market?.pair}
            selected={inputType}
            setSelected={(value) => {
              setInputType(value);
            }}
            shape={"rounded-xs"}
            step={minAmount > 0 ? minAmount : 10 ** -getPrecision("amount")}
            type="number"
            value={amount}
          />
        </div>
        {type === "STOPLIMIT" && (
          <>
            <div className="flex flex-col">
              <CompactInput
                className="input"
                label={t("Stop Price")}
                max={maxPrice}
                min={minPrice}
                onChange={(e) =>
                  setStopPrice(Number.parseFloat(e.target.value) || undefined)
                }
                placeholder="0.0"
                postLabel={market?.pair}
                shape={"rounded-xs"}
                step={minPrice > 0 ? minPrice : 10 ** -getPrecision("price")}
                type="number"
                value={stopPrice ?? ""}
              />
            </div>
            <div className="flex flex-col">
              <CompactInput
                className="input"
                label={t("Take Profit")}
                max={maxPrice}
                min={minPrice}
                onChange={(e) =>
                  setTakeProfitPrice(
                    Number.parseFloat(e.target.value) || undefined
                  )
                }
                placeholder="0.0"
                postLabel={market?.pair}
                shape={"rounded-xs"}
                step={minPrice > 0 ? minPrice : 10 ** -getPrecision("price")}
                type="number"
                value={takeProfitPrice ?? ""}
              />
            </div>
          </>
        )}
        <div className="mt-2 mb-3">
          <RangeSlider
            color="warning"
            disabled={!profile?.id || (type !== "MARKET" && price === 0)}
            legend
            max={100}
            min={0}
            onSliderChange={handleSliderChange}
            steps={[0, 25, 50, 75, 100]}
            value={percentage}
          />
        </div>
      </div>
      <div className="flex items-end gap-1">
        <div className="min-w-24">
          {leverageOptions.length > 1 ? (
            <Select
              label={t("Leverage")}
              onChange={(e) => setLeverage(Number.parseFloat(e.target.value))}
              options={leverageOptions}
              shape={"rounded-xs"}
              value={leverage}
            />
          ) : (
            <CompactInput
              className="input"
              disabled
              label={t("Leverage")}
              shape={"rounded-xs"}
              type="number"
              value={leverage}
            />
          )}
        </div>
        <div className="w-full">
          <Button
            animated={false}
            className="w-full"
            color={
              profile?.id ? (side === "BUY" ? "success" : "danger") : "muted"
            }
            onClick={() => {
              if (profile?.id) {
                handlePlaceOrder();
              } else {
                router.push("/auth/login");
              }
            }}
            shape={"rounded-xs"}
            type="button"
          >
            {profile?.id ? (
              capitalize(side === "BUY" ? t("Long") : t("Short")) +
              " " +
              t("Position")
            ) : (
              <div className="flex gap-2">
                <span className="text-warning-500">{t("Log In")}</span>
                <span>{t("or")}</span>
                <span className="text-warning-500">{t("Register Now")}</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const OrderInput = memo(OrderInputBase);
