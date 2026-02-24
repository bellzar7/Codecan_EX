import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import Textarea from "@/components/elements/form/textarea/Textarea";
import { useWithdrawStore } from "@/stores/user/wallet/withdraw";

const FiatWithdrawAmountBase = () => {
  const { t } = useTranslation();
  const {
    selectedWithdrawMethod,
    setSelectedWithdrawMethod,
    setStep,
    handleFiatWithdraw,
    setWithdrawAmount,
    withdrawAmount,
    loading,
  } = useWithdrawStore();
  const [customFields, setCustomFields] = useState<any>({});
  const [filePreviews] = useState({});
  const [formValues, setFormValues] = useState({});
  const [formErrors] = useState({});
  useEffect(() => {
    if (selectedWithdrawMethod?.customFields) {
      // const fields = JSON.parse(selectedWithdrawMethod.customFields);
      setCustomFields(selectedWithdrawMethod.customFields);
    }
  }, [selectedWithdrawMethod]);
  const handleChange = useCallback(
    (name, values) => {
      setFormValues((prevValues) => {
        const newValues = { ...prevValues };
        newValues[name] = values;
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
      const value = formValues[name];
      const error = formErrors[name];
      const commonProps = {
        key: name,
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
          return <Input {...commonProps} />;
        case "textarea":
          return <Textarea {...commonProps} />;
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
  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {selectedWithdrawMethod?.title} {t("Withdraw Confirmation")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Enter the amount you want to withdraw")}
        </p>
      </div>
      <div className="mx-auto mb-4 w-full max-w-md space-y-5 rounded-sm px-8 pb-8">
        <div>
          <Input
            className="w-full"
            label={t("Amount")}
            max={Number(selectedWithdrawMethod?.maxAmount)}
            min={Number(selectedWithdrawMethod?.minAmount)}
            onChange={(e) => {
              setWithdrawAmount(Number.parseFloat(e.target.value));
            }}
            placeholder={t("Enter amount")}
            required
            type="number"
          />
        </div>
        {customFields && renderFormFields(customFields)}

        <div className="mx-auto mt-16! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button
              className="w-full"
              disabled={loading}
              onClick={() => {
                setSelectedWithdrawMethod(null);
                setStep(3);
              }}
              size="lg"
              type="button"
            >
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            {selectedWithdrawMethod?.alias !== "paypal" && (
              <Button
                className="w-full"
                color="primary"
                disabled={!withdrawAmount || withdrawAmount === 0 || loading}
                onClick={() => {
                  handleFiatWithdraw(formValues);
                }}
                size="lg"
                type="button"
              >
                {t("Withdraw")}
                <Icon className="h-5 w-5" icon="mdi:chevron-right" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const FiatWithdrawAmount = memo(FiatWithdrawAmountBase);
