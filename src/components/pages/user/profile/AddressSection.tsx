import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";

const AddressSection = ({
  formData,
  handleInputChange,
  handleCancel,
  handleSave,
  hasChanges,
  isLoading,
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid w-full grid-cols-12 gap-6">
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-lg text-muted-800 tracking-wide dark:text-muted-100">
            {t("Address")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t("Provide your address details.")}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="lg:max-w-xl">
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            <div className="col-span-12 md:col-span-6">
              <Input
                label={t("Address")}
                name="address"
                onChange={handleInputChange}
                placeholder={t("Enter address")}
                value={formData.address}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                label={t("City")}
                name="city"
                onChange={handleInputChange}
                placeholder={t("Enter city")}
                value={formData.city}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                label={t("Country")}
                name="country"
                onChange={handleInputChange}
                placeholder={t("Enter country")}
                value={formData.country}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                label={t("Zip")}
                name="zip"
                onChange={handleInputChange}
                placeholder={t("Enter zip")}
                value={formData.zip}
              />
            </div>
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
export default AddressSection;
