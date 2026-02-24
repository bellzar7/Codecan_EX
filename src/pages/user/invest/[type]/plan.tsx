import { capitalize } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

type InvestmentPlan = {
  id: string;
  title: string;
  description: string;
  image: string;
  minAmount: number;
  maxAmount: number;
  profitPercentage: number;
  currency: string;
  walletType: string;
  trending: boolean;
  durations: {
    id: string;
    duration: number;
    timeframe: string;
  }[];
};
const InvestmentPlansDashboard = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { type } = router.query as {
    type: string;
  };
  const Type = capitalize(type);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchInvestmentPlans = async () => {
    if (!type) return;
    let url;
    switch (type.toLowerCase()) {
      case "general":
        url = "/api/finance/investment/plan";
        break;
      case "ai":
        url = "/api/ext/ai/investment/plan";
        break;
      case "forex":
        url = "/api/ext/forex/investment/plan";
        break;
      default:
        break;
    }
    const { data, error } = await $fetch({
      url,
      silent: true,
    });
    if (!error) {
      setPlans(data as any);
    }
  };
  useEffect(() => {
    if (router.isReady) {
      fetchInvestmentPlans();
    }
  }, [type, router.isReady]);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const filteredPlans = plans.filter(
    (plan) =>
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <Layout color="muted" title={`${Type} Investment Plans`}>
      <div className="mb-6">
        <HeaderCardImage
          description={
            "Here you can find a list of all available investment plans that are currently active and open for new investments."
          }
          link={`/user/invest/${type}`}
          linkLabel="View Your Investments"
          lottie={{
            category: type === "forex" ? "stock-market" : "cryptocurrency-2",
            path: type === "forex" ? "stock-market-monitoring" : "analysis-1",
            max: type === "forex" ? 2 : undefined,
            height: 240,
          }}
          size="lg"
          title={`Welcome to our ${Type} Investment Plans`}
        />
      </div>

      <div className="mb-6 flex w-full items-center justify-between">
        <div className="hidden w-full sm:block">
          <h2 className="text-2xl">
            <span className="text-primary-500">{t("Popular")} </span>
            <span className="text-muted-800 dark:text-muted-200">
              {t("Investment Plans")}
            </span>
          </h2>
        </div>

        <div className="w-full text-end sm:max-w-xs">
          <Input
            icon={"mdi:magnify"}
            onChange={handleSearchChange}
            placeholder={t("Search Investment Plans")}
            type="text"
            value={searchTerm}
          />
        </div>
      </div>

      <div className="relative mb-5">
        <hr className="border-muted-200 dark:border-muted-700" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {searchTerm
              ? `Matching "${searchTerm}"`
              : `All ${Type} Investment Plans`}
          </span>
        </span>
      </div>
      <div className="mx-auto grid grid-cols-1 gap-5 sm:grid-cols-2 md:auto-rows-[18rem] md:grid-cols-3 lg:grid-cols-4">
        {filteredPlans.map((plan) => (
          <Link href={`/user/invest/${type}/${plan.id}`} key={plan.id}>
            <Card
              className="group relative h-full w-full cursor-pointer p-3 hover:border-primary-500 hover:shadow-lg dark:hover:border-primary-400"
              color="contrast"
            >
              <div className="relative h-[200px] w-full">
                <MashImage
                  alt={plan.title}
                  className="h-full w-full rounded-md bg-muted-100 object-cover dark:bg-muted-900"
                  fill
                  src={plan.image}
                />
                {plan.trending && (
                  <div className="absolute top-0 right-1">
                    <Tag className="rounded-sm" color="primary">
                      {t("Trending")}
                    </Tag>
                  </div>
                )}
              </div>

              <div className="p-2">
                <h3 className="font-semibold text-lg text-primary-500 dark:text-primary-400">
                  {plan.title}
                </h3>
                <div className="flex flex-col gap-1">
                  <p className="pb-2 text-muted-500 text-sm dark:text-muted-400">
                    {plan.description.length > 100
                      ? plan.description.slice(0, 100) + "..."
                      : plan.description}
                  </p>
                  <div className="flex justify-between text-muted-500 text-xs dark:text-muted-400">
                    <p>{t("Return of Investment")}</p>
                    <p className="text-success-500">{plan.profitPercentage}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Layout>
  );
};
export default InvestmentPlansDashboard;
