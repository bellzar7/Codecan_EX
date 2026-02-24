import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import IconButton from "../../../button-icon/IconButton";
import type { CustomRestrictionPairFieldsProps } from "./RestrictionPairFields.types";

const CustomRestrictionPairFieldsBase = ({
  value,
  fields = [],
  onFieldsChange,
}: CustomRestrictionPairFieldsProps) => {
  const { t } = useTranslation();
  const [customFields, setCustomFields] = useState<
    CustomAddressWalletsPairFields[] | unknown
  >(value);
  const [_customOptions, setCustomOptions] = useState<
    CustomAddressWalletsPairFields[] | unknown
  >(value);
  const [_customInputIndexes, setCustomInputIndexes] = useState<number[]>([]);

  useEffect(() => {
    setCustomFields(value);
  }, [value]);
  useEffect(() => {
    console.log("fields", fields);
    setCustomOptions([
      ...(fields as any)?.reason,
      { value: "Add new reason", label: "Add new reason" },
    ]);
  }, [fields]);
  const addField = () => {
    const newField: CustomRestrictionPairFields = {
      section: (fields as any)?.section[0]?.value || "",
      isAllowed: (fields as any)?.isAllowed[0]?.value,
      reason: (fields as any)?.reason[0]?.value || "",
    };
    const valueToSet = Array.isArray(customFields) ? customFields : [];
    const updatedFields = [...valueToSet, newField];
    setCustomFields(updatedFields);
    onFieldsChange?.(updatedFields);
  };
  const updateField = (
    index: number,
    field: keyof CustomRestrictionPairFields,
    value: string | boolean
  ) => {
    if (value === "Add new reason") {
      setCustomInputIndexes((prev) =>
        prev.includes(index) ? prev : [...prev, index]
      );
      return;
    }
    const newFields = [...(customFields as any[])];
    newFields[index] = { ...newFields[index], [field]: value };
    setCustomFields(newFields);
    onFieldsChange?.(newFields);
  };
  const removeField = (index: number) => {
    const newFields = [...(customFields as any[])];
    newFields.splice(index, 1);
    setCustomFields(newFields);
    onFieldsChange?.(newFields);
  };
  return (
    <div className="card-dashed space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-muted-400 text-sm dark:text-muted-600">
          {t("Restrictions")}
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
        customFields.map((field, index) => (
          <div className="flex gap-4" key={index}>
            <Select
              label="Select section"
              onChange={(e) => updateField(index, "section", e.target.value)}
              options={(fields as any)?.section}
              value={field.section}
            />
            <Select
              label="Select isAllowed"
              onChange={(e) => updateField(index, "isAllowed", e.target.value)}
              options={(fields as any)?.isAllowed}
              value={field.isAllowed}
            />
            <Input
              label="Type reason"
              onChange={(e) => updateField(index, "reason", e.target.value)}
              value={field.reason}
            />
            <IconButton
              color="danger"
              onClick={() => removeField(index)}
              variant="pastel"
            >
              <Icon className="h-5 w-5" icon="ph:x" />
            </IconButton>
          </div>
        ))}
    </div>
  );
};
export const CustomRestrictionPairFields = CustomRestrictionPairFieldsBase;
