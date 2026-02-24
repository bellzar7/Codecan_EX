import { Icon } from "@iconify/react";
import Link from "next/link";
import type React from "react";
import { useRef, useState } from "react";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNftStore } from "@/stores/nft";
import "swiper/css";
import "swiper/css/navigation";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";

const FeaturedNftAssets: React.FC = () => {
  const { featuredAssets } = useNftStore();
  const swiperRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Custom navigation button to move the slider
  const handleSlideNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  return (
    <div className="relative z-9 w-full px-4 py-12 md:px-16">
      {/* Gradient Backgrounds */}
      <div className="absolute top-[-300px] right-[-400px] z-[-1] h-[400px] w-[700px] rounded-full opacity-50 blur-[80px] [transform:translate3d(0,0,0)] dark:opacity-100">
        <div className="h-full w-full bg-linear-to-l from-purple-600 via-purple-500 to-transparent" />
      </div>

      <div className="absolute top-[-500px] left-[-400px] z-[-1] hidden h-[400px] w-[700px] rounded-full opacity-50 blur-[80px] [transform:translate3d(0,0,0)] md:block dark:opacity-100">
        <div className="h-full w-full bg-linear-to-r from-indigo-600 via-indigo-500 to-transparent" />
      </div>
      {/* Header Section */}
      <div className="z-9 mb-10 flex flex-col items-center justify-between gap-10 rounded-xl border border-muted-200 bg-muted-50 px-8 py-16 md:px-16 lg:flex-row lg:px-24 dark:border-muted-700 dark:bg-black">
        {/* Left Section */}
        <div className="w-full lg:w-1/3">
          <h2 className="font-bold text-3xl text-muted-900 md:text-4xl dark:text-muted-100">
            Every week, we feature some of our favorite items
          </h2>
          <p className="mt-2 text-muted-600 dark:text-muted-400">
            Collect your favorite items now!
          </p>
          {/* Buttons */}
          <div className="mt-6 flex w-full gap-5">
            <div className="w-full">
              <ButtonLink
                className="w-full"
                color={"primary"}
                href="/nft/marketplace"
              >
                Trade Now
              </ButtonLink>
            </div>
            <div className="w-full">
              <ButtonLink
                className="w-full"
                color={"muted"}
                href="/nft/collections"
              >
                Explore Collections
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* Right Section - Carousel */}
        <div className="relative flex w-full items-center lg:w-2/3">
          {/* Swiper */}
          <Swiper
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: {
                slidesPerView: 1, // Small screens: 1 slide
              },
              768: {
                slidesPerView: 3, // Medium screens: 2 slides
              },
              1024: {
                slidesPerView: 2, // Large screens: 3 slides
              },
            }}
            className="w-full"
            loop={true}
            modules={[Navigation, Autoplay]}
            onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
            ref={swiperRef}
            slidesPerView={1}
            spaceBetween={20}
          >
            {featuredAssets.map((asset) => (
              <SwiperSlide className="h-full w-full min-w-72" key={asset.id}>
                <Link
                  className="group block overflow-hidden rounded-xl border border-muted-100 bg-muted-100 transition hover:border-purple-500 dark:border-muted-900 dark:bg-black"
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
                          Rank:{" "}
                          <span className="font-medium">{asset.rank}</span>
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
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Right Navigation Button */}
          <div className="hidden w-6 ps-3 lg:block">
            {/* Show on medium screens and above */}
            <button
              className="rounded-full bg-muted-200 p-2 text-muted-800 transition hover:bg-muted-300 dark:bg-muted-700 dark:text-muted-100 dark:hover:bg-muted-600"
              onClick={handleSlideNext}
            >
              <Icon className="h-4 w-4" icon="akar-icons:chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNftAssets;
