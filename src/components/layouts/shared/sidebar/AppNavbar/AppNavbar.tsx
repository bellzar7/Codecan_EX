import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useState } from "react";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";
import useScroll from "@/hooks/useScroll";
import { useDashboardStore } from "@/stores/dashboard";
import { cn } from "@/utils/cn";
import { AccountDropdown } from "../../AccountDropdown";
import { NotificationsDropdown } from "../../NotificationsDropdown";
import { SearchResults } from "../../SearchResults";
import type { AppNavbarProps } from "./AppNavbar.types";

const HEIGHT = 60;

const AppNavbarBase = ({
  fullwidth = false,
  horizontal = false,
  nopush = false,
  sideblock = false,
  collapse = false,
}: AppNavbarProps) => {
  const { t } = useTranslation();
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const scrolled = useScroll(HEIGHT);
  const {
    sidebarOpened,
    setPanelOpen,
    setIsSidebarOpenedMobile,
    setSidebarOpened,
    isSidebarOpenedMobile,
    profile,
    isFetched,
    announcements,
  } = useDashboardStore();

  function showSidebar() {
    setIsSidebarOpenedMobile(true);
    setSidebarOpened(true);
  }

  const containerClasses = cn(
    "fixed top-0 left-0 z-10 w-full transition-all duration-300",
    {
      "lg:ms-[64px] lg:w-[calc(100%-64px)]": collapse && !sideblock,
      "lg:ms-20 lg:w-[calc(100%-64px)]": !(collapse || sideblock),
      active: scrolled && sideblock,
      "z-10": scrolled && !sideblock,
      "lg:ms-[280px] lg:w-[calc(100%-280px)] xl:px-10":
        sideblock && sidebarOpened,
      "translate-x-[250px]": sidebarOpened && !nopush && !sideblock,
    }
  );

  const innerContainerClasses = cn("relative mx-auto w-full px-4 lg:px-10", {
    "max-w-full": fullwidth,
    "max-w-7xl": !fullwidth,
    "xl:px-10": horizontal,
    "xl:px-0": !horizontal,
  });

  const navbarClasses = cn(
    "relative z-1 flex h-[60px] w-full items-center justify-between rounded-2xl transition-all duration-300",
    {
      border: !sideblock || (sideblock && scrolled),
      "mt-4 border-muted-200 bg-white px-4 shadow-lg shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/30":
        scrolled,
      "border-transparent": !(scrolled || sideblock),
    }
  );

  const searchContainerClasses = cn(
    "flex-grow-2 items-center md:max-w-[680px]",
    {
      hidden: isMobileSearchActive,
      flex: !isMobileSearchActive,
    }
  );

  const sidebarButtonClasses = cn(
    "relative me-4 inline-block h-[1em] w-[1em] cursor-pointer text-[1.28rem]",
    {
      "is-open": !sideblock && sidebarOpened,
      "*:pointer-events-none before:absolute before:top-1/2 before:left-[0.125em] before:-mt-[0.225em] before:hidden before:h-[0.05em] before:w-[.35em] before:bg-muted-400 before:content-[''] after:absolute after:top-1/2 after:left-[0.125em] after:mt-[0.225em] after:hidden after:h-[0.05em] after:w-[.75em] after:bg-muted-400 after:content-['']": true,
    }
  );

  const searchInputClasses = cn(
    "peer relative inline-flex h-10 w-full max-w-full items-center justify-start rounded-lg border border-muted-200 bg-white py-2 ps-10 pe-3 font-sans text-base text-muted-600 leading-snug outline-0 outline-current outline-hidden outline-offset-0 transition-all duration-300 placeholder:text-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-950 dark:text-muted-300 dark:focus-visible:shadow-muted-800/30 dark:placeholder:text-muted-700",
    {
      "psaceholder:text-muted-300": !sideblock,
    }
  );

  const searchIconClasses =
    "absolute left-0 top-0 z-1 flex h-10 w-10 items-center justify-center text-muted-400 transition-colors duration-300 dark:text-muted-500 [&>svg]:peer-checked:text-primary-500 [&>svg]:peer-focus:stroke-primary-500 [&>svg]:peer-focus:text-primary-500";

  const mobileSearchContainerClasses = cn("w-full", {
    "flex md:hidden": isMobileSearchActive,
    hidden: !isMobileSearchActive,
  });

  return (
    <div className={containerClasses}>
      <div className={innerContainerClasses}>
        <div className={navbarClasses}>
          <div className={searchContainerClasses}>
            <div
              className={cn(
                sideblock
                  ? `h-10 items-center justify-center ps-2 ${
                      sidebarOpened ? "lg:hidden" : "flex"
                    }`
                  : "flex ps-2 lg:hidden"
              )}
            >
              <button
                aria-label="Toggle Sidebar"
                className={sidebarButtonClasses}
                name="sidebarToggle"
                onClick={
                  sideblock
                    ? showSidebar
                    : () => setIsSidebarOpenedMobile(!isSidebarOpenedMobile)
                }
                type="button"
              >
                <span className="absolute top-1/2 left-[0.125em] mt-[.025em] block h-[0.05em] w-[.75em] bg-muted-400 transition-all duration-[250ms] ease-in-out before:absolute before:top-0 before:left-0 before:block before:h-[.05em] before:w-[.75em] before:-translate-y-[.25em] before:bg-muted-400 before:content-[''] after:absolute after:top-0 after:left-0 after:block after:h-[.05em] after:w-[.75em] after:translate-y-[.25em] after:bg-muted-400 after:content-['']" />
              </button>
            </div>

            <div className="hidden w-full max-w-[380px] md:block">
              <div className="relative text-base">
                <input
                  className={searchInputClasses}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(event.currentTarget.value);
                  }}
                  placeholder={t("Search our platform...")}
                  type="text"
                  value={searchTerm}
                />

                <div className={searchIconClasses}>
                  <Icon
                    className="text-lg transition-colors duration-300"
                    icon="lucide:search"
                  />
                </div>

                <SearchResults id="mobile" searchTerm={searchTerm} />
              </div>
            </div>
          </div>
          <div
            className={cn("items-center gap-2", {
              hidden: isMobileSearchActive,
              flex: !isMobileSearchActive,
            })}
          >
            <button
              aria-label="Search"
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-300 md:hidden"
              name="mobileSearch"
              onClick={() => setIsMobileSearchActive(true)}
              type="button"
            >
              <Icon
                className="h-5 w-5 text-muted-400 transition-colors duration-300"
                icon="lucide:search"
              />
            </button>

            <div className="group relative text-start">
              <button
                aria-label="Locales"
                className="mask mask-blob flex h-10 w-10 rotate-0 cursor-pointer items-center justify-center text-muted-400 transition-all duration-300 hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/20"
                name="locales"
                onClick={() => setPanelOpen("locales", true)}
                type="button"
              >
                <Icon
                  className="h-4 w-4 text-muted-500 transition-colors duration-300 group-hover:text-primary-500"
                  icon="iconoir:language"
                />
              </button>
            </div>

            {isFetched && profile && (
              <>
                <div className="group relative text-start">
                  {announcements && announcements.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 z-2 block h-2 w-2 rounded-full bg-primary-500" />
                  )}
                  <button
                    aria-label="Announcements"
                    className="mask mask-blob flex h-10 w-10 rotate-0 cursor-pointer items-center justify-center text-muted-400 transition-all duration-300 hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/20"
                    name="announcements"
                    onClick={() => setPanelOpen("announcements", true)}
                    type="button"
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

          <div className={mobileSearchContainerClasses}>
            <div className="w-full">
              <div className="relative text-base">
                <input
                  aria-label="Search"
                  className="peer relative inline-flex h-10 w-full max-w-full items-center justify-start rounded-lg border border-muted-200 bg-white py-2 ps-10 pe-3 text-base text-muted-500 leading-tight outline-0 outline-current outline-hidden outline-offset-0 transition-all duration-300 placeholder:text-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-950 dark:text-muted-300 dark:focus-visible:shadow-muted-800/30 dark:placeholder:text-muted-700"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(event.currentTarget.value);
                  }}
                  placeholder={`${t("Search")}...`}
                  type="text"
                  value={searchTerm}
                />

                <div className="absolute top-0 left-0 z-1 flex h-10 w-10 items-center justify-center transition-colors duration-300">
                  <Icon
                    className="h-4 w-4 text-muted-400 transition-colors duration-300"
                    icon="lucide:search"
                  />
                </div>

                <button
                  aria-label="Close Search"
                  className="absolute top-0 right-0 z-1 flex h-10 w-10 items-center justify-center transition-colors duration-300"
                  name="closeMobileSearch"
                  onClick={() => {
                    setSearchTerm("");
                    setIsMobileSearchActive(false);
                  }}
                  type="button"
                >
                  <Icon
                    className="h-4 w-4 text-muted-400 transition-colors duration-300"
                    icon="lucide:x"
                  />
                </button>

                <SearchResults id="mobile" searchTerm={searchTerm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppNavbar = AppNavbarBase;
