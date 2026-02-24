import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const StripeSession = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile } = useDashboardStore();
  const { sessionId } = router.query as {
    sessionId: string;
  };
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<
    Array<{
      id: string;
      description: string;
      currency: string;
      amount: number;
    }>
  >([]);
  useEffect(() => {
    if (!(sessionId && profile)) {
      return;
    }
    const verifyPayment = async () => {
      try {
        const { data, error } = await $fetch({
          url: "/api/finance/deposit/fiat/stripe/verify",
          method: "POST",
          silent: true,
          params: { sessionId },
        });
        if (error) {
          toast.error(error);
        }
        // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
        const paymentData = data as any;
        setPaymentStatus(paymentData.status);
        setLineItems(
          // biome-ignore lint/suspicious/noExplicitAny: API response item structure is dynamic
          paymentData.line_items.map((item: any) => ({
            id: item.id,
            description: item.description,
            currency: item.currency.toUpperCase(),
            amount: item.amount,
          }))
        );
      } catch (error) {
        console.error(error);
        setPaymentStatus("failed");
      } finally {
        setIsLoading(false);
      }
    };
    if (sessionId) {
      verifyPayment();
    }
  }, [sessionId, profile]);
  const total = lineItems.reduce((acc, item) => acc + item.amount, 0);
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
      <div>
        {paymentStatus === "succeeded" ? (
          <div className="my-auto flex flex-col justify-center space-y-5 py-20 text-center text-muted-800 dark:text-muted-200">
            {/* Placeholder for success animation */}
            <h1 className="font-bold text-2xl text-success-500">
              {t("Payment Successful")}
            </h1>
            <p>
              {t(
                "Your payment has been processed successfully. Here are the details"
              )}
            </p>
            {/* Example card component displaying payment details */}
            <div className="overflow-hidden font-sans">
              <div className="flex flex-col justify-between gap-y-8 border-muted-200 border-b p-8 sm:flex-row sm:items-center dark:border-muted-700">
                <h3 className="font-medium text-md">
                  {t("Order")} {sessionId}
                </h3>
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
                    {lineItems.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-left font-medium text-sm">
                          {item.description}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-left text-sm">
                          {item.currency}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p>
              {t("Congratulations! You have successfully deposited")} {total}{" "}
              {lineItems[0]?.currency} {t("to your wallet.")}
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
            {/* Placeholder for error icon */}
            <h1>{t("Payment Failed")}</h1>
            <p>
              {t(
                "There was an issue processing your payment. Please try again later."
              )}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};
export default StripeSession;
