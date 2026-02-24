import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useLoginStore } from "@/stores/auth/login";

const VerificationFormBase = () => {
  const { t } = useTranslation();
  const {
    verificationCode,
    setVerificationCode,
    handleVerificationSubmit,
    loading,
  } = useLoginStore();
  const router = useRouter();
  return (
    <div>
      <div className="flex flex-col gap-4">
        <Input
          color="contrast"
          icon="lucide:lock"
          label={t("Verification Code")}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder={t("Enter verification code")}
          value={verificationCode}
        />
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          color="primary"
          disabled={loading}
          loading={loading}
          onClick={() => {
            handleVerificationSubmit(router);
          }}
          size="md"
        >
          {t("Verify Email")}
        </Button>
      </div>
    </div>
  );
};
export const VerificationForm = memo(VerificationFormBase);
