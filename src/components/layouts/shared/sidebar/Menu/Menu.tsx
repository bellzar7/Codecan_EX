import { MashImage } from "@/components/elements/MashImage";
import { useMenuContext } from "@/context/MenuContext";
import { useDashboardStore } from "@/stores/dashboard";
import { TopBar as CollapseTopBar } from "../collapse/TopBar";
import { UserProfileButton as CollapseUserProfileButton } from "../collapse/UserProfileButton";
import { MenuItems } from "../MenuItems";
import { UserProfileButton } from "../sideblock/UserProfileButton";
import { TopBar } from "../TopBar";
import type { MenuProps } from "./Menu.types";

const MenuBase = ({
  float = false,
  sideblock = false,
  collapse = false,
}: MenuProps) => {
  const {
    sidebarOpened,
    isSidebarOpenedMobile,
    setSidebarOpened,
    setIsSidebarOpenedMobile,
    filteredMenu,
    profile,
    isFetched,
    activeSidebar,
  } = useDashboardStore();

  const { setActive } = useMenuContext();

  function collapseSidebarToggle() {
    if (collapse) {
      setSidebarOpened(!sidebarOpened);
    } else {
      setSidebarOpened(false);
      setIsSidebarOpenedMobile(false);
    }
    setActive("");
  }

  function generateNavClassNames() {
    // Define base classes
    const baseClasses = [
      "fixed left-0 top-0 z-11 h-full overflow-hidden transition-all duration-300 dark:border-muted-800 dark:bg-muted-900",
    ];

    // Conditional classes based on the provided states
    const conditionalClasses = [
      collapse ? "w-[280px]" : "w-[calc(100%-80px)]",
      collapse ? "bg-primary-800" : "bg-white",
      !collapse || sideblock || float ? "border-r" : "border-0",
      collapse ? "" : "border-muted-200",
      sideblock ? "text-muted-500 dark:text-muted-400" : "",
      collapse ? "" : "md:w-[250px]",
      collapse ? "" : sideblock ? "lg:w-[280px]" : "lg:left-20",
      collapse
        ? sidebarOpened
          ? "lg:w-[280px]"
          : "lg:w-20"
        : sideblock
          ? ""
          : float
            ? sidebarOpened
              ? "is-sidebar-translated translate-x-0 border-r"
              : "-translate-x-[130%]"
            : sidebarOpened
              ? "translate-x-0"
              : "-translate-x-[101%]",
      collapse
        ? isSidebarOpenedMobile
          ? "is-translated-mobile translate-x-0"
          : "-translate-x-[101%] lg:translate-x-0"
        : sideblock
          ? isSidebarOpenedMobile
            ? ""
            : "-translate-x-[101%]"
          : float
            ? isSidebarOpenedMobile
              ? "is-menu-sidebar-translated-mobile left-20 translate-x-0"
              : "-translate-x-[130%]"
            : isSidebarOpenedMobile
              ? "left-20 translate-x-0"
              : "-translate-x-[101%]",
    ];

    // Join all classes into a single string
    const classes = [...baseClasses, ...conditionalClasses]
      .filter((cls) => cls) // Remove empty strings to avoid unnecessary spaces
      .join(" ");

    return classes;
  }

  const navClassNames = generateNavClassNames();

  const renderMenus = () => {
    return filteredMenu.map((section, key) => (
      <MenuItems
        activeMenuKey={section.title}
        collapse={collapse}
        key={`${section.title}-menu`}
        menuId={`${section.title}-menu`}
        menuItems={filteredMenu[key].menu}
        sideblock={sideblock}
      />
    ));
  };

  const activeMenuItem = filteredMenu.find(
    (item) => item.title === activeSidebar
  );

  if (!(activeMenuItem && (activeMenuItem.menu || activeMenuItem.subMenu))) {
    return null;
  }

  return (
    <nav className={navClassNames}>
      {collapse && (
        <div className="absolute inset-0 z-1 block overflow-hidden opacity-20">
          <MashImage
            alt="sidebar background"
            // fill
            className="h-full w-full object-cover object-center"
            height={869}
            src="/img/sidebar-bg.webp"
            width={80}
          />
        </div>
      )}
      <div
        className={
          collapse || sideblock ? "relative z-2 flex h-full flex-col" : "h-full"
        }
      >
        {sideblock || collapse ? (
          <CollapseTopBar
            collapse={collapse}
            collapseSidebarToggle={collapseSidebarToggle}
            setIsSidebarOpenedMobile={setIsSidebarOpenedMobile}
            sidebarOpened={sidebarOpened}
          />
        ) : (
          <TopBar
            float={float}
            isSidebarOpenedMobile={isSidebarOpenedMobile}
            setIsSidebarOpenedMobile={setIsSidebarOpenedMobile}
            setSidebarOpened={setSidebarOpened}
            sidebarOpened={sidebarOpened}
          />
        )}

        {isFetched && sideblock && (
          <UserProfileButton
            userImageSrc={profile?.avatar || "/img/avatars/placeholder.webp"}
            userName={profile?.firstName || "Clark Smith"}
          />
        )}

        {isFetched && renderMenus()}

        {isFetched && collapse && (
          <CollapseUserProfileButton
            isVisible={sidebarOpened}
            userImageSrc={profile?.avatar || "/img/avatars/placeholder.webp"}
            userName={profile?.firstName || "Clark Smith"}
          />
        )}
      </div>
    </nav>
  );
};

export const Menu = MenuBase;
