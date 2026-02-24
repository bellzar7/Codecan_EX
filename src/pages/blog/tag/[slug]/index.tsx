import { AnimatePresence, motion } from "framer-motion";
import { capitalize } from "lodash";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { PageHeader } from "@/components/elements/base/page-header";
import Pagination from "@/components/elements/base/pagination/Pagination";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import { PostsGrid } from "@/components/pages/blog/PostsGrid";
import { ErrorPage } from "@/components/ui/Errors";
import Layout from "@/layouts/Default";
import $fetch, { $serverFetch } from "@/utils/api";

interface Props {
  initialData?: {
    items: BlogPost[];
    pagination: {
      totalItems: number;
      currentPage: number;
      perPage: number;
      totalPages: number;
    };
  };
  slug?: string;
  error?: string;
}

const Blog: React.FC<Props> = ({ initialData, slug, error }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<any>({});
  const [sort] = useState({ field: "createdAt", rule: "desc" });
  const [items, setItems] = useState(initialData?.items || []);
  const [pagination, setPagination] = useState<{
    totalItems: number;
    currentPage: number;
    perPage: number;
    totalPages: number;
  }>(
    initialData?.pagination || {
      totalItems: 0,
      currentPage: 1,
      perPage: 10,
      totalPages: 0,
    }
  );

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

  const handleFilterChange = async (value: string) => {
    const activeFilter: Record<string, any> = {
      "tag.slug": {
        value: slug,
        operator: "like",
      },
    };

    if (value.trim()) {
      activeFilter.title = {
        value: value.trim().toLowerCase(),
        operator: "startsWith",
      };
    }

    const params = new URLSearchParams({
      page: String(pagination.currentPage),
      perPage: String(pagination.perPage),
      sortField: sort.field,
      sortOrder: sort.rule,
      filter: JSON.stringify(activeFilter),
    });

    const response = await $fetch({
      url: `/api/content/post?${params.toString()}`,
    });

    if (response.data) {
      const postData = response.data as any;
      setItems(postData.items);
      setPagination(postData.pagination);
    }
  };

  return (
    <Layout color="muted" title={t("Blog")}>
      <div className="max-w-5xl space-y-5 lg:mx-auto">
        <PageHeader title={`${capitalize(slug as string)} Posts`}>
          <Input
            className="w-full rounded-md bg-muted-200 px-3 py-1.5 text-muted-700 text-sm focus:outline-hidden focus:ring-1 focus:ring-primary-500 dark:bg-muted-800 dark:text-muted-300"
            icon="ic:twotone-search"
            onChange={(e) => {
              setFilter({ value: e.target.value });
              handleFilterChange(e.target.value);
            }}
            placeholder={t("Search posts")}
            type="text"
          />
        </PageHeader>

        <div className="relative">
          <hr className="border-muted-200 dark:border-muted-800" />
          <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
            <span className="bg-muted-50 px-2 dark:bg-muted-900">
              {filter.value
                ? `Matching "${filter.value}"`
                : `Latest Posts in ${capitalize(slug as string)}`}
            </span>
          </span>
        </div>

        {items.length > 0 ? (
          <PostsGrid posts={items} />
        ) : (
          <div className="flex h-96 items-center justify-center">
            <h2 className="text-muted-500 dark:text-muted-400">
              {t("No posts found")}
            </h2>
          </div>
        )}

        <AnimatePresence>
          {pagination.totalPages > 1 && (
            <motion.div
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-10 left-[5%] flex w-[90%] items-start gap-4 sm:left-[10%] sm:w-[80%] md:left-[15%] md:w-[70%] lg:left-[20%] lg:w-[60%]"
              exit={{ y: 50, opacity: 0 }}
              initial={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex w-full flex-col justify-between gap-4 rounded-lg border border-muted-200 bg-muted-50 p-2 md:flex-row md:items-center dark:border-muted-800 dark:bg-muted-950">
                <div className="w-full md:w-auto md:max-w-[164px]">
                  <Select
                    color="contrast"
                    name="pageSize"
                    onChange={(e) =>
                      setPagination({
                        ...pagination,
                        perPage: Number.parseInt(e.target.value),
                        currentPage: 1,
                      })
                    }
                    options={[
                      { value: "5", label: "5 per page" },
                      { value: "10", label: "10 per page" },
                      { value: "15", label: "15 per page" },
                      { value: "20", label: "20 per page" },
                    ]}
                    value={pagination.perPage}
                  />
                </div>
                <Pagination
                  buttonSize={"md"}
                  currentPage={pagination.currentPage}
                  onPageChange={(page) =>
                    setPagination({
                      ...pagination,
                      currentPage: page,
                    })
                  }
                  pageSize={pagination.perPage}
                  totalCount={pagination.totalItems}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  const { slug } = context.params;

  try {
    const params = new URLSearchParams({
      page: "1",
      perPage: "10",
      sortField: "createdAt",
      sortOrder: "desc",
      filter: JSON.stringify({
        "tag.slug": { value: slug, operator: "like" },
      }),
    });

    const { data, error } = await $serverFetch(context, {
      url: `/api/content/post?${params.toString()}`,
    });

    if (error || !data) {
      return {
        props: {
          error: error || "Unable to fetch posts.",
        },
      };
    }

    return {
      props: {
        initialData: data,
        slug,
      },
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      props: {
        error: `An unexpected error occurred: ${error.message}`,
      },
    };
  }
}

export default Blog;
