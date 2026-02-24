import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import { locales } from "./Locales";

// Define the type for a locale item
interface Locale {
  code: string;
  name: string;
  flag: string;
}

const LocaleLogoBase = () => {
  const { i18n } = useTranslation();
  const [currentLocale, setCurrentLocale] = useState<Locale | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set mounted state after hydration to avoid SSR mismatch
    setIsMounted(true);
    const locale =
      locales.find((locale) => locale.code === i18n.language) || null;

    // Provide a fallback name if it's undefined
    if (locale) {
      setCurrentLocale({
        ...locale,
        name: locale.name || "Unknown", // Fallback to "Unknown" if name is undefined
      });
    } else {
      setCurrentLocale(null);
    }
  }, [i18n.language]);

  if (!isMounted) {
    return null; // Avoid rendering until after the component has mounted
  }

  return currentLocale ? (
    <img
      alt={currentLocale.name}
      height={"auto"}
      src={`/img/flag/${currentLocale.flag}.svg`}
      width={16}
    />
  ) : (
    <Icon
      className="h-4 w-4 text-muted-500 transition-colors duration-300 group-hover:text-primary-500"
      icon="iconoir:language"
    />
  );
};

export const LocaleLogo = memo(LocaleLogoBase);
