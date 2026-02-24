import BannerSection from "@/components/pages/frontend/BannerSection";
import BuilderComponent from "@/components/pages/frontend/BuilderComponent";
import CookieBanner from "@/components/pages/frontend/Cookie";
import FeaturesSection from "@/components/pages/frontend/FeaturesSection";
import Footer from "@/components/pages/frontend/Footer";
import HeroSection from "@/components/pages/frontend/HeroSection";
import MarketsSection from "@/components/pages/frontend/MarketsSection";
import StatusSection from "@/components/pages/frontend/StatusSection";
import Layout from "@/layouts/Nav";
import { useDashboardStore } from "@/stores/dashboard";

const Home = () => {
  const { settings } = useDashboardStore();
  if (settings?.frontendType === "builder") return <BuilderComponent />;

  return (
    <Layout horizontal>
      <HeroSection />
      <MarketsSection />
      <StatusSection />
      <FeaturesSection />
      <BannerSection />
      <Footer />
      <CookieBanner />
    </Layout>
  );
};

export default Home;
