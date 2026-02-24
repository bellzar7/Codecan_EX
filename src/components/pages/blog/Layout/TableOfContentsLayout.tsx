"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Tag from "@/components/elements/base/tag/Tag";
import { CommentSection } from "@/components/pages/blog/CommentSection";
import RelatedPosts from "../RelatedPosts";
import SocialShareButtons from "../SocialShare/SocialShareButtons";

const TableOfContentsLayout = ({
  post,
  comments,
  relatedPosts,
  fetchData,
  t,
}: any) => {
  const { title, content, image } = post;
  const router = useRouter();

  // State for table of contents
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [updatedContent, setUpdatedContent] = useState<string>("");

  useEffect(() => {
    // Parse content and assign unique IDs to headings
    const container = document.createElement("div");
    container.innerHTML = content;

    let headingCounter = 0;

    // Update headings with unique IDs
    const newHeadings: { id: string; text: string }[] = [];
    Array.from(container.querySelectorAll("h1, h2, h3")).forEach((heading) => {
      const text = heading.textContent?.trim() || "";
      const uniqueId = `${text.toLowerCase().replace(/\s+/g, "-")}-${headingCounter}`;
      heading.id = uniqueId;
      newHeadings.push({ id: uniqueId, text });
      headingCounter++;
    });

    setHeadings(newHeadings);
    setUpdatedContent(container.innerHTML); // Save updated content with unique IDs
  }, [content]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 lg:px-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          className="text-muted-600 text-sm hover:underline dark:text-muted-400"
          onClick={() => router.back()}
        >
          ← {t("Back")}
        </button>
      </div>

      {/* Header Section */}
      <div className="mb-8 text-center">
        <Link href={`/blog/category/${post.category?.slug}`}>
          <Tag color="primary" variant="outlined">
            {post.category?.name}
          </Tag>
        </Link>
        <h1 className="mb-2 font-bold text-4xl text-muted-800 dark:text-muted-200">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-muted-600 text-sm dark:text-muted-400">
          <span>
            {t("By")} {post.author?.user?.firstName}{" "}
            {post.author?.user?.lastName}
          </span>
          <Avatar
            alt={`${post.author?.user?.firstName} ${post.author?.user?.lastName}`}
            size="sm"
            src={post.author?.user?.avatar || "/img/avatars/placeholder.webp"}
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

      {/* Main Image */}
      {image && (
        <div className="relative mb-6 w-full overflow-hidden rounded-lg shadow-md">
          <img
            alt={title}
            className="h-[300px] w-full object-cover md:h-[400px]"
            src={image}
          />
        </div>
      )}

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Table of Contents */}
        <aside className="space-y-4 md:w-1/4">
          <div className="sticky top-4">
            <h3 className="pb-2 font-semibold text-lg text-muted-800 dark:text-muted-200">
              {t("Table of Contents")}
            </h3>
            <ul className="list-disc pl-4 text-muted-600 text-sm dark:text-muted-400">
              {headings.map(({ id, text }) => (
                <li className="mb-2" key={id}>
                  <a
                    className="hover:text-primary hover:underline"
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(id);
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
            {/* Social Share Buttons */}
            <div className="mt-8 flex flex-col gap-4">
              <span className="text-muted-600 text-sm dark:text-muted-400">
                {t("Share Article")}:{" "}
              </span>
              <div className="flex gap-2">
                <SocialShareButtons url={window.location.href} />
              </div>
            </div>
          </div>
        </aside>

        {/* Content Section */}
        <div className="prose dark:prose-dark max-w-none flex-1">
          <div dangerouslySetInnerHTML={{ __html: updatedContent }} />
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 font-semibold text-2xl text-muted-800 dark:text-muted-200">
            {t("Related Posts")}
          </h2>
          <RelatedPosts posts={relatedPosts} />
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-12">
        <CommentSection
          comments={comments}
          fetchData={fetchData}
          postId={post.id}
        />
      </div>
    </div>
  );
};

export default TableOfContentsLayout;
