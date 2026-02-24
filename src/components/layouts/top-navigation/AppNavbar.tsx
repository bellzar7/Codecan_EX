import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import React, { type FC, useState } from "react";
import MediaQuery from "react-responsive";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";
import useScroll from "@/hooks/useScroll";
import { useDashboardStore } from "@/stores/dashboard";
import { breakpoints } from "@/utils/breakpoints";
import { AccountDropdown } from "../shared/AccountDropdown";
import { NotificationsDropdown } from "../shared/NotificationsDropdown";
import { SearchResults } from "../shared/SearchResults";

interface AppNavbarProps {
  fullwidth?: boolean;
  horizontal?: boolean;
}

const HEIGHT = 36;

const AppNavbar: FC<AppNavbarProps> = ({
  fullwidth = false,
  horizontal = false,
}) => {
  const { t } = useTranslation();
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const scrolled = useScroll(HEIGHT);
  const { setPanelOpen, profile, isFetched } = useDashboardStore();

  return (
    <div
      className={
        "fixed top-[56px] left-0 z-10 w-full transition-all duration-300"
      }
    >
      <div
        className={`relative mx-auto w-full px-4 lg:px-10 ${fullwidth ? "max-w-full" : "mx-auto max-w-7xl"}
          ${horizontal ? "xl:px-10" : "xl:px-0"}
        `}
      >
        <div
          className={`relative z-1 flex h-[40px] w-full items-center justify-end rounded-2xl border transition-all duration-300 ${
            scrolled
              ? "-mt-12 border-muted-200 bg-white px-2 shadow-lg shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-900 dark:shadow-muted-800/30"
              : "border-transparent px-2 dark:border-transparent"
          }`}
        >
          <MediaQuery minWidth={Number.parseInt(breakpoints.md)}>
            <div
              className={`flex-grow-2 items-center md:max-w-[680px] ${
                isMobileSearchActive ? "hidden" : "flex"
              }`}
            >
              <div className="hidden w-full max-w-[380px]">
                <div className="relative text-base">
                  <input
                    className="peer relative inline-flex h-10 w-full max-w-full items-center justify-start rounded-lg border border-muted-200 bg-white py-2 ps-10 pe-3 font-sans text-base text-muted-600 leading-snug outline-0 outline-current outline-hidden outline-offset-0 transition-all duration-300 placeholder:text-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-300 dark:focus-visible:shadow-muted-800/30 dark:placeholder:text-muted-700"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(event.currentTarget.value);
                    }}
                    placeholder={t("Search our platform...")}
                    type="text"
                    value={searchTerm}
                  />

                  <div className="absolute top-0 left-0 z-1 flex h-10 w-10 items-center justify-center text-muted-400 transition-colors duration-300 dark:text-muted-500 [&>svg]:peer-checked:text-primary-500 [&>svg]:peer-focus:stroke-primary-500 [&>svg]:peer-focus:text-primary-500">
                    <Icon
                      className="text-lg transition-colors duration-300"
                      icon="lucide:search"
                    />
                  </div>

                  <SearchResults id="mobile" searchTerm={searchTerm} />
                </div>
              </div>
            </div>
          </MediaQuery>
          <div
            className={`items-center gap-2 ${
              isMobileSearchActive ? "hidden" : "flex"
            }`}
          >
            <MediaQuery maxWidth={Number.parseInt(breakpoints.md)}>
              <button
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-all duration-300"
                onClick={() => setIsMobileSearchActive(true)}
              >
                <Icon
                  className="h-5 w-5 text-muted-400 transition-colors duration-300"
                  icon="lucide:search"
                />
              </button>
            </MediaQuery>

            <div className="group relative text-start">
              <button
                className="mask mask-blob flex h-10 w-10 rotate-0 cursor-pointer items-center justify-center text-muted-400 transition-all duration-300 hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/20"
                onClick={() => setPanelOpen("locales", true)}
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
                  <span className="absolute top-0.5 right-0.5 z-2 block h-2 w-2 rounded-full bg-primary-500" />
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

          <MediaQuery maxWidth={Number.parseInt(breakpoints.md)}>
            <div
              className={`w-full ${isMobileSearchActive ? "flex" : "hidden"}`}
            >
              <div className="w-full">
                <div className="relative text-base">
                  <input
                    className="peer relative inline-flex h-10 w-full max-w-full items-center justify-start rounded-lg border border-muted-200 bg-white py-2 ps-10 pe-3 text-base text-muted-500 leading-tight outline-0 outline-current outline-hidden outline-offset-0 transition-all duration-300 placeholder:text-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-300 dark:focus-visible:shadow-muted-800/30 dark:placeholder:text-muted-700"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(event.currentTarget.value);
                    }}
                    placeholder={t("Search...")}
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
            </div>
          </MediaQuery>
        </div>
      </div>
    </div>
  );
};

export default AppNavbar;
