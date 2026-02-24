import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";

const SocialMediaSection = ({
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
            {t("Social Media")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t(
              "Add your social media profiles so that people can connect with you on other platforms."
            )}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="lg:max-w-xl">
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            <div className="col-span-12 md:col-span-6">
              <Input
                icon="fa6-brands:twitter"
                label={t("Twitter URL")}
                name="twitter"
                onChange={handleInputChange}
                placeholder={t("Ex: twitter.com/johndoe")}
                value={formData.twitter}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                icon="fa6-brands:dribbble"
                label={t("Dribbble URL")}
                name="dribbble"
                onChange={handleInputChange}
                placeholder={t("Ex: dribbble.com/johndoe")}
                value={formData.dribbble}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                icon="fa6-brands:instagram"
                label={t("Instagram URL")}
                name="instagram"
                onChange={handleInputChange}
                placeholder={t("Ex: instagram.com/johndoe")}
                value={formData.instagram}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                icon="fa6-brands:github"
                label={t("Github URL")}
                name="github"
                onChange={handleInputChange}
                placeholder={t("Ex: github.com/johndoe")}
                value={formData.github}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                icon="fa6-brands:gitlab"
                label={t("Gitlab URL")}
                name="gitlab"
                onChange={handleInputChange}
                placeholder={t("Ex: gitlab.com/johndoe")}
                value={formData.gitlab}
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <Input
                icon="fa6-brands:telegram"
                label={t("Telegram URL")}
                name="telegram"
                onChange={handleInputChange}
                placeholder={t("Ex: t.me/johndoe")}
                value={formData.telegram}
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
export default SocialMediaSection;
