import { useRouter } from "next/router";
import { userMenu } from "@/data/constants/menu";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

export const useLogout = () => {
  const router = useRouter();
  const { setProfile, setIsFetched, setFilteredMenu, filterMenu } =
    useDashboardStore();

  return async () => {
    const { error } = await $fetch({
      url: "/api/auth/logout",
      method: "POST",
    });

    if (!error) {
      setProfile(null);
      setIsFetched(false); // Reset the isFetched state
      const newFilteredMenu = filterMenu(userMenu);
      setFilteredMenu(newFilteredMenu);
      router.push("/");
    }
  };
};
