import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import Alert from "@/components/elements/base/alert/Alert";
import Button from "@/components/elements/base/button/Button";
import renderField from "../RenderField";

const restrictionFields = [
  {
    name: "kycStatus",
    label: "Enable KYC",
    placeholder: "Enable or disable",
    description: "Toggle KYC verification for user accounts.",
    type: "switch",
  },
  {
    name: "tradeRestrictions",
    label: "Trade Restrictions",
    placeholder: "Select an option",
    description: "Restrict trading for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "binaryRestrictions",
    label: "Binary Restrictions",
    placeholder: "Select an option",
    description: "Restrict binary trading for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "forexRestrictions",
    label: "Forex Restrictions",
    placeholder: "Select an option",
    description: "Restrict forex trading for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "aiInvestmentRestrictions",
    label: "AI Investment Restrictions",
    placeholder: "Select an option",
    description: "Restrict AI investment for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "icoRestrictions",
    label: "ICO Restrictions",
    placeholder: "Select an option",
    description: "Restrict ICO investment for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "mlmRestrictions",
    label: "MLM Restrictions",
    placeholder: "Select an option",
    description: "Restrict MLM investment for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "walletRestrictions",
    label: "Wallet Restrictions",
    placeholder: "Select an option",
    description: "Restrict wallet usage for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "depositRestrictions",
    label: "Deposit Restrictions",
    placeholder: "Select an option",
    description: "Restrict deposits for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "transferRestrictions",
    label: "Transfer Restrictions",
    placeholder: "Select an option",
    description: "Restrict transfers for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "withdrawalRestrictions",
    label: "Withdrawal Restrictions",
    placeholder: "Select an option",
    description: "Restrict withdrawals for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "ecommerceRestrictions",
    label: "Ecommerce Restrictions",
    placeholder: "Select an option",
    description: "Restrict ecommerce for clients with incomplete KYC",
    type: "switch",
  },
  {
    name: "stakingRestrictions",
    label: "Staking Restrictions",
    placeholder: "Select an option",
    description: "Restrict staking for clients with incomplete KYC",
    type: "switch",
  },
];

const RestrictionsSection = ({
  formData,
  handleInputChange,
  handleCancel,
  handleSave,
  hasChanges,
  isLoading,
  kycStatus,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 grid w-full grid-cols-12 gap-6">
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg text-muted-800 tracking-wide dark:text-muted-100">
            {t("Restrictions")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t(
              "Control client restrictions in the system depending on their KYC status."
            )}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="lg:max-w-xl">
          {!kycStatus && (
            <div className="mb-4">
              <Alert canClose={false} color={"danger"}>
                <div className="flex items-center justify-start gap-4">
                  <Icon className="h-7 w-7 text-danger-500" icon="mdi:alert" />
                  <div className="flex w-full flex-col items-start">
                    <h3>{t("Template Required")}</h3>
                    <span className="text-sm">
                      {t(
                        "Please set up a KYC template before configuring restrictions:"
                      )}{" "}
                      <Link
                        className="text-primary-500 underline"
                        href="/admin/crm/kyc/template"
                      >
                        {t("KYC Templates")}
                      </Link>
                    </span>
                  </div>
                </div>
              </Alert>
            </div>
          )}
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            {restrictionFields.map((field) =>
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

export default RestrictionsSection;
