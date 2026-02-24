"use client";
import Head from "next/head";
import { useRouter } from "next/router";
import { memo, useEffect } from "react";
import {
  layoutNotPushedClasses,
  layoutPushedClasses,
} from "@/components/layouts/styles";
import { BinaryNav } from "@/components/pages/binary/nav";
import { Order } from "@/components/pages/binary/order";
import { Orders } from "@/components/pages/binary/orders";
import { Chart } from "@/components/pages/trade/chart";
import { useDashboardStore } from "@/stores/dashboard";
import useMarketStore from "@/stores/trade/market";

const binaryStatus = Boolean(true);
const siteTitle = process.env.NEXT_PUBLIC_SITE_NAME || "Default Site Title";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Default Site Description";

const BinaryTradePageBase = () => {
  const router = useRouter();
  const { setWithEco } = useMarketStore();
  const { settings } = useDashboardStore();

  useEffect(() => {
    if (binaryStatus) {
      setWithEco(false);
    } else {
      router.push("/404");
    }
  }, [router, setWithEco]);

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta content={siteDescription} name="description" />
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
      <div className="h-full w-full bg-white dark:bg-muted-900">
        <div className="sticky top-0 z-50 w-[100%_-_4px] bg-white dark:bg-muted-900">
          <BinaryNav />
        </div>

        <div
          className={`relative top-navigation-wrapper min-h-screen pt-16 pb-20 transition-all duration-300 lg:pt-4 dark:bg-muted-1000/[0.96] ${
            false
              ? "is-pushed" + layoutPushedClasses["top-navigation"]
              : layoutNotPushedClasses["top-navigation"]
          } !pb-0 !pe-0 !pt-0 bg-muted-50/[0.96]`}
        >
          {/* <LayoutSwitcher /> */}
          <div
            className={`"max-w-full flex h-full min-h-screen flex-col [&>div]:h-full [&>div]:min-h-screen`}
          >
            <div className="relative mt-1 grid grid-cols-1 gap-1 md:grid-cols-12">
              <div className="col-span-1 min-h-[55vh] border-thin bg-white md:col-span-10 md:min-h-[calc(100vh_-_120px)] lg:col-span-11 dark:bg-muted-900">
                <Chart />
              </div>
              <div className="col-span-1 h-full border-thin bg-white md:col-span-2 lg:col-span-1 dark:bg-muted-900">
                <Order />
              </div>
              <div className="col-span-1 min-h-[40vh] border-thin bg-white md:col-span-12 dark:bg-muted-900">
                <Orders />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const BinaryTradePage = memo(BinaryTradePageBase);
export default BinaryTradePage;
