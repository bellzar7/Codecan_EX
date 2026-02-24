import { useTranslation } from "next-i18next";
import type React from "react";
import type { FC } from "react";
import Avatar, { type Sizes } from "@/components/elements/base/avatar/Avatar";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";

interface ListWidgetItemProps extends React.HTMLAttributes<HTMLDivElement> {
  href: string;
  title: string;
  text: string;
  avatar: string | React.ReactNode;
  itemAction?: React.ReactNode;
  avatarSize?: Sizes;
}
const ListWidgetItem: FC<ListWidgetItemProps> = ({
  href,
  title,
  text,
  avatar,
  itemAction,
  avatarSize = "xs",
  className: classes = "",
}) => {
  const { t } = useTranslation();
  return (
    <div className={`flex justify-between py-3 ${classes}`}>
      <div className="flex w-full items-center gap-2">
        {typeof avatar === "string" ? (
          <Avatar alt={`${title} photo`} size={avatarSize} src={avatar} />
        ) : (
          avatar
        )}
        <div className="h-max max-w-[230px] font-sans">
          <span className="item-title block font-medium text-muted-800 text-sm dark:text-muted-100">
            {title}
          </span>
          <span className="block text-muted-400 text-xs">{text}</span>
        </div>
        <div className="ms-auto flex items-center justify-end">
          {itemAction ? (
            itemAction
          ) : (
            <ButtonLink href={href} size="sm">
              {t("View")}
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
};
export default ListWidgetItem;
