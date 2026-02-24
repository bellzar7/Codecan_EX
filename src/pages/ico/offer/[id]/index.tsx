import { Icon } from "@iconify/react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Countdown from "@/components/elements/addons/Countdown/Default";
import Avatar from "@/components/elements/base/avatar/Avatar";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Progress from "@/components/elements/base/progress/Progress";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";
import { ErrorPage, NotFound } from "@/components/ui/Errors";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet";
import $fetch, { $serverFetch } from "@/utils/api";
import { formatLargeNumber } from "@/utils/market";

type Token = {
  id: string;
  projectId: string;
  saleAmount: number;
  name: string;
  chain: string;
  currency: string;
  purchaseCurrency: string;
  purchaseWalletType: string;
  address: string;
  totalSupply: number;
  description: string;
  image: string;
  status: string;
  phases: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    price: number;
    status: string;
    contributions: number;
    contributionPercentage: number;
    minPurchase: number;
    maxPurchase: number;
  }[];
  icoAllocation: {
    id: string;
    name: string;
    percentage: number;
  };
  project: {
    id: string;
    name: string;
    description: string;
    website: string;
    whitepaper: string;
  };
};

interface Props {
  token?: Token;
  error?: string;
}

const OfferDetails: React.FC<Props> = ({ token: initialToken, error }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [token, setToken] = useState<Token | null>(initialToken || null);
  const { profile, getSetting } = useDashboardStore();
  const { wallet, fetchWallet } = useWalletStore();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (
      token &&
      (!wallet ||
        (wallet &&
          wallet.type !== token.purchaseWalletType &&
          wallet.currency !== token.purchaseCurrency))
    ) {
      fetchWallet(token.purchaseWalletType, token.purchaseCurrency);
    }
  }, [token, wallet]);

  if (!token) {
    return (
      <NotFound
        description={t("We couldn't find the token details.")}
        link="/ico"
        linkTitle={t("Back to ICO Dashboard")}
        title={t("Token Not Found")}
      />
    );
  }

  if (error) {
    return (
      <ErrorPage
        description={t(error)}
        link="/ico"
        linkTitle={t("Back to ICO Dashboard")}
        title={t("Error")}
      />
    );
  }

  const activePhase = token.phases.find((phase) => phase.status === "ACTIVE");

  const fetchToken = async () => {
    const { data, error } = await $fetch({
      url: `/api/ext/ico/offer/${id}`,
      silent: true,
    });

    if (error) {
      toast.error(t("Failed to fetch token details."));
    } else {
      setToken(data as any);
    }
  };

  const purchase = async () => {
    if (!activePhase) return;

    if (
      getSetting("icoRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      await router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to participate in ICO"));
      return;
    }

    const { error } = await $fetch({
      url: "/api/ext/ico/contribution",
      method: "POST",
      body: { amount, phaseId: activePhase.id },
    });

    if (!error) {
      fetchWallet(token.purchaseWalletType, token.purchaseCurrency);
      await fetchToken(); // Refetch token details to update UI
      setAmount(0);
    }
  };

  return (
    <Layout color="muted" title={`${token?.name} Details`}>
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
        <h2 className="text-2xl">
          <span className="text-primary-500">{token?.name} </span>
          <span className="text-muted-800 dark:text-muted-200">
            {t("Details")}
          </span>
        </h2>

        <BackButton href={`/ico/project/${token?.projectId}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1 space-y-5 md:col-span-2 xl:col-span-3">
          <Card
            className="flex flex-col items-center p-6 text-muted-800 sm:flex-row dark:text-muted-200"
            color="contrast"
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <div className="relative">
                <Avatar size="xl" src={token?.image} text={token?.currency} />
                {token?.chain && (
                  <MashImage
                    alt="chain"
                    className="absolute right-0 bottom-0"
                    height={24}
                    src={`/img/crypto/${token.chain?.toLowerCase()}.webp`}
                    width={24}
                  />
                )}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-medium font-sans text-base">
                  {token?.currency} ({token?.name})
                </h4>
                <p className="font-sans text-muted-400 text-sm">
                  {token?.description}
                </p>
              </div>
            </div>
          </Card>
          <Card
            className="p-4 text-muted-800 text-sm dark:text-muted-200"
            color="contrast"
          >
            <h3 className="mb-2 text-start font-bold">{t("Token Details")}</h3>
            <ul className="flex flex-col gap-2">
              <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                <strong>{t("Name")}</strong> {token?.name}
              </li>
              <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                <strong>{t("Address")}</strong> {token?.address}
              </li>
              <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                <strong>{t("Project Name")}</strong> {token?.project.name}
              </li>
              <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                <strong>{t("Project Description")}</strong>{" "}
                {token?.project.description}
              </li>
              <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                <strong>{t("Project Website")}</strong>
                <a
                  className="text-primary-500"
                  href={token?.project.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {token?.project.website}
                </a>
              </li>
              <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                <strong>{t("Project Whitepaper")}</strong>
                <p>{token?.project.whitepaper}</p>
              </li>
              <li className="flex justify-between">
                <strong>{t("Total Supply")}</strong> {token?.totalSupply}{" "}
                {token?.currency}
              </li>
            </ul>
          </Card>
          {activePhase && (
            <Card
              className="flex flex-col justify-between p-4 text-muted-800 text-sm sm:flex-row dark:text-muted-200"
              color="contrast"
            >
              <div className="w-full">
                <h3 className="mb-2 text-start font-bold">
                  {t("Active Phase Details")}
                </h3>
                <ul className="flex flex-col gap-2">
                  <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                    <strong>{t("Price")}</strong>
                    <span>
                      {activePhase.price} {token?.purchaseCurrency}
                    </span>
                  </li>
                  <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                    <strong>{t("Min Purchase Amount")}</strong>
                    <span>
                      {activePhase.minPurchase} {token?.purchaseCurrency}
                    </span>
                  </li>
                  <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                    <strong>{t("Max Purchase Amount")}</strong>
                    <span>
                      {activePhase.maxPurchase} {token?.purchaseCurrency}
                    </span>
                  </li>
                  <li className="flex justify-between border-muted-200 border-b dark:border-muted-800">
                    <strong>{t("Start Date")}</strong>
                    <span>
                      {format(parseISO(activePhase.startDate), "PPpp")}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <strong>{t("End Date")}</strong>
                    <span>{format(parseISO(activePhase.endDate), "PPpp")}</span>
                  </li>
                </ul>
              </div>
            </Card>
          )}
        </div>
        <div className="space-y-5">
          <Card
            className="space-y-5 text-muted-800 dark:text-muted-200"
            color="contrast"
          >
            <div className="w-full border-gray-200 border-b p-4 text-center dark:border-gray-700">
              <div className="w-full">
                {activePhase && (
                  <Countdown
                    endDate={activePhase.endDate}
                    onExpire={() => fetchToken()}
                    startDate={activePhase.startDate} // Optional: Refetch token or trigger an action when countdown ends
                  />
                )}
              </div>
            </div>
            <div className="w-full grow space-y-1 px-4 pb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium font-sans text-muted-700 text-sm dark:text-muted-100">
                  {t("Progress")}
                </h4>
                <div>
                  <span className="font-sans text-muted-400 text-sm">
                    {activePhase?.contributionPercentage?.toFixed(6) ?? 0}%
                  </span>
                </div>
              </div>
              <Progress
                color="primary"
                size="xs"
                value={activePhase?.contributionPercentage ?? 0}
              />
            </div>
            {activePhase && (
              <>
                <div className="border-muted-200 border-t px-4 pt-4 dark:border-muted-800">
                  <Input
                    label={t("Amount")}
                    max={
                      wallet
                        ? wallet.balance > activePhase.maxPurchase
                          ? activePhase.maxPurchase
                          : wallet?.balance
                        : activePhase.maxPurchase
                    }
                    min={activePhase.minPurchase}
                    onChange={(e) =>
                      setAmount(Number.parseFloat(e.target.value))
                    }
                    placeholder={t("Enter amount")}
                    type="number"
                    value={amount}
                  />
                </div>
                <div className="flex items-center justify-between px-4 pt-0 text-xs">
                  <span className="text-muted-800 dark:text-muted-200">
                    {t("Balance")}
                  </span>
                  <span className="flex items-center justify-center gap-1">
                    {wallet?.balance ?? 0} {token?.purchaseCurrency}
                    <Link href={"/user/wallet/deposit"}>
                      <Icon
                        className="h-5 w-5 text-success-500"
                        icon="ei:plus"
                      />
                    </Link>
                  </span>
                </div>
                <div className="px-4 pb-4">
                  <Button
                    className="w-full"
                    color="primary"
                    disabled={
                      !amount ||
                      amount < activePhase.minPurchase ||
                      amount > activePhase.maxPurchase ||
                      (wallet ? amount > wallet.balance : false)
                    }
                    onClick={() => purchase()}
                    shape="rounded-sm"
                    type="button"
                  >
                    {t("Purchase")}
                  </Button>
                </div>
              </>
            )}
          </Card>

          <Card className="text-muted-800 dark:text-muted-200" color="contrast">
            <div className="w-full">
              <div className="flex flex-col gap-1 border-muted-200 border-b p-4 text-center dark:border-muted-800">
                <h3 className="font-sans font-semibold text-md">
                  {activePhase?.name}
                </h3>
                <p className="font-sans text-muted-400 text-xs uppercase">
                  {t("Phase")}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-muted-200 border-b p-4 text-center dark:border-muted-800">
                <h3 className="font-sans font-semibold text-md">
                  {formatLargeNumber(token?.saleAmount || 0)}
                </h3>
                <p className="font-sans text-muted-400 text-xs uppercase">
                  {t("Sale Amount")}
                </p>
              </div>
              <div className="flex flex-col gap-1 border-muted-200 border-b p-4 text-center dark:border-muted-800">
                <h3 className="font-sans font-semibold text-md">
                  {activePhase?.contributions ?? 0}
                </h3>
                <p className="font-sans text-muted-400 text-xs uppercase">
                  {t("Contributions")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  const { id } = context.params;

  try {
    const { data, error } = await $serverFetch(context, {
      url: `/api/ext/ico/offer/${id}`,
    });

    if (error || !data) {
      return {
        props: {
          error: error || "Unable to fetch token details.",
        },
      };
    }

    return {
      props: {
        token: data,
      },
    };
  } catch (error) {
    console.error("Error fetching token details:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default OfferDetails;
