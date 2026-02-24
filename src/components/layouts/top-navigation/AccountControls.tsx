import { Icon } from "@iconify/react";
import type { FC } from "react";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";
import { useDashboardStore } from "@/stores/dashboard";
import { AccountDropdown } from "../shared/AccountDropdown";
import { LocaleLogo } from "../shared/Locales/LocaleLogo";
import { NotificationsDropdown } from "../shared/NotificationsDropdown";

const AccountControls: FC<{
  isMobile: boolean;
  setIsMobileSearchActive: (active: boolean) => void;
}> = ({ isMobile, setIsMobileSearchActive }) => {
  const {
    profile,
    isAdmin,
    activeMenuType,
    toggleMenuType,
    isFetched,
    announcements,
    setPanelOpen,
    isSidebarOpenedMobile,
  } = useDashboardStore();
  return (
    <div
      className={
        isMobile
          ? `flex w-full items-center justify-between gap-2 px-7 pb-3 sm:justify-end ${isSidebarOpenedMobile ? "lg:hidden" : "hidden"}`
          : "ms-auto me-3 hidden items-center gap-2 lg:flex"
      }
    >
      {isFetched && profile && isAdmin && (
        <Tooltip
          content={activeMenuType === "admin" ? "Admin" : "User"}
          position="bottom"
        >
          <Icon
            className={`h-5 w-5 ${
              activeMenuType === "admin" ? "text-primary-500" : "text-muted-400"
            } cursor-pointer transition-colors duration-300`}
            icon={"ph:user-switch"}
            onClick={toggleMenuType}
          />
        </Tooltip>
      )}
      {!isMobile && (
        <button
          className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-300 md:hidden"
          onClick={() => setIsMobileSearchActive(true)}
        >
          <Icon
            className="h-5 w-5 text-muted-400 transition-colors duration-300"
            icon="lucide:search"
          />
        </button>
      )}

      <div className="group relative text-start">
        <button
          className="mask mask-blob flex h-10 w-10 rotate-0 cursor-pointer items-center justify-center text-muted-400 transition-all duration-300 hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/20"
          onClick={() => setPanelOpen("locales", true)}
        >
          <LocaleLogo />
        </button>
      </div>

      {isFetched && profile && (
        <>
          <div className="group relative text-start">
            {announcements && announcements.length > 0 && (
              <span className="absolute top-0.5 right-0.5 z-2 block h-2 w-2 rounded-full bg-primary-500" />
            )}
            <button
              className="mask mask-blob flex h-10 w-10 rotate-0 cursor-pointer items-center justify-center text-muted-400 transition-all duration-300 hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/20"
              onClick={() => setPanelOpen("announcements", true)}
            >
              <Icon
                className="h-4 w-4 text-muted-500 transition-colors duration-300 group-hover:text-primary-500"
                icon="ph:megaphone"
              />
            </button>
          </div>

          <NotificationsDropdown />
        </>
      )}

      <ThemeSwitcher />

      <AccountDropdown />
    </div>
  );
};

export default AccountControls;
