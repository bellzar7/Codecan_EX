"use client";
import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Progress from "@/components/elements/base/progress/Progress";
import { MashImage } from "@/components/elements/MashImage";
import { useDataTable } from "@/stores/datatable";
import Message from "../../base/message/Message";
import { Tooltip } from "../../base/tooltips/Tooltip";

interface InputFileProps {
  id: string;
  acceptedFileTypes?: string[] | null;
  maxFileSize?: number;
  allowMultiple?: boolean;
  label?: string;
  labelAlt?: string;
  shape?: "straight" | "rounded-sm" | "smooth" | "curved" | "full";
  color?:
    | "default"
    | "contrast"
    | "muted"
    | "mutedContrast"
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "none";
  bordered?: boolean;
  spaced?: boolean;
  onChange: (files: File[]) => void;
  onRemoveFile?: (file: File) => void;
  preview: string | null;
  previewPlaceholder?: string;
  flex?: "row" | "col";
  error?: string;
}
const getPreview = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
export default function InputFile(props: InputFileProps) {
  const { t } = useTranslation();
  const {
    id,
    acceptedFileTypes,
    maxFileSize = 16,
    allowMultiple = false,
    label = "",
    labelAlt = "",
    shape = "smooth",
    color = "contrast",
    bordered = false,
    spaced = true,
    onChange,
    onRemoveFile,
    preview,
    previewPlaceholder,
    flex = "row",
    error,
  } = props;
  const MAX_FILE_BYTES = maxFileSize * 1024 * 1024; // MB to bytes
  const {
    setUploadStatus,
    setUploadError,
    resetUpload,
    fileUploadProgress,
    fileUploadStatus,
    uploadError,
    uploadSuccess,
  } = useDataTable();
  const isError = Object.values(fileUploadStatus).some(
    (status) => status !== "Uploaded"
  );
  useEffect(() => {
    setPreviews(preview ? [preview] : [previewPlaceholder]);
  }, [preview, previewPlaceholder]);
  const [previews, setPreviews] = useState<any[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (files) => {
    setUploadError(null);
    const filesArray: File[] = Array.from(files);
    for (const file of filesArray) {
      if (file.size > MAX_FILE_BYTES) {
        setUploadError(`File size cannot exceed ${maxFileSize} MB`);
        return setUploadStatus(file.name, "Error");
      }
      if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
        setUploadError(
          `File type not accepted. Accepted types: ${acceptedFileTypes.join(
            ", "
          )}`
        );
        return setUploadStatus(file.name, "Error");
      }
    }
    try {
      const newPreviews = await Promise.all(
        filesArray.map((file) => getPreview(file))
      );
      setPreviews(newPreviews);
      onChange(filesArray);
    } catch (error) {
      console.error("Error generating previews:", error);
      setUploadError("Error processing files");
    }
  };
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      handleFileChange(event.dataTransfer.files);
    }
    setIsDraggingOver(false);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };
  return (
    <div
      className={`flex w-full flex-col gap-2 ${isDraggingOver ? "border-primary-500 bg-primary-100" : "bg-muted-100"} 
    ${
      bordered && color === "default"
        ? "border border-muted-200 dark:border-muted-700"
        : ""
    }
    ${
      bordered && color === "contrast"
        ? "border border-muted-200 dark:border-muted-800"
        : ""
    }
    ${
      bordered && color === "muted"
        ? "border border-muted-200 dark:border-muted-700"
        : ""
    }
    ${
      bordered && color === "mutedContrast"
        ? "border border-muted-200 dark:border-muted-800"
        : ""
    }
    ${shape === "rounded-sm" ? "rounded-md" : ""}
    ${shape === "smooth" ? "rounded-lg" : ""}
    ${shape === "curved" ? "rounded-xl" : ""}
    ${shape === "full" ? "rounded-xl" : ""}
    ${color === "default" ? "bg-white dark:bg-muted-800" : ""}
    ${color === "contrast" ? "bg-white dark:bg-muted-900" : ""}
    ${color === "muted" ? "bg-muted-100 dark:bg-muted-800" : ""}
    ${color === "mutedContrast" ? "bg-muted-100 dark:bg-muted-900" : ""}
  `}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {uploadSuccess ? (
        <div
          className={`flex flex-col gap-2 py-3 ${spaced ? "px-6" : ""}
        `}
        >
          {isError ? (
            <div className="mt-3 w-full text-center [&+div]:hidden">
              <IconBox
                className="mx-auto mb-2 rotate-45"
                color="danger"
                icon="ph:plus-circle-duotone"
                variant="pastel"
              />
              <h3 className="mb-1 font-light text-base text-muted-800 dark:text-muted-100">
                {t("Upload error")}
              </h3>
              <p className="mx-auto max-w-[320px] text-muted-500 text-sm dark:text-muted-400">
                {t("Sorry, there was a problem uploading your file(s).")}
              </p>
            </div>
          ) : (
            <></>
          )}
          <div className="mt-3 w-full text-center">
            <IconBox
              className="mx-auto mb-2"
              color="success"
              icon="ph:check-circle-duotone"
              variant="pastel"
            />
            <h3 className="mb-1 font-light text-base text-muted-800 dark:text-muted-100">
              {t("Upload Complete")}
            </h3>
            <p className="mx-auto max-w-[320px] text-muted-500 text-sm dark:text-muted-400">
              {t("Great, your file(s) were successfully uploaded.")}
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <label
            className={`block pt-6 pb-3 ${spaced ? "px-6" : ""}
          `}
          >
            <span className="block text-muted-500 text-sm dark:text-muted-400">
              {label}
            </span>
            <span className="block text-muted-500 text-xs dark:text-muted-400">
              {labelAlt}
            </span>
          </label>

          {isError ? (
            ""
          ) : (
            <div
              className={`group flex w-full justify-between gap-4 flex-${flex}
              ${spaced ? "px-6" : ""}
            `}
            >
              <div
                className={`relative w-full border-2 border-muted-300 border-dashed bg-muted-50 p-5 dark:border-muted-700 dark:bg-muted-800 ${shape === "rounded-sm" ? "rounded-md" : ""}
                ${shape === "smooth" ? "rounded-lg" : ""}
                ${shape === "curved" ? "rounded-xl" : ""}
                ${shape === "full" ? "rounded-xl" : ""}
            `}
              >
                <svg
                  className="mx-auto mb-4 h-14 w-14 text-muted-400 transition-colors duration-300 group-hover:text-primary-500"
                  height="32"
                  viewBox="0 0 24 24"
                  width="32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none" stroke="currentColor" strokeLinejoin="round">
                    <path d="M2 14.5A4.5 4.5 0 0 0 6.5 19h12a3.5 3.5 0 0 0 .5-6.965a7 7 0 0 0-13.76-1.857A4.502 4.502 0 0 0 2 14.5Z" />
                    <path
                      d="m14 11l-2-2m0 0l-2 2m2-2v6"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
                <div className="mx-auto flex max-w-xs flex-col text-center">
                  <label>
                    <input
                      accept={
                        acceptedFileTypes
                          ? acceptedFileTypes.join(",")
                          : undefined
                      }
                      className="hidden w-36 cursor-pointer text-sm"
                      id={id}
                      multiple={allowMultiple}
                      onChange={(event) => handleFileChange(event.target.files)}
                      ref={fileInputRef}
                      type="file" // Added the 'multiple' attribute conditionally
                    />
                    <label
                      className={`mx-auto flex w-40 cursor-pointer items-center justify-center bg-primary-500 px-3 py-2 text-center font-normal text-sm text-white transition-colors duration-300 hover:bg-primary-400 active:bg-primary-500 ${shape === "rounded-sm" ? "rounded-md" : ""}
                      ${shape === "smooth" ? "rounded-lg" : ""}
                      ${shape === "curved" ? "rounded-xl" : ""}
                      ${shape === "full" ? "rounded-full" : ""}
                    `}
                      htmlFor={id}
                    >
                      {t("Select File")}
                      {allowMultiple ? "s" : ""}
                    </label>
                  </label>

                  <div className="mt-3 text-muted-500 text-xs uppercase dark:text-muted-400">
                    {t("or drop")} {allowMultiple ? "" : "a"} {t("file")}
                    {allowMultiple ? "s" : ""} {t("here")}
                  </div>
                </div>
              </div>
              {previews.length > 0 && (
                <div
                  className={`relative border-2 border-muted-300 border-dashed bg-muted-50 p-5 dark:border-muted-700 dark:bg-muted-800 ${shape === "rounded-sm" ? "rounded-md" : ""}
              ${shape === "smooth" ? "rounded-lg" : ""}
              ${shape === "curved" ? "rounded-xl" : ""}
              ${shape === "full" ? "rounded-xl" : ""}
          `}
                >
                  {previews.map((preview, index) => (
                    <div
                      className={`relative flex h-32 w-32 flex-col items-center justify-center rounded-md bg-muted-50 dark:bg-muted-800 ${shape === "rounded-sm" ? "rounded-md" : ""}
          ${shape === "smooth" ? "rounded-lg" : ""}
          ${shape === "curved" ? "rounded-xl" : ""}
          ${shape === "full" ? "rounded-xl" : ""}
        `}
                      key={index}
                    >
                      {preview && (
                        <MashImage
                          alt="preview"
                          className="h-full w-full rounded-md object-cover"
                          fill
                          src={preview}
                        />
                      )}
                      {preview !== previewPlaceholder && (
                        <span className="absolute -top-2 -right-2">
                          <Tooltip content={t("Remove file")} position="top">
                            <button
                              className="rounded-full bg-white text-danger-500 shadow-md transition-colors duration-300 hover:bg-danger-500 hover:text-white"
                              onClick={() => {
                                onRemoveFile && onRemoveFile(preview);
                                setPreviews((prev) =>
                                  prev.filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <Icon
                                className="h-6 w-6"
                                icon="ph:x-circle-fill"
                              />
                            </button>
                          </Tooltip>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className="block px-6 pt-3">
            {uploadError && (
              <Message
                color="danger"
                icon="ph:warning-octagon-duotone"
                isFixed={false}
                label={uploadError || ""}
              />
            )}
          </label>

          {error && (
            <span className="mt-1 px-6 pt-3 text-danger-500 text-sm">
              {error}
            </span>
          )}
        </div>
      )}

      <div
        className={`flex flex-col-reverse gap-2 overflow-x-auto ${spaced ? "px-6" : ""}
      `}
      >
        {Object.entries(fileUploadProgress).map(([fileName, progress]) => (
          <div className="flex flex-col gap-1 text-xs" key={fileName}>
            <p className="text-muted-500 dark:text-muted-400">{fileName}</p>
            <div className="flex h-6 items-center gap-2 overflow-hidden rounded-full border border-muted-200 px-3 dark:border-muted-700">
              <Progress size="xs" value={progress} />
              {progress === 100 ? (
                <>
                  {fileUploadStatus[fileName] === "Uploaded" ? (
                    <Icon
                      className="-me-3 h-6 w-6 text-success-500"
                      icon="ph:check-circle-duotone"
                    />
                  ) : (
                    <Icon
                      className="-me-3 h-6 w-6 rotate-45 text-danger-500"
                      icon="ph:plus-circle-duotone"
                    />
                  )}
                </>
              ) : (
                ""
              )}
            </div>
            <p className="mb-2 font-normal text-danger-500 text-xs">
              {fileUploadStatus[fileName] !== "Uploaded"
                ? fileUploadStatus[fileName]
                : ""}
            </p>
          </div>
        ))}
      </div>
      <div>
        {uploadSuccess || isError ? (
          <div
            className={`pb-6 ${spaced ? "px-6" : ""}
          `}
          >
            <Button
              className="w-full"
              color="muted"
              onClick={resetUpload}
              shape={shape}
              type="button"
            >
              {t("Upload Again")}
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
