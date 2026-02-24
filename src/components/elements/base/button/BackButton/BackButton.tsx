import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, type ReactNode } from "react";
import ButtonLink from "../../button-link/ButtonLink";

interface BackButtonProps {
  href: string;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}
const BackButtonBase = ({ href, size = "md", children }: BackButtonProps) => {
  const { t } = useTranslation();
  return (
    <ButtonLink color="muted" href={href} shape="rounded" size={size}>
      <Icon
        className={`"h-4 w-4 ${!children && "mr-2"}"`}
        icon="line-md:chevron-left"
      />
      {children || t("Back")}
    </ButtonLink>
  );
};
export const BackButton = memo(BackButtonBase);
