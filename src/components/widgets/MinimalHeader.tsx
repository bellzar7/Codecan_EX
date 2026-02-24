import Link from "next/link";
import LogoText from "@/components/vector/LogoText";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";

const MinimalHeader = () => {
  return (
    <div className="absolute top-0 left-0 z-30 w-full px-3">
      <div className="mx-auto lg:max-w-[1152px]">
        <div className="flex min-h-[3.6rem] items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <LogoText className="h-7 text-muted-900 md:h-8 dark:text-white" />
            </Link>
          </div>
          <div className="flex items-center justify-end">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalHeader;
