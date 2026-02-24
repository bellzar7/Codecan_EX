import { capitalize } from "lodash";
import { useRouter } from "next/router";
import pluralize from "pluralize";
import { memo, useState } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { BackButton } from "../button/BackButton";
import IconBox from "../iconbox/IconBox";
import type { PageHeaderProps } from "./PageHeader.types";

const PageHeaderBase = ({ title, BackPath, children }: PageHeaderProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const breadcrumbItems = router.asPath
    .split("?")[0]
    .split("/")
    .filter((item) => item !== "")
    .map((item, index, arr) => {
      const title =
        arr.length - 1 === index
          ? pluralize(capitalize(item.replace(/-/g, " ").replace(/#/g, "")))
          : capitalize(item.replace(/-/g, " ").replace(/#/g, ""));

      const href = arr.slice(0, index + 1).join("/");

      return {
        title,
        href: `/${href}`,
      };
    });

  return (
    <div className="flex min-h-16 w-full flex-col items-start justify-center gap-5 rounded-lg py-2 md:flex-row md:justify-between">
      <div className="flex items-center gap-4">
        <IconBox
          className="cursor-pointer duration-300 hover:bg-black/10 hover:text-black hover:shadow-inner dark:hover:bg-white/20"
          color="muted"
          icon={
            isHovered
              ? "heroicons-solid:chevron-left"
              : "material-symbols-light:app-badging-outline"
          }
          onClick={() => router.back()}
          onMouseLeave={() => setIsHovered(false)}
          onMouseOver={() => setIsHovered(true)}
          rotating={!isHovered}
          shape="rounded-sm"
          size="md"
          variant="pastel"
        />
        <h2 className="font-light font-sans text-lg text-muted-700 dark:text-muted-300">
          {title}
          {breadcrumbItems.length > 0 && (
            <Breadcrumb items={breadcrumbItems} separator="slash" />
          )}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        {BackPath && <BackButton href={BackPath} />}
        {children}
      </div>
    </div>
  );
};

export const PageHeader = memo(PageHeaderBase);
