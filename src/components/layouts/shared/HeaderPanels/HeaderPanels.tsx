import { useTranslation } from "next-i18next";
import { memo } from "react";
import FixedPanel from "@/components/elements/base/panel/FixedPanel";
import { useDashboardStore } from "@/stores/dashboard";
import { Announcements } from "../Announcements";
import { Locales } from "../Locales";
import type { HeaderPanelsProps } from "./HeaderPanels.types";

const HeaderPanelsBase = ({}: HeaderPanelsProps) => {
  const { t } = useTranslation();
  const { panels } = useDashboardStore();
  return (
    <>
      <FixedPanel name="locales" title={t("Languages")}>
        {panels["locales"] && <Locales />}
      </FixedPanel>

      <FixedPanel name="announcements" title={t("Announcements")}>
        {panels["announcements"] && <Announcements />}
      </FixedPanel>
    </>
  );
};
export const HeaderPanels = memo(HeaderPanelsBase);
