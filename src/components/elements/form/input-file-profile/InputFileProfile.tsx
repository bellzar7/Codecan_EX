import { Icon, type IconifyIcon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import type React from "react";
import type { FC } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";

interface InputFileProfileProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  id: string;
  value?: string;
  preview?: string;
  previewSize?: "lg" | "xl";
  previewIcon?: string | IconifyIcon;
  acceptedFileTypes?: string[] | null;
  color?:
    | "default"
    | "contrast"
    | "muted"
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger";
  shape?: "smooth" | "rounded-sm" | "curved" | "full";
  onRemoveFile?: () => void;
}
const InputFileProfile: FC<InputFileProfileProps> = ({
  id,
  value,
  preview,
  previewSize = "lg",
  previewIcon = "fluent:person-24-filled",
  acceptedFileTypes = ["image/*"],
  color = "default",
  shape = "full",
  onRemoveFile,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`relative inline-flex items-center justify-center border-2 border-muted-300 dark:border-muted-700 ${shape === "rounded-sm" ? "rounded-md" : ""}
          ${shape === "smooth" ? "rounded-lg" : ""}
          ${shape === "curved" ? "rounded-xl" : ""}
          ${shape === "full" ? "rounded-full" : ""}
      `}
    >
      <input
        accept={acceptedFileTypes ? acceptedFileTypes.join(",") : undefined}
        id={id}
        name={id}
        type="file"
        {...props}
        className={`absolute inset-0 z-2 h-full w-full cursor-pointer opacity-0 ${
          value ? "pointer-events-none" : ""
        }`}
      />
      <Avatar shape={shape} size={previewSize} src={preview} text="">
        {value || preview ? (
          ""
        ) : (
          <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-muted-500 dark:text-muted-600">
            <Icon
              className={`
              ${previewSize === "lg" ? "h-8 w-8" : ""} 
              ${previewSize === "xl" ? "h-10 w-10" : ""}
            `}
              icon={previewIcon}
            />
          </div>
        )}
      </Avatar>

      {value ? (
        <div
          className={`absolute ${previewSize === "lg" ? "right-0 bottom-0" : ""}
            ${previewSize === "xl" ? "right-0.5 bottom-0.5" : ""}
          `}
          onClick={() => {
            onRemoveFile?.();
          }}
        >
          <Tooltip content={t("Remove file")} position="top">
            <IconButton shape="full" size="sm">
              <Icon className="h-3 w-3" icon="lucide:x" />
            </IconButton>
          </Tooltip>
        </div>
      ) : (
        ""
      )}

      {value ? (
        ""
      ) : (
        <label
          className={`absolute ${previewSize === "lg" ? "right-0 bottom-0" : ""}
            ${previewSize === "xl" ? "right-0.5 bottom-0.5" : ""}
          `}
          htmlFor={id}
        >
          <Tooltip content={t("Add picture")} position="top">
            <IconButton color={color} shape="full" size="sm">
              <Icon className="h-4 w-4" icon="lucide:plus" />
            </IconButton>
          </Tooltip>
        </label>
      )}
    </div>
  );
};
export default InputFileProfile;
