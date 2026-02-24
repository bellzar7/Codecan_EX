import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "@/stores/dashboard";

const BannerSection: React.FC = () => {
  const headingRef = useRef(null);
  const linkRef = useRef(null);
  const [isHeadingVisible, setHeadingVisible] = useState(false);
  const [isLinkVisible, setLinkVisible] = useState(false);
  const isHeadingInView = useInView(headingRef);
  const isLinkInView = useInView(linkRef);
  const { t } = useTranslation();
  const { profile } = useDashboardStore(); // Get user profile data

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setHeadingVisible(isHeadingInView);
  }, [isHeadingInView]);

  useEffect(() => {
    setLinkVisible(isLinkInView);
  }, [isLinkInView]);

  useEffect(() => {
    if (profile && profile.firstName) {
      setIsLoggedIn(true); // Check if the user is logged in
    }
  }, [profile]);

  return (
    <section className="relative mx-auto w-full bg-dot-black/[0.2] bg-white px-4 pt-16 pb-10 sm:px-6 md:h-auto md:pb-20 lg:px-8 dark:bg-black dark:bg-dot-white/[0.2]">
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-0">
        <div className="relative rounded-xl bg-muted-100 p-5 sm:py-16 dark:bg-neutral-950">
          <div className="absolute inset-0 dark:hidden">
            <Image
              alt="Banner Background"
              fill
              src="/img/home/banner-bg.svg"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="absolute inset-0 hidden dark:block">
            <Image
              alt="Banner Background"
              fill
              src="/img/home/banner-bg-dark.svg"
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="relative z-10 mx-auto max-w-xl text-center">
            <div className="mb-5">
              <motion.h2
                animate={
                  isHeadingVisible
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text font-bold text-3xl text-transparent md:text-8xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                ref={headingRef}
                transition={{ duration: 1 }}
              >
                {t("Start Your Crypto Journey Now!")}
              </motion.h2>
              <motion.div
                animate={
                  isLinkVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                className="mt-8 flex items-center justify-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                ref={linkRef}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <Link
                  className="relative p-[3px]"
                  href={isLoggedIn ? "/user" : "/login"}
                >
                  <div className="absolute inset-0 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500" />
                  <div className="group relative rounded-[6px] bg-black px-8 py-[7px] text-white text-xl transition duration-200 hover:bg-transparent">
                    {t("Get Started")}
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
