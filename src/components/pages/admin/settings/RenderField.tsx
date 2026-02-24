import DatePicker from "@/components/elements/form/datepicker/DatePicker";
import Input from "@/components/elements/form/input/Input";
import InputFile from "@/components/elements/form/input-file/InputFile";
import Select from "@/components/elements/form/select/Select";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import { useDashboardStore } from "@/stores/dashboard";

const RenderField = ({
  field,
  formData,
  handleInputChange,
  handleFileChange,
  isDark,
}: {
  field: any;
  formData: any;
  handleInputChange: any;
  handleFileChange?: any;
  isDark: boolean;
}) => {
  const commonProps = {
    label: field.label,
    placeholder: field.placeholder,
    name: field.name,
  };

  if (field.showIf && !field.showIf(formData)) {
    return null;
  }

  switch (field.type) {
    case "select": {
      const selectedValue = formData[field.name];
      const preview =
        field.preview && selectedValue
          ? field.preview[isDark ? "dark" : "light"][selectedValue]
          : null;

      return (
        <div className="col-span-12">
          <Select
            {...commonProps}
            className="w-full min-w-48"
            onChange={(e) =>
              handleInputChange({ name: field.name, value: e.target.value })
            }
            options={field.options || []}
            value={selectedValue || ""}
          />
          <span className="text-muted-400 text-xs">{field.description}</span>
          {preview && (
            <div className="w-full min-w-[200px] md:min-w-[400px]">
              <img
                alt={`${field.label} Preview`}
                className="max-h-[300px] w-full rounded-lg border border-muted-300 object-contain transition-all duration-300 hover:border-primary-500 dark:border-muted-800 dark:hover:border-primary-400"
                src={preview}
              />
            </div>
          )}
        </div>
      );
    }

    case "date":
      return (
        <div className="col-span-12">
          <DatePicker
            {...commonProps}
            onChange={(e: any) =>
              handleInputChange({
                name: field.name,
                value: new Date(e.target.value),
              })
            }
            value={formData[field.name] || new Date()}
          />
          <span className="text-muted-400 text-xs">{field.description}</span>
        </div>
      );

    case "switch": {
      const value =
        typeof formData[field.name] === "boolean"
          ? formData[field.name]
          : formData[field.name] === "true"
            ? true
            : false;
      return (
        <div className="col-span-12">
          <ToggleSwitch
            {...commonProps}
            checked={value}
            color={"success"}
            onChange={(e) =>
              handleInputChange({
                name: field.name,
                value: e.target.checked,
                save: true,
              })
            }
            sublabel={field.description}
          />
        </div>
      );
    }

    case "file":
      return (
        <div className="col-span-12">
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
            color={"contrast"}
            id={field.name}
            label={`${field.label}`}
            labelAlt={`Size: ${field.size.width}x${field.size.height}px, Max File Size: 16 MB`}
            maxFileSize={16}
            onChange={(files) => handleFileChange(files, field)}
            onRemoveFile={() =>
              handleInputChange({ name: field.name, value: null, save: true })
            }
            preview={formData[field.name] || ""}
            previewPlaceholder="/img/placeholder.svg"
          />
        </div>
      );

    default:
      return (
        <div className="col-span-12">
          <Input
            {...commonProps}
            max={field.max}
            min={field.min}
            onChange={(e) =>
              handleInputChange({
                name: field.name,
                value: e.target.value,
              })
            }
            step={field.step}
            type={field.type}
            value={formData[field.name] || ""}
          />
        </div>
      );
  }
};

const RenderFieldWrapper = (props: any) => {
  const { isDark } = useDashboardStore(); // Move hook call to a wrapper
  return <RenderField {...props} isDark={isDark} key={props.field.name} />;
};

export default RenderFieldWrapper;
