import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import Heading from "@/components/elements/base/heading/Heading";
import Input from "@/components/elements/form/input/Input";
import Textarea from "@/components/elements/form/textarea/Textarea";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

type FormInput = {
  subject: string;
  emailBody?: string;
  smsBody?: string;
  pushBody?: string;
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  shortCodes?: string;
};
const NotificationTemplateEdit: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [template, setTemplate] = useState<FormInput | null>(null);
  const [formValues, setFormValues] = useState<FormInput>({
    subject: "",
    emailBody: "",
    smsBody: "",
    pushBody: "",
    email: false,
    sms: false,
    push: false,
    shortCodes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchTemplate = async () => {
      const { data } = await $fetch({
        url: `/api/admin/system/notification/template/${id}`,
        silent: true,
      });
      const templateData = data as any;
      setTemplate({
        subject: templateData.subject,
        shortCodes: templateData.shortCodes,
      });
      setFormValues({
        subject: templateData.subject,
        emailBody: templateData.emailBody || "",
        smsBody: templateData.smsBody || "",
        pushBody: templateData.pushBody || "",
        email: templateData.email,
        sms: templateData.sms,
        push: templateData.push,
      });
    };
    if (id) {
      fetchTemplate();
    }
  }, [id]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleSwitchChange = (name: string, newValue: boolean) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: newValue,
    }));
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { error } = await $fetch({
      url: `/api/admin/system/notification/template/${id}`,
      method: "PUT",
      body: formValues,
    });
    if (!error) {
      router.push("/admin/system/notification/template");
    }
    setIsSubmitting(false);
  };
  const shortcodesMap = (item: string) => {
    const map: {
      [key: string]: string;
    } = {
      FIRSTNAME: t("User first name"),
      LASTNAME: t("User last name"),
      EMAIL: t("User email"),
      PHONE: t("User phone"),
      COMPANY: t("User company"),
      ADDRESS: t("User address"),
      CITY: t("User city"),
      STATE: t("User state"),
      ZIP: t("User zip"),
      COUNTRY: t("User country"),
      PASSWORD: t("User password"),
      USERNAME: t("User username"),
      URL: t("Site url"),
      CREATED_AT: t("Template related Created at"),
      UPDATED_AT: t("Updated at date"),
      SITE_NAME: t("Site name"),
      SITE_URL: t("Site url"),
      SITE_EMAIL: t("Site email"),
      SITE_PHONE: t("Site phone"),
      SITE_ADDRESS: t("Site address"),
      TOKEN: t("Template related token"),
      LAST_LOGIN: t("User last login"),
    };
    return map[item] || item;
  };
  return (
    <Layout color="muted" title={t("Notification Template")}>
      <div className="mb-5 flex items-center justify-between">
        <Heading as="h1" size="lg">
          {t("Editing")} {template?.subject} {t("Template")}
        </Heading>
        <div className="flex justify-end">
          <Button
            className="mr-2"
            color="success"
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            <Icon className="mr-2 h-5 w-5" icon="line-md:confirm" />
            {t("Save")}
          </Button>
          <ButtonLink color="muted" href="/admin/system/notification/template">
            <Icon className="mr-2 h-5 w-5" icon="line-md:arrow-small-left" />
            {t("Back")}
          </ButtonLink>
        </div>
      </div>
      <div className="grid xs:grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
        <div className="xs:col-span-1 space-y-5 md:col-span-2 lg:col-span-3">
          <Input
            disabled={isSubmitting}
            label={t("Subject")}
            name="subject"
            onChange={handleChange}
            placeholder={t("Enter subject")}
            value={formValues.subject}
          />
          <Textarea
            disabled={isSubmitting}
            label={t("Email Body")}
            name="emailBody"
            onChange={handleChange}
            placeholder={t("Enter email body")}
            rows={10}
            value={formValues.emailBody || ""}
          />
          <Textarea
            disabled={isSubmitting}
            label={t("SMS Body")}
            name="smsBody"
            onChange={handleChange}
            placeholder={t("Enter sms body")}
            value={formValues.smsBody || ""}
          />
          <Textarea
            disabled={isSubmitting}
            label={t("Push Body")}
            name="pushBody"
            onChange={handleChange}
            placeholder={t("Enter push body")}
            value={formValues.pushBody || ""}
          />
        </div>
        <div className="col-span-1">
          <Card className="p-5">
            <Heading as="h2" className="mb-5 text-muted" size="md">
              {t("Variables")}
            </Heading>
            <div className="space-y-3 text-xs">
              {template?.shortCodes &&
                JSON.parse(template.shortCodes).map(
                  (item: string, index: number) => (
                    <div className="flex flex-col" key={index}>
                      <span className="text-gray-600 dark:text-gray-400">
                        %
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {item}
                        </span>
                        %
                      </span>
                      <span className="text-gray-500">
                        {shortcodesMap(item)}
                      </span>
                    </div>
                  )
                )}
            </div>
          </Card>
          <Card className="mt-5 p-5">
            <div className="space-y-3 text-xs">
              <div>
                <ToggleSwitch
                  checked={formValues.email ?? false}
                  color="primary"
                  disabled={isSubmitting}
                  id="email-switch"
                  label={t("Email")}
                  name="email"
                  onChange={() =>
                    handleSwitchChange("email", !formValues.email)
                  }
                  sublabel={t("Send emails notifications")}
                />
              </div>
              <div>
                <ToggleSwitch
                  checked={formValues.sms ?? false}
                  color="primary"
                  disabled={true}
                  id="sms-switch"
                  label={t("SMS (coming soon)")}
                  name="sms"
                  onChange={() => handleSwitchChange("sms", !formValues.sms)}
                  sublabel={t("Send sms notifications")}
                />
              </div>
              <div>
                <ToggleSwitch
                  checked={formValues.push ?? false}
                  color="primary"
                  disabled={true}
                  id="push-switch"
                  label={t("Push (coming soon)")}
                  name="push"
                  onChange={() => handleSwitchChange("push", !formValues.push)}
                  sublabel={t("Send push notifications")}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
export default NotificationTemplateEdit;
export const permission = "Access Notification Template Management";
