import Link from "next/link";
import { sizes } from "@/components/elements/base/avatar/Avatar";
import { MashImage } from "@/components/elements/MashImage";
import { cn } from "@/utils/cn";
import type { UserProfileButtonProps } from "./UserProfileButton.types";

const UserProfileButtonBase = ({
  userName = "Clark Smith",
  userImageSrc = "/img/avatars/placeholder.webp",
  isVisible = false,
}: UserProfileButtonProps) => {
  const containerClasses =
    "flex h-16 shrink-0 items-center border-t border-primary-700 px-5";
  const linkClasses = "flex items-center gap-2 p-0.5";
  const imageContainerClasses = "mask mask-blob h-8 w-8 min-w-[1.6rem]";
  const imageClasses = "block w-full";
  const userNameClasses = cn(
    "whitespace-nowrap text-sm text-white transition-all duration-300 hover:text-white/70",
    {
      "opacity-100": isVisible,
      "opacity-0": !isVisible,
    }
  );

  return (
    <div className={containerClasses}>
      <Link className={linkClasses} href="/user/profile">
        <span className={imageContainerClasses}>
          <MashImage
            alt=""
            className={imageClasses}
            height={sizes["xxs"]}
            src={userImageSrc}
            width={sizes["xxs"]}
          />
        </span>
        <span className={userNameClasses}>{userName}</span>
      </Link>
    </div>
  );
};

export const UserProfileButton = UserProfileButtonBase;
