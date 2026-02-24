"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Tag from "@/components/elements/base/tag/Tag";
import { CommentSection } from "@/components/pages/blog/CommentSection";
import RelatedPosts from "../RelatedPosts";

const DefaultLayout = ({ post, comments, relatedPosts, fetchData, t }: any) => {
  const { title, content, image } = post;
  const router = useRouter();

  return (
    <div className="mx-auto px-4 pb-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="text-muted-600 text-sm hover:underline dark:text-muted-400"
          onClick={() => router.back()}
        >
          ← {t("Back")}
        </button>
      </div>

      {image && (
        <div className="relative mb-6 max-h-[400px] w-full overflow-hidden rounded-lg shadow-md">
          <img
            alt={title}
            className="h-[300px] w-full object-cover md:h-[400px]"
            src={image}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 px-4 text-center">
            {/* Category Link */}
            <Link href={`/blog/category/${post.category?.slug}`}>
              <Tag color="contrast">{post.category?.name}</Tag>
            </Link>

            {/* Title */}
            <h1 className="mb-2 font-bold text-4xl text-white">{title}</h1>

            {/* Author and Date */}
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <span>
                {t("By")} {post.author?.user?.firstName}{" "}
                {post.author?.user?.lastName}
              </span>
              <Avatar
                alt={`${post.author?.user?.firstName} ${post.author?.user?.lastName}`}
                className="ml-2 border border-white"
                size="sm"
                src={
                  post.author?.user?.avatar || "/img/avatars/placeholder.webp"
                }
              />
              <span>
                {new Date(post.createdAt || new Date()).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="prose dark:prose-dark">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>

      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 font-semibold text-2xl text-muted-800 dark:text-muted-200">
            {t("Related Posts")}
          </h2>
          <RelatedPosts posts={relatedPosts} />
        </div>
      )}

      {/* Comments Section */}
      <CommentSection
        comments={comments}
        fetchData={fetchData}
        postId={post.id}
      />
    </div>
  );
};

export default DefaultLayout;
