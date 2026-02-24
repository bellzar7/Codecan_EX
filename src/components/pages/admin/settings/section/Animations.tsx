import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import { Lottie } from "@/components/elements/base/lottie";
import { lottiesConfig } from "@/utils/animations";
import renderField from "../RenderField";

const animationsFields = [
  {
    name: "lottieAnimationStatus",
    label: "Enable Lottie Animations",
    placeholder: "Enable or disable",
    description:
      "Toggle the display of Lottie animated images in the application.",
    type: "switch",
    defaultValue: true,
  },
];

const AnimationsSection = ({
  formData,
  handleInputChange,
  handleFileChange,
  handleCancel,
  handleSave,
  hasChanges,
  isLoading,
}: {
  formData: any;
  handleInputChange: (params: { name: string; value: any }) => void;
  handleFileChange: (files: FileList, field: any) => Promise<void>;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  hasChanges: boolean;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();

  const renderLottieField = (config: any) => {
    const enabledName = `${config.name}Enabled`;
    const isEnabled =
      typeof formData[enabledName] === "undefined"
        ? true
        : String(formData[enabledName]) === "true";

    const switchField = {
      name: enabledName,
      label: config.label,
      placeholder: `Enable ${config.label}`,
      description: "Enable or disable this specific lottie animation",
      type: "switch",
      defaultValue: true,
    };

    let category = config.category;
    let path = config.path;
    let max = config.max;
    const height = 250;
    const maxWidth = config.maxWidth;
    const maxHeight = config.maxHeight;

    if (config.dynamic) {
      const isForex = formData.forexInvestment === "true";
      category = isForex ? "stock-market" : "cryptocurrency-2";
      path = isForex ? "stock-market-monitoring" : "analysis-1";
      max = isForex ? 2 : undefined;
    } else if (typeof max === "function") max = max(formData);

    return (
      <div
        className="col-span-12 flex flex-col space-y-4 border-muted-200 border-b pb-4 dark:border-muted-800"
        key={config.name}
      >
        <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
          {renderField({
            field: switchField,
            formData,
            handleInputChange,
          })}
        </div>

        <div
          className={`${isEnabled ? "block" : "hidden"} flex justify-center`}
        >
          <Lottie
            category={category}
            classNames={"mx-auto "}
            height={height}
            max={max}
            path={path}
          />
        </div>

        <div className={`${isEnabled ? "hidden" : "block"}`}>
          {renderField({
            field: {
              name: `${config.name}File`,
              label: `${config.label} Alternative Image`,
              type: "file",
              description:
                "Upload your own image to replace the lottie animation",
              dir: "lottie",
              size: {
                width: maxWidth,
                height: maxHeight,
                maxWidth,
                maxHeight,
              },
            },
            formData,
            handleInputChange,
            handleFileChange,
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 grid w-full grid-cols-12 gap-6">
      <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg text-muted-800 tracking-wide dark:text-muted-100">
            {t("Animations")}
          </h3>
          <p className="max-w-xs text-muted-400 text-sm">
            {t("Manage Lottie animation settings and per-feature animations.")}
          </p>
        </div>
      </div>
      <div className="col-span-12 ltablet:col-span-7 lg:col-span-7">
        <div className="space-y-8 lg:max-w-xl">
          <div className="grid w-full grid-cols-12 gap-x-6 gap-y-4">
            {animationsFields.map((field) =>
              renderField({ field, formData, handleInputChange })
            )}
          </div>

          {lottiesConfig.map((config) => renderLottieField(config))}

          {hasChanges && (
            <div className="col-span-12 flex justify-end space-x-4">
              <Button color="default" onClick={handleCancel}>
                {t("Cancel")}
              </Button>
              <Button color="primary" loading={isLoading} onClick={handleSave}>
                {t("Save Changes")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimationsSection;
