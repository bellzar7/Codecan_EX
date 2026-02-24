// require('dotenv').config();
//
// const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';
// const locales = process.env.NEXT_PUBLIC_LANGUAGES ? process.env.NEXT_PUBLIC_LANGUAGES.split(',').map((lang) => lang.trim()) : ['en'];
//
// module.exports = {
//   i18n: {
//     defaultLocale,
//     locales,
//   },
//   debug: true,
//   localePath: typeof window === 'undefined'
//     ? require('path').resolve('./public/locales')
//     : '/public/locales',
// };

// next-i18next.config.js
require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const defaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en";

const envLocales = process.env.NEXT_PUBLIC_LANGUAGES
  ? process.env.NEXT_PUBLIC_LANGUAGES.split(",").map((lang) => lang.trim())
  : ["en"];

// у деві ріжемо до мінімуму, щоб dev-компіляція була швидкою
const locales = dev ? ["en"] : envLocales;

module.exports = {
  i18n: {
    defaultLocale,
    locales,
  },
  debug: true,
  localePath:
    typeof window === "undefined"
      ? require("node:path").resolve("./public/locales")
      : "/public/locales",
};
