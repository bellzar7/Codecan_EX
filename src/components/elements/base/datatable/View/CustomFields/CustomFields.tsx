import { useTranslation } from "next-i18next";
import Input from "@/components/elements/form/input/Input";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import type { CustomFieldsProps } from "./CustomFields.types";

const CustomFieldsBase = ({ value = [] }: CustomFieldsProps) => {
  const { t } = useTranslation();
  return (
    <div className="card-dashed space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-muted-400 text-sm dark:text-muted-600">
          {t("Custom Fields")}
        </label>
      </div>
      {value?.map((field, index) => (
        <div className="flex gap-4" key={index}>
          <Input
            placeholder={t("Field Name")}
            readOnly={true}
            type="text"
            value={field.title}
          />
          <Input
            placeholder={t("Field Type")}
            readOnly={true}
            type="text"
            value={field.type}
          />
          <ToggleSwitch
            checked={field.required}
            color="primary"
            id={`required-${index}`}
            label={t("Required")}
          />
        </div>
      ))}
    </div>
  );
};
export const CustomFields = CustomFieldsBase;
