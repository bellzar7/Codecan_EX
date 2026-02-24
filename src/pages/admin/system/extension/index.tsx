"use client";
import { debounce } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import { MashImage } from "@/components/elements/MashImage";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

type Extension = {
  id: string;
  productId: string;
  name: string;
  title: string;
  description: string;
  link: string;
  status: boolean;
  version: string;
  image: string;
};

const api = "/api/admin/system/extension";

const Extension = () => {
  const { t } = useTranslation();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const router = useRouter();

  const fetchData = async () => {
    const { data, error } = await $fetch({
      url: api,
      silent: true,
    });
    console.log("data", data);
    if (!error) setExtensions(data as any);
  };

  const debouncedFetchData = debounce(fetchData, 100);
  useEffect(() => {
    if (router.isReady) debouncedFetchData();
  }, [router.isReady]);

  return (
    <Layout color="muted" title={t("Extensions")}>
      <div className="grid grid-cols-1 gap-x-3 gap-y-6 md:grid-cols-2 xl:grid-cols-3">
        {extensions.map((product) => (
          <div className="group relative" key={product.id}>
            <Link href={`/admin/system/extension/${product.productId}`}>
              <Card
                className="relative transform rounded-lg p-3 transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl"
                color="contrast"
              >
                <div className="relative h-full w-full">
                  <MashImage
                    alt={product.name}
                    className="rounded-lg object-cover"
                    src={product.image || "/img/placeholder.svg"}
                  />
                  <div className="absolute right-1 bottom-1">
                    <Tag color={product.status ? "success" : "danger"}>
                      {product.status ? "Active" : "Inactive"}
                    </Tag>
                  </div>
                </div>
                <div className="mb-2">
                  <h4 className="font-medium text-muted-800 dark:text-muted-100">
                    {product.title}
                  </h4>
                  <p className="text-muted-500 text-sm dark:text-muted-400">
                    {product.description.length > 250
                      ? product.description.slice(0, 250) + "..."
                      : product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-800 dark:text-muted-100">
                    Version
                  </span>
                  <span className="text-muted-800 dark:text-muted-100">
                    {Number.parseFloat(product.version) >= 4
                      ? product.version
                      : "N/A"}
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};
export default Extension;
export const permission = "Access Extension Management";
