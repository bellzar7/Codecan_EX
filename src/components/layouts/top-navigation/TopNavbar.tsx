import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useState } from "react";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import LogoText from "@/components/vector/LogoText";
import { useDashboardStore } from "@/stores/dashboard";
import { SearchResults } from "../shared/SearchResults";
import AccountControls from "./AccountControls";
import { Menu } from "./Menu";

const TopNavbar = ({ trading, transparent }) => {
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { t } = useTranslation();

  const {
    profile,
    isSidebarOpenedMobile,
    setIsSidebarOpenedMobile,
    isAdmin,
    activeMenuType,
    toggleMenuType,
    isFetched,
  } = useDashboardStore();
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Bicrypto";

  return (
    <nav
      aria-label="main navigation"
      className={`relative z-11 ${
        !transparent &&
        "border-muted-200 border-b bg-white dark:border-muted-900 dark:bg-muted-900"
      }`}
      role="navigation"
    >
      <div
        className={`${
          transparent &&
          "fixed border-muted-200 border-b bg-white dark:border-muted-900 dark:bg-muted-900"
        } flex min-h-[2.6rem] w-full flex-col items-stretch justify-center lg:flex-row`}
      >
        <div className="flex items-center justify-between px-3">
          <Link
            className="relative flex shrink-0 grow-0 items-center rounded-[.52rem] px-3 py-2 no-underline transition-all duration-300"
            href="/"
          >
            <LogoText
              className={
                "w-[100px] max-w-[100px] text-muted-900 dark:text-white"
              }
            />
          </Link>

          <div className="flex items-center justify-center">
            {isSidebarOpenedMobile && isAdmin && isFetched && profile && (
              <div className="flex items-center justify-center lg:hidden">
                <Tooltip
                  content={activeMenuType === "admin" ? "Admin" : "User"}
                  position="bottom"
                >
                  <Icon
                    className={`h-5 w-5 ${
                      activeMenuType === "admin"
                        ? "text-primary-500"
                        : "text-muted-400"
                    } cursor-pointer transition-colors duration-300`}
                    icon={"ph:user-switch"}
                    onClick={toggleMenuType}
                  />
                </Tooltip>
              </div>
            )}
            <div>
              <button
                aria-expanded="false"
                aria-label="menu"
                className="relative ms-auto block h-[2.6rem] w-[2.6rem] cursor-pointer appearance-none border-none bg-none text-muted-400 lg:hidden"
                onClick={() => {
                  setIsSidebarOpenedMobile(!isSidebarOpenedMobile);
                  setIsMobileSearchActive(false);
                }}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-[calc(50%-6px)] left-[calc(50%-8px)] block h-px w-4 origin-center bg-current transition-all duration-[86ms] ease-out ${
                    isSidebarOpenedMobile
                      ? "tranmuted-y-[5px] rotate-45"
                      : "scale-[1.1]"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute top-[calc(50%-1px)] left-[calc(50%-8px)] block h-px w-4 origin-center scale-[1.1] bg-current transition-all duration-[86ms] ease-out ${
                    isSidebarOpenedMobile ? "opacity-0" : ""
                  }`}
                />
                <span
                  aria-hidden="true"
                  className={`absolute top-[calc(50%+4px)] left-[calc(50%-8px)] block h-px w-4 origin-center scale-[1.1] bg-current transition-all duration-[86ms] ease-out ${
                    isSidebarOpenedMobile
                      ? "-tranmuted-y-[5px] -rotate-45"
                      : "scale-[1.1]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`w-full ${
            isMobileSearchActive ? "hidden" : "flex"
          } ${isSidebarOpenedMobile ? "flex-col items-start justify-start" : "items-center justify-center"}`}
        >
          <AccountControls
            isMobile={true}
            setIsMobileSearchActive={setIsMobileSearchActive}
          />
          <Menu />
        </div>
        {!trading && (
          <div
            className={`ms-0 w-full items-center justify-center lg:ms-10 lg:me-3 ${
              isMobileSearchActive ? "hidden lg:flex" : "hidden"
            }`}
          >
            <div className="relative w-full text-base">
              <input
                className="peer relative inline-flex h-10 w-full max-w-full items-center justify-start rounded-lg border border-muted-200 bg-white py-2 ps-10 pe-3 text-base text-muted-500 leading-tight outline-0 outline-current outline-hidden outline-offset-0 transition-all duration-300 placeholder:text-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-950 dark:text-muted-300 dark:focus-visible:shadow-muted-800/30 dark:placeholder:text-muted-700"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(event.currentTarget.value);
                }}
                placeholder={`${t("Search")} ${siteName} ${t("components")}`}
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
                className="absolute top-0 right-0 z-1 flex h-10 w-10 items-center justify-center transition-colors duration-300"
                onClick={() => {
                  setSearchTerm("");
                  setIsMobileSearchActive(false);
                }}
              >
                <Icon
                  className="h-4 w-4 text-muted-400 transition-colors duration-300"
                  icon="lucide:x"
                />
              </button>

              <SearchResults id="mobile" searchTerm={searchTerm} />
            </div>
          </div>
        )}

        <AccountControls
          isMobile={false}
          setIsMobileSearchActive={setIsMobileSearchActive}
        />
      </div>
    </nav>
  );
};

export default TopNavbar;
