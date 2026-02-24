import { useDashboardStore } from "@/stores/dashboard";

const AppOverlay = () => {
  const { setIsSidebarOpenedMobile, isSidebarOpenedMobile } =
    useDashboardStore();

  return (
    <div
      className={`fixed inset-O z-10 h-full w-full bg-muted-900 transition-opacity duration-300 ${
        isSidebarOpenedMobile
          ? "pointer-events-auto opacity-60 lg:pointer-events-none lg:hidden lg:opacity-0 dark:opacity-50"
          : "pointer-events-none opacity-0!"
      }`}
      onClick={() => setIsSidebarOpenedMobile(!isSidebarOpenedMobile)}
    />
  );
};

export default AppOverlay;
