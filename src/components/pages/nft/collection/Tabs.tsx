import type React from "react";
import { useState } from "react";
import { useNftStore } from "@/stores/nft";
import ActivityTab from "./tabs/ActivityTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import AssetList from "./tabs/AssetTab";

const tabs = ["Collection", "Activity", "Offers", "Analytics"];

const CollectionTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Collection");
  const { collection } = useNftStore();

  return (
    <div className="w-full px-12 pb-12">
      <div className="flex border-muted-200 border-b dark:border-muted-800">
        {tabs.map((tab) => (
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === tab
                ? "border-purple-500 border-b-2 text-muted-800 dark:text-muted-200"
                : "text-muted-500"
            }`}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Collection" && <AssetList />}
      {activeTab === "Activity" && collection && (
        <ActivityTab id={collection.id} type="collection" />
      )}
      {activeTab === "Offers" && <div>Offers Content</div>}
      {activeTab === "Analytics" && <AnalyticsTab />}
    </div>
  );
};

export default CollectionTabs;
