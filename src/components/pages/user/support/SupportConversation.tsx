import type { FC, ReactNode } from "react";
import { MashImage } from "@/components/elements/MashImage";

interface SupportConversationProps {
  avatar: string;
  children: ReactNode;
  timestamp: string;
  side?: "left" | "right";
}

const SupportConversation: FC<SupportConversationProps> = ({
  avatar,
  children,
  timestamp,
  side = "left",
}) => {
  const isLeft = side === "left";

  return (
    <div className="group">
      <div
        className={`flex items-stretch gap-5 ${
          isLeft ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div>
          <MashImage
            alt="user photo"
            className="block rounded-full"
            height={40}
            src={avatar}
            width={40}
          />
        </div>
        <div
          className={`relative rounded-[.65rem] border border-muted-200 p-3 text-muted-800 dark:text-muted-200 ${
            isLeft ? "bg-muted-200/80" : "bg-white"
          } ${
            isLeft
              ? "before:left-full after:left-full"
              : "before:right-full after:right-full"
          } before:pointer-events-none before:absolute before:top-[20px] before:-mt-[6px] before:h-0 before:w-0 before:border-[6px] before:border-transparent after:pointer-events-none after:absolute after:top-[21px] after:-mt-2 after:h-0 after:w-0 after:border-[5px] after:border-transparent ${
            isLeft
              ? "before:border-l-muted-200 after:border-l-muted-200/80"
              : "before:border-r-muted-200 after:border-r-white"
          } dark:border-muted-800 ${
            isLeft
              ? "dark:bg-muted-800 dark:after:border-l-muted-800 dark:before:border-l-muted-800"
              : "dark:bg-muted-950 dark:after:border-r-muted-950 dark:before:border-r-muted-800"
          } min-w-[15%] max-w-[80%]`}
        >
          <div className="content text-md [&_p]:mb-2 [&_p]:text-muted-500 dark:[&_p]:text-muted-400">
            {children}
          </div>
        </div>
      </div>
      <div
        className={`mt-1 ${
          isLeft ? "me-[68px] text-right" : "ms-[68px] text-left"
        }`}
      >
        <span className="timestamp ms-2 block text-[.7rem] text-muted-400">
          {timestamp}
        </span>
      </div>
    </div>
  );
};

export default SupportConversation;
