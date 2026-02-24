import { useTranslation } from "next-i18next";
import Layout from "@/layouts/Default";

interface ErrorProps {
  title: string;
  description?: string;
  link?: string;
  linkTitle?: string;
}

export const NotFound = ({
  title,
  description,
  link,
  linkTitle,
}: ErrorProps) => {
  const { t } = useTranslation();

  return (
    <Layout color="muted" title={t("Not Found")}>
      <div className="py-16 text-center">
        <h2 className="font-bold text-2xl text-muted-800 dark:text-muted-200">
          {t(`${title} Not Found`)}
        </h2>
        {description && (
          <p className="mt-4 text-muted-600 dark:text-muted-400">
            {t(description)}
          </p>
        )}
        <a
          className="mt-6 inline-block text-primary-500 hover:underline"
          href={link || "/"}
        >
          {t(linkTitle || "Go Back")}
        </a>
      </div>
    </Layout>
  );
};

export const ErrorPage = ({
  title,
  description,
  link,
  linkTitle,
}: ErrorProps) => {
  const { t } = useTranslation();

  return (
    <Layout color="muted" title={t("Error")}>
      <div className="py-16 text-center">
        <h2 className="font-bold text-2xl text-danger-500">
          {t(title || "Error")}
        </h2>
        {description && (
          <p className="mt-4 text-muted-600 dark:text-muted-400">
            {t(description)}
          </p>
        )}
        <a
          className="mt-6 inline-block text-primary-500 hover:underline"
          href={link || "/"}
        >
          {t(linkTitle || "Go Back")}
        </a>
      </div>
    </Layout>
  );
};
