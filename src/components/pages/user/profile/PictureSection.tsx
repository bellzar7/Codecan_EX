import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import InputFile from "@/components/elements/form/input-file/InputFile";

const PictureSection = ({
  formData,
  handleFileChange,
  handleCancel,
  handleSave,
  hasChanges,
  setFormData,
  setChanges,
  isLoading,
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid w-full grid-cols-12 gap-6">
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="mt-4 space-y-2">
          <h3 className="font-medium text-lg text-muted-800 tracking-wide dark:text-muted-100">
            {t("Picture")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t(
              "Manage your profile picture or upload a new one. Having a nice profile picture helps your network to grow."
            )}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="lg:max-w-xl">
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            <div className="col-span-12 gap-5">
              <InputFile
                acceptedFileTypes={[
                  "image/png",
                  "image/jpeg",
                  "image/jpg",
                  "image/gif",
                  "image/svg+xml",
                  "image/webp",
                ]}
                bordered
                color="contrast"
                id="profile-picture"
                label={`${t("Max File Size")}: ${16} MB`}
                maxFileSize={16}
                onChange={(files) => handleFileChange(files)}
                onRemoveFile={() => {
                  setFormData({ ...formData, avatar: "" });
                  setChanges((prevChanges) => ({
                    ...prevChanges,
                    avatar: null,
                  }));
                }}
                preview={formData.avatar || ""}
                previewPlaceholder="/img/avatars/placeholder.webp"
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
export default PictureSection;
