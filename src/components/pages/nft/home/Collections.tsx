import { Icon } from "@iconify/react";
import Link from "next/link";
import type React from "react";
import { useNftStore } from "@/stores/nft";

const TopCollections: React.FC = () => {
  const { topCollections } = useNftStore();

  return (
    <div className="relative w-full px-16 py-12">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="z-10 font-bold text-2xl text-muted-800 lg:text-4xl dark:text-muted-200">
          Today&apos;s Top Collections
        </h2>
        <Link className="z-10" href="/nft/collections" passHref>
          <button className="flex items-center space-x-1 rounded-md bg-muted-100/50 px-4 py-2 font-medium text-muted-800 text-sm transition hover:bg-muted-200/50 dark:bg-muted-500/50 dark:text-muted-100 dark:hover:bg-muted-600/50">
            <span>Analytics</span>
            <Icon className="h-4 w-4" icon="akar-icons:arrow-up-right" />
          </button>
        </Link>
      </div>

      {/* Collections List - Responsive Grid Layout */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {topCollections.length > 0 ? (
          topCollections.map((collection, index) => (
            <Link
              className="flex items-center justify-between rounded-xs border-muted-300 border-b px-4 py-4 transition hover:bg-muted-100 dark:border-muted-700 dark:hover:bg-muted-700"
              href={`/nft/collection/${collection.id}`}
              key={collection.id}
            >
              {/* Left Section with Rank, Image, and Name */}
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <span className="z-10 font-bold text-muted-600 text-xl dark:text-muted-400">
                  {index + 1}
                </span>

                {/* Collection Image */}
                <img
                  alt={collection.name}
                  className="z-10 h-10 w-10 rounded-full border border-muted-300 dark:border-muted-600"
                  src={collection.image || "/default-placeholder.png"}
                />

                {/* Collection Details */}
                <div className="flex flex-col">
                  <h3 className="z-10 font-semibold text-lg text-muted-900 dark:text-white">
                    {collection.name || "Unnamed Collection"}
                  </h3>
                  <p className="z-10 text-muted-500 text-sm dark:text-muted-400">
                    Starts from:{" "}
                    <span className="font-medium text-muted-900 dark:text-white">
                      {collection.startingPrice
                        ? `${collection.startingPrice.toFixed(2)} ETH`
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right Section with Volume */}
              <div className="z-10 text-right">
                <p className="z-10 font-medium text-muted-600 text-sm dark:text-muted-400">
                  Volume
                </p>
                <span className="z-10 font-semibold text-black text-lg dark:text-white">
                  {collection.volume
                    ? `${collection.volume.toFixed(2)} ETH`
                    : "N/A"}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-2 w-full text-center text-muted-600 dark:text-muted-400">
            No top collections available at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default TopCollections;
