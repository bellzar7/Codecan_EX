import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useDashboardStore } from "@/stores/dashboard";
import footerData from "../../../../data/footer.json";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Your Site Name";
const FooterSection: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useDashboardStore();

  const socialLinks = {
    facebook: settings?.facebookLink,
    twitter: settings?.twitterLink,
    instagram: settings?.instagramLink,
    linkedin: settings?.linkedinLink,
    telegram: settings?.telegramLink,
  };

  return (
    <footer className="mx-auto mt-auto w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-0">
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Link
              aria-label="Brand"
              className="flex-none font-semibold text-xl dark:text-white"
              href="#"
            >
              {siteName}
            </Link>
            <p className="mt-3 text-gray-600 text-xs sm:text-sm dark:text-neutral-400">
              {t(footerData.footerNote)}{" "}
              <Link
                className="inline-flex items-center gap-x-1.5 font-medium text-blue-600 decoration-2 hover:underline dark:text-blue-500"
                href={footerData.footerNoteLink}
              >
                {t(footerData.footerNoteText)}
              </Link>{" "}
              {t(
                "analyze market movements, and prepare for trades with the latest news and insights from fellow traders."
              )}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:col-span-2">
            {footerData.sections.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-900 text-xs uppercase dark:text-neutral-100">
                  {t(section.title)}
                </h4>
                <div className="mt-3 grid space-y-3 text-sm">
                  {section.links.map((link, idx) => (
                    <p key={idx}>
                      <Link
                        className="inline-flex gap-x-2 text-gray-600 hover:text-gray-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                        href={link.url}
                      >
                        {t(link.name)}
                      </Link>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 border-gray-200 border-t pt-5 dark:border-neutral-700">
          <div className="sm:flex sm:items-center sm:justify-between">
            <p className="mt-1 text-gray-600 text-xs sm:text-sm dark:text-neutral-400">
              {`${footerData.copyright}`}
            </p>
            <div className="mt-4 flex space-x-4 sm:mt-0">
              {socialLinks.facebook && (
                <Link
                  aria-label="Facebook"
                  className="text-gray-600 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-500"
                  href={socialLinks.facebook}
                >
                  <Icon className="h-5 w-5" icon="akar-icons:facebook-fill" />
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  aria-label="Twitter"
                  className="text-gray-600 hover:text-blue-400 dark:text-neutral-400 dark:hover:text-blue-300"
                  href={socialLinks.twitter}
                >
                  <Icon className="h-5 w-5" icon="akar-icons:twitter-fill" />
                </Link>
              )}
              {socialLinks.instagram && (
                <Link
                  aria-label="Instagram"
                  className="text-gray-600 hover:text-pink-600 dark:text-neutral-400 dark:hover:text-pink-500"
                  href={socialLinks.instagram}
                >
                  <Icon className="h-5 w-5" icon="akar-icons:instagram-fill" />
                </Link>
              )}
              {socialLinks.linkedin && (
                <Link
                  aria-label="LinkedIn"
                  className="text-gray-600 hover:text-blue-700 dark:text-neutral-400 dark:hover:text-blue-600"
                  href={socialLinks.linkedin}
                >
                  <Icon className="h-5 w-5" icon="akar-icons:linkedin-fill" />
                </Link>
              )}
              {socialLinks.telegram && (
                <Link
                  aria-label="Telegram"
                  className="text-gray-600 hover:text-blue-400 dark:text-neutral-400 dark:hover:text-blue-300"
                  href={socialLinks.telegram}
                >
                  <Icon className="h-5 w-5" icon="akar-icons:telegram-fill" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
