import type React from "react";
import { useState } from "react";
import ActivityTab from "../../collection/tabs/ActivityTab";

interface AssetDetailsTabsProps {
  collection: any;
  asset: any;
}

const tabs = ["Description", "Details", "Activity"];

const AssetDetailsTabs: React.FC<AssetDetailsTabsProps> = ({
  collection,
  asset,
}) => {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <div className="rounded-lg bg-muted-100 p-4 shadow-md dark:bg-muted-800">
      <div className="mb-4 flex space-x-4 border-muted-200 border-b dark:border-muted-700">
        {tabs.map((tab) => (
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? "border-purple-500 border-b-2 text-muted-900 dark:text-white"
                : "text-muted-500"
            }`}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Description" && (
        <div>
          <p className="text-muted-700 dark:text-muted-300">
            {collection.description}
          </p>
        </div>
      )}

      {activeTab === "Details" && (
        <div className="space-y-4">
          <ul className="space-y-2 text-muted-700 dark:text-muted-300">
            <li>
              <strong>Index:</strong> #{asset.index}
            </li>
            <li>
              <strong>Token ID:</strong> {asset.id}
            </li>
            <li>
              <strong>Royalties:</strong> {asset.royalty}%
            </li>
          </ul>
        </div>
      )}

      {activeTab === "Activity" && <ActivityTab id={asset.id} type="asset" />}
    </div>
  );
};

export default AssetDetailsTabs;
