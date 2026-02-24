import { Combobox, Transition } from "@headlessui/react";
import { Icon, type IconifyIcon } from "@iconify/react";
import type { VariantProps } from "class-variance-authority";
import { useTranslation } from "next-i18next";
import {
  type FC,
  Fragment,
  type InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Loader from "@/components/elements/base/loader/Loader";
import { inputVariants } from "@/components/elements/variants/input-variants";

interface ComboBoxItem {
  value: any;
  label: string;
  icon?: IconifyIcon | string;
  image?: string;
}

interface ComboBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color">,
    VariantProps<typeof inputVariants> {
  label?: string;
  multiple?: boolean;
  error?: string;
  value?: any;
  selected: any;
  setSelected: any;
  disabled?: boolean;
  loading?: boolean;
  options?: ComboBoxItem[];
  classNames?: string;
  onChange?: (value: any) => void;
  onClose?: () => void;
  setFirstErrorInputRef?: (ref: HTMLInputElement) => void;
}

const ComboBox: FC<ComboBoxProps> = ({
  selected,
  setSelected,
  label,
  size = "md",
  color = "default",
  shape = "smooth",
  disabled,
  loading = false,
  options = [],
  classNames,
  error,
  onClose,
  setFirstErrorInputRef,
  ...props
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        onClose
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    if (setFirstErrorInputRef) {
      setFirstErrorInputRef(selectRef.current as unknown as HTMLInputElement);
    }
  }, [setFirstErrorInputRef, error]);

  const [query, setQuery] = useState("");
  const filteredItems =
    query === ""
      ? options
      : options.filter((item) =>
          item.label
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return (
    <div className={`relative w-full ${classNames}`}>
      <Combobox onChange={setSelected} ref={inputRef} value={selected ?? ""}>
        <div className="relative mt-1">
          {!!label && (
            <label className="font-sans text-[0.68rem] text-muted-400">
              {label}
            </label>
          )}
          <div className="relative z-20 w-full font-sans">
            <Combobox.Input
              className={inputVariants({
                size,
                color,
                shape,
                className: `peer relative text-start ${size === "sm" && selected?.icon ? "ps-8 pe-2" : ""}
                ${size === "md" && selected?.icon ? "ps-10 pe-3" : ""}
                ${size === "lg" && selected?.icon ? "ps-12 pe-4" : ""}
                ${size === "sm" && selected?.image ? "ps-8 pe-2" : ""}
                ${size === "md" && selected?.image ? "ps-11 pe-3" : ""}
                ${size === "lg" && selected?.image ? "ps-12 pe-4" : ""}
                ${size === "sm" && !selected?.icon ? "px-2" : ""}
                ${size === "md" && !selected?.icon ? "px-3" : ""}
                ${size === "lg" && !selected?.icon ? "px-4" : ""}
                ${size === "sm" && !selected?.image ? "px-2" : ""}
                ${size === "md" && !selected?.image ? "px-3" : ""}
                ${size === "lg" && !selected?.image ? "px-4" : ""}
                ${error ? "border-danger-500!" : ""}
                ${
                  disabled
                    ? "pointer-events-none! cursor-not-allowed! opacity-50!"
                    : ""
                }
                ${
                  loading
                    ? "select-none! pointer-events-none text-transparent! shadow-none! placeholder:text-transparent!"
                    : ""
                }
              `,
              })}
              displayValue={(item: any) => {
                return item && typeof item === "object" && item.label
                  ? item.label
                  : item;
              }}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              {...props}
            />
            <div
              className={`absolute top-0 left-0 z-0 flex items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-primary-500 dark:text-muted-500 ${size === "sm" ? "h-8 w-8" : ""} 
                ${size === "md" ? "h-10 w-10" : ""} 
                ${size === "lg" ? "h-12 w-12" : ""}`}
            >
              {!!selected?.icon && !selected?.image ? (
                <Icon
                  className={`
                    ${size === "sm" ? "h-3 w-3" : ""} 
                    ${size === "md" ? "h-4 w-4" : ""} 
                    ${size === "lg" ? "h-5 w-5" : ""}
                    ${error ? "text-danger-500!" : ""}
                  `}
                  icon={selected?.icon}
                />
              ) : (
                ""
              )}
              {!!selected?.image && !selected?.icon ? (
                <Avatar
                  size={size === "lg" ? "xxs" : "xxxs"}
                  src={selected?.image}
                  text={selected?.label.substring(0, 1)}
                />
              ) : (
                ""
              )}
            </div>
            {loading ? (
              <div
                className={`absolute top-0 right-0 z-0 flex items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-primary-500 dark:text-muted-500 ${size === "sm" ? "h-8 w-8" : ""} 
                  ${size === "md" ? "h-10 w-10" : ""} 
                  ${size === "lg" ? "h-12 w-12" : ""}`}
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
            <Combobox.Button
              className={`absolute top-0 right-0 flex items-center justify-center peer:focus-visible:[&>svg]:rotate-180 ${size === "sm" ? "h-8 w-8" : ""} 
                ${size === "md" ? "h-10 w-10" : ""} 
                ${size === "lg" ? "h-12 w-12" : ""}
                ${
                  loading
                    ? "pointer-events-none! select-none! text-transparent! opacity-0!"
                    : ""
                }
              `}
            >
              <Icon
                aria-hidden="true"
                className="h-4 w-4 text-muted-400 transition-transform duration-300"
                icon="lucide:chevrons-up-down"
              />
            </Combobox.Button>
          </div>
          <Transition
            afterLeave={() => setQuery("")}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options
              className={`slimscroll !p-2 absolute z-30 mt-1 max-h-[300px] w-full overflow-auto border text-base shadow-lg shadow-muted-300/30 ring-1 ring-primary-500 ring-opacity-5 focus:outline-hidden sm:text-sm dark:shadow-muted-800/20 ${shape === "rounded-sm" ? "rounded-md" : ""}
                ${shape === "smooth" ? "rounded-lg" : ""}
                ${shape === "rounded-sm" ? "rounded-md" : ""}
                ${shape === "curved" ? "rounded-xl" : ""}
                ${shape === "full" ? "rounded-xl" : ""}
                ${
                  color === "default"
                    ? "border-muted-200 bg-white dark:border-muted-700 dark:bg-muted-800"
                    : ""
                }
                ${
                  color === "contrast"
                    ? "border-muted-200 bg-white dark:border-muted-800 dark:bg-muted-950"
                    : ""
                }
                ${
                  color === "muted"
                    ? "border-muted-200 bg-white dark:border-muted-700 dark:bg-muted-800"
                    : ""
                }
                ${
                  color === "mutedContrast"
                    ? "border-muted-200 bg-white dark:border-muted-800 dark:bg-muted-950"
                    : ""
                }
              `}
              ref={selectRef}
            >
              {filteredItems.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  {t("Nothing found.")}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Combobox.Option
                    className={({
                      active,
                    }) => `relative flex cursor-default select-none items-center gap-2 p-2 transition-colors duration-300 ${
                      active
                        ? "bg-primary-500/10 text-primary-700 dark:bg-primary-500/20"
                        : "text-muted-600 dark:text-muted-400"
                    }
                      ${shape === "rounded-sm" ? "rounded-md" : ""}
                      ${shape === "smooth" ? "rounded-lg" : ""}
                      ${shape === "rounded-sm" ? "rounded-md" : ""}
                      ${shape === "curved" ? "rounded-xl" : ""}
                      ${shape === "full" ? "rounded-xl" : ""}
                    `}
                    key={item.value}
                    value={item.value}
                  >
                    {({ selected, active }) => (
                      <>
                        {!!item?.icon && !item?.image ? (
                          <span
                            className={
                              "pointer-events-none flex items-center justify-center"
                            }
                          >
                            <Icon
                              aria-hidden="true"
                              className="h-5 w-5 text-muted-400 transition-colors duration-300"
                              icon={item?.icon}
                            />
                          </span>
                        ) : (
                          ""
                        )}
                        {!!item?.image && !item?.icon ? (
                          <Avatar
                            size="xxs"
                            src={item?.image}
                            text={item?.label.substring(0, 1)}
                          />
                        ) : (
                          ""
                        )}
                        <span
                          className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                        >
                          {item.label}
                        </span>
                        {selected ? (
                          <span
                            className={`relative z-0 ms-auto flex items-center pe-2 text-primary-600 ${
                              active ? "" : ""
                            }`}
                          >
                            <Icon
                              aria-hidden="true"
                              className="h-4 w-4"
                              icon="lucide:check"
                            />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default ComboBox;
