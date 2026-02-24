import { EffectFade, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MashImage } from "@/components/elements/MashImage";
import type { PostsSliderProps } from "./PostsSlider.types";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { formatDate } from "date-fns";
import Link from "next/link";
import SwiperNavigation from "@/components/elements/addons/swiper/SwiperNavigation";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";

const PostsSliderBase = ({ content }: PostsSliderProps) => {
  return (
    <>
      <h1 className="mb-[2rem] text-center font-bold text-[3rem]" />
      <Swiper
        className="fade relative h-[400px]"
        effect={"fade"}
        loop={true}
        modules={[Pagination, EffectFade]}
        spaceBetween={30}
      >
        {content.map((post, index) => {
          return (
            <SwiperSlide className="pointer-events-none relative" key={index}>
              <div className="relative h-full w-full">
                <MashImage
                  alt=""
                  className="h-full w-full rounded-lg object-cover"
                  fill
                  src={post.image || "/img/placeholder.svg"}
                />
                <div className="absolute top-4 right-4">
                  <Tag shape="full">
                    {formatDate(
                      new Date(post.createdAt || new Date()),
                      "MMM dd, yyyy"
                    )}
                  </Tag>
                </div>
              </div>
              <div className="pointer-events-auto absolute inset-x-0 bottom-0 mb-6 hidden px-6 md:block">
                <Card
                  className="p-6 font-sans"
                  color="contrast"
                  shadow-sm="flat"
                >
                  <div className="space-y-2">
                    <Link href={`/blog/post/${post.slug}`}>
                      <h5 className="font-medium text-lg text-muted-800 dark:text-muted-100">
                        {post.title}
                      </h5>
                    </Link>
                    <p className="text-muted-500 text-sm dark:text-muted-100">
                      {post.description?.slice(0, 250)}...
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Avatar
                      alt=""
                      size="xxs"
                      src={
                        post.author?.user?.avatar ||
                        "/img/avatars/placeholder.webp"
                      }
                    />
                    <div>
                      <p className="font-medium text-muted-800 text-sm leading-tight dark:text-muted-100">
                        {post.author?.user?.firstName}{" "}
                        {post.author?.user?.lastName}
                      </p>
                      <span className="block text-muted-400 text-xs">
                        {post.author?.user?.role?.name}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </SwiperSlide>
          );
        })}
        <SwiperNavigation />
      </Swiper>
    </>
  );
};

export const PostsSlider = PostsSliderBase;
