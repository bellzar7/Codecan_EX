import { Icon } from "@iconify/react";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const statusClassMap = {
  APPROVED:
    "text-success-700 bg-success-100 border border-success-300 rounded-lg dark:bg-muted-900 dark:border-success-800 dark:text-success-400",
  PENDING:
    "text-info-700 bg-info-100 border border-info-300 rounded-lg dark:bg-muted-900 dark:border-info-800 dark:text-info-400",
  REJECTED:
    "text-danger-700 bg-danger-100 border border-danger-300 rounded-lg dark:bg-muted-900 dark:border-danger-800 dark:text-danger-400",
  MUTED:
    "text-muted-900 bg-muted-100 border border-muted-300 rounded-lg dark:bg-muted-900 dark:border-muted-700 dark:text-muted-400",
};
const IdentityVerification: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const router = useRouter();
  const [lastLevel, setLastLevel] = useState(0);
  const [level, setLevel] = useState(0);
  const [statusClass, setStatusClass] = useState(statusClassMap["MUTED"]);
  const [statusIcon, setStatusIcon] = useState("");

  const checkStatus = async () => {
    const kycLevel = Number.parseInt(profile?.kyc?.level || "0");
    setLevel(kycLevel);
    setStatusClass(statusClassMap[profile?.kyc?.status || "MUTED"]);
    setStatusIcon(() => {
      switch (profile?.kyc?.status) {
        case "APPROVED":
          return "line-md:confirm";
        case "PENDING":
          return "line-md:loading-alt-loop";
        case "REJECTED":
          return "line-md:close";
        default:
          return "";
      }
    });
  };

  const fetchActiveKycTemplate = async () => {
    const { data, error } = await $fetch({
      url: "/api/user/kyc/template",
      silent: true,
    });
    if (!error) {
      const options = (data as any).options;
      const customFields = (data as any).customOptions;
      updateLastLevel({ ...options, ...customFields });
    }
  };

  const debouncedFetchActiveKycTemplate = debounce(fetchActiveKycTemplate, 100);

  useEffect(() => {
    if (router.isReady && profile) {
      checkStatus();
      debouncedFetchActiveKycTemplate();
    }
  }, [router.isReady, profile]);

  const updateLastLevel = (fields: Record<string, any>) => {
    let maxLevel = 0;
    for (const key in fields) {
      if (
        fields[key].enabled &&
        Number.parseInt(fields[key].level) > maxLevel
      ) {
        maxLevel = Number.parseInt(fields[key].level);
      }
    }
    setLastLevel(maxLevel);
  };

  const getKycApplicationRoute = (state: string) => {
    return `/user/profile/kyc?state=${state}&l=${
      level + (state === "new" ? 1 : 0)
    }`;
  };
  const verificationLevel =
    lastLevel > level ? `Verified Level ${level + 1}` : "Verified";
  const kycDesc = profile?.kyc
    ? t("Verify your identity to participate in our platform.")
    : t(
        "To comply with regulations, each participant is required to go through identity verification (KYC/AML) to prevent fraud, money laundering operations, transactions banned under the sanctions regime, or those which fund terrorism. Please complete our fast and secure verification process to participate in our platform."
      );
  const computedLevels = Array.from({ length: lastLevel }, (_, i) => {
    const currentLevel = i + 1;
    return {
      id: currentLevel,
      level: currentLevel,
      name: ["Verified", "Verified Plus", "Verified Pro"][i],
      cssClass:
        level >= currentLevel
          ? level === currentLevel
            ? statusClass
            : statusClassMap["APPROVED"]
          : statusClassMap["MUTED"],
      icon:
        level >= currentLevel
          ? level === currentLevel
            ? statusIcon
            : "line-md:confirm"
          : "",
      showStatus: level >= currentLevel,
    };
  });
  return (
    <>
      <div className="mx-auto text-muted-800 dark:text-muted-200">
        <div className="grid xs:grid-cols-1 gap-5 md:grid-cols-3">
          <div className="xs:col-span-1 md:col-span-2">
            <div className="py-5 text-muted-800 dark:text-muted-200">
              <p className="text-lg">{kycDesc}</p>
            </div>
            <div className="mx-auto">
              {!profile?.kyc ||
              (level === 0 && profile?.kyc?.status !== "PENDING") ? (
                <Card
                  className="rounded-sm border-muted-500 px-5 py-10 text-center"
                  color={"contrast"}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-muted-200 p-4 text-muted-600 dark:bg-muted-800 dark:text-muted-300">
                      <Icon
                        className="h-10 w-10"
                        icon="system-uicons:files-multi"
                      />
                    </div>
                    <span className="my-5 font-medium text-2xl text-muted-700 dark:text-muted-300">
                      {t(
                        "You have not submitted your necessary documents to verify your identity. In order to trade in our platform, please verify your identity."
                      )}
                    </span>
                    <p className="text-md">
                      {t(
                        "It would be great if you could submit the form. If you have any questions, please feel free to contact our support team."
                      )}
                    </p>
                    <ButtonLink
                      className="mt-5"
                      color="primary"
                      href={getKycApplicationRoute("new")}
                    >
                      {t("Click here to complete your KYC")}
                    </ButtonLink>
                  </div>
                </Card>
              ) : profile?.kyc?.status === "PENDING" ? (
                <Card
                  className="flex items-center rounded-sm border-info px-5 py-10 text-center"
                  color={"contrast"}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-5 rounded-full bg-info-100 p-4 text-info-700 dark:bg-muted-800 dark:text-info-400">
                      <Icon
                        className="h-16 w-16"
                        icon="line-md:loading-alt-loop"
                      />
                    </div>
                    <span className="mb-5 font-medium text-2xl text-info-500">
                      {t("Your identity verification is processing.")}
                    </span>
                    <p className="text-md">
                      {t(
                        "We are still working on your identity verification. Once our team verifies your identity, you will be notified by email."
                      )}
                    </p>
                  </div>
                </Card>
              ) : profile?.kyc?.status === "REJECTED" ? (
                <Card
                  className="rounded-sm border-warning px-5 py-10 text-center"
                  color={"contrast"}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-5 rounded-full bg-danger-100 p-4 text-danger-700 dark:bg-muted-800 dark:text-danger-400">
                      <Icon className="h-12 w-12" icon="line-md:alert" />
                    </div>
                    <span className="mb-5 font-medium text-2xl text-danger-500">
                      {t("Sorry! Your application was rejected.")}
                    </span>
                    <p className="text-md">
                      {t(
                        "In our verification process, we found information that is incorrect or missing. Please resubmit the form. In case of any issues with the submission, please contact our support team."
                      )}
                    </p>
                    <ButtonLink
                      className="mt-5"
                      color="primary"
                      href={getKycApplicationRoute("resubmit")}
                    >
                      {t("Submit Again")}
                    </ButtonLink>
                  </div>
                </Card>
              ) : profile?.kyc?.status === "APPROVED" ? (
                <Card
                  className="rounded-sm border-success px-5 py-10 text-center"
                  color={"contrast"}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-5 rounded-full bg-success-100 p-4 text-success-700 dark:bg-muted-800 dark:text-success-400">
                      <Icon
                        className="h-16 w-16"
                        icon="fluent:shield-task-28-regular"
                      />
                    </div>
                    <span className="mb-5 font-medium text-2xl text-success-500">
                      {t("Your identity has been verified successfully.")}
                    </span>
                    <p>
                      {t(
                        "One of our team members has verified your identity. Now you can participate in our platform. Thank you."
                      )}
                    </p>
                    {lastLevel > level && (
                      <ButtonLink
                        className="mt-5"
                        color="primary"
                        href={`/user/profile/kyc?state=new&l=${level + 1}`}
                      >
                        {t("Get")} {verificationLevel}
                      </ButtonLink>
                    )}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
          <Card className="p-5" color={"mutedContrast"}>
            <h4 className="mb-2 text-lg">{t("Verification Levels")}</h4>
            <ul className="space-y-4">
              {computedLevels.map((item) => (
                <li key={item.id}>
                  <Card className={`w-full p-4 ${item.cssClass}`} role="alert">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        {item.level}. {item.name}
                      </h3>
                      {item.showStatus && (
                        <Icon
                          className="h-5 w-5 text-muted-400"
                          color="currentColor"
                          icon={item.icon}
                        />
                      )}
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <Faq category="KYC" />
    </>
  );
};
export const KycStatus = IdentityVerification;
