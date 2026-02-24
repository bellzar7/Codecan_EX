import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useLogout } from "@/hooks/useLogout";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const AccountDeletionPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const logout = useLogout();
  const { profile } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"warning" | "verify">("warning");
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleRequestDeletion = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await $fetch({
        url: "/api/auth/delete",
        method: "POST",
        body: { email: profile?.email },
      });

      if (error) {
        setError(t("Failed to send deletion code. Please try again."));
      } else {
        setStep("verify");
      }
    } catch (e) {
      setError(t("Failed to send deletion code. Please try again."));
    }
    setIsLoading(false);
  };

  const handleVerifyAndDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await $fetch({
        url: "/api/auth/delete/confirm",
        method: "POST",
        body: { email: profile?.email, token: code },
      });

      if (error) {
        setError(
          t("Invalid code or unable to delete account. Please try again.")
        );
      } else {
        // Logout user after successful deletion
        logout();
        router.push("/");
      }
    } catch (e) {
      setError(
        t("Invalid code or unable to delete account. Please try again.")
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="mb-12 flex flex-col gap-4">
      {step === "warning" ? (
        <>
          <h2 className="font-bold text-muted-800 text-xl dark:text-muted-100">
            {t("Delete Your Account")}
          </h2>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {t(
              "Deleting your account is permanent and will remove all your data. This action cannot be undone."
            )}
          </p>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {t(
              "If you're sure, click the button below to request a deletion code."
            )}
          </p>
          <Button
            color="danger"
            loading={isLoading}
            onClick={handleRequestDeletion}
          >
            {t("Request Deletion Code")}
          </Button>
        </>
      ) : (
        <>
          <h2 className="font-bold text-muted-800 text-xl dark:text-muted-100">
            {t("Confirm Account Deletion")}
          </h2>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {t(
              "A code has been sent to your email. Enter it below to confirm account deletion."
            )}
          </p>
          <Input
            label={t("Deletion Code")}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("Enter the code")}
            value={code}
          />
          {error && <p className="mt-2 text-red-500">{error}</p>}
          <div className="mt-4 flex gap-4">
            <Button
              color="default"
              onClick={() => router.push("/user/profile")}
            >
              {t("Cancel")}
            </Button>
            <Button
              color="danger"
              loading={isLoading}
              onClick={handleVerifyAndDelete}
            >
              {t("Confirm Deletion")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountDeletionPage;
