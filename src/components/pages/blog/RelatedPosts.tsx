import Link from "next/link";
import { memo } from "react";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import { MashImage } from "@/components/elements/MashImage";

const RelatedPostsBase = ({
  posts,
  max = 3, // Default maximum number of posts to display
}: {
  posts: BlogPost[];
  max?: number;
}) => {
  return (
    <div
      className={`grid grid-cols-1 ${
        max > 1 ? "sm:grid-cols-2" : ""
      } ${max > 2 ? "md:grid-cols-3" : ""} mx-auto gap-4`}
    >
      {posts.slice(0, max).map((post) => {
        const description = post.description || "";
        const contentSnippet = description.slice(0, 150) + "...";

        const header = (
          <div className="relative z-1 h-[200px] max-h-[200px] w-full overflow-hidden">
            <MashImage
              alt={post.title}
              className="h-full w-full rounded-lg bg-muted-100 object-cover dark:bg-muted-900"
              fill
              src={post.image || "/img/placeholder.svg"}
            />
            <Tag
              className="absolute top-2 left-2 ms-1"
              color="muted"
              shape="rounded-sm"
              variant="solid"
            >
              {post.category?.name}
            </Tag>
          </div>
        );

        const createdAt = post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : null;

        return (
          <Link href={`/blog/post/${post.slug}`} key={post.id}>
            <Card
              className="relative h-full w-full cursor-pointer p-2 transition-all duration-300 hover:border-primary-500 hover:shadow-lg dark:hover:border-primary-400"
              color={"contrast"}
            >
              {header}
              <div className="p-2">
                <h3 className="font-semibold text-lg text-primary-500 dark:text-primary-400">
                  {post.title}
                </h3>
                <div className="flex flex-col gap-1 text-xs">
                  <p className="text-muted-500 dark:text-muted-400">
                    {contentSnippet}
                  </p>
                  {createdAt && (
                    <p className="mt-1 text-muted-500 dark:text-muted-400">
                      {createdAt}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export const RelatedPosts = memo(RelatedPostsBase);
export default RelatedPosts;
