import { Icon } from "@iconify/react";
import { formatDate } from "date-fns";
import { capitalize } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Alert from "@/components/elements/base/alert/Alert";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import { Lottie } from "@/components/elements/base/lottie";
import Progress from "@/components/elements/base/progress/Progress";
import Tag from "@/components/elements/base/tag/Tag";
import { NewInvestment } from "@/components/pages/user/invest/plan/NewInvestment";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet";
import $fetch from "@/utils/api";

const InvestmentPlansDashboard = () => {
  const { t } = useTranslation();
  const { settings } = useDashboardStore();
  const router = useRouter();
  const { type, id } = router.query as {
    type: string;
    id: string;
  };
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plan, setPlan] = useState<any | null>(null);
  const [investment, setInvestment] = useState<any | null>(null);
  const { wallet, fetchWallet } = useWalletStore();
  const [amount, setAmount] = useState<number>(0);
  const [duration, setDuration] = useState<{
    label: string;
    value: string;
  }>({
    label: "Select Duration",
    value: "",
  });

  const fetchInvestmentPlan = async () => {
    if (!(type && id)) return;
    let url;
    switch (type.toLowerCase()) {
      case "general":
        url = `/api/finance/investment/plan/${id}`;
        break;
      case "ai":
        url = `/api/ext/ai/investment/plan/${id}`;
        break;
      case "forex":
        url = `/api/ext/forex/investment/plan/${id}`;
        break;
      default:
        break;
    }
    const { data, error } = await $fetch({
      url,
      silent: true,
    });
    if (!error) {
      setPlan(data);
    }
  };

  const fetchInvestment = async () => {
    if (!(type && id)) return;
    let url;
    switch (type.toLowerCase()) {
      case "forex":
      case "general":
        url = "/api/finance/investment";
        break;
      case "ai":
        url = "/api/ext/ai/investment";
        break;
      default:
        break;
    }
    const { data, error } = await $fetch({
      url,
      silent: true,
      params: { type },
    });
    if (error) {
      setInvestment(null);
    } else {
      setInvestment(data);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchInvestmentPlan();
      fetchInvestment();
      setIsLoading(false);
    }
  }, [type, id, router.isReady]);

  useEffect(() => {
    if (plan) {
      fetchWallet(plan.walletType, plan.currency);
    }
  }, [plan]);

  const invest = async () => {
    if (!plan) return;
    if (!duration.value || isNaN(amount) || amount <= 0) {
      toast.error(
        "Please select a duration and enter a valid amount to invest"
      );
      return;
    }
    if (!wallet || wallet.balance < amount) {
      toast.error("Insufficient balance to invest");
      return;
    }
    if (amount < plan.minInvestment) {
      toast.error("Amount is less than the minimum investment");
      return;
    }
    if (amount > plan.maxInvestment) {
      toast.error("Amount is more than the maximum investment");
      return;
    }

    setIsLoading(true);
    const { error } = await $fetch({
      url: "/api/finance/investment",
      method: "POST",
      body: {
        type,
        planId: id,
        durationId: duration.value,
        amount,
      },
    });
    if (!error) {
      fetchInvestment();
      if (plan) fetchWallet(plan.walletType, plan.currency);
      setAmount(0);
      setDuration({ label: "Select Duration", value: "" });
    }
    setIsLoading(false);
  };

  const cancelInvestment = async () => {
    setIsLoading(true);
    const { error } = await $fetch({
      url: `/api/finance/investment/${investment.id}`,
      method: "DELETE",
      params: { type },
    });
    if (!error) {
      setInvestment(null);
      if (plan) fetchWallet(plan.walletType, plan.currency);
    }
    setIsLoading(false);
  };

  const ROI = useMemo(() => {
    if (!plan || plan.profitPercentage === undefined) return 0;
    return ((amount * plan.profitPercentage) / 100).toFixed(8);
  }, [amount, plan]);

  const progress = useMemo(() => {
    if (!investment) return 0;
    const startDate = new Date(investment.createdAt).getTime();
    const endDate = new Date(investment.endDate).getTime();
    const currentDate = new Date().getTime();
    return ((currentDate - startDate) / (endDate - startDate)) * 100;
  }, [investment]);

  const statusColor = useMemo(() => {
    if (!investment) return "text-muted-400";
    switch (investment.status) {
      case "ACTIVE":
        return "primary";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
      case "REJECTED":
        return "danger";
      default:
        return "muted";
    }
  }, [investment]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (plan) {
        setInvestment((prev) => {
          if (!prev) return null;
          if (prev.status === "ACTIVE") {
            return {
              ...prev,
            };
          }
          return prev;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [plan]);

  // Determine if investment Lottie is enabled
  const isInvestmentLottieEnabled =
    settings?.lottieAnimationStatus === "true" &&
    settings?.investmentLottieEnabled === "true";
  const investmentLottieFile = settings?.investmentLottieFile;

  return (
    <Layout color="muted" title={`${plan?.title || "Loading"} Investment Plan`}>
      <div className="mx-auto mt-5 w-full max-w-xl">
        <div className="rounded-2xl border border-transparent md:border-muted-200 md:p-4 md:dark:border-muted-800">
          <Card color="contrast">
            <div className="flex items-center justify-between border-muted-200 border-b px-6 py-4 dark:border-muted-800">
              <div>
                <h2 className="font-normal font-sans text-base text-muted-800 leading-tight dark:text-muted-100">
                  {plan?.title}
                </h2>
                <p className="text-muted-400 text-sm">{plan?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconButton
                  color="muted"
                  onClick={() => router.back()}
                  size="sm"
                  type="button"
                >
                  <Icon className="h-4 w-4" icon="lucide:arrow-left" />
                </IconButton>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 p-6">
              {plan && investment && investment.planId !== plan.id && (
                <Alert canClose={false} color="warning">
                  <Icon className="h-6 w-6 text-warning-500" icon="mdi:alert" />
                  <p className="text-sm text-warning-600">
                    You have an active investment in a different plan. You
                    cannot invest in this plan until your current investment is
                    completed.
                  </p>
                </Alert>
              )}

              <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-900">
                <div className="flex flex-col divide-y divide-muted-200 rounded-lg border border-muted-200 bg-white text-center md:flex-row md:divide-x md:divide-y-0 dark:divide-muted-800 dark:border-muted-800 dark:bg-muted-950">
                  <div className="my-2 flex-1 py-3">
                    <h3 className="mb-1 flex items-center justify-center gap-1 text-muted-500 text-sm uppercase leading-tight dark:text-muted-400">
                      {t("Balance")}{" "}
                      <Link href={"/user/wallet/deposit"}>
                        <Icon
                          className="h-5 w-5 cursor-pointer hover:text-primary-500"
                          icon="mdi:plus"
                        />
                      </Link>
                    </h3>
                    <span className="font-semibold text-lg text-muted-800 dark:text-muted-100">
                      {wallet?.balance || 0} {plan?.currency}
                    </span>
                  </div>
                  <div className="my-2 flex-1 py-3">
                    <h3 className="mb-1 text-muted-500 text-sm uppercase leading-tight dark:text-muted-400">
                      {investment ? "Invested" : "Investing"}
                    </h3>
                    <span className="font-semibold text-danger-500 text-lg">
                      {investment ? investment.amount : amount} {plan?.currency}
                    </span>
                  </div>
                  <div className="my-2 flex-1 py-3">
                    <h3 className="mb-1 text-muted-500 text-sm uppercase leading-tight dark:text-muted-400">
                      {investment ? "Profit" : "ROI"}
                    </h3>
                    <span className="font-semibold text-lg text-success-500">
                      {investment ? investment.profit : ROI} {plan?.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-transparent bg-muted-50 p-4 md:border-muted-200 md:p-6 dark:bg-muted-900 md:dark:border-muted-800">
                {investment ? (
                  <div className="w-full">
                    {isInvestmentLottieEnabled ? (
                      <Lottie
                        category="stock-market"
                        height={250}
                        max={2}
                        path="stock-market-monitoring"
                      />
                    ) : investmentLottieFile ? (
                      <img
                        alt="Investment Illustration"
                        className="mx-auto max-h-[250px] object-contain"
                        src={investmentLottieFile}
                      />
                    ) : null}
                    <div>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-semibold text-lg text-muted-800 dark:text-muted-100">
                          {capitalize(type)} {t("Investment Details")}
                        </p>
                        <Tag color={statusColor as any} shape={"rounded-sm"}>
                          {investment.status}
                        </Tag>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-muted-400 text-sm">
                            {t("Duration")}
                          </p>
                          <p className="text-muted-800 text-sm dark:text-muted-100">
                            {investment.duration?.duration}{" "}
                            {investment.duration?.timeframe}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-muted-400 text-sm">
                            {t("Amount")}
                          </p>
                          <p className="text-muted-800 text-sm dark:text-muted-100">
                            {investment.amount} {plan?.currency}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-muted-400 text-sm">
                            {t("Return of Investment")}
                          </p>
                          <p className="text-muted-800 text-sm dark:text-muted-100">
                            {investment.profit} {plan?.currency}
                          </p>
                        </div>
                        <div className="">
                          <div className="flex items-center justify-between">
                            <p className="text-muted-400 text-sm">
                              {t("Start Date")}
                            </p>
                            <p className="text-muted-400 text-sm">
                              {t("End Date")}
                            </p>
                          </div>
                          <Progress
                            classNames={"my-[1px"}
                            color="primary"
                            size="sm"
                            value={progress}
                          />
                          <div className="items-center] flex justify-between">
                            <p className="text-muted-400 text-sm">
                              {investment.createdAt &&
                                formatDate(
                                  new Date(investment.createdAt),
                                  "dd MMM yyyy, hh:mm a"
                                )}
                            </p>
                            <p className="text-muted-400 text-sm">
                              {investment.endDate &&
                                formatDate(
                                  new Date(investment.endDate),
                                  "dd MMM yyyy, hh:mm a"
                                )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex w-full justify-center gap-4 border-muted-200 border-t pt-4 dark:border-muted-800">
                      <span className="w-1/2">
                        <Button
                          className="w-full"
                          color="danger"
                          disabled={investment.status !== "ACTIVE" || isLoading}
                          loading={isLoading}
                          onClick={() => cancelInvestment()}
                          type="button"
                        >
                          {t("Cancel Investment")}
                        </Button>
                      </span>
                    </div>
                  </div>
                ) : (
                  <NewInvestment
                    amount={amount}
                    duration={duration}
                    invest={invest}
                    isLoading={isLoading}
                    plan={plan}
                    setAmount={setAmount}
                    setDuration={setDuration}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
export default InvestmentPlansDashboard;
