import type React from "react";
import { useState } from "react";
import { useNftStore } from "@/stores/nft";
import Stats from "./elements/Stats";

const CollectionInfoSection: React.FC = () => {
  // Retrieve the collection state from the Zustand store
  const { collection } = useNftStore();
  const [showMore, setShowMore] = useState(false);

  if (!collection) return null;

  return (
    <div className="grid grid-cols-1 items-start gap-6 p-6 px-6 md:grid-cols-2 md:px-12">
      <div className="space-y-4">
        {/* Collection Name */}
        <h1 className="font-bold text-4xl text-gray-900 dark:text-white">
          {collection.name}
        </h1>

        {/* Collection Description */}
        <p
          className={`text-gray-700 dark:text-gray-300 ${
            showMore ? "" : "line-clamp-2"
          }`}
        >
          {collection.description}
        </p>

        {/* Show More / Show Less Button */}
        {collection.description.length > 150 && (
          <button
            className="mt-2 text-green-500 text-sm hover:text-green-700"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Collection Stats Section */}
      <div className="flex w-full flex-col items-end">
        <Stats />
      </div>
    </div>
  );
};

export default CollectionInfoSection;
("");
