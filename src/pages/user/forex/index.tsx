import { Icon } from "@iconify/react";
import { debounce } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import { DataTable } from "@/components/elements/base/datatable";
import ImagePortal from "@/components/elements/imagePortal";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";
import { statusOptions } from "@/utils/constants";

const api = "/api/ext/forex/transaction";
const columnConfig: ColumnConfigType[] = [
  {
    field: "createdAt",
    label: "Date",
    type: "datetime",
    sortable: true,
    filterable: false,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    options: [
      {
        value: "FOREX_DEPOSIT",
        label: "Deposit",
        color: "success",
      },
      {
        value: "FOREX_WITHDRAW",
        label: "Withdrawal",
        color: "danger",
      },
    ],
    sortable: true,
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "fee",
    label: "Fee",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: statusOptions,
  },
];
const ImageItem = ({ label, src, openLightbox }) => (
  <div>
    <div className="group relative">
      <a className="block cursor-pointer" onClick={() => openLightbox(src)}>
        <img
          alt={label}
          className="rounded-lg"
          height="180"
          loading="lazy"
          src={src || "/img/placeholder.svg"}
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Icon className="text-3xl text-white" icon="akar-icons:eye" />
        </div>
      </a>
    </div>
  </div>
);
const ForexAccountsDashboard = () => {
  const { t } = useTranslation();
  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();
  const [accounts, setAccounts] = useState<{
    [key: string]: ForexAccount;
  }>({});
  const [singals, setSignals] = useState<ForexSignal[]>([]);
  const [demoPasswordUnlocked, setDemoPasswordUnlocked] = useState(false);
  const [livePasswordUnlocked, setLivePasswordUnlocked] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = (image: string) => {
    setCurrentImage(image);
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };
  const fetchForexAccounts = async () => {
    const url = "/api/ext/forex/account";
    const { data, error } = await $fetch({
      url,
      silent: true,
    });
    if (!error) {
      const accountsData = data as any;
      setAccounts(accountsData);
      if (accountsData["LIVE"] && accountsData["LIVE"].accountSignals) {
        setSignals(accountsData["LIVE"].accountSignals);
      }
    }
  };
  const debounceFetchForexAccounts = debounce(fetchForexAccounts, 100);
  useEffect(() => {
    if (router.isReady) {
      debounceFetchForexAccounts();
    }
  }, [router.isReady]);
  useEffect(() => {
    if (
      router.isReady &&
      getSetting("forexRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to access forex accounts"));
    }
  }, [router.isReady, profile?.kyc?.status]);

  return (
    <Layout color="muted" title={t("Forex Accounts")}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
        <div className="col-span-12 ltablet:col-span-8 lg:col-span-8">
          <HeaderCardImage
            description={
              getSetting("forexInvestment") === "true"
                ? "Choose from a variety of investment plans to grow your wealth."
                : "Trade forex with ease and confidence."
            }
            link={
              getSetting("forexInvestment") === "true"
                ? "/user/invest/forex/plan"
                : undefined
            }
            linkLabel="View Investment Plans"
            lottie={{
              category: "stock-market-2",
              path: "capital-funding",
              max: 2,
              height: getSetting("forexInvestment") === "true" ? 220 : 200,
            }}
            size="md"
            title={t("Forex")}
          />

          <div className="mt-3">
            <DataTable
              columnConfig={columnConfig}
              endpoint={api}
              hasBreadcrumb={false}
              hasRotatingBackButton={false}
              hasStructure={false}
              isCrud={false}
              paginationLocation="static"
              postTitle={t("Forex")}
              title={t("Transactions")}
            />
          </div>
          {singals && singals.length > 0 && (
            <div className="mt-6">
              <div className="mb-4">
                <h2 className="text-muted-800 text-xl dark:text-muted-200">
                  {t("Signals")}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
                {singals.map((signal, index) => (
                  <Card
                    className="relative col-span-4 text-md"
                    color={"contrast"}
                    key={index}
                  >
                    <ImageItem
                      label={signal.title}
                      openLightbox={openLightbox}
                      src={signal.image}
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="col-span-12 ltablet:col-span-4 mt-0 flex flex-col gap-6 md:mt-6 lg:col-span-4">
          {Object.values(accounts).map((account, index) => (
            <Card className="relative text-md" color={"contrast"} key={index}>
              {!account.accountId && (
                <div className="absolute z-10 h-full w-full rounded-lg bg-white bg-opacity-50 backdrop-blur-xs dark:bg-black dark:bg-opacity-50">
                  <div className="flex h-full flex-col items-center justify-center">
                    <Icon
                      className="h-10 w-10 text-info-500"
                      icon="svg-spinners:blocks-shuffle-3"
                    />
                    <span className="mt-2 text-muted-500 text-sm">
                      {t("Account not ready yet")}
                    </span>
                  </div>
                </div>
              )}
              <div className="h-full w-full p-5">
                <div className="mb-5">
                  <Link href={`/user/forex/${account.id}`}>
                    <Button
                      className="w-full"
                      color="primary"
                      disabled={!account.status || account.balance === 0}
                      shape="rounded-sm"
                      type="button"
                    >
                      {account.type} {t("Trade")}
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-500">{t("Account ID")}</span>
                  <span className="text-muted-800 dark:text-muted-100">
                    {account.accountId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-500">{t("Password")}</span>
                  <span className="flex items-center gap-2 text-muted-800 dark:text-muted-100">
                    <span>
                      {account.type === "DEMO"
                        ? demoPasswordUnlocked
                          ? account.password
                          : "*********"
                        : account.type === "LIVE"
                          ? livePasswordUnlocked
                            ? account.password
                            : "*********"
                          : "N/A"}
                    </span>
                    <Icon
                      className="cursor-pointer"
                      icon={
                        account.type === "DEMO"
                          ? demoPasswordUnlocked
                            ? "bi:eye"
                            : "bi:eye-slash"
                          : livePasswordUnlocked
                            ? "bi:eye"
                            : "bi:eye-slash"
                      }
                      onClick={() => {
                        if (account.type === "DEMO") {
                          setDemoPasswordUnlocked(!demoPasswordUnlocked);
                        } else if (account.type === "LIVE") {
                          setLivePasswordUnlocked(!livePasswordUnlocked);
                        }
                      }}
                    />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-500">{t("Leverage")}</span>
                  <span className="text-muted-800 dark:text-muted-100">
                    x{account.leverage}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-500">{t("MetaTrader")}</span>
                  <span className="text-muted-800 dark:text-muted-100">
                    {account.mt}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-500">{t("Balance")}</span>
                  <span className="text-muted-800 dark:text-muted-100">
                    {account.balance}
                  </span>
                </div>
                {account.type === "LIVE" && (
                  <div className="mt-5 flex items-center justify-center gap-5">
                    <a
                      className="w-full"
                      href={`/user/forex/${account.id}/deposit`}
                    >
                      <Button
                        className="w-full"
                        color="success"
                        disabled={!account.status}
                        shape="rounded-sm"
                        type="button"
                      >
                        <span>{t("Deposit")}</span>
                      </Button>
                    </a>
                    <a
                      className="w-full"
                      href={`/user/forex/${account.id}/withdraw`}
                    >
                      <Button
                        className="w-full"
                        color="danger"
                        disabled={!account.status || account.balance === 0}
                        shape="rounded-sm"
                        type="button"
                      >
                        <span>{t("Withdraw")}</span>
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Faq category="FOREX" />
      {isLightboxOpen && (
        <ImagePortal onClose={closeLightbox} src={currentImage} />
      )}
    </Layout>
  );
};
export default ForexAccountsDashboard;
