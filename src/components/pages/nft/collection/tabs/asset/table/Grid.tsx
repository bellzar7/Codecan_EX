import Link from "next/link";
import type React from "react";

interface AssetGridCardProps {
  asset: any;
}

const AssetGridCard: React.FC<AssetGridCardProps> = ({ asset }) => (
  <Link
    className="group block overflow-hidden rounded-xl border border-muted-200 bg-muted-100 transition hover:border-purple-500 dark:border-muted-900 dark:bg-black"
    href={`/nft/asset/${asset.id}`}
  >
    <div className="relative h-[18rem] w-full overflow-hidden">
      <img
        alt={asset.name}
        className="h-full w-full transform object-cover transition-transform duration-300 group-hover:scale-110"
        src={asset.image}
      />
    </div>

    <div className="relative bg-muted-200 p-4 transition group-hover:shadow-lg dark:bg-muted-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-muted-900 dark:text-white">
            {asset.name}
          </h3>
          <p className="text-muted-600 text-sm dark:text-muted-400">
            Rank: <span className="font-medium">{asset.rank}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-muted-600 text-sm dark:text-muted-400">
            #{asset.index}
          </p>
          <span className="font-bold text-lg text-muted-900 dark:text-white">
            {asset.price ? `${asset.price} ETH` : "N/A"}
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 h-full w-full -translate-x-1/2 translate-y-full transform p-3 transition-transform group-hover:translate-y-0">
        <button className="h-full w-full rounded-lg bg-purple-500 px-4 py-2 text-white shadow-md transition hover:bg-purple-600">
          Buy now
        </button>
      </div>
    </div>
  </Link>
);

export default AssetGridCard;
