import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import Alert from "@/components/elements/base/alert/Alert";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Input from "@/components/elements/form/input/Input";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const ExchangeProvider = () => {
  const { t } = useTranslation();
  const [updateData, setUpdateData] = useState({
    status: false,
    version: "",
    release_date: "",
    summary: "",
    changelog: null,
    update_id: "",
    message: "",
  });
  const router = useRouter();
  const { productId } = router.query as {
    productId: string;
  };
  const [isUpdating, setIsUpdating] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState("");
  const [envatoUsername, setEnvatoUsername] = useState("");
  const [productName, setProductName] = useState(null);
  const [productTitle, setProductTitle] = useState(null);
  const [productVersion, setProductVersion] = useState("");
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fetchProductData = useCallback(async () => {
    const { data, error } = await $fetch({
      url: `/api/admin/finance/exchange/provider/${productId}`,
      silent: true,
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      const exchangeData = data as any;
      setProductVersion(exchangeData.exchange.version);
      setProductName(exchangeData.exchange.name);
      setProductTitle(exchangeData.exchange.title);
    }
  }, [productId]);
  const debouncedFetchProductData = debounce(fetchProductData, 100);
  useEffect(() => {
    if (router.isReady) {
      debouncedFetchProductData();
    }
  }, [router.isReady, debouncedFetchProductData]);
  const reVerifyLicense = useCallback(async () => {
    const { data, error } = await $fetch({
      url: `/api/admin/finance/exchange/provider/${productId}/verify`,
      method: "POST",
      silent: true,
    });
    if (error) {
      setLicenseVerified(false);
    } else {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setLicenseVerified((data as any).status);
    }
  }, [productId]);
  useEffect(() => {
    if (productId && productName) {
      reVerifyLicense();
    }
  }, [productId, productName, reVerifyLicense]);
  const checkForUpdates = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await $fetch({
      url: "/api/admin/system/update/check",
      method: "POST",
      body: { productId, currentVersion: productVersion },
      silent: true,
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setUpdateData(data as any);
      setUpdateData((prevState) => ({
        ...prevState,
        // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
        message: (data as any).message,
      }));
    }
    setIsLoading(false);
  }, [productId, productVersion]);
  useEffect(() => {
    if (licenseVerified) {
      checkForUpdates();
    }
  }, [licenseVerified, checkForUpdates]);
  const updateSystem = async () => {
    setIsUpdating(true);
    const { error } = await $fetch({
      url: "/api/admin/system/update/download",
      method: "POST",
      body: {
        productId,
        updateId: updateData.update_id,
        version: updateData.version,
        product: productName,
        type: "extension",
      },
    });
    if (!error) {
      setProductVersion(updateData.version);
    }
    setIsUpdating(false);
  };
  const activateLicenseAction = async () => {
    setIsSubmitting(true);
    const { data, error } = await $fetch({
      url: `/api/admin/finance/exchange/provider/${productId}/activate`,
      method: "POST",
      body: { purchaseCode, envatoUsername },
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setLicenseVerified((data as any).status);
    }
    setIsSubmitting(false);
  };
  return (
    <Layout color="muted" title={t("Extension Details")}>
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="text-xl">{productTitle}</h1>
        <BackButton href={`/admin/finance/exchange/provider/${productId}`} />
      </div>
      {licenseVerified ? (
        <div className="flex w-full flex-col items-center justify-center">
          {isLoading ? (
            <div className="flex h-[70vh] w-full items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-5 space-y-5 text-center">
                <IconBox
                  color="info"
                  icon="svg-spinners:blocks-shuffle-3"
                  shape="full"
                  size="xl"
                />
                <h1 className="font-bold text-2xl">
                  {t("Checking for updates")}...
                </h1>
                <p>{t("Please wait while we check for updates")}.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-5 text-start">
              {updateData.status && (
                <Alert
                  canClose={false}
                  className="text-md"
                  color="info"
                  icon="material-symbols-light:info-outline"
                >
                  {t(
                    "Please backup your database and script files before upgrading"
                  )}
                  .
                </Alert>
              )}
              <Alert canClose={false} className="text-md" color={"success"}>
                {updateData.message}
              </Alert>
              {updateData.status && (
                <Card className="space-y-5 p-5">
                  <span className="font-semibold text-gray-800 text-lg dark:text-gray-200">
                    {t("Update Notes")}
                  </span>
                  <div
                    className="prose pl-5"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Changelog HTML from trusted API source
                    dangerouslySetInnerHTML={{
                      __html: updateData.changelog || "",
                    }}
                  />
                  <Button
                    className="w-full"
                    color="success"
                    disabled={updateData.update_id === "" || isUpdating}
                    loading={isUpdating}
                    onClick={updateSystem}
                    type="submit"
                  >
                    {t("Update")}
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-[70vh] w-full items-center justify-center">
          <div className="flex w-full max-w-5xl flex-col items-center justify-center px-4 text-center">
            <h1>{t("Verify your license")}</h1>
            <Card className="mt-8 max-w-md space-y-5 p-5">
              <Input
                label={t("Purchase Code")}
                onChange={(e) => setPurchaseCode(e.target.value)}
                placeholder={t("Enter your purchase code")}
                type="text"
                value={purchaseCode}
              />
              <Input
                label={t("Envato Username")}
                onChange={(e) => setEnvatoUsername(e.target.value)}
                placeholder={t("Enter your Envato username")}
                type="text"
                value={envatoUsername}
              />
              <Button
                className="w-full"
                color="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                onClick={activateLicenseAction}
              >
                {t("Activate License")}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
};
export default ExchangeProvider;
export const permission = "Access Exchange Provider Management";
