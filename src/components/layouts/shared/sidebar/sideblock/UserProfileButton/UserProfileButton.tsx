import Link from "next/link";
import { useTranslation } from "next-i18next";
import { sizes } from "@/components/elements/base/avatar/Avatar";
import { MashImage } from "@/components/elements/MashImage";
import type { UserProfileButtonProps } from "./UserProfileButton.types";

const UserProfileButtonBase = ({
  userName = "Clark C.",
  userImageSrc = "/img/avatars/placeholder.webp",
}: UserProfileButtonProps) => {
  const { t } = useTranslation();
  return (
    <div className="mb-2 flex items-center">
      <Link
        className="flex h-[68px] items-center gap-2 px-6"
        href="/user/profile"
      >
        <span className="mask mask-blob h-12 w-12 shrink-0">
          <MashImage
            alt={userName}
            className="block w-full"
            height={sizes["xs"]}
            src={userImageSrc}
            width={sizes["xs"]}
          />
        </span>

        <div>
          <span className="block font-sans text-muted-400 text-xs uppercase leading-tight">
            {t("Welcome")}
          </span>
          <span className="block font-normal font-sans text-base text-muted-800 leading-tight dark:text-muted-100">
            {userName}
          </span>
        </div>
      </Link>
    </div>
  );
};
export const UserProfileButton = UserProfileButtonBase;
