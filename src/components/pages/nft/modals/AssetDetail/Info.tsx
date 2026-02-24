import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { useNftStore } from "@/stores/nft";
import UserInfo from "./UserInfo";

interface AssetInfoProps {
  asset: any;
  collection: any;
}

const AssetInfo: React.FC<AssetInfoProps> = ({ asset, collection }) => {
  const { likeAsset, unlikeAsset, checkLikeStatus, openPurchaseModal } =
    useNftStore();
  const [isLiked, setIsLiked] = useState(asset?.isLiked ?? null);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const liked = await checkLikeStatus(asset.id);
      setIsLiked(liked);
    };

    if (asset?.id) {
      setIsLiked(asset.isLiked ?? null);
      if (asset.isLiked === undefined) {
        fetchLikeStatus();
      }
    }
  }, [asset.id, asset.isLiked, checkLikeStatus]);

  const handleLikeToggle = async () => {
    if (isLiked) {
      await unlikeAsset(asset.id);
      setIsLiked(false);
    } else {
      await likeAsset(asset.id);
      setIsLiked(true);
    }
  };

  const handleShare = () => {
    const assetUrl = `${window.location.origin}/nft/collection/${collection.id}`;
    navigator.clipboard.writeText(assetUrl).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };

  return (
    <div className="flex h-full flex-col justify-center gap-10">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl text-muted-900 dark:text-white">
          {asset.name} #{asset.index}
        </h1>
        <div className="flex items-center gap-2">
          <IconButton color="contrast" onClick={handleLikeToggle}>
            <Icon
              className={isLiked ? "text-red-500" : ""}
              icon={isLiked ? "mdi:heart" : "mdi:heart-outline"}
            />
          </IconButton>
          <IconButton color="contrast" onClick={handleShare}>
            <Icon icon="mdi:share-variant" />
          </IconButton>
        </div>
      </div>

      <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-800">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg text-muted-800 dark:text-muted-300">
            Price
          </h2>
          <p className="font-bold text-2xl text-purple-600 dark:text-purple-400">
            {asset.price} {asset.currency}
          </p>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            className="flex-1 rounded-lg bg-purple-500 px-4 py-3 text-white shadow-md hover:bg-purple-600"
            onClick={() => openPurchaseModal(asset)}
          >
            Buy now
          </button>
          <button className="flex-1 rounded-lg bg-muted-200 px-4 py-3 text-black shadow-md hover:bg-muted-300 dark:bg-muted-700 dark:text-white dark:hover:bg-muted-600">
            Make offer
          </button>
        </div>
      </div>

      <div className="flex justify-between gap-4">
        <UserInfo label="Owned By" user={asset.owner} />
        <UserInfo label="Created By" user={collection.creator} />
      </div>
    </div>
  );
};

export default AssetInfo;
