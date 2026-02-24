import type { VariantProps } from "class-variance-authority";
import { type FC, type TextareaHTMLAttributes, useEffect, useRef } from "react";
import Loader from "@/components/elements/base/loader/Loader";
import { textareaVariants } from "@/components/elements/variants/textarea-variants";
import { focusClass } from "@/utils/constants";

interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "color">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  resize?: boolean;
  loading?: boolean;
  setFirstErrorInputRef?: (ref: HTMLTextAreaElement) => void;
}

const Textarea: FC<TextAreaProps> = ({
  label,
  error,
  color = "default",
  shape = "smooth",
  resize = false,
  loading = false,
  className: classes = "",
  setFirstErrorInputRef,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (setFirstErrorInputRef) {
      setFirstErrorInputRef(textareaRef.current as HTMLTextAreaElement);
    }
  }, [setFirstErrorInputRef, error]);

  return (
    <div className="w-full font-sans">
      {label ? <label className="text-muted-400 text-sm">{label}</label> : ""}
      <div className="relative w-full text-base">
        <textarea
          className={textareaVariants({
            color,
            shape,
            className: ` 
              ${classes}
              ${resize ? "" : "resize-none"}
              ${error ? "border-danger-500!" : ""}
              ${
                loading
                  ? "select-none! pointer-events-none text-transparent! shadow-none! placeholder:text-transparent!"
                  : ""
              }
              ${focusClass}
            `,
          })}
          ref={textareaRef}
          rows={4}
          {...props}
        />
        {loading ? (
          <div
            className={
              "absolute top-0 right-0 z-0 flex h-10 w-10 items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-primary-500 dark:text-muted-500"
            }
          >
            <Loader
              classNames={`dark:text-muted-200
                ${
                  color === "muted" || color === "mutedContrast"
                    ? "text-muted-400"
                    : "text-muted-300"
                }
              `}
              size={20}
              thickness={4}
            />
          </div>
        ) : (
          ""
        )}
        {error ? (
          <span className="-mt-1 block font-sans text-[0.6rem] text-danger-500">
            {error}
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Textarea;
