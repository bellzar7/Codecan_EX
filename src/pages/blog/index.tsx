import { EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { PostsGrid } from "@/components/pages/blog/PostsGrid";
import { PostsSlider } from "@/components/pages/blog/PostsSlider";
import Layout from "@/layouts/Default";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import Tag from "@/components/elements/base/tag/Tag";
import { MashImage } from "@/components/elements/MashImage";
import { ErrorPage } from "@/components/ui/Errors";
import { $serverFetch } from "@/utils/api";

interface Props {
  posts?: {
    items: BlogPost[];
    pagination: {
      totalItems: number;
      currentPage: number;
      perPage: number;
      totalPages: number;
    };
  };
  categories?: Category[];
  tags?: Tag[];
  error?: string;
}

const Blog: React.FC<Props> = ({ posts, categories, tags, error }) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <ErrorPage
        description={t(error)}
        link="/"
        linkTitle={t("Go Back")}
        title={t("Error")}
      />
    );
  }

  return (
    <Layout color="muted" title={t("Blog")}>
      <div className="max-w-5xl space-y-8 lg:mx-auto">
        {/* Slider Section */}
        <div className="pb-5">
          <PostsSlider content={posts?.items || []} />
        </div>

        {/* Categories Section */}
        {categories && categories.length > 0 && (
          <>
            <div className="relative mb-6">
              <hr className="border-muted-200 dark:border-muted-800" />
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
              grabCursor={true}
              loop={true}
              modules={[EffectCoverflow]}
              pagination={{
                clickable: true,
              }}
              slidesPerView={4}
              spaceBetween={30}
            >
              {categories.map((category, index) => (
                <SwiperSlide className="slide-item" key={index}>
                  <Link href={`/blog/category/${category.slug}`} passHref>
                    <div className="group relative transform transition duration-300 ease-in-out hover:-translate-y-1">
                      <div className="relative h-[150px] w-full">
                        <MashImage
                          alt={category.slug}
                          className="h-full w-full rounded-lg bg-muted-100 object-cover dark:bg-muted-900"
                          fill
                          src={category.image || "/img/placeholder.svg"}
                        />
                      </div>
                      <div>
                        <div className="absolute inset-0 z-10 h-full w-full rounded-lg bg-muted-900 opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
                        <div className="absolute inset-0 z-20 flex h-full w-full flex-col justify-between p-6">
                          <h3 className="font-sans text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                            {category.name}
                          </h3>
                          <h3 className="font-sans text-sm text-white underline opacity-0 transition-all duration-300 group-hover:opacity-100">
                            {t("View Posts")}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </>
        )}

        {/* Latest Posts Section */}
        <div className="relative">
          <hr className="border-muted-200 dark:border-muted-800" />
          <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
            <span className="bg-muted-50 px-2 dark:bg-muted-900">
              {t("Latest Posts")}
            </span>
          </span>
        </div>
        <PostsGrid posts={posts?.items || []} />
      </div>

      {/* Tag Cloud Section */}
      <div className="relative mt-10 mb-5">
        <hr className="border-muted-200 dark:border-muted-800" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {t("Our Tag Cloud")}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {tags?.slice(0, 50).map((tag, index) => (
          <Link href={`/blog/tag/${tag.slug}`} key={index} passHref>
            <Tag
              className="group transform p-3 transition duration-300 ease-in-out hover:-translate-y-1"
              shape="rounded-sm"
            >
              {tag.name}
            </Tag>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const [postsResponse, categoriesResponse, tagsResponse] = await Promise.all(
      [
        $serverFetch(context, {
          url: "/api/content/post?page=1&perPage=10&sortField=createdAt&sortOrder=desc",
        }),
        $serverFetch(context, { url: "/api/content/category" }),
        $serverFetch(context, { url: "/api/content/tag" }),
      ]
    );
    if (postsResponse.error || categoriesResponse.error || tagsResponse.error) {
      throw new Error(
        postsResponse.error ||
          categoriesResponse.error ||
          tagsResponse.error ||
          "Unknown error occurred"
      );
    }

    return {
      props: {
        posts: postsResponse.data,
        categories: categoriesResponse.data,
        tags: tagsResponse.data,
      },
    };
  } catch (error: any) {
    console.error("Error fetching data:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default Blog;
