import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";
import RangeSlider from "@/components/elements/addons/range-slider/RangeSlider";
import Button from "@/components/elements/base/button/Button";
import CompactInput from "@/components/elements/form/input/compactInput";
import ListBox from "@/components/elements/form/listbox/Listbox";
import { useDashboardStore } from "@/stores/dashboard";
import useMarketStore from "@/stores/trade/market";
import { useOrderStore } from "@/stores/trade/order";

const AiInvestmentInputBase = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, getSetting } = useDashboardStore();
  const { market } = useMarketStore();
  const getPrecision = (type) => Number(market?.precision?.[type] || 8);
  const { loading, aiPlans, placeAiInvestmentOrder, pairBalance } =
    useOrderStore();
  const [selectedDuration, setSelectedDuration] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [percentage, setPercentage] = useState(0);
  const [selectedPlanId, setSelectedPlanId] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    if (selectedPlanId) {
      setSelectedPlan(aiPlans.find((plan) => plan.id === selectedPlanId.value));
    }
    setPercentage(0);
    setAmount(0);
    setSelectedDuration(null);
  }, [selectedPlanId]);

  const handleSliderChange = (value: number) => {
    setPercentage(value);
    const total = (pairBalance * value) / 100;
    setAmount(total);
  };

  const handlePlaceInvestment = async () => {
    if (
      getSetting("aiInvestmentRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      await router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to invest in AI Bots"));
      return;
    }
    if (!(selectedPlanId && selectedDuration)) return;
    await placeAiInvestmentOrder(
      selectedPlanId.value,
      selectedDuration.value,
      market,
      amount
    );
    setSelectedPlanId(null);
    setSelectedDuration(null);
    setAmount(0);
    setPercentage(0);
    setSelectedPlan(null);
  };

  return (
    <div className="flex h-full w-full flex-col justify-between gap-2">
      <div className="flex w-full flex-col gap-3">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-400 text-xs dark:text-muted-400">
              {t("Avbl")} {pairBalance.toFixed(getPrecision("price"))}{" "}
              {market?.pair}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <ListBox
            disabled={loading}
            loading={loading}
            options={aiPlans.map((plan) => ({
              value: plan.id,
              label: plan.title,
            }))}
            placeholder={t("Select a Plan")}
            selected={selectedPlanId}
            setSelected={setSelectedPlanId}
            shape={"rounded-xs"}
          />
          <ListBox
            disabled={loading || !selectedPlan?.durations}
            loading={loading}
            options={selectedPlan?.durations?.map((duration) => ({
              value: duration.id,
              label: `${duration.duration} ${duration.timeframe}`,
            }))}
            placeholder={t("Select a Duration")}
            selected={selectedDuration}
            setSelected={setSelectedDuration}
            shape={"rounded-xs"}
          />
        </div>

        <div className="flex flex-col gap-1">
          <CompactInput
            className="input"
            disabled={loading || !selectedPlan}
            label={t("Amount")}
            loading={loading}
            max={selectedPlan?.maxAmount}
            min={selectedPlan?.minAmount}
            onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
            placeholder="0.0"
            postLabel={market?.pair}
            shape={"rounded-xs"}
            type="number"
            value={amount}
          />
        </div>
        <div className="flex justify-between gap-5 text-muted-400 text-xs dark:text-muted-400">
          <p>
            {t("Min Amount")}: {selectedPlan?.minAmount}
          </p>
          <p>
            {t("Max Amount")}: {selectedPlan?.maxAmount}
          </p>
        </div>
        <div className="mt-2 mb-3">
          <RangeSlider
            color="warning"
            legend
            max={100}
            min={0}
            onSliderChange={handleSliderChange}
            steps={[0, 25, 50, 75, 100]}
            value={percentage}
          />
        </div>
      </div>
      {selectedPlan && (
        <div className="mt-2 rounded-xs bg-muted-100 p-3 text-muted-400 text-xs dark:bg-muted-800 dark:text-muted-400">
          {selectedPlan?.description}
          <div className="mt-2">
            <p className="text-success-500">
              {t("ROI")}: {selectedPlan?.profitPercentage}%
            </p>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-col gap-1">
        <Button
          animated={false}
          className="w-full"
          color={profile?.id ? "success" : "muted"}
          onClick={() => {
            if (profile?.id) {
              handlePlaceInvestment();
            } else {
              router.push("/auth/login");
            }
          }}
          shape={"rounded-xs"}
          type="button"
        >
          {profile?.id ? (
            "Invest"
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
  );
};

export const AiInvestmentInput = memo(AiInvestmentInputBase);
