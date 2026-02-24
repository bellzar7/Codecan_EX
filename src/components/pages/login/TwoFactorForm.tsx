import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useLoginStore } from "@/stores/auth/login";

const TwoFactorFormBase = () => {
  const { t } = useTranslation();
  const {
    otp,
    setOtp,
    twoFactorType,
    handle2FASubmit,
    handleResendOtp,
    resendCooldown,
    loading,
  } = useLoginStore();
  const router = useRouter();

  return (
    <div>
      <div className="flex flex-col gap-4">
        <Input
          color="contrast"
          icon="lucide:lock"
          label={t("2FA Code")}
          onChange={(e) => setOtp(e.target.value)}
          placeholder={t("Enter 2FA code")}
          value={otp}
        />
        <p className="text-muted-500 text-sm">
          {t(`Use the OTP sent to your ${twoFactorType.toLowerCase()}`)}
        </p>
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          color="primary"
          disabled={loading}
          loading={loading}
          onClick={() => {
            handle2FASubmit(router);
          }}
          size="md"
        >
          {t("Verify 2FA")}
        </Button>
      </div>
      <div>
        {twoFactorType !== "APP" && (
          <span className="mt-4 flex items-center justify-between text-muted-400 text-sm dark:text-muted-600">
            <span>{t("Didn't receive the OTP?")}</span>
            <span
              className={`flex items-center justify-center gap-1 text-sm ${
                resendCooldown > 0 || loading
                  ? "cursor-not-allowed text-muted-400 dark:text-muted-600"
                  : "cursor-pointer text-primary-600 hover:text-primary-500"
              }`}
              onClick={() => {
                if (resendCooldown > 0 || loading) return;
                handleResendOtp();
              }}
            >
              <Icon className="me-1" icon="mdi:refresh" />
              {resendCooldown > 0
                ? `${t("Resend OTP in")} ${resendCooldown}s`
                : t("Resend OTP")}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
export const TwoFactorForm = memo(TwoFactorFormBase);
