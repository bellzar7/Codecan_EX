import { useTranslation } from "next-i18next";
import TwdMarkets from "@/components/pages/user/markets/TwdMarkets";
import { News } from "@/components/pages/user/News";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";

const IndicesPage = () => {
  const { t } = useTranslation();
  const { settings } = useDashboardStore();

  return (
    <Layout color="muted" title={t("Indices Trading (Paper)")}>
      <TwdMarkets type="indices" />
      {settings?.newsStatus === "true" && <News />}
    </Layout>
  );
};

export default IndicesPage;
