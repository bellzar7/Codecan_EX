// components/ContactInfo.js

import { useTranslation } from "next-i18next";
import ToggleSwitch from "@/components/elements/form/toggle-switch/ToggleSwitch";
import Card from "../base/card/Card";

const ContactInfo = ({ field, data }) => {
  const { t } = useTranslation();
  return (
    <Card className="mb-5 flex w-full items-start justify-start gap-5 p-5">
      <ToggleSwitch
        checked={data.emailVerified}
        color="success"
        disabled
        label={t("Email Verified")}
        name={field.emailVerified.name}
      />
    </Card>
  );
};
export default ContactInfo;
