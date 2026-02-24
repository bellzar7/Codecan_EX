import type React from "react";
import AutoplaySlider from "@/components/elements/base/slider/AutoplaySlider";
import { useNftStore } from "@/stores/nft";

const TrendingCollectionsCarousel: React.FC = () => {
  const { trendingCollections } = useNftStore();

  return (
    <AutoplaySlider containerStyles="w-full h-[300px] lg:h-[400px] px-16 mt-16 z-10">
      {trendingCollections?.map((collection, index) => (
        <div
          className="relative flex h-full w-full items-center justify-center"
          key={index}
        >
          <div
            className={
              "relative z-9 flex h-[300px] w-full items-center justify-between overflow-hidden rounded-lg px-8 py-12 shadow-xl md:px-20 lg:h-[400px] lg:px-32 xl:px-48"
            }
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.0)), url(${collection.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex flex-col justify-center space-y-4">
              <h2 className="mb-2 font-bold text-4xl text-white lg:text-5xl">
                {collection.name}
              </h2>
              <p className="mb-4 text-white">{collection.description}</p>
            </div>
          </div>
        </div>
      ))}
    </AutoplaySlider>
  );
};

export default TrendingCollectionsCarousel;
