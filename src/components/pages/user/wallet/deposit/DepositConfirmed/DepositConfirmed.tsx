import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { useDepositStore } from "@/stores/user/wallet/deposit";
import type { DepositConfirmedProps } from "./DepositConfirmed.types";

const DepositConfirmedBase = ({}: DepositConfirmedProps) => {
  const { t } = useTranslation();
  const { deposit, clearAll } = useDepositStore();
  const router = useRouter();
  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Looks like you're all set")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t(
            "Thank you for using our service. You can now start using your wallet."
          )}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-8 pb-8">
        <Card className="p-6 text-center font-sans" color="contrast">
          <IconBox
            className="mx-auto mb-4"
            color={deposit?.balance ? "success" : "info"}
            icon="ph:check-circle-duotone"
            size={"xl"}
            variant="pastel"
          />
          <h3 className="mb-1 font-light text-lg text-muted-800 dark:text-muted-100">
            {t("Congratulations")}
          </h3>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {deposit.transaction?.status === "COMPLETED" ? (
              <>
                {t("Great, you've sucessfully deposited")}{" "}
                {deposit?.transaction?.amount} {deposit?.currency}{" "}
                {t("to your wallet using")} {deposit?.method}.{" "}
                {t("Your new balance is")} {deposit?.balance}{" "}
                {deposit?.currency}
              </>
            ) : deposit.transaction?.status === "PENDING" ? (
              <>
                {t("Your deposit of")} {deposit?.currency}{" "}
                {t(
                  "is currently pending. You will receive an email once the transaction is completed."
                )}
              </>
            ) : (
              <>
                {t(
                  "Your deposit has been processed. However, it seems there was an issue with the transaction. Please contact support for further assistance."
                )}
              </>
            )}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              className="w-full"
              color="primary"
              onClick={async () => {
                clearAll();
                router.push("/user/wallet");
              }}
            >
              {t("Go to Wallet")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
export const DepositConfirmed = memo(DepositConfirmedBase);
