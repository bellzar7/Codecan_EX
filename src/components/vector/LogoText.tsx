import { type FC, useMemo } from "react";
import { useDashboardStore } from "@/stores/dashboard";
import { MashImage } from "../elements/MashImage";

interface LogoTextProps {
  className?: string;
}

const LogoText: FC<LogoTextProps> = ({ className: classes }) => {
  const { isDark, settings } = useDashboardStore();

  const fullLogoSrc = useMemo(() => {
    if (settings?.fullLogo || settings?.fullLogoDark) {
      return isDark
        ? settings?.fullLogoDark || settings?.fullLogo
        : settings?.fullLogo;
    }
    return "";
  }, [isDark, settings]);

  return (
    <div className={`flex h-[30px] w-[100px] items-center ${classes}`}>
      <MashImage
        alt="Workflow"
        className="max-h-full w-full fill-current"
        height={30}
        src={fullLogoSrc}
        width={100}
      />
    </div>
  );
};

export default LogoText;
