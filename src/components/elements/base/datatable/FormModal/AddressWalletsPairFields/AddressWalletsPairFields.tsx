import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import $fetch from "@/utils/api";
import IconButton from "../../../button-icon/IconButton";
import type { CustomAddressWalletsPairFieldsProps } from "./AddressWalletsPairFields.types";

const CustomAddressWalletsPairFieldsBase = ({
  value,
  fields = [],
  onFieldsChange,
}: CustomAddressWalletsPairFieldsProps) => {
  const { t } = useTranslation();
  const [customFields, setCustomFields] = useState<
    CustomAddressWalletsPairFields[] | unknown
  >(value);
  const [customOptions, setCustomOptions] = useState<
    CustomAddressWalletsPairFields[] | unknown
  >(value);
  const [customInputIndexes, setCustomInputIndexes] = useState<number[]>([]);
  const [networkOptions, setNetworkOptions] = useState<Record<string, any[]>>(
    {}
  );
  const [loadingNetworks, setLoadingNetworks] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setCustomFields(value);
  }, [value]);

  useEffect(() => {
    console.log("fields", fields);
    setCustomOptions([
      ...(fields as any)?.address,
      { value: "Add new address", label: "Add new address" },
    ]);
  }, [fields]);

  // Fetch networks for a specific currency
  const fetchNetworksForCurrency = useCallback(
    async (currency: string, index: number) => {
      if (!currency || loadingNetworks[index]) return;

      // Check if networks already loaded for this currency
      if (networkOptions[currency]) {
        return;
      }

      setLoadingNetworks((prev) => ({ ...prev, [index]: true }));

      try {
        console.log(
          `[AddressWalletsPairFields] Fetching networks for currency: ${currency}`
        );
        const { data, error } = await $fetch({
          url: `/api/finance/currency/SPOT/${currency}?action=deposit`,
          silent: true,
        });

        if (error) {
          console.error(
            `[AddressWalletsPairFields] Error fetching networks for ${currency}:`,
            error
          );
          setNetworkOptions((prev) => ({ ...prev, [currency]: [] }));
        } else {
          console.log(
            `[AddressWalletsPairFields] Networks fetched for ${currency}:`,
            data
          );
          const networks = Array.isArray(data)
            ? data.map((network) => ({
                value: network.chain,
                label: network.chain,
                network: network.chain,
              }))
            : [];
          setNetworkOptions((prev) => ({ ...prev, [currency]: networks }));
        }
      } catch (err) {
        console.error(
          `[AddressWalletsPairFields] Exception fetching networks for ${currency}:`,
          err
        );
        setNetworkOptions((prev) => ({ ...prev, [currency]: [] }));
      } finally {
        setLoadingNetworks((prev) => ({ ...prev, [index]: false }));
      }
    },
    [loadingNetworks, networkOptions]
  );
  const addField = () => {
    const newField: CustomAddressWalletsPairFields = {
      currency: (fields as any)?.currency[0]?.value || "",
      address: (fields as any)?.address[0]?.value || "",
      network: "",
    };
    const valueToSet = Array.isArray(customFields) ? customFields : [];
    const updatedFields = [...valueToSet, newField];
    setCustomFields(updatedFields);
    onFieldsChange?.(updatedFields);
  };
  const updateField = (
    index: number,
    field: keyof CustomAddressWalletsPairFields,
    value: string | boolean
  ) => {
    if (value === "Add new address") {
      setCustomInputIndexes((prev) =>
        prev.includes(index) ? prev : [...prev, index]
      );
      return;
    }
    const newFields = [...(customFields as any[])];
    newFields[index] = { ...newFields[index], [field]: value };

    // If currency changed, fetch networks for that currency and reset network
    if (field === "currency" && typeof value === "string") {
      newFields[index].network = ""; // Reset network when currency changes
      fetchNetworksForCurrency(value, index);
    }

    setCustomFields(newFields);
    onFieldsChange?.(newFields);
  };
  const removeField = (index: number) => {
    const newFields = [...(customFields as any[])];
    newFields.splice(index, 1);
    setCustomFields(newFields);
    onFieldsChange?.(newFields);
  };

  // Load networks when component mounts for existing currencies
  useEffect(() => {
    if (Array.isArray(customFields)) {
      customFields.forEach((field: any, index: number) => {
        if (field.currency && !networkOptions[field.currency]) {
          fetchNetworksForCurrency(field.currency, index);
        }
      });
    }
  }, [customFields, fetchNetworksForCurrency, networkOptions]);
  return (
    <div className="card-dashed space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-muted-400 text-sm dark:text-muted-600">
          {t("Wallets")}
        </label>
        <IconButton
          className="flex items-center"
          color="success"
          onClick={addField}
          size={"sm"}
          variant="pastel"
        >
          <Icon className="h-5 w-5" icon="ph:plus" />
        </IconButton>
      </div>
      {Array.isArray(customFields) &&
        customFields.map((field, index) => {
          const currentNetworks = field.currency
            ? networkOptions[field.currency] || []
            : [];
          const isLoadingNetworks = loadingNetworks[index];

          return (
            <div className="flex gap-4" key={index}>
              <Select
                label="Select currency"
                onChange={(e) => updateField(index, "currency", e.target.value)}
                options={(fields as any)?.currency}
                value={field.currency}
              />
              <Select
                disabled={!field.currency || isLoadingNetworks}
                label={
                  isLoadingNetworks ? "Loading networks..." : "Select network"
                }
                onChange={(e) => updateField(index, "network", e.target.value)}
                options={
                  currentNetworks.length > 0
                    ? [
                        { value: "", label: "Select a network" },
                        ...currentNetworks,
                      ]
                    : [
                        {
                          value: "",
                          label: field.currency
                            ? "No networks available"
                            : "Select currency first",
                        },
                      ]
                }
                value={field.network}
              />
              {customInputIndexes.includes(index) && (
                <Input
                  label="Type address"
                  onChange={(e) =>
                    updateField(index, "address", e.target.value)
                  }
                  placeholder={"Add new address"}
                  value={field.address}
                />
              )}
              {!customInputIndexes.includes(index) && (
                <Select
                  label="Select address"
                  onChange={(e) =>
                    updateField(index, "address", e.target.value)
                  }
                  options={customOptions as any}
                  value={field.address}
                />
              )}
              <IconButton
                color="danger"
                onClick={() => removeField(index)}
                variant="pastel"
              >
                <Icon className="h-5 w-5" icon="ph:x" />
              </IconButton>
            </div>
          );
        })}
    </div>
  );
};
export const CustomAddressWalletsPairFields =
  CustomAddressWalletsPairFieldsBase;
