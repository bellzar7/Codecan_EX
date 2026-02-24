import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import { useNftStore } from "@/stores/nft";

const SocialLinksAndButtons = () => {
  const {
    collection,
    followCollection,
    unfollowCollection,
    checkFollowStatus,
  } = useNftStore();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);

  // Fetch the follow status when the component mounts
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (collection && collection.id) {
        const status = await checkFollowStatus(collection.id);
        setIsFollowing(status);
      }
    };

    fetchFollowStatus();
  }, [collection, checkFollowStatus]); // Dependency array updated to include `collection` instead of `collection.id`

  // Handle follow/unfollow toggle
  const handleFollowToggle = async () => {
    if (!(collection && collection.id)) return;

    if (isFollowing) {
      await unfollowCollection(collection.id);
      setIsFollowing(false);
    } else {
      await followCollection(collection.id);
      setIsFollowing(true);
    }
  };

  const handleShare = () => {
    if (!collection) return;
    const assetUrl = `${window.location.origin}/nft/collection/${collection.id}`;
    navigator.clipboard.writeText(assetUrl).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };

  // If collection is null, render empty state early on
  if (!collection) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-4 flex w-full items-center justify-end gap-5 px-6 md:px-12">
      {/* Render Social Links */}
      {collection.links && Object.keys(collection.links).length > 0 && (
        <div className="flex gap-4 border-muted-200 border-e pe-4 md:gap-6 dark:border-muted-800">
          {collection.links?.website && (
            <Tooltip content="Website">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                href={collection.links.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="mdi:web" />
              </a>
            </Tooltip>
          )}
          {collection.links?.youtube && (
            <Tooltip content="YouTube">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                href={collection.links.youtube}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="mdi:youtube" />
              </a>
            </Tooltip>
          )}
          {collection.links?.twitter && (
            <Tooltip content="Twitter">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                href={collection.links.twitter}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="mdi:twitter" />
              </a>
            </Tooltip>
          )}
          {collection.links?.instagram && (
            <Tooltip content="Instagram">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                href={collection.links.instagram}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="mdi:instagram" />
              </a>
            </Tooltip>
          )}
          {collection.links?.discord && (
            <Tooltip content="Discord">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                href={collection.links.discord}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="mdi:discord" />
              </a>
            </Tooltip>
          )}
          {collection.links?.telegram && (
            <Tooltip content="Telegram">
              <a
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                href={collection.links.telegram}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="mdi:telegram" />
              </a>
            </Tooltip>
          )}
        </div>
      )}

      {/* Follow and Share Buttons */}
      <div className="flex items-center space-x-4">
        <Button
          className="group flex items-center"
          color={"contrast"}
          onClick={handleFollowToggle}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <Icon
            className={`me-1 h-5 w-5 ${
              isFollowing && hovering
                ? "text-red-500"
                : isFollowing
                  ? "text-yellow-500"
                  : "group-hover:text-yellow-500"
            }`}
            icon={isFollowing ? "mdi:star" : "mdi:star-outline"}
          />
          <span
            className={`text-sm ${
              isFollowing && hovering
                ? "text-red-500"
                : isFollowing
                  ? "text-yellow-500"
                  : "group-hover:text-yellow-500"
            }`}
          >
            {isFollowing && hovering
              ? "Unfollow"
              : isFollowing
                ? "Following"
                : "Follow"}
          </span>
        </Button>

        <Tooltip content="Share">
          <IconButton color={"contrast"} onClick={handleShare}>
            <Icon icon="mdi:share-variant" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default SocialLinksAndButtons;
