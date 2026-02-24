import { addDays } from "date-fns";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import { Panel } from "@/components/elements/base/panel";
import Progress from "@/components/elements/base/progress/Progress";
import Input from "@/components/elements/form/input/Input";
import ListBox from "@/components/elements/form/listbox/Listbox";
import { MashImage } from "@/components/elements/MashImage";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import PaginationControls from "@/components/pages/nft/collection/elements/PaginationControls";
import { StakingInfo } from "@/components/pages/user/staking/StakingInfo";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet";
import $fetch from "@/utils/api";

type StakingDuration = {
  id: string;
  poolId: string;
  duration: number;
  interestRate: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
type StakingLog = {
  id: string;
  userId: string;
  poolId: string;
  durationId: string;
  amount: number;
  status: "ACTIVE" | "RELEASED" | "COLLECTED";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  duration: StakingDuration;
};
type StakingPool = {
  id: string;
  name: string;
  description: string;
  currency: string;
  chain: string;
  type: string;
  minStake: number;
  maxStake: number;
  status: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  stakingDurations: StakingDuration[];
  stakingLogs: StakingLog[];
};
const StakesDashboard = () => {
  const { t } = useTranslation();
  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [filter, setFilter] = useState("");
  const [amount, setAmount] = useState(0);
  const [hasStaked, setHasStaked] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const { wallet, fetchWallet, setWallet } = useWalletStore();
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isStarted: boolean;
    progress: number;
    endDate: string;
    startDate: string;
  } | null>(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
  });

  const fetchStakingPools = async () => {
    const url = "/api/ext/staking/pool";
    const { data, error } = await $fetch({ url, silent: true });

    if (!error) {
      const poolsData = data as any;
      setStakingPools(poolsData);
      setPagination((prev) => ({ ...prev, totalItems: poolsData.length }));
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchStakingPools();
    }
  }, [router.isReady]);

  const filteredPools = stakingPools.filter((pool) =>
    pool.currency.toLowerCase().includes(filter.toLowerCase())
  );

  const paginatedPools = filteredPools.slice(
    (pagination.currentPage - 1) * pagination.perPage,
    pagination.currentPage * pagination.perPage
  );

  useEffect(() => {
    if (router.isReady) {
      fetchStakingPools();
    }
  }, [router.isReady]);

  const openStake = async (pool: StakingPool) => {
    setWallet(null);
    fetchWallet(pool.type, pool.currency);
    setHasStaked(
      Array.isArray(pool.stakingLogs) && pool.stakingLogs.length > 0
    );
    setSelectedPool(pool);
    if (!pool.stakingDurations[0]?.duration) return;
    setSelectedDuration({
      label: `${pool.stakingDurations[0]?.duration} days`,
      value: pool.stakingDurations[0]?.id,
    });
    setAmount(0);
    if (pool.stakingLogs.length > 0) {
      const log = pool.stakingLogs[0];
      if (!log.createdAt) return;
      const durationInDays = log.duration?.duration;
      const endDate = addDays(new Date(log.createdAt), durationInDays);
      const countdown = calculateCountdown(
        log.createdAt,
        endDate.toISOString()
      );
      setCountdown(countdown);
    }
  };

  const [loading, setLoading] = useState(false);
  const handleStake = async () => {
    if (
      getSetting("stakingRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      await router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to purchase this product"));
      return;
    }

    if (!wallet) {
      toast.error("You need to have balance in your wallet to stake");
      return;
    }

    if (!(selectedPool && selectedDuration)) return;
    if (
      amount < selectedPool.minStake ||
      amount > selectedPool.maxStake ||
      amount > wallet.balance
    ) {
      toast.error("Invalid amount");
      return;
    }
    setLoading(true);
    const { error } = await $fetch({
      url: "/api/ext/staking/log",
      method: "POST",
      body: {
        poolId: selectedPool.id,
        durationId: selectedDuration.value,
        amount,
      },
    });
    if (!error) {
      fetchWallet(selectedPool.type, selectedPool.currency);
      fetchStakingPools();
      setSelectedPool(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedPool && hasStaked) {
      const intervalId = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown) {
            const durationInDays =
              selectedPool.stakingLogs[0].duration.duration;
            const endDate = addDays(
              new Date(prevCountdown.startDate),
              durationInDays
            );
            return calculateCountdown(
              prevCountdown.startDate,
              endDate.toISOString()
            );
          }
          return null;
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [selectedPool, hasStaked]);

  const calculateCountdown = (startDate: string, endDate: string) => {
    const now: number = new Date().getTime();
    const start: number = new Date(startDate).getTime();
    const end: number = new Date(endDate).getTime();
    const isStarted: boolean = now >= start;
    const timeRemaining: number = Math.max((end - now) / 1000, 0);
    const totalDuration: number = (end - start) / 1000; // Total duration in seconds
    const progress: number =
      ((totalDuration - timeRemaining) / totalDuration) * 100;
    const days: number = Math.floor(timeRemaining / (60 * 60 * 24));
    const hours: number = Math.floor(
      (timeRemaining % (60 * 60 * 24)) / (60 * 60)
    );
    const minutes: number = Math.floor((timeRemaining % (60 * 60)) / 60);
    const seconds: number = Math.floor(timeRemaining % 60);
    return {
      days,
      hours,
      minutes,
      seconds,
      isStarted,
      progress,
      endDate,
      startDate,
    };
  };

  return (
    <Layout color="muted" title={t("Staking Pool")}>
      <HeaderCardImage
        description="Staking is the process of holding funds in a cryptocurrency wallet to support the operations of a blockchain network. Users are rewarded for simply depositing and holding coins."
        link={"/user/staking/history"}
        linkLabel="View Staking History"
        lottie={{
          category: "cryptocurrency-2",
          path: "payout",
          height: 240,
        }}
        size="lg"
        title={t("Stake your crypto and earn interest on it.")}
      />
      <div className="relative pt-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl">
            <span className="text-primary-500">{t("Staking")}</span>{" "}
            <span className="text-muted-800 dark:text-muted-200">
              {t("Pools")}
            </span>
          </h2>
          <div>
            <Input
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("Search for a pool")}
              type="text"
              value={filter}
            />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {paginatedPools.map((pool, index) => (
            <Card
              className="flex flex-col items-center p-6 sm:flex-row"
              color="contrast"
              key={index}
              shadow="hover"
              shape="smooth"
            >
              <div className="contact flex w-full flex-row items-center justify-start gap-3">
                <div className="relative">
                  <Avatar
                    size="md"
                    src={
                      pool.icon ||
                      `/img/crypto/${pool.currency.toLowerCase()}.webp`
                    }
                  />
                  {pool?.chain && (
                    <MashImage
                      alt="chain"
                      className="absolute right-0 bottom-0 rounded-full"
                      height={16}
                      src={`/img/crypto/${pool.chain.toLowerCase()}.webp`}
                      width={16}
                    />
                  )}
                </div>
                <div className="text-start font-sans">
                  <h4 className="font-medium text-base text-muted-800 leading-tight dark:text-muted-100">
                    {pool.currency} ({pool.name})
                  </h4>
                  <p className="font-sans text-muted-400 text-xs">
                    {pool.description.length > 100
                      ? `${pool.description.slice(0, 100)}...`
                      : pool.description}
                  </p>
                </div>
              </div>
              <div className="my-4 px-4 text-center lg:my-0 lg:me-8 lg:text-start">
                <span className="block text-muted-400 text-xs uppercase leading-snug">
                  {t("Limits")}
                </span>
                <span className="block whitespace-nowrap font-medium text-[1.1rem] text-muted-800 leading-snug dark:text-muted-100">
                  {pool.minStake} - {pool.maxStake} {pool.currency}
                </span>
              </div>
              <div className="status px-4">
                <span className="text-info-500 text-sm">{pool.type}</span>
              </div>
              <div className="my-6 flex items-center justify-center gap-3 lg:my-0 lg:me-8 lg:justify-end" />
              <div className="flex items-center">
                <Button
                  color={"primary"}
                  onClick={() => openStake(pool)}
                  shape={"rounded-sm"}
                >
                  {t("Stake")}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <PaginationControls
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
      <Panel
        isOpen={!!selectedPool}
        onClose={() => setSelectedPool(null)}
        size="xl"
        tableName={t("Stake")}
        title={t("Stake")}
      >
        {selectedPool && (
          <div className="flex flex-col justify-between gap-5 text-muted-800 text-sm dark:text-muted-200">
            <div className="contact flex w-full flex-row items-center justify-center gap-3 lg:justify-start">
              <div className="relative">
                <MashImage
                  alt={selectedPool.currency}
                  className="h-full w-full rounded-full"
                  height={96}
                  src={
                    selectedPool.icon ||
                    `/img/crypto/${selectedPool.currency.toLowerCase()}.webp`
                  }
                  width={96}
                />
                {selectedPool.chain && (
                  <MashImage
                    alt="chain"
                    className="absolute right-0 bottom-0 rounded-full"
                    height={16}
                    src={`/img/crypto/${selectedPool.chain.toLowerCase()}.webp`}
                    width={16}
                  />
                )}
              </div>
              <div className="text-start font-sans">
                <h4 className="font-medium text-base text-muted-800 leading-tight dark:text-muted-100">
                  {selectedPool.currency} ({selectedPool.name})
                </h4>
                <p className="font-sans text-muted-400 text-xs">
                  {selectedPool.description}
                </p>
              </div>
            </div>

            <StakingInfo
              amount={amount}
              hasStaked={hasStaked}
              selectedDuration={selectedDuration}
              selectedPool={selectedPool}
              wallet={{ balance: wallet?.balance }}
            />

            {hasStaked && countdown && (
              <div className="mt-6 w-full">
                <Progress
                  color="success"
                  size="xs"
                  value={countdown.progress}
                />
                <div className="mt-1 flex w-full justify-between text-muted-500 text-xs dark:text-muted-400">
                  <p>{t("Collectable in")}</p>
                  <p>
                    {countdown.days}d {countdown.hours}h {countdown.minutes}m{" "}
                    {countdown.seconds}s{" "}
                    <span className="text-success-500">
                      ({countdown.progress.toFixed(2)}%)
                    </span>
                  </p>
                </div>
              </div>
            )}

            {hasStaked ? (
              <>
                <Card className="w-full p-2">
                  <Button
                    className="w-full"
                    color="primary"
                    disabled
                    onClick={() => {}}
                    shape="rounded-sm"
                  >
                    {t("Collect")}
                  </Button>
                </Card>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-5 md:flex-row">
                  <ListBox
                    label={t("Select Duration")}
                    options={selectedPool.stakingDurations.map(
                      (d) =>
                        ({
                          label: `${d.duration} days`,
                          value: d.id,
                        }) || []
                    )}
                    selected={selectedDuration}
                    setSelected={(d) => {
                      setSelectedDuration(d);
                    }}
                  />
                  <Input
                    label={t("Amount")}
                    onChange={(e) => setAmount(+e.target.value)}
                    type="number"
                    value={amount}
                  />
                </div>
                <Card className="w-full p-2">
                  <Button
                    className="w-full"
                    color="primary"
                    disabled={loading}
                    loading={loading}
                    onClick={handleStake}
                    shape="rounded-sm"
                  >
                    {t("Stake")}
                  </Button>
                </Card>
              </>
            )}
          </div>
        )}
      </Panel>

      <Faq category="STAKING" />
    </Layout>
  );
};
export default StakesDashboard;
