import Head from "next/head";
import { useRouter } from "next/router";
import React, { type FC, useMemo } from "react";
import FloatingLiveChat from "@/components/layouts/floating-live-chat/FloatingLiveChat";
import LayoutSwitcher from "@/components/layouts/LayoutSwitcher";
import SidebarPanelProvider from "@/components/layouts/sidebar-panel/SidebarPanelProvider";
import SidebarPanelFloatProvider from "@/components/layouts/sidebar-panel-float/SidebarPanelFloatProvider";
import {
  layoutNotPushedClasses,
  layoutPushedClasses,
  layoutWrapperClasses,
} from "@/components/layouts/styles";
import TopNavigationProvider from "@/components/layouts/top-navigation/TopNavigationProvider";
import { useDashboardStore } from "@/stores/dashboard";
import { useLayoutStore } from "@/stores/layout";

type LayoutColors = "default" | "muted";
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  color?: LayoutColors;
  fullwidth?: boolean;
  horizontal?: boolean;
  nopush?: boolean;
}

const siteTitle = process.env.NEXT_PUBLIC_SITE_NAME;
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION;

const Layout: FC<LayoutProps | any> = ({
  children,
  title = siteTitle,
  description = siteDescription,
  color = "default",
  fullwidth = false,
  horizontal = false,
  nopush = false,
}) => {
  const { sidebarOpened, settings } = useDashboardStore();
  const { activeLayout } = useLayoutStore();

  const router = useRouter();
  const floatingLiveChatEnabled =
    settings?.floatingLiveChat === "true" ?? false;
  const isExcludedPath = [
    "/admin",
    "/user/support",
    "/trade",
    "/user/binary",
    "/futures",
    "/user/forex/",
  ].some((excluded) => router.pathname.startsWith(excluded));

  const wrapperClass = useMemo(
    () => `${activeLayout.toLowerCase()}-wrapper`,
    [activeLayout]
  );

  const layoutProvider = useMemo(() => {
    switch (activeLayout) {
      case "sidebar-panel":
        return (
          <SidebarPanelProvider
            fullwidth={fullwidth}
            horizontal={horizontal}
            nopush={nopush}
          />
        );
      case "sidebar-panel-float":
        return (
          <SidebarPanelFloatProvider
            fullwidth={fullwidth}
            horizontal={horizontal}
            nopush={nopush}
          />
        );
      case "top-navigation":
        return (
          <TopNavigationProvider
            fullwidth={fullwidth}
            horizontal={horizontal}
          />
        );
      default:
        return null;
    }
  }, [activeLayout, fullwidth, horizontal, nopush]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta content={description} name="description" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />

        <meta content="en US" property="locale" />
        <meta content="index,follow,max-image-preview:large" name="robots" />
        <meta content="summary large image" name="twitter:card" />
        <meta content="630" property="og:height" />
        <meta content="1200" property="og:image:width" />
        <meta content="image/png" property="og:image:type" />
        <meta content="website" property="og:type" />

        <link href="/manifest.json" rel="manifest" />

        {[
          {
            size: "57x57",
            src: settings?.appleIcon57,
          },
          {
            size: "60x60",
            src: settings?.appleIcon60,
          },
          {
            size: "72x72",
            src: settings?.appleIcon72,
          },
          {
            size: "76x76",
            src: settings?.appleIcon76,
          },
          {
            size: "114x114",
            src: settings?.appleIcon114,
          },
          {
            size: "120x120",
            src: settings?.appleIcon120,
          },
          {
            size: "144x144",
            src: settings?.appleIcon144,
          },
          {
            size: "152x152",
            src: settings?.appleIcon152,
          },
          {
            size: "180x180",
            src: settings?.appleIcon180,
          },
          {
            size: "192x192",
            src: settings?.androidIcon192,
          },
          {
            size: "256x256",
            src: settings?.androidIcon256,
          },
          {
            size: "384x384",
            src: settings?.androidIcon384,
          },
          {
            size: "512x512",
            src: settings?.androidIcon512,
          },
          {
            size: "32x32",
            src: settings?.favicon32,
          },
          {
            size: "96x96",
            src: settings?.favicon96,
          },
          {
            size: "16x16",
            src: settings?.favicon16,
          },
        ]
          .filter((icon) => icon.src) // Only include icons that have a src
          .map((icon) => (
            <link
              href={icon.src}
              key={icon.size}
              rel="icon"
              sizes={icon.size}
              type="image/png"
            />
          ))}
        {settings?.msIcon144 && (
          <meta content={settings.msIcon144} name="msapplication-TileImage" />
        )}
        <meta content="#ffffff" name="msapplication-TileColor" />
        <meta content="#ffffff" name="theme-color" />
      </Head>
      <div
        className={`min-h-screen overflow-hidden transition-all duration-300 dark:bg-muted-950/[0.96] ${
          color === "muted" ? "bg-muted-50" : "bg-white"
        }`}
      >
        {layoutProvider}

        <div
          className={`${wrapperClass} relative min-h-screen transition-all duration-300 dark:bg-muted-950/[0.96] ${
            layoutWrapperClasses[activeLayout]
          } ${
            sidebarOpened && !nopush
              ? "is-pushed" + layoutPushedClasses[activeLayout]
              : layoutNotPushedClasses[activeLayout]
          } ${color === "muted" ? "bg-muted-50/[0.96]" : "bg-white/[0.96]"}
    ${horizontal ? "pe-0! pt-0! pb-0!" : ""}`}
        >
          <LayoutSwitcher />
          {floatingLiveChatEnabled && !isExcludedPath && <FloatingLiveChat />}
          <div
            className={`${fullwidth ? "max-w-full" : "mx-auto max-w-7xl"} ${
              horizontal
                ? "flex h-full min-h-screen flex-col [&>div]:h-full [&>div]:min-h-screen"
                : ""
            }`}
          >
            <div className={`${horizontal ? "" : "pt-4 pb-20"}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
