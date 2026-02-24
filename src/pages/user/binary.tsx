import { Icon } from "@iconify/react";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import BinaryList from "@/components/pages/binary/BinaryList";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import useMarketStore from "@/stores/trade/market";
import $fetch from "@/utils/api";

const binaryPractice =
  process.env.NEXT_PUBLIC_BINARY_PRACTICE_STATUS !== "false";

const BinaryTradingDashboard = () => {
  const { t } = useTranslation();
  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();
  const [livePositions, setLivePositions] = useState<any[]>([]);
  const [practicePositions, setPracticePositions] = useState<any[]>([]);
  const [livePercentageChange, setLivePercentageChange] = useState<number>(0);
  const [practicePercentageChange, setPracticePercentageChange] =
    useState<number>(0);
  const [firstAvailableMarket, setFirstAvailableMarket] = useState<
    string | null
  >(null);
  const { getFirstAvailablePair, fetchData, marketData } = useMarketStore();

  useEffect(() => {
    if (
      router.isReady &&
      getSetting("binaryRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to access forex accounts"));
    }
  }, [router.isReady, profile?.kyc?.status]);

  useEffect(() => {
    if (router.isReady) {
      fetchBinaryPositions();
      debounce(fetchData, 100)();
    }
  }, [router.isReady]);

  useEffect(() => {
    const availableMarket = getFirstAvailablePair();
    setFirstAvailableMarket(availableMarket);
  }, [marketData.length]);

  const fetchBinaryPositions = async () => {
    const { data, error } = await $fetch({
      url: "/api/exchange/binary/order/last",
      silent: true,
    });
    if (!error) {
      const positionsData = data as any;
      setLivePositions(positionsData.nonPracticeOrders);
      setPracticePositions(positionsData.practiceOrders);
      setLivePercentageChange(positionsData.livePercentageChange);
      setPracticePercentageChange(positionsData.practicePercentageChange);
    }
  };

  const LivePositionsMonthCount = livePositions.filter(
    (item) =>
      new Date(item.createdAt).getTime() >
      new Date(new Date().setDate(new Date().getDate() - 30)).getTime()
  );

  const PracticePositionsMonthCount = practicePositions.filter(
    (item) =>
      new Date(item.createdAt).getTime() >
      new Date(new Date().setDate(new Date().getDate() - 30)).getTime()
  );

  return (
    <Layout color="muted" title={t("Binary Trading")}>
      <HeaderSection
        binaryPractice={binaryPractice}
        firstAvailableMarket={firstAvailableMarket}
        t={t}
      />
      <PositionsSection
        binaryPractice={binaryPractice}
        LivePositionsMonthCount={LivePositionsMonthCount}
        livePercentageChange={livePercentageChange}
        livePositions={livePositions}
        PracticePositionsMonthCount={PracticePositionsMonthCount}
        practicePercentageChange={practicePercentageChange}
        practicePositions={practicePositions}
        t={t}
      />
      <Faq category="BINARY" />
    </Layout>
  );
};

const HeaderSection = ({ t, binaryPractice, firstAvailableMarket }) => (
  <HeaderCardImage
    description={
      binaryPractice
        ? "Practice your trading skills with a Practice account or start trading with a live account."
        : "Start trading with a live account."
    }
    linkElement={
      <>
        {firstAvailableMarket ? (
          <>
            {binaryPractice && (
              <ButtonLink
                className="text-white dark:text-muted-100"
                color="primary"
                href={`/binary/${firstAvailableMarket}?practice=true`}
                shape="rounded-sm"
                variant={"outlined"}
              >
                {t("Practice")}
              </ButtonLink>
            )}
            <ButtonLink
              color="contrast"
              href={`/binary/${firstAvailableMarket}`}
              shape="rounded-sm"
            >
              {t("Start Trading")}
            </ButtonLink>
          </>
        ) : (
          <Button color="primary" shape="rounded-sm">
            {t("Coming Soon")}
          </Button>
        )}
      </>
    }
    lottie={{ category: "cryptocurrency-2", path: "trading", height: 240 }}
    size="lg"
    title={t("Binary Trading")}
  />
);

const PositionsSection = ({
  t,
  livePositions,
  practicePositions,
  livePercentageChange,
  practicePercentageChange,
  LivePositionsMonthCount,
  PracticePositionsMonthCount,
  binaryPractice,
}) => (
  <div className="mt-16 flex w-full flex-col gap-8 md:flex-row">
    <div className="flex w-full flex-col gap-5 md:w-1/2">
      <PositionCard
        count={LivePositionsMonthCount.length}
        imgSrc="/img/illustrations/apex.svg"
        percentageChange={livePercentageChange}
        positions={livePositions}
        title={t("Live Positions (30 days)")}
      />
    </div>
    <div className="flex w-full flex-col gap-5 md:w-1/2">
      {binaryPractice && (
        <PositionCard
          count={PracticePositionsMonthCount.length}
          imgSrc="/img/illustrations/laptop-woman.svg"
          percentageChange={practicePercentageChange}
          positions={practicePositions}
          title={t("Practice Positions (30 days)")}
        />
      )}
    </div>
  </div>
);

const PositionCard = ({
  title,
  positions,
  percentageChange,
  count,
  imgSrc,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="p-6" color={"contrast"}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-md text-muted-500 dark:text-muted-400">{title}</p>
          <div className="pt-4 pb-6">
            <span className="font-sans font-semibold text-4xl text-muted-800 leading-none dark:text-muted-100">
              <span className="mr-2">{count}</span>
              <small className="font-medium text-muted-500 text-sm dark:text-muted-400">
                {t("positions")}
              </small>
            </span>
          </div>
          <div className="mb-2 flex items-center gap-2 font-sans">
            {Number(percentageChange) === 0 ? (
              <span className="text-muted-400 text-sm">
                {t("No records from last month")}
              </span>
            ) : (
              <div
                className={`flex items-center font-semibold ${
                  percentageChange > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                <Icon
                  className="h-4 w-4 text-current"
                  icon={
                    percentageChange > 0
                      ? "ri:arrow-up-s-fill"
                      : "ri:arrow-down-s-fill"
                  }
                />
                <span>{percentageChange.toFixed(2)}%</span>
                <span className="ml-2 text-muted-400 text-sm">
                  {percentageChange > 0
                    ? t("more than last month")
                    : t("less than last month")}
                </span>
              </div>
            )}
          </div>
        </div>
        <span className="-top-10 -right-4 xs:hidden sm:absolute">
          <img alt={title} className="h-48" src={imgSrc} />
        </span>
      </div>
      <BinaryList positions={positions} shape="full" />
    </Card>
  );
};

export default BinaryTradingDashboard;
