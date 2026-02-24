import Link from "next/link";
import { MashImage } from "@/components/elements/MashImage";
import { PinContainer } from "@/components/ui/PostPin";
import type { PostCardPinProps } from "./PostCardPin.types";

const PostCardPinBase = ({ post }: PostCardPinProps) => {
  return (
    <Link href={`/blog/${post.slug}`} passHref>
      <PinContainer href={`/blog/${post.slug}`} title={post.title}>
        <div className="flex h-[20rem] w-[16rem] basis-full flex-col text-slate-100/50 tracking-tight sm:basis-1/2">
          <div className="relative mb-5 h-[200px] w-full">
            <MashImage
              alt={post.title}
              className="h-full w-full rounded-lg bg-muted-100 object-cover dark:bg-muted-900"
              fill
              src={post.image || "/img/placeholder.svg"}
            />
          </div>
          <h3 className="line-clamp-2 text-gray-800 dark:text-gray-100">
            {post.title}
          </h3>
          <div className="m-0! p-0! font-normal text-base">
            <span className="text-slate-500">
              {post.content?.slice(0, 120)}...
            </span>
          </div>
        </div>
      </PinContainer>
    </Link>
  );
};

export const PostCardPin = PostCardPinBase;
