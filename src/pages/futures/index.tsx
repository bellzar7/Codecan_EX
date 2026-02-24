import { useTranslation } from "next-i18next";
import FuturesMarketsList from "@/components/pages/futures/marketsList";
import Layout from "@/layouts/Default";

const FuturesMarkets = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Futures")}>
      <FuturesMarketsList />
    </Layout>
  );
};
export default FuturesMarkets;
