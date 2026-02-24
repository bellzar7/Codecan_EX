import type React from "react";
import { useNftStore } from "@/stores/nft";

const Stats: React.FC = () => {
  // Retrieve the collection state from the Zustand store
  const collection = useNftStore((state) => state.collection);

  if (!collection) return null;

  const stats = [
    {
      label: "Volume",
      value: collection.totalVolume
        ? `${collection.totalVolume} ${collection.chain}`
        : `0 ${collection.chain}`,
    },
    {
      label: "Floor Price",
      value: collection.floorPrice
        ? `${collection.floorPrice} ${collection.chain}`
        : `0 ${collection.chain}`,
    },
    { label: "Supply", value: collection.nftAssets?.length || "0" },
    // { label: "Followers", value: collection.followers?.length || "0" },
    { label: "Holders", value: collection.holders || "0" },
  ];

  return (
    <div className="mt-4 flex flex-wrap justify-end space-x-8 text-right">
      {stats.map((stat, index) => (
        <div className="flex flex-col" key={index}>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            {stat.label}
          </span>
          <span className="font-semibold text-gray-900 text-xl dark:text-white">
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Stats;
