import Link from "next/link";
import { useTranslation } from "next-i18next";
import { PageHeader } from "@/components/elements/base/page-header";
import Tag from "@/components/elements/base/tag/Tag";
import { ErrorPage } from "@/components/ui/Errors";
import Layout from "@/layouts/Default";
import { $serverFetch } from "@/utils/api";

interface Props {
  tags?: Tag[];
  error?: string;
}

const BlogTags: React.FC<Props> = ({ tags = [], error }) => {
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
        <PageHeader title={t("Blog Tags")} />

        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((tag, index) => (
            <Link href={`/blog/tag/${tag.slug}`} key={index} passHref>
              <Tag
                className="group transform p-3 transition duration-300 ease-in-out hover:-translate-y-1"
                shape="rounded-sm"
              >
                {tag.name}
              </Tag>
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
      url: "/api/content/tag",
    });

    if (error || !data) {
      return {
        props: {
          error: error || "Unable to fetch tags.",
        },
      };
    }

    return {
      props: {
        tags: data,
      },
    };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default BlogTags;
