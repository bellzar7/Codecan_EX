import { formatDate } from "date-fns";
import Link from "next/link";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import { MashImage } from "@/components/elements/MashImage";
import type { PostCardProps } from "./PostCard.types";

const PostCardBase = ({ post }: PostCardProps) => {
  return (
    <Link href={`/blog/${post.slug}`} passHref>
      <Card
        className="group relative h-full w-full cursor-pointer p-3 hover:border-primary-500 hover:shadow-lg dark:hover:border-primary-400"
        shape="curved"
      >
        <div className="relative h-[200px] w-full">
          <MashImage
            alt={post.title}
            className="h-full w-full rounded-md bg-muted-100 object-cover dark:bg-muted-900"
            fill
            src={post.image || "/img/placeholder.svg"}
          />
          <Tag
            className="absolute top-3 left-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            color="primary"
            shape="full"
            variant="pastel"
          >
            {post.category?.name}
          </Tag>
        </div>
        <div>
          <div className="mt-3 mb-6">
            <h3 className="line-clamp-2 text-gray-800 dark:text-gray-100">
              {post.title}
            </h3>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <Avatar
              className="bg-muted-500/20 text-muted-500"
              size="xs"
              src={post.author?.user?.avatar || "/img/avatars/1.svg"}
              text={post.author?.user?.firstName}
            />
            <div className="leading-none">
              <h4 className="font-medium font-sans text-muted-800 text-sm leading-tight dark:text-muted-100">
                {post.author?.user?.firstName}
              </h4>
              <p className="font-sans text-muted-400 text-xs">
                {formatDate(
                  new Date(post.createdAt || new Date()),
                  "MMM dd, yyyy"
                )}
              </p>
            </div>
            {/* {post.author?.user?.id === user?.id && (
              <Link
                href={`/blog/author/post?type=edit&slug=${post.slug}`}
                passHref
              >
                <button className="ms-auto">
                  <Icon name="lucide:edit-3" />
                  <span>Edit</span>
                </button>
              </Link>
            )} */}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export const PostCard = PostCardBase;
