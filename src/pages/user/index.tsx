import { useTranslation } from "next-i18next";
import Markets from "@/components/pages/user/markets/Markets";
import { News } from "@/components/pages/user/News";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";

const MarketsPage = () => {
  const { t } = useTranslation();
  const { settings } = useDashboardStore();
  return (
    <Layout color="muted" title={t("Markets")}>
      <Markets />
      {settings?.newsStatus && <News />}
    </Layout>
  );
};
export default MarketsPage;
