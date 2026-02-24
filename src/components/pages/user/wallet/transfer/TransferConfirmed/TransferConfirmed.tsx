import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { useTransferStore } from "@/stores/user/wallet/transfer";

const TransferConfirmedBase = () => {
  const { t } = useTranslation();
  const { transfer, clearAll } = useTransferStore();
  const router = useRouter();

  const transferMessage = () => {
    if (!(transfer && transfer.fromTransfer)) return "";

    if (transfer.fromTransfer.status === "COMPLETED") {
      return transfer.transferType === "client" ? (
        <>
          {t("Great, you've successfully transferred")}{" "}
          {transfer?.fromTransfer?.amount} {transfer?.fromCurrency}{" "}
          {t("from your")} {transfer?.fromType} {t("wallet to the client's")}{" "}
          {transfer?.toType} {t("wallet")}.
        </>
      ) : (
        <>
          {t("Great, you've successfully transferred")}{" "}
          {transfer?.fromTransfer?.amount} {transfer?.fromCurrency}{" "}
          {t("from your")} {transfer?.fromType} {t("wallet to your")}{" "}
          {transfer?.toType} {t("wallet")}. {t("Your new balance is")}{" "}
          {transfer?.fromBalance} {transfer?.fromCurrency}.
        </>
      );
    }

    if (transfer.fromTransfer.status === "PENDING") {
      return (
        <>
          {t("Your transfer of")} {transfer?.fromTransfer?.amount}{" "}
          {transfer?.fromCurrency} {t("from your")} {transfer?.fromType}{" "}
          {t("wallet to your")} {transfer?.toType}{" "}
          {t(
            "wallet is currently pending. You will receive an email once the transaction is completed."
          )}
          .
        </>
      );
    }

    return (
      <>
        {t(
          "Your transfer has been processed. However, it seems there was an issue with the transaction. Please contact support for further assistance."
        )}
        .
      </>
    );
  };

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
            color={
              transfer.fromTransfer?.status === "COMPLETED" ? "success" : "info"
            }
            icon="ph:check-circle-duotone"
            size={"xl"}
            variant="pastel"
          />
          <h3 className="mb-1 font-light text-lg text-muted-800 dark:text-muted-100">
            {t("Congratulations")}
          </h3>
          <p className="text-muted-500 text-sm dark:text-muted-400">
            {transferMessage()}
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

export const TransferConfirmed = memo(TransferConfirmedBase);
