import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import Alert from "@/components/elements/base/alert/Alert";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const ExchangeProviderPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { productId } = router.query;
  // biome-ignore lint/suspicious/noExplicitAny: Exchange data structure is dynamic
  const [exchange, setExchange] = useState<any>(null);
  // biome-ignore lint/suspicious/noExplicitAny: Result data structure is dynamic
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fetchExchangeDetails = useCallback(async (id: string) => {
    setLoading(true);
    const { data, error } = await $fetch({
      url: `/api/admin/finance/exchange/provider/${id}`,
      silent: true,
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setExchange((data as any).exchange);
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setResult((data as any).result);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (productId) {
      fetchExchangeDetails(productId as string);
    }
  }, [productId, fetchExchangeDetails]);
  // biome-ignore lint/suspicious/noExplicitAny: Exchange details structure varies by provider
  const exchangeDetails: Record<string, any> = {
    binance: {
      imgSrc: "/img/exchanges/binance.svg",
      supportedCountries: "Countries and Regions",
      link: "https://www.binance.com/en/country-region-selector",
      description:
        "Binance Holdings Ltd., branded Binance, is a global company that operates the largest cryptocurrency exchange in terms of daily trading volume of cryptocurrencies. Binance was founded in 2017 by Changpeng Zhao, a developer who had previously created high-frequency trading software.",
    },
    kucoin: {
      imgSrc: "/img/exchanges/kucoin.svg",
      restrictedCountries:
        "The United States, North Korea, Singapore, Hong Kong, Iran, The Crimean region",
      description:
        "KuCoin is a large cryptocurrency exchange offering the ability to buy, sell, and trade cryptocurrencies. In addition to basic trading options, the platform offers margin, futures, and peer-to-peer (P2P) trading. Users can also choose to stake or lend their crypto to earn rewards.",
    },
    xt: {
      imgSrc: "/img/exchanges/xt.svg",
      restrictedCountries:
        "United States, Canada, Mainland China, Cuba, North Korea, Singapore, Sudan, Syria, Venezuela, Indonesia, Crimea",
      description:
        "XT is a global cryptocurrency exchange that provides a platform for trading more than 100 cryptocurrencies. Since early 2018, XT has been providing a secure, reliable, and advanced digital asset trading platform for global users.",
    },
  };
  const details = exchangeDetails[exchange?.name?.toLowerCase()];
  if (loading) {
    return (
      <Layout color="muted" title={t("Loading...")}>
        <div className="flex h-96 flex-col items-center justify-center gap-5">
          <Icon
            className="h-8 w-8 animate-spin text-primary-500"
            icon="line-md:loading-loop"
          />
          <span className="ml-2 text-muted-600 dark:text-muted-400">
            {t("Loading")} {t("Exchange")}...
          </span>
        </div>
      </Layout>
    );
  }
  return (
    <Layout color="muted" title={`${exchange?.title} Exchange`}>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between md:flex-row">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 md:gap-10">
              {/* biome-ignore lint/performance/noImgElement: External exchange logos */}
              {/* biome-ignore lint/correctness/useImageSize: Dynamic sizing with CSS */}
              <img
                alt={exchange?.title || "Exchange logo"}
                className="w-24 md:w-48"
                src={details?.imgSrc}
              />
              <div className="flex gap-2 text-md">
                <Tag>{exchange?.version}</Tag>
                <Tag color={exchange?.status ? "success" : "danger"}>
                  {exchange?.status ? "Active" : "Inactive"}
                </Tag>
              </div>
            </div>
            <div className="flex flex-col gap-4 text-md">
              {details?.supportedCountries && (
                <div>
                  <p className="text-muted-800 dark:text-muted-200">
                    {t("Supported Countries")}
                  </p>
                  <Link
                    className="text-primary-500 underline dark:text-primary-400"
                    href={details?.link}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {details?.supportedCountries}
                  </Link>
                </div>
              )}
              {details?.restrictedCountries && (
                <p className="text-muted-600 dark:text-muted-400">
                  {t("Restricted Countries")} {details?.restrictedCountries}
                </p>
              )}
              <p className="text-muted-600 dark:text-muted-400">
                {details?.description}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2 md:mt-0">
            {!exchange?.licenseStatus && (
              <Link
                href={`/admin/finance/exchange/provider/${exchange?.productId}/license`}
              >
                <Button className="ml-2" color="primary" shape={"rounded-sm"}>
                  {t("Activate License")}
                </Button>
              </Link>
            )}
            <BackButton href="/admin/finance/exchange" />
          </div>
        </div>
        {result && (
          <Alert
            canClose={false}
            className="mt-6"
            color={result.status ? "success" : "danger"}
            label={
              <div className="text-xl">
                {result.status ? "Success!" : "Error!"}{" "}
                <span className="text-muted-600 dark:text-muted-400">
                  {result.status
                    ? "Credentials are valid"
                    : "Credentials are invalid"}
                </span>
              </div>
            }
            sublabel={
              <div className="text-md">
                {result.message}
                {result.status === false && (
                  <>
                    <p className="mt-4 text-primary-500 dark:text-primary-400">
                      {t(
                        "Please check your credentials in the .env file and try again. Note that any changes to the .env file will require a server restart."
                      )}
                    </p>
                    <p className="mt-4 text-muted-600 dark:text-muted-400">
                      {t(
                        "If you don&apos;t have the credentials, please visit the exchange website to create an API key, secret, and passphrase (if required)."
                      )}
                    </p>
                    <p className="text-muted-600 dark:text-muted-400">
                      {t(
                        "Once you have the credentials, add them to your .env file as shown below"
                      )}
                    </p>
                    <div className="prose mt-4 max-w-xl text-muted-600 text-sm dark:text-muted-400">
                      <pre>
                        <li>APP_{exchange?.name?.toUpperCase()}_API_KEY</li>
                        <li>APP_{exchange?.name?.toUpperCase()}_API_SECRET</li>
                        {exchange?.name?.toUpperCase() === "BINANCE" && (
                          <li>
                            APP_{exchange?.name?.toUpperCase()}_API_PASSPHRASE
                          </li>
                        )}
                      </pre>
                    </div>
                    <p className="mt-4 text-muted-600 dark:text-muted-400">
                      {t(
                        "If you&apos;re still having issues, please check the following"
                      )}
                    </p>
                    <ul className="mt-4 list-inside list-disc text-info-500 dark:text-info-400">
                      <li>
                        {t(
                          "You may also need to whitelist your server IP address in the exchange settings."
                        )}
                      </li>
                      <li>
                        {t(
                          "Make sure you enable all permissions except those that prevent withdrawals to unlisted addresses."
                        )}
                      </li>
                      <li>
                        {t(
                          "If this is your first time using this exchange, make sure your account is new and KYC is verified."
                        )}
                      </li>
                    </ul>
                  </>
                )}
              </div>
            }
          />
        )}
        <hr className="my-6 border-muted-300 border-t dark:border-muted-700" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <CardLink
            href="/admin/finance/exchange/market"
            icon="mdi:chart-line"
            label={t("Markets")}
          />
          <CardLink
            href="/admin/finance/currency/spot"
            icon="mdi:currency-usd"
            label={t("Currencies")}
          />
          <CardLink
            disabled={result?.status === false}
            href="/admin/finance/exchange/balance"
            icon="mdi:wallet"
            label={t("Balances")}
          />
          <CardLink
            disabled={result?.status === false}
            href="/admin/finance/exchange/fee"
            icon="mdi:cash-multiple"
            label={t("Fees")}
          />
        </div>
      </main>
    </Layout>
  );
};
const CardLink = ({
  icon,
  label,
  href,
  disabled,
}: {
  icon: string;
  label: string;
  href: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();
  if (disabled) {
    return (
      <Tooltip content={t("Please check your credentials before proceeding")}>
        <Card className="flex cursor-not-allowed items-center bg-muted-100 p-4 dark:bg-muted-800">
          <Icon
            className="mr-4 h-8 w-8 text-muted-400 dark:text-muted-400"
            icon={icon}
          />
          <span className="text-muted-400 dark:text-muted-400">{label}</span>
        </Card>
      </Tooltip>
    );
  }
  return (
    <Link href={href}>
      <Card className="flex cursor-pointer items-center p-4 hover:bg-muted-100 dark:hover:bg-muted-800">
        <Icon
          className="mr-4 h-8 w-8 text-muted-600 dark:text-muted-400"
          icon={icon}
        />
        <span className="text-muted-800 dark:text-muted-100">{label}</span>
      </Card>
    </Link>
  );
};
export default ExchangeProviderPage;
export const permission = "Access Exchange Provider Management";
