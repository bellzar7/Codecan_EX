import { formatDistanceToNow } from "date-fns";
import type React from "react";

interface AssetListRowProps {
  asset: any;
  chain: string | undefined;
}

const AssetListRow: React.FC<AssetListRowProps> = ({ asset, chain }) => (
  <div className="grid cursor-pointer grid-cols-5 items-center gap-4 border-muted-200 border-b py-3 transition hover:border-muted-100 hover:bg-muted-100 dark:border-muted-800 dark:hover:border-muted-800 dark:hover:bg-muted-800">
    {/* Asset Info */}
    <div className="col-span-2 flex items-center">
      <img
        alt={asset.name}
        className="mx-4 h-20 w-20 rounded-md"
        src={asset.image}
      />
      <div>
        <span className="font-semibold text-lg text-muted-800 dark:text-muted-200">
          {asset.name}
        </span>
        <span className="text-muted-500 text-sm"> #{asset.index}</span>
      </div>
    </div>

    {/* Price */}
    <span className="text-muted-800 dark:text-muted-200">
      {asset.price} {chain}
    </span>

    {/* Owner */}
    <span className="text-green-500">@{asset.owner.firstName}</span>

    {/* Listed Time (Time Ago Format) */}
    <span className="text-muted-500 dark:text-muted-400">
      {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
    </span>
  </div>
);

export default AssetListRow;
