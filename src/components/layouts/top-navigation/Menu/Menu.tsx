import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDashboardStore } from "@/stores/dashboard";
import NavbarItem from "../navbar/NavbarItem";
import NavDropdown from "../navbar/NavDropdown";

const MenuBase = () => {
  const { isSidebarOpenedMobile, filteredMenu } = useDashboardStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMenuItemActive = (item) => {
    return item.href === router.pathname;
  };

  // Helper function to render a single link
  const renderLink = (item, key, hasDescription = false) => (
    <NavbarItem
      description={hasDescription && item.description}
      href={item.href}
      icon={
        item.icon || (isMenuItemActive(item) ? "ph:dot-fill" : "ph:dot-duotone")
      }
      key={key}
      title={item.title}
    />
  );

  // Helper function to render a dropdown or link based on the item type
  const renderDropdownOrLink = (
    item,
    idx,
    nested = false,
    hasDescription = false
  ) => {
    const subMenu = Array.isArray(item.subMenu) ? item.subMenu : item.menu;
    if (Array.isArray(subMenu)) {
      return (
        <NavDropdown
          description={hasDescription && item.description}
          icon={
            item.icon ||
            (isMenuItemActive(item) ? "ph:dot-fill" : "ph:dot-duotone")
          }
          key={idx}
          nested={nested}
          title={item.title}
        >
          {subMenu.map((subItem, subIdx) =>
            subItem.subMenu || subItem.menu
              ? renderDropdownOrLink(
                  subItem,
                  `subdropdown-${subIdx}`,
                  true,
                  true
                )
              : renderLink(subItem, `sublink-${subIdx}`, true)
          )}
        </NavDropdown>
      );
    }
    // Otherwise, it's a direct link
    return renderLink(item, `link-${idx}`);
  };

  const renderMenus = () => {
    console.log("filteredMenu", filteredMenu);
    return filteredMenu.map((item, idx) => renderDropdownOrLink(item, idx));
  };

  if (!isMounted) {
    return null; // Prevent rendering on the server side
  }

  return (
    <div
      className={`scrollbar-hidden grow flex-wrap items-stretch overflow-y-auto lg:flex lg:overflow-visible lg:bg-transparent dark:bg-muted-900 dark:lg:bg-transparent ${
        isSidebarOpenedMobile ? "block max-h-[80vh]" : "hidden lg:block"
      }`}
    >
      <div
        className={`lg:!flex px-4 pb-2 lg:flex-1 lg:basis-full lg:items-stretch lg:justify-center lg:space-x-1 lg:pb-0 ${
          isSidebarOpenedMobile ? "block" : "hidden"
        }`}
      >
        {renderMenus()}
      </div>
    </div>
  );
};

export const Menu = MenuBase;
