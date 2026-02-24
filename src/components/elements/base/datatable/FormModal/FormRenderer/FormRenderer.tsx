// biome-ignore lint/style/useFilenamingConvention: Existing file with many imports across the codebase
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RichTextEditor from "@/components/elements/addons/RichTextEditor";
import {
  CustomAddressWalletsPairFields,
  CustomRestrictionPairFields,
} from "@/components/elements/base/datatable/FormModal";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import DatePicker from "@/components/elements/form/datepicker/DatePicker";
import Input from "@/components/elements/form/input/Input";
import InputFile from "@/components/elements/form/input-file/InputFile";
import InputFileField from "@/components/elements/form/input-file-field/InputFileField";
import InputFileProfile from "@/components/elements/form/input-file-profile/InputFileProfile";
import ListBox from "@/components/elements/form/listbox/Listbox";
import Select from "@/components/elements/form/select/Select";
import Textarea from "@/components/elements/form/textarea/Textarea";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import { useDataTable } from "@/stores/datatable";
import {
  evaluateCondition,
  filterFormItemsByCondition,
  getNestedValue,
  isEditable,
  parseMultipleSelect,
  safeJSONParse,
  setNestedValue,
} from "@/utils/datatable";
import Button from "../../../button/Button";
import { CustomFields } from "../CustomFields";
import type { FormRendererProps } from "./FormRenderer.types";

