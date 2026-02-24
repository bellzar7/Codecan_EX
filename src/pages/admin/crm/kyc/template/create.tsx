import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { type ChangeEvent, type FormEvent, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

interface CustomOption {
  title: string;
  required: boolean;
  type: string;
  level: string;
}
type Option = {
  enabled: boolean;
  required: boolean;
  level: string;
};
interface Form {
  title: string;
  options: {
    firstName: Option;
    lastName: Option;
    email: Option;
    phone: Option;
    address: Option;
    city: Option;
    state: Option;
    country: Option;
    zip: Option;
    dob: Option;
    ssn: Option;
    documentPassport: Option;
    documentDriversLicense: Option;
    documentIdCard: Option;
  };
  customOptions: CustomOption[];
}
const CreateKycTemplate = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const initialFormState: Form = {
    title: "",
    options: {
      firstName: { enabled: false, required: false, level: "1" },
      lastName: { enabled: false, required: false, level: "1" },
      email: { enabled: false, required: false, level: "1" },
      phone: { enabled: false, required: false, level: "1" },
      address: { enabled: false, required: false, level: "1" },
      city: { enabled: false, required: false, level: "1" },
      state: { enabled: false, required: false, level: "1" },
      country: { enabled: false, required: false, level: "1" },
      zip: { enabled: false, required: false, level: "1" },
      dob: { enabled: false, required: false, level: "1" },
      ssn: { enabled: false, required: false, level: "1" },
      documentPassport: { enabled: false, required: false, level: "1" },
      documentDriversLicense: { enabled: false, required: false, level: "1" },
      documentIdCard: { enabled: false, required: false, level: "1" },
    },
    customOptions: [],
  };
  const [form, setForm] = useState<Form>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAddCustomOption = () => {
    setForm((prevForm) => ({
      ...prevForm,
      customOptions: [
        ...prevForm.customOptions,
        { title: "", required: false, type: "input", level: "1" },
      ],
    }));
  };
  const handleRemoveCustomOption = (index: number) => {
    setForm((prevForm) => ({
      ...prevForm,
      customOptions: prevForm.customOptions.filter((_, i) => i !== index),
    }));
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const keys = name.split(".");
    const updateValue = type === "checkbox" ? checked : value;
    if (keys[0] === "options") {
      setForm((prevForm) => ({
        ...prevForm,
        options: {
          ...prevForm.options,
          [keys[1]]: {
            ...prevForm.options[keys[1]],
            [keys[2]]: updateValue,
          },
        },
      }));
    } else if (keys[0] === "customOptions") {
      const index = Number.parseInt(keys[1], 10);
      const field = keys[2];
      const updatedCustomOptions = form.customOptions.map((option, i) =>
        i === index ? { ...option, [field]: updateValue } : option
      );
      setForm((prevForm) => ({
        ...prevForm,
        customOptions: updatedCustomOptions,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: updateValue,
      }));
    }
  };
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const validate = form.customOptions?.every((option) => option.title !== "");
    if (!validate) {
      setIsSubmitting(false);
      toast.error(t("Please fill in all custom option titles"));
      return;
    }
    const customOptionsObject = form.customOptions.reduce((acc, option) => {
      const { title, ...rest } = option;
      acc[title] = rest;
      return acc;
    }, {});
    const values = {
      ...form,
      customOptions: customOptionsObject,
    };
    const { error } = await $fetch({
      url: "/api/admin/crm/kyc/template",
      method: "POST",
      body: values,
    });
    if (!error) {
      router.push("/admin/crm/kyc/template");
    }
    setIsSubmitting(false);
  };
  const keyMap = {
    firstName: {
      title: t("First Name"),
      description: t("The user's given name"),
    },
    lastName: {
      title: t("Last Name"),
      description: t("The user's family name"),
    },
    email: { title: t("Email"), description: t("The user's email address") },
    phone: { title: t("Phone"), description: t("The user's phone number") },
    address: {
      title: t("Address"),
      description: t("The user's street address"),
    },
    city: { title: t("City"), description: t("The user's city") },
    state: { title: t("State"), description: t("The user's state or region") },
    country: { title: t("Country"), description: t("The user's country") },
    zip: { title: t("Zip"), description: t("The user's postal code") },
    dob: { title: t("Date of Birth"), description: t("The user's birth date") },
    ssn: {
      title: t("SSN"),
      description: t("The user's social security number"),
    },
    documentPassport: {
      title: t("Passport"),
      description: t("The user's passport information"),
    },
    documentDriversLicense: {
      title: t("Driver License"),
      description: t("The user's driver's license information"),
    },
    documentIdCard: {
      title: t("ID Card"),
      description: t("The user's ID card information"),
    },
    customOptions: {
      title: t("Custom Options"),
      description: t("Fields for capturing additional user information"),
    },
  };
  const documents = [
    "documentPassport",
    "documentDriversLicense",
    "documentIdCard",
  ];
  const generalFields = Object.keys(keyMap).filter(
    (key) => !documents.includes(key) && key !== "customOptions"
  );
  const renderFieldSettings = (field: string) => (
    <div
      className={`flex xs:flex-col items-start justify-between gap-5 p-5 text-muted-800 sm:flex-row dark:text-muted-200 ${
        field !== "ssn" ? "border-muted-300 border-b dark:border-muted-700" : ""
      }`}
      key={field}
    >
      <div className="flex flex-col gap-2">
        <span>{keyMap[field].title}</span>
        <span className="text-muted-500 text-sm dark:text-muted-400">
          {keyMap[field].description}
        </span>
      </div>
      <div className="flex xs:flex-col items-end justify-end gap-10 sm:flex-row">
        <div className="flex flex-col gap-5">
          <Checkbox
            checked={form.options[field].enabled}
            color={"primary"}
            label={t("Enabled")}
            name={`options.${field}.enabled`}
            onChange={handleChange}
          />
          <Checkbox
            checked={form.options[field].required}
            color={"primary"}
            label={t("Required")}
            name={`options.${field}.required`}
            onChange={handleChange}
          />
        </div>
        <Select
          className="min-w-[96px]"
          label={t("Level")}
          name={`options.${field}.level`}
          onChange={handleChange}
          options={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
          ]}
          value={form.options[field].level}
        />
      </div>
    </div>
  );
  return (
    <Layout color="muted" title={t("Create KYC Template")}>
      <div className="mb-5 flex w-full items-center justify-between">
        <h1 className="text-muted-800 text-xl dark:text-muted-200">
          {t("Create KYC Template")}
        </h1>
        <BackButton href="/admin/crm/kyc/template" />
      </div>
      <form className="space-y-10" onSubmit={handleSubmit}>
        <Card className="space-y-5 p-5">
          <Input
            className="w-full"
            label={t("Title")}
            name="title"
            onChange={handleChange}
            placeholder={t("Enter template title")}
            type="text"
            value={form.title}
          />
        </Card>
        <Card>{generalFields.map(renderFieldSettings)}</Card>
        <Card>{documents.map(renderFieldSettings)}</Card>
        <Card className="space-y-5 p-5 text-muted-800 dark:text-muted-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl">{t("Custom Options")}</h3>
            <IconButton
              color="primary"
              onClick={handleAddCustomOption}
              type="button"
              variant={"outlined"}
            >
              <Icon className="h-5 w-5" icon="mdi:plus" />
            </IconButton>
          </div>
          {form.customOptions.map((option, index) => (
            <div className="space-y-4" key={index}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
                <div className="col-span-1 sm:col-span-4">
                  <Input
                    className="w-full"
                    label={t("Option Title")}
                    name={`customOptions.${index}.title`}
                    onChange={handleChange}
                    placeholder={t("Ex: username")}
                    type="text"
                    value={option.title}
                  />
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <Select
                    className="min-w-[96px]"
                    label={t("Type")}
                    name={`customOptions.${index}.type`}
                    onChange={handleChange}
                    options={[
                      { value: "input", label: t("Input") },
                      { value: "textarea", label: t("Textarea") },
                      { value: "file", label: t("File Upload") },
                      { value: "image", label: t("Image Upload") },
                    ]}
                    value={option.type}
                  />
                </div>
                <div className="col-span-1 sm:col-span-5">
                  <div className="flex items-end justify-end gap-5">
                    <Select
                      className="min-w-[96px]"
                      label={t("Level")}
                      name={`customOptions.${index}.level`}
                      onChange={handleChange}
                      options={[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                        { value: "3", label: "3" },
                      ]}
                      value={option.level}
                    />
                    <div>
                      <Checkbox
                        checked={option.required}
                        color={"primary"}
                        label={t("Required")}
                        name={`customOptions.${index}.required`}
                        onChange={handleChange}
                      />
                    </div>
                    <IconButton
                      color="danger"
                      onClick={() => handleRemoveCustomOption(index)}
                      type="button"
                    >
                      <Icon className="h-4 w-4" icon="mdi:trash-can" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Card>
        <div className="flex items-center justify-center">
          <Card className="w-64 p-2">
            <Button
              className="w-full"
              color="primary"
              disabled={isSubmitting}
              loading={isSubmitting}
              type="submit"
            >
              {t("Create")}
            </Button>
          </Card>
        </div>
      </form>
    </Layout>
  );
};
export default CreateKycTemplate;
export const permission = "Access KYC Template Management";
