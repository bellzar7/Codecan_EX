import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import Textarea from "@/components/elements/form/textarea/Textarea";
import { useDepositStore } from "@/stores/user/wallet/deposit";
import $fetch from "@/utils/api";
import type { FiatDepositAmountProps } from "./FiatDepositAmount.types";

const APP_PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_APP_PAYPAL_CLIENT_ID;

const FiatDepositAmountBase = ({}: FiatDepositAmountProps) => {
  const { t } = useTranslation();
  const {
    selectedDepositMethod,
    setSelectedDepositMethod,
    setStep,
    handleFiatDeposit,
    setDepositAmount,
    depositAmount,
    loading,
    selectedCurrency,
    setDeposit,
    stripeListener,
  } = useDepositStore();

  const [paypal, setPaypal] = useState<any>(null);
  const [paypalLoaded, setPaypalLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (selectedDepositMethod?.alias === "paypal") {
      const scriptId = "paypal-js";
      if (typeof window !== "undefined" && (window as any).paypal) {
        setPaypal((window as any).paypal);
      } else {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${APP_PAYPAL_CLIENT_ID}&components=buttons&enable-funding=venmo,paylater`;
        script.onload = () => {
          setPaypal((window as any).paypal);
        };
        document.body.appendChild(script);
      }
      return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          setPaypal(null);
          setPaypalLoaded(false);
          existingScript.remove();
        }
      };
    }
  }, [selectedDepositMethod?.alias]);

  useEffect(() => {
    if (
      paypal &&
      !paypalLoaded &&
      depositAmount >= Number(selectedDepositMethod?.minAmount)
    ) {
      setPaypalLoaded(true);
      let orderId;
      const FUNDING_SOURCES = [paypal.FUNDING.PAYPAL];
      FUNDING_SOURCES.forEach((fundingSource) => {
        paypal
          .Buttons({
            fundingSource,
            style: {
              layout: "vertical",
              shape: "pill",
              color: fundingSource === paypal.FUNDING.PAYLATER ? "gold" : "",
            },
            createOrder: async () => {
              try {
                const { data, error } = await $fetch({
                  url: "/api/finance/deposit/fiat/paypal",
                  method: "POST",
                  silent: true,
                  body: {
                    amount: depositAmount,
                    currency: selectedCurrency,
                  },
                });
                if (error) {
                  toast.error("Failed to create order");
                } else {
                  orderId = (data as any).id;
                  return (data as any).id;
                }
              } catch (error) {
                console.error("Create order error:", error);
                toast.error("Error creating PayPal order");
              }
            },
            onApprove: async () => {
              try {
                const { data, error } = await $fetch({
                  url: "/api/finance/deposit/fiat/paypal/verify",
                  method: "POST",
                  silent: true,
                  params: {
                    orderId,
                  },
                });
                if (!error) {
                  setDeposit(data);
                  setStep(5);
                }
              } catch (error) {
                console.error(error);
                toast.error("Error approving PayPal transaction");
              }
            },
          })
          .render("#paypal-button-container");
      });
    }
  }, [paypalLoaded, paypal, depositAmount, selectedDepositMethod?.minAmount]);

  const [customFields, setCustomFields] = useState<any>({});
  const [filePreviews] = useState({});
  const [formValues, setFormValues] = useState<any>({});
  const [formErrors] = useState<any>({});

  useEffect(() => {
    if (selectedDepositMethod?.customFields) {
      // console.log('selectedDepositMethod',selectedDepositMethod);
      // const fields = JSON.parse(selectedDepositMethod.customFields);
      setCustomFields(selectedDepositMethod.customFields);
    }
  }, [selectedDepositMethod]);

  const handleChange = useCallback(
    (name, value) => {
      setFormValues((prevValues) => {
        const newValues = { ...prevValues };
        newValues[name] = value;
        return newValues;
      });
    },
    [setFormValues, filePreviews, customFields]
  );

  const firstErrorInputRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (firstErrorInputRef.current) {
      firstErrorInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTimeout(() => {
        firstErrorInputRef.current?.focus();
      }, 200);
    }
  }, [formErrors]);

  const setFirstErrorInputRef = (inputRef, error) => {
    if (error && !firstErrorInputRef.current) {
      firstErrorInputRef.current = inputRef;
    } else if (!error && firstErrorInputRef.current === inputRef) {
      firstErrorInputRef.current = null;
    }
  };

  const renderFormField = useCallback(
    (formItem) => {
      const { name, type, title, required } = formItem;
      const value = formValues[name] || "";
      const error = formErrors[name];
      const commonProps = {
        name,
        label: title,
        placeholder: `Enter ${title}`,
        required,
        error,
        value,
        onChange: (e) => handleChange(name, e.target.value),
        setFirstErrorInputRef: (inputRef) =>
          setFirstErrorInputRef(inputRef, error),
      };
      switch (type) {
        case "input":
          return <Input key={name} {...commonProps} />;
        case "textarea":
          return <Textarea key={name} {...commonProps} />;
        default:
          return null;
      }
    },
    [formValues, formErrors, filePreviews, handleChange]
  );

  const renderFormFields = useCallback(
    (formItems) => {
      if (!Array.isArray(formItems)) return null;
      return formItems.map((formItem, index) => {
        if (Array.isArray(formItem)) {
          const gridCols = `grid-cols-${formItem.length}`;
          return (
            <div className={`grid gap-4 ${gridCols}`} key={index}>
              {formItem.map((nestedItem) => renderFormField(nestedItem))}
            </div>
          );
        }
        return (
          <div className="space-y-5" key={index}>
            {renderFormField(formItem)}
          </div>
        );
      });
    },
    [renderFormField]
  );

  const calculateFees = (amount) => {
    const fixedFee = selectedDepositMethod?.fixedFee || 0;
    const percentageFee = selectedDepositMethod?.percentageFee || 0;
    const fee = fixedFee + (percentageFee * amount) / 100;
    const total = amount + fee;
    return { fee, total };
  };

  const { fee, total } = useMemo(
    () => calculateFees(depositAmount || 0),
    [depositAmount, selectedDepositMethod]
  );

  if (stripeListener) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icon
            className="h-12 w-12 animate-spin text-primary-500"
            icon="mdi:loading"
          />
          <p className="text-primary-500 text-xl">
            {t("Processing payment...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {selectedDepositMethod?.title} {t("Deposit Amount")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Enter the amount you want to deposit")}
        </p>
      </div>
      <div className="mx-auto w-full max-w-sm space-y-5 rounded-sm">
        <div>
          <Input
            className="w-full"
            label={t("Amount")}
            max={Number(selectedDepositMethod?.maxAmount)}
            min={Number(selectedDepositMethod?.minAmount)}
            onChange={(e) => {
              setDepositAmount(Number.parseFloat(e.target.value));
            }}
            placeholder={t("Enter amount")}
            required
            type="number"
            value={depositAmount || ""}
          />
        </div>
        {customFields && renderFormFields(customFields)}

        <div className="card-dashed mt-5 text-sm">
          <div className="flex justify-between">
            <p className="text-muted-600 dark:text-muted-300">
              {t("Fixed Fee")}
            </p>
            <p className="text-muted-600 dark:text-muted-300">
              {selectedDepositMethod?.fixedFee || 0}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-600 dark:text-muted-300">
              {t("Percentage Fee")}
            </p>
            <p className="text-muted-600 dark:text-muted-300">
              {selectedDepositMethod?.percentageFee || 0}%
            </p>
          </div>
          <div className="mb-2 flex justify-between border-muted-300 border-b border-dashed pb-2 dark:border-muted-700">
            <p className="text-muted-600 dark:text-muted-300">
              {t("Total Fee")}
            </p>
            <p className="text-muted-600 dark:text-muted-300">
              {fee.toFixed(2)}
            </p>
          </div>
          <div className="mb-2 flex justify-between border-muted-300 border-b border-dashed pb-2 dark:border-muted-700">
            <p className="text-muted-600 dark:text-muted-300">
              {t("Total to Pay")}
            </p>
            <p className="text-muted-600 dark:text-muted-300">
              {total.toFixed(2)}
            </p>
          </div>
        </div>

        {selectedDepositMethod?.alias === "paypal" && (
          <>
            <div
              className={
                depositAmount >= Number(selectedDepositMethod?.minAmount) &&
                paypalLoaded
                  ? ""
                  : "hidden"
              }
              id="paypal-button-container"
            />
            {depositAmount < Number(selectedDepositMethod?.minAmount) &&
              !paypalLoaded && (
                <button
                  className="flex w-full justify-center rounded-3xl border border-transparent bg-gray-400 px-4 py-4 font-medium text-sm text-white hover:bg-gray-500 focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled
                  type="button"
                >
                  {t("Pay with PayPal")}
                </button>
              )}
          </>
        )}

        <div className="mx-auto mt-16! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button
              className="w-full"
              disabled={loading}
              onClick={() => {
                setPaypalLoaded(false);
                setPaypal(null);
                setSelectedDepositMethod(null, null);
                setStep(3);
              }}
              size="lg"
              type="button"
            >
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            {selectedDepositMethod?.alias !== "paypal" && (
              <Button
                className="w-full"
                color="primary"
                disabled={
                  !depositAmount ||
                  depositAmount === 0 ||
                  loading ||
                  stripeListener
                }
                onClick={() => {
                  handleFiatDeposit(formValues);
                }}
                size="lg"
                type="button"
              >
                {t("Deposit")}
                <Icon className="h-5 w-5" icon="mdi:chevron-right" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FiatDepositAmount = memo(FiatDepositAmountBase);
