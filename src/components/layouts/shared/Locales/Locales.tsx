import { motion, useInView } from "framer-motion";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useRef, useState } from "react";
import Input from "@/components/elements/form/input/Input";
import { cn } from "@/utils/cn";
import { localeFlagMap } from "@/utils/constants";
import nextI18NextConfig from "../../../../../next-i18next.config.js";

export const locales = nextI18NextConfig.i18n.locales.map((locale) => {
  const [code] = locale.split("-");
  return {
    code: locale,
    name: new Intl.DisplayNames([locale], { type: "language" }).of(code),
    flag: localeFlagMap[code],
  };
});

const LocalesBase = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && i18n.language) {
      const detectedLanguage = i18n.language;
      const savedLocale = localStorage.getItem("NEXT_LOCALE");
      if (savedLocale && savedLocale !== detectedLanguage) {
        i18n.changeLanguage(savedLocale);
      } else if (!detectedLanguage) {
        i18n.changeLanguage("en");
      }
    }
  }, [i18n]);

  const onToggleLanguageClick = (newLocale: string) => {
    localStorage.setItem("NEXT_LOCALE", newLocale);
    i18n.changeLanguage(newLocale).then(() => {
      const { pathname, asPath, query } = router;
      router.push({ pathname, query }, asPath, { locale: newLocale });
    });
  };

  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const filteredLocales = locales.filter((locale) =>
    locale.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="slimscroll relative flex w-full flex-col overflow-x-hidden">
      <Input
        aria-label={t("Search Languages")}
        className="mb-4 rounded-md border border-muted-300 p-2"
        label={t("Search")}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("Search Languages")}
        value={search}
      />
      <div
        className="slimscroll flex max-h-[calc(100vh_-_160px)] flex-col gap-2 overflow-y-auto pe-1"
        ref={ref}
      >
        {isInView &&
          filteredLocales.map((locale) => (
            <motion.div
              className={cn(
                "flex cursor-pointer items-center rounded-md px-4 py-2 transition-all duration-300 ease-in-out",
                locale.code === i18n.language
                  ? "bg-primary-500 text-white dark:bg-primary-400 dark:text-white"
                  : "bg-muted-100 text-muted-700 hover:bg-muted-200 dark:bg-muted-800 dark:text-muted-200 dark:hover:bg-muted-700"
              )}
              key={locale.code}
              onClick={() => onToggleLanguageClick(locale.code)}
            >
              <img
                alt={locale.name as any}
                className="mr-3"
                height={"auto"}
                src={`/img/flag/${locale.flag}.svg`}
                width={24}
              />
              {locale.name} ({locale.code})
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export const Locales = memo(LocalesBase);
