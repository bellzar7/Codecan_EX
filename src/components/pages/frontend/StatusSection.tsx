import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";

const StatusSection = () => {
  const { t } = useTranslation();

  const stats = [
    {
      main: "92%",
      sub: t("+7% this month"),
      description: t(
        "of users have traded cryptocurrencies using our platform"
      ),
      icon: (
        <svg
          className="size-4 shrink-0"
          fill="currentColor"
          height="16"
          viewBox="0 0 16 16"
          width="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z" />
        </svg>
      ),
      highlight: true,
    },
    {
      main: "99.95%",
      description: t("successful transactions"),
    },
    {
      main: "2,000+",
      description: t("cryptocurrencies supported"),
    },
    {
      main: "85%",
      description: t("customer satisfaction rate"),
    },
  ];

  return (
    <section className="relative mx-auto w-full bg-dot-black/[0.1] bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14 dark:bg-black dark:bg-dot-white/[0.1]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_70%,black)] dark:bg-black" />

      <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-0">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="flex flex-col items-center lg:items-start lg:pe-6 xl:pe-12">
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-6xl text-blue-600 leading-10"
                initial={{ opacity: 0, y: -50 }}
                transition={{ duration: 1 }}
              >
                {stats[0].main}
                <span className="ms-1 inline-flex items-center gap-x-1 rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-800 text-xs leading-4 dark:bg-neutral-800 dark:text-neutral-300">
                  {stats[0].icon}
                  {stats[0].sub}
                </span>
              </motion.p>
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-gray-500 sm:mt-3 dark:text-neutral-500"
                initial={{ opacity: 0, y: -50 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {stats[0].description}
              </motion.p>
            </div>
          </div>

          <div className="relative lg:col-span-8 lg:before:absolute lg:before:top-0 lg:before:-left-12 lg:before:h-full lg:before:w-px lg:before:bg-gray-200 lg:dark:before:bg-neutral-700">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4 lg:grid-cols-3">
              {stats.slice(1).map((stat, index) => (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  key={index}
                  transition={{
                    duration: 0.8,
                    ease: [0.6, -0.05, 0.01, 0.99],
                    delay: index * 0.2,
                  }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <p className="font-semibold text-3xl text-blue-600">
                    {stat.main}
                  </p>
                  <p className="mt-1 text-gray-500 dark:text-neutral-500">
                    {stat.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatusSection;
