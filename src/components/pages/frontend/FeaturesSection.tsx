import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useState } from "react";

const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const { t } = useTranslation();

  const features = [
    {
      title: t("Advanced Charting Tools"),
      description: t(
        "Utilize sophisticated charting tools to analyze market trends and make informed trading decisions."
      ),
      icon: (
        <svg
          className="mt-2 size-6 shrink-0 hs-tab-active:text-blue-600 text-muted-800 md:size-7 dark:hs-tab-active:text-blue-500 dark:text-muted-200"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
          <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
          <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
          <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
          <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
        </svg>
      ),
      imageUrl: "/img/home/chart.webp",
    },
    {
      title: t("Real-Time Market Data"),
      description: t(
        "Stay ahead with real-time updates on market prices, trends, and news."
      ),
      icon: (
        <svg
          className="mt-2 size-6 shrink-0 hs-tab-active:text-blue-600 text-muted-800 md:size-7 dark:hs-tab-active:text-blue-500 dark:text-muted-200"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      ),
      imageUrl: "/img/home/markets.webp",
    },
    {
      title: t("Powerful Trading Algorithms"),
      description: t(
        "Deploy advanced trading algorithms to maximize your trading efficiency and profitability."
      ),
      icon: (
        <svg
          className="mt-2 size-6 shrink-0 hs-tab-active:text-blue-600 text-muted-800 md:size-7 dark:hs-tab-active:text-blue-500 dark:text-muted-200"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </svg>
      ),
      imageUrl: "/img/home/order.webp",
    },
  ];

  const onClickFeature = (index: number, feature: any) => {
    console.log("index", index);
    console.log("feature", feature);
    setActiveFeature(index);
  };

  return (
    <section className="relative mx-auto w-full bg-dot-black/[0.2] bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 dark:bg-black dark:bg-dot-white/[0.2]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
      <div className="relative mx-auto max-w-7xl p-6 px-4 sm:px-6 md:p-16 lg:px-8">
        <div className="relative z-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="mb-10 lg:order-2 lg:col-span-6 lg:col-start-8 lg:mb-0">
            <h2 className="font-bold text-2xl text-muted-800 sm:text-3xl dark:text-muted-200">
              {t("Make the most of your trading experience")}
            </h2>

            <nav
              aria-label="Tabs"
              className="mt-5 grid gap-4 md:mt-10"
              role="tablist"
            >
              {features.map((feature, index) => (
                <motion.button
                  animate={{ opacity: 1, y: 0 }}
                  aria-controls={`tabs-with-card-${index}`}
                  className={`${
                    activeFeature === index
                      ? "border-transparent bg-muted-50 shadow-md dark:bg-muted-800"
                      : "hover:bg-muted-200 dark:hover:bg-muted-800"
                  } rounded-xl p-4 text-start md:p-5`}
                  data-hs-tab={`#tabs-with-card-${index}`}
                  id={`tabs-with-card-item-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  key={index}
                  onClick={() => onClickFeature(index, feature)}
                  role="tab"
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  type="button"
                >
                  <span className="flex">
                    {feature.icon}
                    <span className="ms-6 grow">
                      <span className="block font-semibold hs-tab-active:text-blue-600 text-lg text-muted-800 dark:hs-tab-active:text-blue-500 dark:text-muted-200">
                        {feature.title}
                      </span>
                      <span className="mt-1 block text-muted-800 dark:hs-tab-active:text-muted-200 dark:text-muted-200">
                        {feature.description}
                      </span>
                    </span>
                  </span>
                </motion.button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div>
                {features.map((feature, index) => (
                  <motion.div
                    animate={{ opacity: activeFeature === index ? 1 : 0 }}
                    aria-labelledby={`tabs-with-card-item-${index}`}
                    className={`rounded-xl shadow-muted-200 shadow-xl dark:shadow-muted-900/20 ${
                      activeFeature === index ? "" : "hidden"
                    }`}
                    id={`tabs-with-card-${index}`}
                    initial={{ opacity: 0 }}
                    key={index}
                    role="tabpanel"
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      alt={feature.title}
                      className="h-auto w-full rounded-xl"
                      src={feature.imageUrl}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="absolute top-0 right-0 hidden translate-x-20 md:block lg:translate-x-20">
                <svg
                  className="h-auto w-16 text-orange-500"
                  fill="none"
                  height="135"
                  viewBox="0 0 121 135"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 16.4754C11.7688 27.4499 21.2452 57.3224 5 89.0164"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  <path
                    d="M33.6761 112.104C44.6984 98.1239 74.2618 57.6776 83.4821 5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                  <path
                    d="M50.5525 130C68.2064 127.495 110.731 117.541 116 78.0874"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="10"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 grid size-full grid-cols-12">
          <div className="col-span-full h-5/6 w-full rounded-xl bg-muted-100 sm:h-3/4 lg:col-span-7 lg:col-start-6 lg:h-full dark:bg-muted-900" />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
