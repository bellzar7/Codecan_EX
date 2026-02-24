import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import renderField from "../RenderField";

const socialFields = [
  {
    name: "facebookLink",
    label: "Facebook Link",
    placeholder: "Enter Facebook link",
    type: "url",
  },
  {
    name: "twitterLink",
    label: "Twitter Link",
    placeholder: "Enter Twitter link",
    type: "url",
  },
  {
    name: "instagramLink",
    label: "Instagram Link",
    placeholder: "Enter Instagram link",
    type: "url",
  },
  {
    name: "linkedinLink",
    label: "LinkedIn Link",
    placeholder: "Enter LinkedIn link",
    type: "url",
  },
  {
    name: "telegramLink",
    label: "Telegram Link",
    placeholder: "Enter Telegram link",
    type: "url",
  },
];

const SocialLinksSection = ({
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
            {t("Social Links")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t("Manage social media links for the footer.")}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="lg:max-w-xl">
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            {socialFields.map((field) =>
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

export default SocialLinksSection;
