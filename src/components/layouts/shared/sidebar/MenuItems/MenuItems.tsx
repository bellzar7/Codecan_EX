import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { MenuContextProvider } from "@/context/MenuContext";
import { useDashboardStore } from "@/stores/dashboard";
import { cn } from "@/utils/cn";
import { MenuDivider } from "../sidebar-menu/MenuDivider";
import { MenuItem } from "../sidebar-menu/MenuItem";
import { SubMenuItem } from "../sidebar-menu/SubMenuItem";
import type { MenuItemsProps } from "./MenuItems.types";

const MenuItemsBase = ({
  menuId,
  activeMenuKey,
  menuItems = [],
  specialRender,
  collapse = false,
  sideblock = false,
}: MenuItemsProps) => {
  const { activeSidebar, isFetched } = useDashboardStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || activeSidebar !== activeMenuKey) {
    return null;
  }

  const isMenuChildActive = (items) => {
    return items.some((item) => router.pathname.startsWith(item.href));
  };

  const renderMenuItems = (items) =>
    items.length > 0 ? (
      items.map((item, index) =>
        item.subMenu ? (
          <MenuItem
            active={isMenuChildActive(item.subMenu)}
            collapse={collapse}
            description={item.description}
            icon={item.icon}
            key={index}
            sideblock={sideblock}
            title={item.title}
          >
            {item.subMenu.map((subItem, subIndex) => (
              <SubMenuItem
                collapse={collapse}
                href={subItem.href}
                key={subIndex}
                sideblock={sideblock}
                title={subItem.title}
              />
            ))}
          </MenuItem>
        ) : (
          <MenuItem
            collapse={collapse}
            description={item.description}
            href={item.href}
            icon={item.icon}
            key={index}
            sideblock={sideblock}
            title={item.title}
          />
        )
      )
    ) : (
      <li className="flex h-full flex-col items-center justify-center px-4 py-2 text-muted-500 text-sm dark:text-muted-400">
        <span className="flex items-center justify-center gap-2">
          <Icon className="h-4 w-4" icon="akar-icons:arrow-left" />
          {t("Select a menu item")}
        </span>
      </li>
    );

  const content = specialRender ? specialRender() : renderMenuItems(menuItems);

  const listClasses = cn(
    "slimscroll h-[calc(100%_-_52px)] animate-[fadeInLeft_.5s] overflow-y-auto px-4 pb-10",
    {
      "m-0 list-none p-0": collapse,
      "py-3": !sideblock,
    }
  );

  if (collapse) {
    return (
      <li className="slimscroll grow overflow-y-auto overflow-x-hidden py-3">
        <nav>
          <ul className={listClasses}>{content}</ul>
        </nav>
      </li>
    );
  }

  return (
    <ul className={listClasses} id={menuId}>
      <MenuContextProvider>
        {isFetched && content}
        {isFetched && menuItems.length > 0 && <MenuDivider />}
      </MenuContextProvider>
    </ul>
  );
};

export const MenuItems = MenuItemsBase;
