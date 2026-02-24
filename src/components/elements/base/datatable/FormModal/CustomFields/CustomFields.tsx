import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import IconButton from "../../../button-icon/IconButton";
import type { CustomFieldsProps } from "./CustomFields.types";

const CustomFieldsBase = ({
  value = [],
  onFieldsChange,
}: CustomFieldsProps) => {
  const { t } = useTranslation();
  const [customFields, setCustomFields] = useState<CustomField[]>(value);
  useEffect(() => {
    if (Array.isArray(value)) {
      setCustomFields(value);
    }
  }, [value]);
  const addField = () => {
    const newField: CustomField = {
      title: "",
      type: "input",
      required: false,
    };
    const updatedFields = [...customFields, newField];
    setCustomFields(updatedFields);
    onFieldsChange?.(updatedFields);
  };
  const updateField = (
    index: number,
    field: keyof CustomField,
    value: string | boolean
  ) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], [field]: value };
    setCustomFields(newFields);
    onFieldsChange?.(newFields);
  };
  const removeField = (index: number) => {
    const newFields = [...customFields];
    newFields.splice(index, 1);
    setCustomFields(newFields);
    onFieldsChange?.(newFields);
  };
  return (
    <div className="card-dashed space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-muted-400 text-sm dark:text-muted-600">
          {t("Custom Fields")}
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
            <Input
              onChange={(e) => updateField(index, "title", e.target.value)}
              placeholder={t("Field Name")}
              type="text"
              value={field.title}
            />
            <Select
              onChange={(e) => updateField(index, "type", e.target.value)}
              options={[
                { value: "input", label: "Input" },
                { value: "textarea", label: "Textarea" },
              ]}
              value={field.type}
            />
            <ToggleSwitch
              checked={field.required}
              color="primary"
              id={`required-${index}`}
              label={t("Required")}
              onChange={(e) => updateField(index, "required", e.target.checked)}
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
export const CustomFields = CustomFieldsBase;
