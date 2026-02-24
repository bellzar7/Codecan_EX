import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";

interface TabProps {
  label: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabName: string;
}

const Tab: React.FC<TabProps> = ({
  label,
  activeTab,
  setActiveTab,
  tabName,
}) => {
  const router = useRouter();

  const handleTabClick = () => {
    setActiveTab(tabName);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: tabName.toLowerCase() },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <button
      className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300 ${
        activeTab === tabName
          ? "border-primary-500 text-primary-500 dark:text-primary-400"
          : "border-transparent text-muted"
      }
        `}
      onClick={handleTabClick}
      type="button"
    >
      {label}
    </button>
  );
};

interface TabsProps {
  mainTab: string;
  setMainTab: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ mainTab, setMainTab }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 overflow-x-auto border-muted-200 border-b dark:border-muted-800">
      <Tab
        activeTab={mainTab}
        label={t("General")}
        setActiveTab={setMainTab}
        tabName="GENERAL"
      />
      <Tab
        activeTab={mainTab}
        label={t("KYC Restrictions")}
        setActiveTab={setMainTab}
        tabName="RESTRICTIONS"
      />
      <Tab
        activeTab={mainTab}
        label={t("Wallet")}
        setActiveTab={setMainTab}
        tabName="WALLET"
      />
      <Tab
        activeTab={mainTab}
        label={t("Animations")}
        setActiveTab={setMainTab}
        tabName="ANIMATIONS"
      />
      <Tab
        activeTab={mainTab}
        label={t("Logos")}
        setActiveTab={setMainTab}
        tabName="LOGOS"
      />
      <Tab
        activeTab={mainTab}
        label={t("Investments")}
        setActiveTab={setMainTab}
        tabName="INVEST"
      />
      <Tab
        activeTab={mainTab}
        label={t("P2P")}
        setActiveTab={setMainTab}
        tabName="P2P"
      />
      <Tab
        activeTab={mainTab}
        label={t("Affiliate")}
        setActiveTab={setMainTab}
        tabName="AFFILIATE"
      />
      <Tab
        activeTab={mainTab}
        label={t("Social")}
        setActiveTab={setMainTab}
        tabName="SOCIAL"
      />
    </div>
  );
};

export default Tabs;
