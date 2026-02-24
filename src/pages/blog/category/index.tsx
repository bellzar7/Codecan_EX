import Link from "next/link";
import { useTranslation } from "next-i18next";
import Card from "@/components/elements/base/card/Card";
import { PageHeader } from "@/components/elements/base/page-header";
import { MashImage } from "@/components/elements/MashImage";
import { ErrorPage } from "@/components/ui/Errors";
import Layout from "@/layouts/Default";
import { $serverFetch } from "@/utils/api";

interface Props {
  categories: Category[];
  error?: string;
}

const Blog: React.FC<Props> = ({ categories, error }) => {
  const { t } = useTranslation();

  if (error) {
    return (
      <ErrorPage
        description={t(error)}
        link="/blog"
        linkTitle={t("Back to Blog")}
        title={t("Error")}
      />
    );
  }

  return (
    <Layout color="muted" title={t("Blog")}>
      <div className="max-w-5xl space-y-5 lg:mx-auto">
        <PageHeader title={t("Blog Categories")} />
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((category, index) => (
            <Link href={`/blog/category/${category.slug}`} key={index} passHref>
              <Card
                className="group transform p-3 transition duration-300 ease-in-out hover:-translate-y-1"
                shape="curved"
              >
                <div className="relative h-[120px] w-full">
                  <MashImage
                    alt={category.name}
                    className="rounded-lg object-cover"
                    fill
                    src={category.image || "/img/placeholder.svg"}
                  />
                </div>
                <div>
                  <div className="mt-3">
                    <h3 className="line-clamp-2 text-gray-800 dark:text-gray-100">
                      {category.name}
                    </h3>
                    <div>
                      <p className="font-sans text-muted-400 text-xs">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const { data, error } = await $serverFetch(context, {
      url: "/api/content/category",
    });

    if (error || !data) {
      return {
        props: {
          error: error || "Unable to fetch categories.",
        },
      };
    }

    return {
      props: {
        categories: data,
      },
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default Blog;
