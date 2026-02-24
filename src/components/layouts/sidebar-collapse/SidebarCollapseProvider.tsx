import type { FC } from "react";
import AppOverlay from "@/components/widgets/AppOverlay";
import { MenuContextProvider } from "@/context/MenuContext";
import { HeaderPanels } from "../shared/HeaderPanels";
import { AppNavbar } from "../shared/sidebar/AppNavbar";
import { Menu } from "../shared/sidebar/Menu";

interface ProviderProps {
  fullwidth?: boolean;
  horizontal?: boolean;
}
const SidebarCollapseProvider: FC<ProviderProps> = ({
  fullwidth = false,
  horizontal = false,
}) => {
  return (
    <>
      <MenuContextProvider>
        <Menu collapse />
      </MenuContextProvider>

      <AppNavbar
        collapse
        fullwidth={fullwidth ? fullwidth : false}
        horizontal={horizontal ? horizontal : false}
      />

      <HeaderPanels />

      <AppOverlay />
    </>
  );
};
export default SidebarCollapseProvider;
