import Link from "next/link";
import { memo } from "react";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import { MashImage } from "@/components/elements/MashImage";

const PostsGridBase = ({ posts }: { posts: BlogPost[] }) => {
  return (
    <div className="mx-auto grid grid-cols-1 gap-4 md:grid-cols-3">
      {posts
        .reduce(
          (rows: { width: number; element: JSX.Element }[][], post, i) => {
            let row: { width: number; element: JSX.Element }[] =
              rows[rows.length - 1];

            if (!row) {
              row = [];
              rows.push(row);
            }

            const remaining = 3 - row.reduce((acc, p) => acc + p.width, 0);
            const itemWidth = Math.min(
              Math.floor(Math.random() * 2) + 1,
              remaining
            );

            if (itemWidth <= remaining) {
              const className = `col-span-1 md:col-span-${itemWidth}`;
              const description = post.description || "";
              const contentSnippet =
                itemWidth === 1
                  ? description.slice(0, 150) + "..."
                  : description.slice(0, 350) + "...";

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

              row.push({
                width: itemWidth,
                element: (
                  <Link href={`/blog/post/${post.slug}`} key={post.id}>
                    <Card
                      className={`relative h-full w-full cursor-pointer p-2 hover:shadow-lg ${className} transition-all duration-300 hover:border-primary-500 dark:hover:border-primary-400`}
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
                        </div>
                      </div>
                    </Card>
                  </Link>
                ),
              });

              if (remaining - itemWidth === 0) {
                rows.push([]);
              }
            }

            return rows;
          },
          []
        )
        .flatMap((row) => row.map(({ element }) => element))}
    </div>
  );
};

export const PostsGrid = memo(PostsGridBase);
