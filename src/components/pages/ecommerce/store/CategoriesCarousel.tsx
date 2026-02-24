// components/pages/shop/CategoriesCarousel.tsx

import Link from "next/link";
import type React from "react";
import { EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { MashImage } from "@/components/elements/MashImage";

interface Props {
  categories: any[];
  t: (key: string) => string;
}

const CategoriesCarousel: React.FC<Props> = ({ categories, t }) => {
  return (
    <div className="mt-5 mb-5">
      <div className="relative mb-6">
        <hr className="border-muted-200 dark:border-muted-700" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {t("Categories")}
          </span>
        </span>
      </div>
      <Swiper
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
        }}
        centeredSlides={true}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 1,
          slideShadows: false,
        }}
        effect={"coverflow"}
        grabCursor={true} // Enables looping
        loop={true} // Visible slides, including the active one
        modules={[EffectCoverflow]} // Space between slides
        pagination={{ clickable: true }}
        slidesPerView={4}
        spaceBetween={30}
      >
        {categories.map((category, index) => (
          <SwiperSlide className="slide-item" key={index}>
            <Link href={`/store/${category.slug}`} passHref>
              <div className="group relative h-[150px] w-full transform transition duration-300 ease-in-out hover:-translate-y-1">
                <MashImage
                  alt={category.slug}
                  className="h-full w-full rounded-lg bg-muted-100 object-cover dark:bg-muted-900"
                  fill
                  src={category.image || "/img/placeholder.svg"}
                />
                <div className="absolute inset-0 z-10 h-full w-full rounded-lg bg-muted-900 opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
                <div className="absolute inset-0 z-20 flex h-full w-full flex-col justify-between p-6">
                  <h3 className="font-sans text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {category.name}
                  </h3>
                  <h3 className="font-sans text-sm text-white underline opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {t("View products")}
                  </h3>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CategoriesCarousel;