const FormRendererBase = ({
  formValues: formValuesUnknown,
  setFormValues: setFormValuesUnknown,
}: FormRendererProps) => {
  // biome-ignore lint/suspicious/noExplicitAny: Form values are dynamic based on form structure
  const setFormValues = setFormValuesUnknown as any;
  // biome-ignore lint/suspicious/noExplicitAny: Form values are dynamic based on form structure
  const formValues = formValuesUnknown as any;
  const { t } = useTranslation();
  const { modalItem, modalAction, formErrors } = useDataTable((state) => state);

  const isNew = modalAction?.topic === "create";
  const [filePreviews, setFilePreviews] = useState({});
  const firstErrorInputRef = useRef<HTMLDivElement | null>(null);

  const initializeValues = useCallback(
    (formItems) => {
      const initialValues = {};
      const initialPreviews = {};

      if (isNew) {
        return { initialValues, initialPreviews };
      }

      const deepParseObject = // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex recursive object parsing
        (obj) => {
          if (typeof obj !== "object" || obj === null) {
            return obj;
          }
          const parsedObj = Array.isArray(obj) ? [] : {};
          for (const key in obj) {
            // Parse custom fields that come as JSON strings
            if (
              typeof obj[key] === "string" &&
              (key === "customFields" ||
                key === "customAddressWalletsPairFields" ||
                key === "customRestrictionPairFields")
            ) {
              try {
                parsedObj[key] = safeJSONParse(obj[key]);
                // Ensure it's an array, fallback to empty array if not
                if (!Array.isArray(parsedObj[key])) {
                  parsedObj[key] = [];
                }
              } catch (_error) {
                parsedObj[key] = [];
              }
            } else if (typeof obj[key] === "string") {
              try {
                parsedObj[key] = safeJSONParse(obj[key]);
              } catch (_error) {
                parsedObj[key] = obj[key];
              }
            } else if (
              key === "customFields" ||
              key === "customAddressWalletsPairFields" ||
              key === "customRestrictionPairFields"
            ) {
              // If already an object/array, ensure it's an array
              parsedObj[key] = Array.isArray(obj[key]) ? obj[key] : [];
            } else {
              parsedObj[key] = deepParseObject(obj[key]);
            }
          }
          return parsedObj;
        };

      const parsedModalItem = modalItem ? deepParseObject(modalItem) : {};
      const parseItemValue = (rawValue, formItem) => {
        let parsedValue = rawValue;
        switch (formItem.ts) {
          case "number": {
            const numValue = Number.parseFloat(parsedValue);
            return Number.isNaN(numValue)
              ? formItem.defaultValue || 0
              : numValue;
          }
          case "boolean":
            return parsedValue === true || parsedValue === "true";
          case "object":
            if (typeof parsedValue === "string") {
              try {
                parsedValue = safeJSONParse(parsedValue);
              } catch (_error) {
                parsedValue = {};
              }
            }
            return parsedValue || formItem.defaultValue || {};
          default:
            return parsedValue || formItem.defaultValue || null;
        }
      };

      const setInitialValue = (path, itemValue, formItem) => {
        if (path) {
          const value = parseItemValue(itemValue, formItem);
          setNestedValue(initialValues, path, value);
        }
      };

      const handleFileValue = (path, value) => {
        if (value instanceof File) {
          initialPreviews[path] = URL.createObjectURL(value);
        } else if (typeof value === "string") {
          initialPreviews[path] = value;
        }
      };

      const parseFormItems = // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex form parsing logic
        (items, pathPrefix = "") => {
          if (!items) {
            return;
          }

          for (const item of items) {
            if (!item) {
              continue;
            }

            if (Array.isArray(item)) {
              for (const nestedItem of item) {
                parseFormItems([nestedItem], pathPrefix);
              }
              continue;
            }

            const path = pathPrefix ? `${pathPrefix}.${item.name}` : item.name;
            let value: unknown;
            switch (item.type) {
              case "tags":
                value = parsedModalItem?.[item.name];
                break;
              case "select":
                value = parsedModalItem
                  ? getNestedValue(parsedModalItem, path)
                  : item.defaultValue;
                if (
                  item.multiple &&
                  item.structure &&
                  Array.isArray(parsedModalItem?.[item.name])
                ) {
                  value = parseMultipleSelect(
                    parsedModalItem[item.name],
                    item.structure
                  );
                }
                break;
              case "object":
                value = parsedModalItem
                  ? getNestedValue(parsedModalItem, path)
                  : undefined;
                if (typeof value === "string") {
                  value = safeJSONParse(value);
                }
                break;
              case "file":
                value = parsedModalItem
                  ? getNestedValue(parsedModalItem, path)
                  : undefined;
                handleFileValue(path, value);
                break;
              case "customFields":
                value =
                  parsedModalItem?.customFields || item.defaultValue || [];
                break;
              case "customAddressWalletsPairFields":
                value =
                  parsedModalItem?.customAddressWalletsPairFields ||
                  item.defaultValue ||
                  [];
                break;
              case "customRestrictionPairFields":
                value =
                  parsedModalItem?.customRestrictionPairFields ||
                  item.defaultValue ||
                  [];
                break;
              default:
                value = parsedModalItem
                  ? getNestedValue(parsedModalItem, path)
                  : undefined;
                break;
            }

            setInitialValue(path, value, item);

            if (item.type === "object" && item.fields) {
              parseFormItems(item.fields, path);
            } else if (Array.isArray(item.fields)) {
              for (const subItem of item.fields) {
                if (Array.isArray(subItem)) {
                  for (const nestedSubItem of subItem) {
                    parseFormItems([nestedSubItem], path);
                  }
                } else {
                  parseFormItems([subItem], path);
                }
              }
            }
          }
        };

      parseFormItems(formItems);
      return { initialValues, initialPreviews };
    },
    [modalItem, isNew]
  );

  const { initialValues, initialPreviews } = useMemo(
    () => initializeValues(modalAction?.formItems),
    [initializeValues, modalAction?.formItems]
  );

  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      ...initialValues,
    }));
    setFilePreviews(initialPreviews);
  }, [initialValues, initialPreviews, setFormValues]);

  const selectAllTags = useCallback(
    (tagName, options) => {
      setFormValues((prevValues) => ({
        ...prevValues,
        [tagName]: [...options],
      }));
    },
    [setFormValues]
  );

  const clearAllTags = useCallback(
    (tagName) => {
      setFormValues((prevValues) => ({
        ...prevValues,
        [tagName]: [],
      }));
    },
    [setFormValues]
  );

  // Define setFirstErrorInputRef before it's used in dependencies
  const setFirstErrorInputRef = useCallback((inputRef, error) => {
    if (error && !firstErrorInputRef.current) {
      firstErrorInputRef.current = inputRef;
    } else if (!error && firstErrorInputRef.current === inputRef) {
      firstErrorInputRef.current = null;
    }
  }, []);

  // Define getFormItemValue before it's used in dependencies
  const getFormItemValue = useCallback(
    (formItem, path) => {
      return formItem.type === "tags" ||
        (formItem.type === "select" && formItem.multiple && formItem.structure)
        ? formValues[formItem.name]
        : getNestedValue(formValues, path);
    },
    [formValues]
  );

  const handleChange = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex form change handling logic
    (name, values, type, ts = "string", multiple = false) => {
      if (type === "file") {
        if (!values.length) {
          return;
        }

        const formItem = modalAction?.formItems
          ?.flat()
          ?.find((item) => item?.name === name);
        if (!formItem) {
          return;
        }
        const maxSize = formItem.maxSize ?? 16;
        const maxSizeBytes = maxSize * 1024 * 1024;

        const files = multiple ? Array.from(values) : [values[0]];
        for (const file of files) {
          if (maxSizeBytes && file.size > maxSizeBytes) {
            // File size validation - silently reject oversized files
            if (filePreviews[name]) {
              URL.revokeObjectURL(filePreviews[name]);
            }
            return;
          }
          setFilePreviews((prev) => ({
            ...prev,
            [name]: URL.createObjectURL(file),
          }));
          setFormValues((prev) => ({
            ...prev,
            [name]: {
              data: file,
              width: formItem?.width,
              height: formItem?.height,
            },
          }));
        }
      } else {
        let formattedValue = values;
        switch (ts) {
          case "number": {
            const decimalPart = values.toString().split(".")[1];
            if (decimalPart) {
              const firstDecimalDigit = decimalPart[0];
              const significantPart = decimalPart.slice(1);
              if (!(firstDecimalDigit === "0" && !significantPart)) {
                formattedValue = Number.parseFloat(values);
              }
            } else {
              formattedValue = Number.parseFloat(values);
            }
            break;
          }
          case "boolean":
            formattedValue = Boolean(values);
            break;
          case "object":
            formattedValue = values || {};
            break;
          default:
            formattedValue = values || null;
        }
        if (type === "select" && multiple) {
          return setFormValues((prevValues) => ({
            ...prevValues,
            [name]: values,
          }));
        }
        if (type === "select") {
          return setFormValues((prevValues) => ({
            ...prevValues,
            [name]: values,
          }));
        }

        setFormValues((prevValues) => {
          const newValues = { ...prevValues };
          setNestedValue(newValues, name, formattedValue);
          return newValues;
        });

        // Update dependent fields based on the conditions
        if (modalAction?.formItems) {
          const formItems = modalAction.formItems.flat();
          for (const item of formItems) {
            // biome-ignore lint/suspicious/noExplicitAny: Form item conditions are dynamic
            const itemWithConditions = item as any;
            if (itemWithConditions?.conditions?.[name]) {
              const conditionValue =
                itemWithConditions.conditions[name][formattedValue];
              setFormValues((prevValues) => ({
                ...prevValues,
                [item.name]: conditionValue,
              }));
            }
          }
        }
      }
    },
    [setFormValues, filePreviews, modalAction?.formItems]
  );

  // Define renderObjectField before it's used in renderFormField
  const renderObjectField = useCallback(
    (formItem, path, renderFormFieldsFn) => (
      <div
        className={
          formItem.label &&
          "rounded-md border border-gray-300 border-dashed p-4 dark:border-gray-600"
        }
        key={path}
      >
        {formItem.label && (
          <p className="mb-2 font-semibold text-muted-700 text-sm dark:text-muted-300">
            {t(formItem.label)}
          </p>
        )}
        <div className="mx-auto w-full space-y-4">
          {renderFormFieldsFn(formItem.fields, path)}
        </div>
      </div>
    ),
    [t]
  );

  // Define renderSelectField before it's used in renderFormField
  const renderSelectField = useCallback(
    (
      formItem,
      path,
      value,
      error,
      commonProps,
      options,
      isDisabled,
      editable
    ) => {
      if (formItem.multiple) {
        return (
          <div key={path}>
            <ListBox
              disabled={!editable || isDisabled}
              error={error}
              key={path}
              label={formItem?.label}
              multiple
              options={options}
              placeholder={formItem?.placeholder}
              selected={value}
              setSelected={(newSelected) => {
                const updatedSelected = formItem.options.filter((option) =>
                  newSelected.some((sel) => sel.value === option.value)
                );
                handleChange(
                  path,
                  updatedSelected,
                  formItem.type,
                  formItem.ts,
                  formItem.multiple
                );
              }}
            />
            {error && <p className="mt-2 text-danger-500 text-xs">{error}</p>}
          </div>
        );
      }
      return (
        <div key={path}>
          <Select
            {...commonProps}
            disabled={!editable || isDisabled}
            error={error}
            onChange={(e) =>
              handleChange(path, e.target?.value, formItem.type, formItem.ts)
            }
            options={options}
            value={`${value}`}
          />
        </div>
      );
    },
    [handleChange]
  );

  // Define renderDateTimeField before it's used in renderFormField
  const renderDateTimeField = useCallback(
    (formItem, path, value, error, commonProps) => (
      <div key={path}>
        <DatePicker
          {...commonProps}
          icon="ion:calendar-outline"
          onChange={(e) =>
            handleChange(
              path,
              new Date((e.target as HTMLInputElement).value),
              formItem.type
            )
          }
          placeholder={t("Pick a date")}
          value={value}
        />
        {error && <p className="mt-2 text-danger-500 text-xs">{error}</p>}
      </div>
    ),
    [handleChange, t]
  );

  // Define renderTagsField before it's used in renderFormField
  const renderTagsField = useCallback(
    (formItem, value) => {
      const selectedCount = Array.isArray(value) ? value.length : 0;
      return (
        <div className="card-dashed" key={formItem.name}>
          <div className="mb-5 flex items-center justify-between">
            <div className="text-muted-400 text-sm dark:text-muted-600">
              {t("Selected")} {formItem.name}: {selectedCount}
            </div>
            <div className="flex gap-4">
              <Button
                color="success"
                onClick={() => selectAllTags(formItem.name, formItem.options)}
                size="sm"
              >
                {t("Select All")}
              </Button>
              <Button
                color="danger"
                onClick={() => clearAllTags(formItem.name)}
                size="sm"
              >
                {t("Clear All")}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
            {formItem.options.map((item) => (
              <Checkbox
                checked={
                  Array.isArray(value) &&
                  value.some((v) => String(v.id) === String(item.id))
                }
                color="success"
                key={item.id}
                label={item.name}
                onChange={() => {
                  setFormValues((prev) => {
                    const existingTags = Array.isArray(prev[formItem.name])
                      ? prev[formItem.name]
                      : [];
                    return existingTags.some(
                      (v) => String(v.id) === String(item.id)
                    )
                      ? {
                          ...prev,
                          [formItem.name]: existingTags.filter(
                            (v) => String(v.id) !== String(item.id)
                          ),
                        }
                      : { ...prev, [formItem.name]: [...existingTags, item] };
                  });
                }}
              />
            ))}
          </div>
        </div>
      );
    },
    [t, setFormValues, selectAllTags, clearAllTags]
  );

  // Define renderFileField before it's used in renderFormField
  const renderFileField = useCallback(
    (formItem, path, value, filePreview, error) => {
      switch (formItem.fileType) {
        case "avatar":
          return (
            <div className="w-full pb-5 text-center" key={path}>
              <InputFileProfile
                color="primary"
                id={path}
                onChange={(e) => handleChange(path, e.target.files, "file")}
                onRemoveFile={() => {
                  setFormValues((prev) => ({ ...prev, [path]: "" }));
                  setFilePreviews((prev) => ({ ...prev, [path]: "" }));
                }}
                preview={filePreview}
                previewSize="lg"
                value={value ? value.name : ""}
              />
              {error && <p className="mt-2 text-danger-500 text-sm">{error}</p>}
            </div>
          );
        case "image":
          return (
            <span key={path}>
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
                color="default"
                id={path}
                label={`${t("Max File Size")}: ${formItem.maxSize || 16} MB`}
                labelAlt={`${t("Size")}: ${formItem.width}x${formItem.height} px`}
                maxFileSize={formItem.maxSize || 16}
                onChange={(files) => handleChange(path, files, "file")}
                onRemoveFile={() =>
                  setFormValues((prev) => ({ ...prev, [path]: null }))
                }
                preview={filePreview}
                previewPlaceholder="/img/placeholder.svg"
              />
              {error && <p className="mt-2 text-danger-500 text-sm">{error}</p>}
            </span>
          );
        default:
          return (
            <span key={path}>
              <InputFileField
                acceptedFileTypes={formItem.acceptedFileTypes}
                id={path}
                label={`${t("Max File Size")}: ${formItem.maxSize || 16} MB`}
                maxFileSize={formItem.maxSize || 16}
                onChange={(e) => handleChange(path, e.target.files, "file")}
                value={value ? value.name : ""}
              />
              {error && <p className="mt-2 text-danger-500 text-sm">{error}</p>}
            </span>
          );
      }
    },
    [handleChange, setFormValues, t]
  );

  // Define renderSwitchField before it's used in renderFormField
  const renderSwitchField = useCallback(
    (formItem, path, value, error) => (
      <span key={path}>
        <ToggleSwitch
          checked={!!value}
          color="primary"
          id={path}
          label={t(formItem.label)}
          name={path}
          onChange={(e) =>
            handleChange(path, e.target.checked, "switch", formItem.ts)
          }
          setFirstErrorInputRef={(inputRef) =>
            setFirstErrorInputRef(inputRef, error)
          }
        />
        {error && <p className="mt-2 text-danger-500 text-sm">{error}</p>}
      </span>
    ),
    [handleChange, setFirstErrorInputRef, t]
  );

  const renderFormField = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex form field rendering with many field types
    (formItem, renderFormFieldsFn, parentPath = "") => {
      if (!formItem) {
        return null;
      }

      const path = parentPath
        ? `${parentPath}.${formItem.name}`
        : formItem.name;
      const value = getFormItemValue(formItem, path);
      const error = getNestedValue(formErrors, path);
      const filePreview = filePreviews[path];

      if (formItem.notNull && !value) {
        return null;
      }
      if (
        formItem.condition &&
        !evaluateCondition(formItem.condition, formValues)
      ) {
        return null;
      }

      const editable = isEditable(formItem.editable, formValues);

      // Update options based on conditions
      let options = formItem.options || [];
      let isDisabled = false;
      let defaultOptionLabel = t("Select an option");

      if (formItem.conditions) {
        const conditionKey = Object.keys(formItem.conditions)[0];
        const conditionValue = formValues[conditionKey];
        if (conditionValue) {
          options = formItem.conditions[conditionKey][conditionValue] || [];
        } else {
          isDisabled = true;
          defaultOptionLabel = t(`Please select a ${conditionKey}`);
        }
      }

      // Add the default "Select an option" value
      if (options.length > 0 || isDisabled) {
        options = [{ value: null, label: defaultOptionLabel }, ...options];
      }

      const commonProps = {
        name: path,
        label: formItem.label,
        placeholder: formItem.placeholder,
        readOnly: !editable,
        disabled: !editable,
        onChange: (e) =>
          handleChange(path, e.target.value, formItem.type, formItem.ts),
        setFirstErrorInputRef: (inputRef) =>
          setFirstErrorInputRef(inputRef, error),
      };

      switch (formItem.type) {
        case "input":
          return (
            <Input
              key={path}
              value={value}
              {...commonProps}
              error={error}
              icon={formItem.icon}
              step={formItem.ts === "number" ? "any" : undefined}
              type={formItem.ts === "number" ? "number" : "text"}
            />
          );
        case "select":
          return renderSelectField(
            formItem,
            path,
            value,
            error,
            commonProps,
            options,
            isDisabled,
            editable
          );
        case "datetime":
          return renderDateTimeField(formItem, path, value, error, commonProps);
        case "tags":
          return renderTagsField(formItem, value);
        case "file":
          return renderFileField(formItem, path, value, filePreview, error);
        case "switch":
          return renderSwitchField(formItem, path, value, error);
        case "textarea":
          return (
            <Textarea key={path} {...commonProps} error={error} value={value} />
          );
        case "richTextEditor":
          return (
            <RichTextEditor
              key={path}
              onChange={(e) => handleChange(path, e, "richTextEditor")}
              placeholder={commonProps.placeholder}
              value={value}
            />
          );
        case "date":
          return <DatePicker key={path} {...commonProps} value={value} />;
        case "customFields":
          return (
            <CustomFields
              key={path}
              onFieldsChange={(fields) =>
                handleChange(path, fields, "customFields")
              }
              value={formValues?.customFields}
            />
          );
        case "customAddressWalletsPairFields":
          return (
            <CustomAddressWalletsPairFields
              fields={formItem?.fields}
              key={path}
              onFieldsChange={(fields) =>
                handleChange(path, fields, "customAddressWalletsPairFields")
              }
              value={formValues?.customAddressWalletsPairFields}
            />
          );
        case "customRestrictionPairFields":
          return (
            <CustomRestrictionPairFields
              fields={formItem?.fields}
              key={path}
              onFieldsChange={(fields) =>
                handleChange(path, fields, "customRestrictionPairFields")
              }
              value={formValues?.customRestrictionPairFields}
            />
          );
        case "object":
          return renderObjectField(
            formItem,
            path,
            renderFormFieldsFn ?? (() => null)
          );
        default:
          return null;
      }
    },
    [
      formValues,
      formErrors,
      filePreviews,
      handleChange,
      getFormItemValue,
      renderDateTimeField,
      renderFileField,
      renderObjectField,
      renderSelectField,
      renderSwitchField,
      renderTagsField,
      setFirstErrorInputRef,
      t,
    ]
  );

  const renderFormFields = useCallback(
    (formItems, parentPath = "") => {
      const activeItems = filterFormItemsByCondition(formItems, formValues);
      return activeItems
        .flatMap((formItem, index) => {
          if (Array.isArray(formItem)) {
            const gridCols = `grid-cols-${formItem.length}`;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: Form items may not have unique identifiers
              <div className={`grid gap-4 ${gridCols}`} key={`grid-${index}`}>
                {formItem.map((nestedItem) =>
                  renderFormField(nestedItem, renderFormFields, parentPath)
                )}
              </div>
            );
          }
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Form items may not have unique identifiers
            <div className="space-y-5" key={`field-${index}`}>
              {renderFormField(formItem, renderFormFields, parentPath)}
            </div>
          );
        })
        .filter(Boolean); // Filter out null items
    },
    [renderFormField, formValues]
  );

  useEffect(() => {
    if (firstErrorInputRef.current) {
      firstErrorInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTimeout(() => {
        firstErrorInputRef.current?.focus();
      }, 200);
    }
  }, []);

  return <>{renderFormFields(modalAction?.formItems)}</>;
};

export const FormRenderer = FormRendererBase;
