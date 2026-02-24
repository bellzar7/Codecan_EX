import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import { Lottie } from "@/components/elements/base/lottie";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const TwoFactorBase = () => {
  const { t } = useTranslation();
  const { profile, updateProfile2FA, setIsFetched, settings } =
    useDashboardStore() as any;
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [secret, setSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [type, setType] = useState(""); // No default type initially
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [qrCode, setQrCode] = useState(""); // For APP type
  const [sentOtpType, setSentOtpType] = useState(""); // For SMS and EMAIL types

  const handleGenerateOtp = async (selectedType) => {
    setType(selectedType);
    const requestBody: Record<string, any> = { type: selectedType };
    if (selectedType === "SMS") requestBody.phoneNumber = phoneNumber;
    setIsGenerating(true);
    const { data, error, validationErrors } = await $fetch({
      url: "/api/auth/otp/generate",
      method: "POST",
      body: requestBody,
      silent: selectedType === "APP",
    });
    if (data && !error) {
      setSecret((data as any).secret);
      if ((data as any).qrCode) setQrCode((data as any).qrCode);
      if (["SMS"].includes(type)) setSentOtpType(type);
      setStep(2);
    } else if (validationErrors) {
      for (const key in validationErrors) {
        toast.error(validationErrors[key]);
      }
    }
    setIsGenerating(false);
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    const { data, error } = await $fetch({
      url: "/api/auth/otp/resend",
      method: "POST",
      body: { id: profile.id, secret, type },
    });
    setIsResending(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error(t("Please enter the OTP"));
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await $fetch({
      url: "/api/auth/otp/verify",
      method: "POST",
      body: { otp, secret, type },
      silent: false,
    });
    setIsSubmitting(false);
    if (data && !error) {
      setIsFetched(false);
      router.push("/user");
    }
  };

  const handleToggleOtp = async (status) => {
    setIsSubmitting(true);
    updateProfile2FA(status);
    setIsSubmitting(false);
  };

  // Map methodType to Lottie config keys
  const getLottieKeyForType = (methodType: string) => {
    switch (methodType) {
      case "APP":
        return "appVerificationLottie";
      case "SMS":
        return "mobileVerificationLottie";
      case "EMAIL":
        return "emailVerificationLottie";
      default:
        return "";
    }
  };

  const renderCard = (methodType, path, text, handleClick) => {
    const enabledType = profile?.twoFactor?.type || "";
    const status = profile?.twoFactor?.enabled;

    const lottieKey = getLottieKeyForType(methodType);
    const isLottieEnabled =
      settings?.lottieAnimationStatus === "true" &&
      settings?.[`${lottieKey}Enabled`] === "true";
    const lottieFile = settings?.[`${lottieKey}File`];

    return (
      <Card
        className={`flex flex-col items-center p-6 ${
          enabledType === methodType || isGenerating
            ? "relative cursor-not-allowed"
            : "cursor-pointer"
        }`}
        color={
          enabledType === methodType
            ? status
              ? "success"
              : "danger"
            : "contrast"
        }
        key={methodType}
        onClick={
          enabledType === methodType || isGenerating ? null : handleClick
        }
        shape="smooth"
      >
        {enabledType === methodType && (
          <div className="absolute top-0 right-0 mt-2 mr-2">
            <Tooltip content={status ? t("Disable 2FA") : t("Enable 2FA")}>
              <IconButton
                color={status ? "danger" : "success"}
                disabled={isGenerating}
                onClick={() => handleToggleOtp(!status)}
                shadow={status ? "danger" : "success"}
                size="sm"
                type="button"
                variant="outlined"
              >
                <Icon
                  className="h-4 w-4"
                  icon={status ? "mdi:close" : "mdi:check"}
                />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* Conditional logic to render Lottie or fallback image */}
        {isLottieEnabled ? (
          <Lottie
            category="otp"
            classNames="mx-auto max-w-[160px]"
            max={path === "mobile-verfication" ? 2 : undefined}
            path={path}
          />
        ) : lottieFile ? (
          <img
            alt={`${methodType} Verification`}
            className="mx-auto max-w-[160px] object-contain p-5"
            src={lottieFile}
          />
        ) : null}

        <p className="mb-4 text-center text-muted-800 text-sm dark:text-muted-200">
          {t(text)}
        </p>
      </Card>
    );
  };

  const render2FACards = () => {
    const methods: any[] = [];
    if (process.env.NEXT_PUBLIC_2FA_APP_STATUS === "true") {
      methods.push(
        renderCard("APP", "app-verfication", "Google Authenticator", () =>
          handleGenerateOtp("APP")
        )
      );
    }
    if (process.env.NEXT_PUBLIC_2FA_SMS_STATUS === "true") {
      methods.push(
        renderCard("SMS", "mobile-verfication", "Receive OTP via SMS", () => {
          setType("SMS");
          setStep(2);
        })
      );
    }
    if (process.env.NEXT_PUBLIC_2FA_EMAIL_STATUS === "true") {
      methods.push(
        renderCard("EMAIL", "email-verfication", "Receive OTP via Email", () =>
          handleGenerateOtp("EMAIL")
        )
      );
    }
    return (
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-3">
          {methods}
        </div>
      </div>
    );
  };

  if (isGenerating) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icon
            className="h-12 w-12 animate-spin text-primary-500"
            icon="mdi:loading"
          />
          <p className="text-primary-500 text-xl">{t("Generating OTP...")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex grow items-center px-6 py-12 md:px-12">
        <div className="container">
          <div className="columns flex items-center">
            <div className="shrink grow md:p-3">
              <div className="mx-auto -mt-10 mb-6 max-w-[420px] text-center font-sans">
                <h1 className="mb-2 text-center font-light font-sans text-3xl text-muted-800 leading-tight dark:text-muted-100">
                  {t("Enable Two-Factor Authentication")}
                </h1>
                <p className="text-center text-muted-500 text-sm">
                  {step === 1
                    ? t("Choose the type of 2FA to enable")
                    : t("Enter the OTP sent to your phone to enable 2FA")}
                </p>
              </div>

              {step === 1 ? (
                render2FACards()
              ) : (
                <Card
                  className="mx-auto flex max-w-[420px] flex-col gap-4 p-6 md:p-8 lg:p-10"
                  color="contrast"
                  shape="smooth"
                >
                  {type === "APP" && qrCode && (
                    <div className="text-center">
                      <div className="flex justify-center p-4">
                        <MashImage
                          alt="QR Code"
                          height={250}
                          src={qrCode}
                          width={250}
                        />
                      </div>
                      <p className="text-muted-500">
                        {t("Scan this QR code with your authenticator app")}
                      </p>
                    </div>
                  )}
                  {type === "SMS" && (
                    <div>
                      <Input
                        autoComplete="tel"
                        color="default"
                        icon="lucide:phone"
                        label={t("Phone Number")}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={t("Enter your phone number for SMS OTP")}
                        size="lg"
                        value={phoneNumber}
                      />
                    </div>
                  )}
                  <Input
                    color="default"
                    icon="lucide:lock"
                    label={t("OTP")}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t("Enter OTP")}
                    size="lg"
                    value={otp}
                  />

                  <div className="relative">
                    {type === "SMS" && !sentOtpType && (
                      <div className="my-4">
                        <Button
                          className="w-full"
                          color="primary"
                          disabled={isSubmitting}
                          loading={isSubmitting}
                          onClick={() => handleGenerateOtp(type)}
                          shadow="primary"
                          size="lg"
                          type="button"
                          variant="solid"
                        >
                          {t("Send OTP")}
                        </Button>
                      </div>
                    )}
                    {type === "SMS" &&
                      sentOtpType === "SMS" &&
                      phoneNumber &&
                      otp && (
                        <div className="my-4">
                          <Button
                            className="w-full"
                            color="primary"
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            onClick={handleVerifyOtp}
                            shadow="primary"
                            size="lg"
                            type="button"
                            variant="solid"
                          >
                            {t("Verify OTP")}
                          </Button>
                        </div>
                      )}
                    {["APP", "EMAIL"].includes(type) && (
                      <div className="my-4">
                        <Button
                          className="w-full"
                          color="primary"
                          disabled={isSubmitting}
                          loading={isSubmitting}
                          onClick={handleVerifyOtp}
                          shadow="primary"
                          size="lg"
                          type="button"
                          variant="solid"
                        >
                          {t("Verify OTP")}
                        </Button>
                      </div>
                    )}
                    {["EMAIL", "SMS"].includes(type) &&
                      sentOtpType === type && (
                        <div className="my-4">
                          <Button
                            className="w-full"
                            color="primary"
                            disabled={isResending}
                            loading={isResending}
                            onClick={handleResendOtp}
                            shadow="primary"
                            size="lg"
                            type="button"
                            variant="solid"
                          >
                            {t("Resend OTP")}
                          </Button>
                        </div>
                      )}

                    <div className="mt-10 flex items-center justify-between text-center">
                      <Link
                        className="flex items-center justify-center text-muted-400 text-sm underline-offset-4 hover:text-primary-500 hover:underline"
                        href="/user/profile"
                      >
                        <Icon className="mr-2" icon="mdi:cancel" />
                        {t("Cancel")}
                      </Link>
                      <div
                        className="flex cursor-pointer items-center justify-center text-muted-400 text-sm underline-offset-4 hover:text-primary-500 hover:underline"
                        onClick={() => {
                          setStep(1);
                          setOtp("");
                          setSecret("");
                        }}
                      >
                        <Icon className="mr-2" icon="akar-icons:arrow-left" />
                        {t("Change Method")}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <div className="mt-8 text-center">
                <p className="text-muted-500 text-sm">
                  {t("You can enable or disable 2FA at any time")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export const TwoFactor = TwoFactorBase;
