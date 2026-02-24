import { useTranslation } from "next-i18next";
import type React from "react";
import type { FC } from "react";

interface InputFileFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  value?: string;
  acceptedFileTypes?: string[] | null;
  label: string;
  maxFileSize?: number;
  color?: "default" | "contrast" | "muted" | "mutedContrast";
  shape?: "smooth" | "rounded-sm" | "curved" | "full";
  error?: string;
}
const InputFileField: FC<InputFileFieldProps> = ({
  id,
  value,
  acceptedFileTypes,
  label,
  maxFileSize = 5,
  color = "default",
  shape = "smooth",
  error,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <div className="relative w-full">
      {!!label && (
        <label className="font-sans text-[0.68rem] text-muted-400">
          {label}
        </label>
      )}
      <div
        className={`relative flex items-center justify-between border-2 px-4 py-3 transition duration-150 ease-in-out ${
          color === "default"
            ? "border-muted-200 bg-white hover:border-primary-500 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500"
            : ""
        }
        ${
          color === "contrast"
            ? "bg-white hover:border-primary-500 dark:border-muted-800 dark:bg-muted-950 dark:hover:border-primary-500"
            : ""
        }
        ${
          color === "muted"
            ? "border-muted-200 bg-muted-100 hover:border-primary-500 dark:border-muted-700 dark:bg-muted-800 dark:hover:border-primary-500"
            : ""
        }
        ${
          color === "mutedContrast"
            ? "border-muted-200 bg-muted-100 hover:border-primary-500 dark:border-muted-800 dark:bg-muted-950 dark:hover:border-primary-500"
            : ""
        }
        ${shape === "rounded-sm" ? "rounded-md" : ""}
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
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div className="flex items-center">
          <svg
            className="h-6 w-6 shrink-0 text-muted-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <div className="ms-2">
            <span className="line-clamp-1 text-muted-600 text-sm dark:text-muted-400">
              {value ? value : "Choose a file"}
            </span>
          </div>
        </div>
        {value ? (
          ""
        ) : (
          <span className="hidden text-muted-500 text-sm sm:block">
            {t("Max file size")} {maxFileSize} {t("MB")}
          </span>
        )}
      </div>
      {!!error && (
        <span className="mt-1 px-6 pt-3 text-danger-500 text-sm">{error}</span>
      )}
    </div>
  );
};
export default InputFileField;
