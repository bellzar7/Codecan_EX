import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import renderField from "../RenderField";

const investmentFields = [
  {
    name: "investment",
    label: "General Investment",
    placeholder: "Select an option",
    description: "Enable or disable investment feature",
    type: "switch",
  },
  {
    name: "forexInvestment",
    label: "Forex Investment",
    placeholder: "Select an option",
    description: "Enable or disable investment feature in Forex",
    type: "switch",
  },
];

const InvestmentSection = ({
  formData,
  handleInputChange,
  handleCancel,
  handleSave,
  hasChanges,
  isLoading,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 grid w-full grid-cols-12 gap-6">
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg text-muted-800 tracking-wide dark:text-muted-100">
            {t("Investments")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t("Manage investment-related settings and restrictions.")}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="lg:max-w-xl">
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            {investmentFields.map((field) =>
              renderField({ field, formData, handleInputChange })
            )}
            {hasChanges && (
              <div className="col-span-12 flex justify-end space-x-4">
                <Button color="default" onClick={handleCancel}>
                  {t("Cancel")}
                </Button>
                <Button
                  color="primary"
                  loading={isLoading}
                  onClick={handleSave}
                >
                  {t("Save Changes")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSection;
