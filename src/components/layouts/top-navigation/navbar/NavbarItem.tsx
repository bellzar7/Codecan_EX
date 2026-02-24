import { Icon, type IconifyIcon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import type { FC } from "react";
import { toast } from "sonner";
import { useDashboardStore } from "@/stores/dashboard";

export const navItemBaseStyles =
  "hover:bg-muted-100 hover:text-primary-500 dark:hover:bg-muted-800 leading-6 text-muted-500 dark:text-muted-400 relative flex cursor-pointer items-center gap-1 rounded-lg py-2.5 px-2";

interface NavbarItemProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className"> {
  icon: IconifyIcon | string;
  title: string;
  href?: string;
  description?: string;
  checkPermission?: () => Promise<boolean> | boolean;
  onPermissionDenied?: () => void;
}

const NavbarItem: FC<NavbarItemProps> = ({
  icon,
  title,
  href = "",
  description,
  checkPermission,
  onPermissionDenied,
  ...props
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { profile } = useDashboardStore();

  const isActive = router.pathname === href;

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Always prevent default to block auto navigation
    let isAllowed = true;
    let errMessage = "";

    if (profile && profile?.customRestrictionPairFields?.length > 0) {
      for (const restriction of profile?.customRestrictionPairFields) {
        if (restriction?.section?.toLowerCase() === title?.toLowerCase()) {
          isAllowed = restriction.isAllowed;
          errMessage = restriction.reason;
        }
      }
    }
    if (isAllowed) {
      router.push(href); // Manual navigation
    } else {
      toast.error(errMessage);
    }
    //     onPermis
    // if (checkPermission) {
    //   let allowed = false
    //   if (allowed) {
    //     router.push(href); // Manual navigation
    //   } else {
    //     onPermissionDenied?.(); // Show popup or alert
    //   }
    // } else {
    //   router.push(href); // Navigate directly if no permission logic provided
    // }
  };

  return (
    <a
      className={`flex items-center gap-3 transition-colors duration-300 ${navItemBaseStyles} ${
        isActive
          ? "bg-muted-100 text-primary-500 lg:bg-transparent dark:bg-muted-800"
          : ""
      }`}
      onClick={handleClick}
      {...props}
    >
      <Icon className="h-5 w-5" icon={icon} />
      <div className="flex flex-col">
        <span className="text-sm">{t(title)}</span>
        {description && (
          <span className="text-muted-400 text-xs leading-none dark:text-muted-500">
            {t(description)}
          </span>
        )}
      </div>
    </a>
  );
};

export default NavbarItem;
