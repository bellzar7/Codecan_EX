import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { MashImage } from "@/components/elements/MashImage";
import { useDashboardStore } from "@/stores/dashboard";
import { LAYOUTS, useLayoutStore } from "@/stores/layout";
import { Tooltip } from "../elements/base/tooltips/Tooltip";

const LayoutSwitcher = () => {
  const { t } = useTranslation();
  const { setActiveLayout, activeLayout } = useLayoutStore();
  const { settings } = useDashboardStore();
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLayout = (e: any) => {
    setActiveLayout(e.target.value);
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen((state) => !state);
  };

  if (!isMounted) {
    return null; // Prevent rendering on the server side
  }

  if (settings?.layoutSwitcher !== "true") return null;

  return (
    <div
      className={`group/layouts fixed right-5 bottom-5 ${open ? "z-50" : "z-40"}`}
    >
      <Tooltip content={t("Layout")}>
        <button
          aria-label="Layout switcher"
          className={`flex items-center rounded-lg border border-muted-200 bg-white p-3 text-start shadow-lg shadow-muted-300/30 transition-all duration-300 hover:border-primary-500 dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/30 dark:hover:border-primary-500 ${
            open
              ? "pointer-events-none translate-y-full opacity-0"
              : "pointer-events-auto translate-y-0 opacity-100"
          }`}
          name="layoutSwitcherToggle"
          onClick={handleOpen}
          type="button"
        >
          <Icon
            className="h-6 w-6 shrink-0 text-muted-400 transition-colors duration-300 group-hover/layouts:text-primary-500"
            icon="ph:layout-duotone"
          />
        </button>
      </Tooltip>
      <div
        className={`fixed right-5 bottom-5 z-1000 h-[350px] w-[480px] max-w-[90%] overflow-hidden rounded-lg border border-muted-200 bg-white shadow-lg shadow-muted-300/30 transition-all duration-300 hover:border-primary-500 sm:h-[200px] sm:max-w-[80%] dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/30 dark:hover:border-primary-500 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-muted-200 border-b px-6 dark:border-muted-800">
          <div>
            <h3 className="font-medium font-sans text-lg text-muted-800 dark:text-muted-100">
              {t("Layout")}
            </h3>
          </div>
          <button
            aria-label="Close layout switcher"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-100 transition-colors duration-300 hover:bg-muted-200 dark:bg-muted-800 dark:hover:bg-muted-700"
            name="layoutSwitcherToggle"
            onClick={handleOpen}
            type="button"
          >
            <Icon
              className="h-4 w-4 text-muted-500 dark:text-muted-200"
              icon="lucide:x"
            />
          </button>
        </div>
        <div className="slimscroll relative grid grid-cols-2 gap-6 overflow-y-auto p-6 sm:grid-cols-3">
          {LAYOUTS.map((layout, index) => (
            <div className="group/radio relative" key={index}>
              <input
                aria-label={layout}
                className="absolute top-0 left-0 z-10 h-full w-full cursor-pointer opacity-0"
                name="layout"
                onChange={handleLayout}
                type="radio"
                value={layout}
              />
              <div className="relative text-center">
                <div className="relative">
                  <MashImage
                    alt="Layout icon"
                    className={`block w-full transition-opacity duration-300 dark:hidden ${
                      activeLayout === layout
                        ? "opacity-100"
                        : "opacity-50 group-hover/radio:rounded-xs group-hover/radio:bg-muted-200 group-hover/radio:opacity-80 dark:group-hover/radio:bg-muted-800"
                    }`}
                    height={100}
                    src={`/img/illustrations/switcher/${layout}.svg`}
                    width={40}
                  />
                  <MashImage
                    alt="Layout icon"
                    className={`hidden w-full transition-opacity duration-300 dark:block ${
                      activeLayout === layout
                        ? "opacity-100"
                        : "opacity-50 group-hover/radio:opacity-80"
                    }`}
                    height={100}
                    src={`/img/illustrations/switcher/${layout}-dark.svg`}
                    width={40}
                  />
                  <div
                    className={`absolute top-0 right-0 z-10 h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-success-500 dark:border-muted-950 ${
                      activeLayout === layout ? "flex" : "hidden"
                    }`}
                  >
                    <Icon className="h-3 w-3 text-white" icon="lucide:check" />
                  </div>
                </div>
                <span
                  className={`block font-sans text-xs ${
                    activeLayout === layout
                      ? "text-primary-500"
                      : "text-muted-400"
                  }`}
                >
                  {layout
                    .split("-")
                    .map((word) => {
                      return word.charAt(0).toUpperCase() + word.slice(1);
                    })
                    .join(" ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayoutSwitcher;
