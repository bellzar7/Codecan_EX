import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { orderId } = router.query as {
    orderId: string;
  };
  const { profile } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [payerName, setPayerName] = useState(
    `${profile?.firstName} ${profile?.lastName}`
  );
  const [payerEmail, setPayerEmail] = useState(profile?.email || "");
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!orderId) {
        return;
      }
      try {
        const { data, error } = await $fetch({
          url: "/api/finance/deposit/fiat/paypal/details",
          method: "POST",
          silent: true,
          params: { orderId },
        });
        if (error) {
          toast.error(error);
          setPaymentStatus("failed");
          setIsLoading(false);
          return;
        }
        // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
        const paymentData = data as any;
        setPaymentStatus(paymentData.status);
        const purchaseUnit = paymentData.purchase_units[0];
        setCurrencyCode(purchaseUnit.amount.currency_code);
        setDepositAmount(
          Number.parseFloat(purchaseUnit.amount.breakdown.item_total.value)
        );
        setTaxAmount(
          Number.parseFloat(purchaseUnit.amount.breakdown.tax_total.value)
        );
        setTotalAmount(Number.parseFloat(purchaseUnit.amount.value));
        setPayerName(paymentData.payer?.name?.given_name || "");
        setPayerEmail(paymentData.payer?.email_address || "");
      } catch (error) {
        console.error(error);
        setPaymentStatus("failed");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentDetails();
  }, [orderId]);
  const formatPrice = (amount: number, currency: string) => {
    // Dummy formatting function, replace with your actual formatting logic
    return `${amount.toFixed(2)} ${currency}`;
  };
  if (isLoading) {
    return (
      <Layout color="muted" title={t("Processing...")}>
        <div className="my-auto flex flex-col items-center justify-center space-y-5 py-20 text-center text-muted-800 dark:text-muted-200">
          <Icon
            className="h-24 w-24 animate-spin text-4xl text-primary-500"
            icon="mdi:loading"
          />
          <h1 className="font-bold text-2xl">{t("Processing Payment...")}</h1>
          <p>{t("Please wait while we process your payment.")}</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout color="muted" title={t("Deposit Success")}>
      {paymentStatus === "COMPLETED" ? (
        <div className="my-auto flex flex-col justify-center space-y-5 py-20 text-center text-muted-800 dark:text-muted-200">
          <h1 className="font-bold text-2xl text-success-500">
            {t("Payment Successful")}
          </h1>
          <p>
            {t(
              "Your payment has been processed successfully. Here are the details"
            )}
          </p>
          <div className="overflow-hidden font-sans">
            <div className="flex flex-col justify-between gap-y-8 border-muted-200 border-b p-8 sm:flex-row sm:items-center dark:border-muted-700">
              <h3 className="font-medium text-md">
                {t("Order")} {orderId}
              </h3>
              <p>
                {t("Payer")} {payerName} ({payerEmail})
              </p>
            </div>
            <div className="flex flex-col">
              <table className="min-w-full divide-y divide-muted-200 dark:divide-muted-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-xs uppercase">
                      {t("Description")}
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-xs uppercase">
                      {t("Currency")}
                    </th>
                    <th className="px-6 py-3 text-center font-medium text-xs uppercase">
                      {t("Amount")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-200 bg-white dark:divide-muted-700 dark:bg-muted-900">
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-left font-medium text-sm">
                      {t("Deposit to")}
                      {currencyCode}
                      {t("Wallet")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm">
                      {currencyCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                      {formatPrice(depositAmount, currencyCode)}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-left font-medium text-sm">
                      {t("Tax")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm">
                      {currencyCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                      {formatPrice(taxAmount, currencyCode)}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap px-6 py-4 text-left font-medium text-sm">
                      {t("Total")}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-left text-sm">
                      {currencyCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                      {formatPrice(totalAmount, currencyCode)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p>
            {t("Congratulations! You have successfully deposited")}{" "}
            {formatPrice(depositAmount, currencyCode)} {t("to your")}{" "}
            {currencyCode} {t("Wallet.")}
          </p>
          <Button
            color="primary"
            onClick={() => router.push("/user/wallet/FIAT")}
          >
            <Icon className="h-5 w-5" icon="mdi:chevron-left" />
            {t("Go Back")}
          </Button>
        </div>
      ) : (
        <div>
          <h1>{t("Payment Failed")}</h1>
          <p>
            {t(
              "There was an issue processing your payment. Please try again later."
            )}
          </p>
        </div>
      )}
    </Layout>
  );
};
export default PaymentSuccessPage;
