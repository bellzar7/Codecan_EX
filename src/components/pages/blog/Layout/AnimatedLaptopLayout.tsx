"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Tag from "@/components/elements/base/tag/Tag";
import { CommentSection } from "@/components/pages/blog/CommentSection";
import { TracingBeam } from "@/components/ui/Beam";
import { MacbookScroll } from "@/components/ui/MacBookScroll";
import RelatedPosts from "../RelatedPosts";

const AnimatedLaptopLayout = ({
  post,
  comments,
  relatedPosts,
  fetchData,
  t,
}: any) => {
  const { title, content, image } = post;
  const router = useRouter();

  return (
    <>
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="text-muted-600 text-sm hover:underline dark:text-muted-400"
          onClick={() => router.back()}
        >
          ← {t("Back")}
        </button>
      </div>
      <TracingBeam>
        <div className="relative mx-auto max-w-prose pt-4 antialiased">
          <div className="hidden w-full overflow-hidden md:block">
            <MacbookScroll
              showGradient={false}
              src={image || "/img/placeholder.svg"}
              title={
                <div className="flex flex-col items-center justify-center gap-2">
                  <div>
                    <Link href={`/blog/category/${post.category?.slug}`}>
                      <Tag color="primary" variant="outlined">
                        {post.category?.name}
                      </Tag>
                    </Link>
                  </div>
                  <span className="text-7xl">{title}</span>
                  <div className="mt-8 flex items-center gap-2 text-sm">
                    <span>
                      {t("By")} {post.author?.user?.firstName}{" "}
                      {post.author?.user?.lastName}
                    </span>
                    <Avatar
                      alt={`${post.author?.user?.firstName} ${post.author?.user?.lastName}`}
                      className="ml-2"
                      size="sm"
                      src={
                        post.author?.user?.avatar ||
                        "/img/avatars/placeholder.webp"
                      }
                    />
                    <span className="text-muted-600 dark:text-muted-400">
                      {new Date(
                        post.createdAt || new Date()
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                    </span>
                  </div>
                </div>
              }
            />
          </div>
          <div className="prose dark:prose-dark mx-auto max-w-prose prose-pre:max-w-[90vw] pe-20 md:pe-0">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 font-semibold text-2xl text-muted-800 dark:text-muted-200">
                {t("Related Posts")}
              </h2>
              <RelatedPosts max={2} posts={relatedPosts} />
            </div>
          )}
          <CommentSection
            comments={comments}
            fetchData={fetchData}
            postId={post.id}
          />
        </div>
      </TracingBeam>
    </>
  );
};

export default AnimatedLaptopLayout;
