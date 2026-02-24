"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet";
import { frontendBannerImageColumns } from "@/utils/constants";
import { debounce } from "@/utils/throttle";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

const HeroSection = () => {
  const { t } = useTranslation();
  const { isDark, profile } = useDashboardStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { pnl, fetchPnl } = useWalletStore();
  const debounceFetchPnl = debounce(fetchPnl, 100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && profile.firstName) {
      setLoading(true);
      setIsLoggedIn(true);
      debounceFetchPnl();
      setLoading(false);
    }
  }, [profile]);

  return (
    <section className="relative flex w-full flex-col items-center justify-center bg-dot-black/[0.2] bg-white md:h-auto md:flex-row dark:bg-black dark:bg-dot-white/[0.2]">
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      {/* Hero */}
      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-0">
        {/* Grid */}
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center text-center md:text-left">
            <motion.h1
              animate={{ opacity: 1, y: 0 }}
              className="font-bold text-6xl text-muted-800 md:text-8xl lg:text-10xl dark:text-muted-200"
              initial={{ opacity: 0, y: -50 }}
              transition={{ duration: 1 }}
            >
              {t("Find the Next")}{" "}
              <span className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {t("Crypto Gem")}
              </span>{" "}
              {t("on")} {siteName}
            </motion.h1>
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-lg text-muted-600 md:text-xl dark:text-muted-400"
              initial={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {t(
                "We provide the latest information on the best cryptocurrencies to invest in."
              )}
            </motion.p>
            {isLoggedIn && pnl ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex flex-col items-center space-y-2 md:items-start"
                initial={{ opacity: 0, y: -20 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <h2 className="font-bold text-md text-muted-800 dark:text-muted-200">
                  {t("Your Estimated Balance")}
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-4xl text-primary-500">
                    {pnl?.today ? (
                      `$${pnl.today?.toFixed(2)}`
                    ) : loading ? (
                      <Skeleton
                        baseColor={isDark ? "#27272a" : "#f7fafc"}
                        height={12}
                        highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
                        width={60}
                      />
                    ) : (
                      "$0.00"
                    )}
                  </span>
                </div>
                <div className="flex gap-2 pb-5 text-green-500 text-md">
                  <div>{t("Today's PnL")}:</div>
                  {pnl?.today ? (
                    <>
                      {pnl.today > pnl.yesterday && pnl.yesterday !== 0 ? (
                        <span className="flex items-center gap-2 text-green-500">
                          <span>
                            +${(pnl.today - pnl.yesterday).toFixed(2)}
                          </span>
                          <span className="text-md">
                            (+
                            {pnl.yesterday !== 0
                              ? (
                                  ((pnl.today - pnl.yesterday) /
                                    pnl.yesterday) *
                                  100
                                ).toFixed(2)
                              : "0"}
                            %)
                          </span>
                        </span>
                      ) : pnl.today < pnl.yesterday ? (
                        <span className="flex items-center gap-2 text-red-500">
                          <span>
                            -${(pnl.yesterday - pnl.today).toFixed(2)}
                          </span>
                          <span className="text-md">
                            (-
                            {pnl.yesterday !== 0
                              ? (
                                  ((pnl.yesterday - pnl.today) /
                                    pnl.yesterday) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %)
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-gray-500">
                          <span>$0.00</span>
                          <span className="text-md">(0.00%)</span>
                        </span>
                      )}
                    </>
                  ) : loading ? (
                    <Skeleton
                      baseColor={isDark ? "#27272a" : "#f7fafc"}
                      height={12}
                      highlightColor={isDark ? "#3a3a3e" : "#edf2f7"}
                      width={60}
                    />
                  ) : (
                    "$0.00"
                  )}
                </div>
                <div className="flex space-x-4">
                  <Link href="/user/wallet/deposit">
                    <Button
                      color="warning"
                      shape={"rounded-xs"}
                      variant={"outlined"}
                    >
                      {t("Deposit")}
                    </Button>
                  </Link>
                  <Link href="/user/wallet/withdraw">
                    <Button
                      color="muted"
                      shape={"rounded-xs"}
                      variant={"outlined"}
                    >
                      {t("Withdraw")}
                    </Button>
                  </Link>
                  <Link href="/market">
                    <Button
                      color="muted"
                      shape={"rounded-xs"}
                      variant={"outlined"}
                    >
                      {t("Trade")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex items-center justify-center space-x-4 md:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <div className="max-w-xs">
                    <Input
                      color={"contrast"}
                      placeholder={t("Enter your email")}
                      size={"lg"}
                      type="text"
                    />
                  </div>
                  <Link className="relative p-[3px]" href="/register">
                    <div className="absolute inset-0 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500" />
                    <div className="group relative rounded-[6px] bg-black px-8 py-[7px] text-md text-white transition duration-200 hover:bg-transparent">
                      {t("Sign Up Now")}
                    </div>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
          {/* End Col */}
          <div
            className="h-[20rem] w-full overflow-hidden rounded-lg sm:h-[30rem] lg:h-[35rem]"
            style={{ perspective: "700px" }}
          >
            <div
              className="grid h-[55rem] w-[60rem] origin-[50%_0%] grid-cols-3 gap-12 overflow-hidden sm:w-[80rem] md:h-[90rem] lg:h-[75rem] lg:w-[50rem]"
              style={{
                transform:
                  "translate3d(7%, -2%, 0px) scale3d(0.9, 0.8, 1) rotateX(15deg) rotateY(-9deg) rotateZ(32deg)",
              }}
            >
              {Object.entries(frontendBannerImageColumns).map(
                ([key, images], colIndex) => (
                  <div
                    className={`grid h-[440px] w-full gap-9 ${
                      colIndex === 0
                        ? "animation-sliding-img-up-1"
                        : colIndex === 1
                          ? "animation-sliding-img-down-1"
                          : "animation-sliding-img-up-2"
                    }`}
                    key={colIndex}
                  >
                    {images.map((image, index) => (
                      <React.Fragment key={index}>
                        <img
                          alt={`Image ${index + 1}`}
                          className="w-full rounded-lg border border-muted-200 object-cover shadow-lg transition-all duration-300 hover:border hover:border-primary-500 dark:hidden dark:border-muted-800 dark:shadow-neutral-900/80 dark:hover:border dark:hover:border-primary-400"
                          src={image.light}
                        />
                        <img
                          alt={`Image ${index + 1}`}
                          className="hidden w-full rounded-lg border border-muted-200 object-cover shadow-lg transition-all duration-300 hover:border hover:border-primary-500 dark:block dark:border-muted-800 dark:shadow-neutral-900/80 dark:hover:border dark:hover:border-primary-400"
                          src={image.dark}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
          {/* End Col */}
        </div>
        {/* End Grid */}
      </div>
      {/* End Hero */}
    </section>
  );
};

export default HeroSection;
