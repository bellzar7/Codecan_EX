import type React from "react";
import { useNftStore } from "@/stores/nft";
import ProfileImage from "./elements/ProfileImage";

const BannerSection: React.FC = () => {
  // Retrieve the collection state from the Zustand store
  const collection = useNftStore((state) => state.collection);

  return (
    <div
      className="relative flex h-[250px] w-full flex-col justify-end bg-center bg-cover md:h-[280px]"
      style={{
        backgroundImage: `url(${collection?.image || "/default-banner.png"})`,
      }}
    >
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-black/80 to-transparent" />

      {/* Creator's Profile Image */}
      <ProfileImage avatar={collection?.creator?.avatar} />
    </div>
  );
};

export default BannerSection;
