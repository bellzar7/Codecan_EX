import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { appWithTranslation } from "next-i18next";
import { Toaster, toast } from "sonner";
import { AppWebSocketProvider } from "@/context/WebSocketContext";
import { restoreLayoutFromStorage } from "@/stores/layout";
import "../i18n";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import { useDashboardStore } from "@/stores/dashboard";

const GoogleAnalytics = dynamic(
  () => import("@/components/elements/addons/GoogleAnalytics"),
  { ssr: false }
);
const FacebookPixel = dynamic(
  () => import("@/components/elements/addons/FacebookPixel"),
  { ssr: false }
);

const GoogleTranslate = dynamic(
  () => import("@/components/elements/addons/GoogleTranslate"),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  const { fetchProfile, settings, profile } = useDashboardStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const hasAccess = document.cookie.includes("accessToken=");
    const hasSession = document.cookie.includes("sessionId=");
    if (!hasAccess && hasSession) {
      fetch("/api/auth/session", { credentials: "include" }).catch(() => {});
    }
  }, []);
  useEffect(() => {
    if (router.isReady && !settings) {
      fetchProfile();
    }
  }, [router.isReady, settings, fetchProfile]);

  useEffect(() => {
    restoreLayoutFromStorage();
    setMounted(true);
  }, []);

  useEffect(() => {
    restoreLayoutFromStorage();
  }, []);

  useEffect(() => {
    if (router.isReady && !settings) {
      fetchProfile();
    }
  }, [router.isReady, settings, fetchProfile]);

  useEffect(() => {
    console.log("some change url", router.asPath);
    if (profile && profile?.customRestrictionPairFields?.length > 0) {
      for (const restriction of profile?.customRestrictionPairFields) {
        if (
          router.asPath
            .toLowerCase()
            .includes(restriction?.section?.toLowerCase()) &&
          !restriction?.isAllowed
        ) {
          toast.error(restriction?.reason);
          router.push("/uk");
        }
      }
    }
  }, [router, profile]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log("url", url);
      if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_STATUS === "true") {
        const { gtag } = window as any;
        gtag("config", process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
          page_path: url,
        });
      }
      if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_STATUS === "true") {
        const { fbq } = window as any;
        fbq("track", "PageView");
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (!mounted) {
    // Ensures server and client render the same content
    return null;
  }

  if (!settings) {
    // This will now run only after the component has mounted
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">
          <Icon
            className="mr-2 h-12 w-12 animate-spin"
            icon="mingcute:loading-3-line"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-muted-950/[0.96]">
      <Toaster
        closeButton
        position="top-center"
        richColors
        theme="system"
        toastOptions={{
          duration: 3000,
        }}
      />
      <GoogleAnalytics />
      <FacebookPixel />
      {settings?.googleTranslateStatus === "true" && <GoogleTranslate />}
      <Component {...pageProps} />
    </div>
  );
}

const AppWithProviders = appWithTranslation(MyApp);

function WrappedApp(props: AppProps) {
  return (
    <AppWebSocketProvider>
      <AppWithProviders {...props} />
    </AppWebSocketProvider>
  );
}

export default WrappedApp;
