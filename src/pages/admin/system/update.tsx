import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Alert from "@/components/elements/base/alert/Alert";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import Layout from "@/layouts/Default";
import $fetch, { $serverFetch } from "@/utils/api"; // Ensure $fetch is imported correctly
import "react-loading-skeleton/dist/skeleton.css";
import { useDashboardStore } from "@/stores/dashboard";

interface UpdateData {
  status: boolean;
  message: string;
  changelog: string | null;
  update_id: string;
  version: string;
}

interface Props {
  initialProductId: string;
  initialProductVersion: string;
  initialLicenseVerified: boolean;
  initialUpdateData: UpdateData;
}

const SystemUpdate: React.FC<Props> = ({
  initialProductId,
  initialProductVersion,
  initialLicenseVerified,
  initialUpdateData,
}) => {
  const { t } = useTranslation();
  const { isDark } = useDashboardStore();

  const [updateData, setUpdateData] = useState<UpdateData>(initialUpdateData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [purchaseCode, setPurchaseCode] = useState("");
  const [envatoUsername, setEnvatoUsername] = useState("");
  const [productId, setProductId] = useState(initialProductId);
  const [productName] = useState("bicrypto");
  const [productVersion, setProductVersion] = useState(initialProductVersion);
  const [licenseVerified, setLicenseVerified] = useState(
    initialLicenseVerified
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const externalNotesUrl = "https://support.mash3div.com/pages/5/update-notes";
  const [isUpdateChecking, setIsUpdateChecking] = useState(false);

  const [skeletonProps, setSkeletonProps] = useState({
    baseColor: "#f7fafc",
    highlightColor: "#edf2f7",
  });

  useEffect(() => {
    setSkeletonProps({
      baseColor: isDark ? "#27272a" : "#f7fafc",
      highlightColor: isDark ? "#3a3a3e" : "#edf2f7",
    });
  }, [isDark]);

  const safeFetch = async (config: any) => {
    // A wrapper to handle `$fetch` safely
    try {
      const response = await $fetch(config);
      // Assuming $fetch returns { data, error }
      if (response.error) {
        console.error("Fetch Error:", response.error);
        return { data: null, error: response.error };
      }
      return response;
    } catch (err) {
      console.error("Fetch Exception:", err);
      return { data: null, error: err };
    }
  };

  const checkForUpdates = async () => {
    if (!(productId && productVersion)) return;
    setIsUpdateChecking(true);
    const { data, error } = await safeFetch({
      url: "/api/admin/system/update/check",
      method: "POST",
      body: { productId, currentVersion: productVersion },
      silent: true,
    });
    if (data && !error) {
      const updateInfo = data as any;
      setUpdateData({
        ...updateInfo,
        message: updateInfo.message || "Update information retrieved.",
      } as any);
    } else {
      setUpdateData((prev) => ({
        ...prev,
        status: false,
        message:
          (data as any)?.message ||
          "Unable to retrieve update information due to a network error.",
      }));
    }
    setIsUpdateChecking(false);
  };

  const updateSystem = async () => {
    setIsUpdating(true);
    const { error } = await safeFetch({
      url: "/api/admin/system/update/download",
      method: "POST",
      body: {
        productId,
        updateId: updateData.update_id,
        version: updateData.version,
        product: productName,
      },
    });
    if (error) {
      setUpdateData((prev) => ({
        ...prev,
        message: "Failed to update system. Please try again later.",
      }));
    } else {
      setProductVersion(updateData.version);
      setUpdateData((prev) => ({
        ...prev,
        message: "Update completed successfully.",
      }));
    }
    setIsUpdating(false);
  };

  const activateLicenseAction = async () => {
    setIsSubmitting(true);
    const { data, error } = await safeFetch({
      url: "/api/admin/system/license/activate",
      method: "POST",
      body: { productId, purchaseCode, envatoUsername },
    });
    if (data && !error) {
      const licenseData = data as any;
      setLicenseVerified(licenseData.status);
      if (!licenseData.status) {
        setUpdateData((prev) => ({
          ...prev,
          message: "License activation failed. Please check your details.",
        }));
      }
    } else {
      setUpdateData((prev) => ({
        ...prev,
        message: "Error activating license. Please try again.",
      }));
    }
    setIsSubmitting(false);
  };

  const noUpdateAvailable =
    !updateData.status &&
    updateData.message === "You have the latest version of Bicrypto.";

  const errorOrFallbackScenario =
    !updateData.status &&
    updateData.message !== "You have the latest version of Bicrypto." &&
    updateData.message !== "";

  return (
    <Layout color="muted" title={t("System Update")}>
      {/* Top Bar */}
      <div className="mb-8 flex w-full items-center justify-between text-muted-800 dark:text-muted-200">
        <div className="flex flex-col space-y-1">
          <h1 className="font-bold text-2xl">{t("System Update")}</h1>
          <p className="text-muted-600 text-sm dark:text-muted-400">
            {t("Current Version")}:{" "}
            <span className="font-medium text-info-500">{productVersion}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`h-4 w-4 animate-pulse rounded-full ${
              licenseVerified ? "bg-green-500" : "bg-red-500"
            }`}
            title={
              licenseVerified
                ? t("License Verified")
                : t("License Not Verified")
            }
          />
          <span className="text-sm">
            {licenseVerified
              ? t("License Verified")
              : t("License Not Verified")}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Section (2/3) */}
        <div className="col-span-2 space-y-6">
          {isUpdateChecking ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton height={48} {...skeletonProps} />
              </div>
              <Card className="space-y-5 border border-muted-200 p-5 shadow-xs dark:border-muted-700">
                <div className="space-y-4">
                  <Skeleton height={20} width={120} {...skeletonProps} />
                  <Skeleton count={3} {...skeletonProps} />
                  <Skeleton height={12} width={100} {...skeletonProps} />
                </div>
              </Card>
            </div>
          ) : (
            <>
              {updateData.status && (
                <div className="space-y-3">
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
                  {updateData.message && (
                    <Alert canClose={false} className="text-md" color="success">
                      {updateData.message}
                    </Alert>
                  )}
                </div>
              )}

              {noUpdateAvailable && (
                <>
                  <Alert canClose={false} className="text-md" color="success">
                    {updateData.message}
                  </Alert>
                  <Card className="flex flex-col space-y-5 border border-muted-200 p-5 shadow-xs dark:border-muted-700">
                    <h3 className="font-semibold text-gray-800 text-xl dark:text-gray-200">
                      {t("Update Notes")}
                    </h3>
                    <p className="text-muted-600 text-sm dark:text-muted-400">
                      {t(
                        "There are no updates available for your system at this time."
                      )}
                    </p>
                    <a
                      className="text-info-600 text-sm underline hover:text-info-500"
                      href={externalNotesUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {t("View Changelog")}
                    </a>
                  </Card>
                </>
              )}

              {errorOrFallbackScenario && (
                <Alert canClose={false} className="text-md" color="warning">
                  {updateData.message ||
                    t("Unable to retrieve update information.")}
                </Alert>
              )}

              {updateData.status && updateData.changelog && (
                <Card className="space-y-5 border border-muted-200 p-5 shadow-xs dark:border-muted-700">
                  <h3 className="font-semibold text-gray-800 text-xl dark:text-gray-200">
                    {t("Update Notes")}
                  </h3>
                  <div
                    className="prose dark:prose-dark max-h-96 overflow-auto pl-5 text-muted-800 text-sm dark:text-muted-200"
                    dangerouslySetInnerHTML={{
                      __html: updateData.changelog || "",
                    }}
                  />
                  <a
                    className="text-info-600 text-sm underline hover:text-info-500"
                    href={externalNotesUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t("View Changelog")}
                  </a>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Right Section (1/3) */}
        <div className="col-span-1 space-y-6">
          <Card className="space-y-5 border border-muted-200 p-5 shadow-xs dark:border-muted-700">
            <h3 className="font-semibold text-gray-800 text-lg dark:text-gray-200">
              {t("Update Actions")}
            </h3>
            <p className="text-muted-600 text-sm dark:text-muted-400">
              {updateData.status
                ? t(
                    "Update to the latest version once your license is verified."
                  )
                : t("No updates available, but you can re-check at any time.")}
            </p>
            {isUpdateChecking ? (
              <div className="space-y-4">
                <Skeleton height={32} width="100%" {...skeletonProps} />
                <Skeleton height={32} width="100%" {...skeletonProps} />
              </div>
            ) : (
              <>
                <Button
                  className="w-full"
                  color="success"
                  disabled={
                    !(updateData.status && licenseVerified) ||
                    updateData.update_id === "" ||
                    isUpdating
                  }
                  loading={isUpdating}
                  onClick={updateSystem}
                  type="submit"
                >
                  {t("Update")}
                </Button>
                <Button
                  className="w-full"
                  color="primary"
                  disabled={isUpdateChecking}
                  loading={isUpdateChecking}
                  onClick={checkForUpdates}
                  type="button"
                >
                  {t("Check for Updates")}
                </Button>
              </>
            )}
          </Card>

          {!licenseVerified && (
            <Card className="space-y-5 border border-muted-200 p-5 shadow-xs dark:border-muted-700">
              <h4 className="font-semibold text-gray-800 text-md dark:text-gray-200">
                {t("License Verification")}
              </h4>
              <p className="text-muted-600 text-sm dark:text-muted-400">
                {t(
                  "Please enter your purchase details to verify your license."
                )}
              </p>
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export const permission = "Access System Update Management";

export async function getServerSideProps(context: any) {
  // Safe server-side fetch wrapper
  const safeServerFetch = async (config: any) => {
    try {
      const response = await $serverFetch(context, config);
      if (response.error) {
        console.error("Server Fetch Error:", response.error);
        return { data: null, error: response.error };
      }
      return response;
    } catch (err) {
      console.error("Server Fetch Exception:", err);
      return { data: null, error: err };
    }
  };

  try {
    const productResponse = await safeServerFetch({
      url: "/api/admin/system/product",
    });

    const productId = productResponse.data?.id || "";
    const productVersion = productResponse.data?.version || "";

    let licenseVerified = false;
    let updateData: UpdateData = {
      status: false,
      message: "You have the latest version of Bicrypto.",
      changelog: null,
      update_id: "",
      version: productVersion,
    };

    if (productId) {
      const licenseVerification = await safeServerFetch({
        url: "/api/admin/system/license/verify",
        method: "POST",
        body: { productId },
      });
      licenseVerified = licenseVerification?.data?.status ?? false;
    }

    if (productId && productVersion) {
      const updateCheck = await safeServerFetch({
        url: "/api/admin/system/update/check",
        method: "POST",
        body: { productId, currentVersion: productVersion },
      });
      if (updateCheck.data) {
        updateData = {
          ...updateData,
          ...updateCheck.data,
        };
      } else if (updateCheck.error) {
        updateData.message =
          "Unable to check for updates at this time. Please try again later.";
      }
    }

    return {
      props: {
        initialProductId: productId,
        initialProductVersion: productVersion,
        initialLicenseVerified: licenseVerified,
        initialUpdateData: updateData,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        initialProductId: "",
        initialProductVersion: "",
        initialLicenseVerified: false,
        initialUpdateData: {
          status: false,
          message: "Unable to check for updates at this time.",
          changelog: null,
          update_id: "",
          version: "",
        },
      },
    };
  }
}

export default SystemUpdate;
