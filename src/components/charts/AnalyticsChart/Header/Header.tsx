import { Icon } from "@iconify/react";
import { capitalize } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import Breadcrumb from "@/components/elements/base/breadcrumb/Breadcrumb";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import type { HeaderProps } from "./Header.types";

const HeaderBase = ({ modelName, postTitle }: HeaderProps) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const breadcrumbItems = router.asPath
    .split("?")[0] // This splits the path at the '?' and takes the first part, excluding the query.
    .split("/")
    .filter((item) => item !== "")
    .map((item, index, arr) => {
      return {
        title: capitalize(item.replace(/-/g, " ").replace(/#/g, "")),
        href: `/${arr.slice(0, index + 1).join("/")}`,
      };
    });
  return (
    <div className="mb-2 flex min-h-16 w-fullrounded-lg flex-col items-start justify-center gap-5 py-2 md:flex-row md:justify-between">
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
          shape={"rounded-sm"}
          size={"md"}
          variant={"pastel"}
        />
        <h2 className="font-light font-sans text-lg text-muted-700 dark:text-muted-300">
          {modelName} {postTitle || "Analytics"}
          <Breadcrumb items={breadcrumbItems} separator="slash" />
        </h2>
      </div>
      <Tooltip content={t("Records")}>
        <Link href={router.asPath.replace("analysis", "")} passHref>
          <IconButton
            aria-label="Records"
            color="primary"
            size={"lg"}
            variant="pastel"
          >
            <Icon className="h-6 w-6" icon="solar:database-bold-duotone" />
          </IconButton>
        </Link>
      </Tooltip>
    </div>
  );
};
export const Header = HeaderBase;
