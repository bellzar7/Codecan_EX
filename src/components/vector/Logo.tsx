import { type FC, useMemo } from "react";
import { useDashboardStore } from "@/stores/dashboard";
import { MashImage } from "../elements/MashImage";

interface LogoProps {
  className?: string;
}

const Logo: FC<LogoProps> = ({ className: classes }) => {
  const { isDark, settings } = useDashboardStore();

  const logoSrc = useMemo(() => {
    if (settings?.logo || settings?.logoDark) {
      return isDark ? settings?.logoDark || settings?.logo : settings?.logo;
    }
    return "";
  }, [isDark, settings]);

  return (
    <div className={`flex h-[30px] w-[30px] items-center ${classes}`}>
      <MashImage alt="Workflow" height={30} src={logoSrc} width={30} />
    </div>
  );
};

export default Logo;
