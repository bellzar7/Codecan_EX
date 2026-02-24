import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import Dropdown from "@/components/elements/base/dropdown/Dropdown";
import { MashImage } from "@/components/elements/MashImage";
import { useLogout } from "@/hooks/useLogout";
import { useDashboardStore } from "@/stores/dashboard";

const AccountDropdownBase = () => {
  const { t } = useTranslation();
  const logout = useLogout();
  const { profile } = useDashboardStore();

  if (!profile) {
    return (
      <>
        <Link href="/login">
          <Button color="primary" shape="rounded-sm" variant="outlined">
            <Icon
              className="me-1 h-5 w-5"
              icon="material-symbols-light:login-outline"
            />
            {t("Login")}
          </Button>
        </Link>
        <Link href="/register">
          <Button color="muted" shape="rounded-sm" variant="outlined">
            <Icon className="me-1 h-5 w-5" icon="bx:bxs-user-plus" />
            {t("Register")}
          </Button>
        </Link>
      </>
    );
  }

  return (
    <Dropdown
      indicator={false}
      orientation="end"
      title={t("My Account")}
      toggleImage={
        <MashImage
          alt=""
          height={350}
          src={profile?.avatar || "/img/avatars/placeholder.webp"}
          width={350}
        />
      }
    >
      <Link
        className="group mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-muted-100 dark:hover:bg-muted-800"
        href="/user/wallet"
      >
        <Icon
          className="h-5 w-5 stroke-muted-400 text-muted-400 transition-colors duration-300 dark:group-hover:stroke-primary-500 dark:group-hover:text-primary-500"
          icon="ph:wallet"
        />
        <div className="option-content flex flex-col">
          <span className="block font-medium font-sans text-muted-800 text-sm leading-tight dark:text-muted-100">
            {t("Assets")}
          </span>
          <span className="block font-sans text-muted-400 text-xs leading-tight">
            {t("View your assets")}
          </span>
        </div>
      </Link>
      <Link
        className="group mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-muted-100 dark:hover:bg-muted-800"
        href="/user/profile"
      >
        <Icon
          className="h-5 w-5 stroke-muted-400 text-muted-400 transition-colors duration-300 dark:group-hover:stroke-primary-500 dark:group-hover:text-primary-500"
          icon="ph:user-circle-duotone"
        />
        <div className="option-content flex flex-col">
          <span className="block font-medium font-sans text-muted-800 text-sm leading-tight dark:text-muted-100">
            {t("Profile")}
          </span>
          <span className="block font-sans text-muted-400 text-xs leading-tight">
            {t("View your profile")}
          </span>
        </div>
      </Link>
      {/* api management */}
      <Link
        className="group mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-muted-100 dark:hover:bg-muted-800"
        href="/user/api"
      >
        <Icon
          className="h-5 w-5 stroke-muted-400 text-muted-400 transition-colors duration-300 dark:group-hover:stroke-primary-500 dark:group-hover:text-primary-500"
          icon="carbon:api"
        />
        <div className="option-content flex flex-col">
          <span className="block font-medium font-sans text-muted-800 text-sm leading-tight dark:text-muted-100">
            {t("API Management")}
          </span>
          <span className="block font-sans text-muted-400 text-xs leading-tight">
            {t("Manage your API keys")}
          </span>
        </div>
      </Link>
      <button
        aria-label="Logout"
        className="group mx-2 flex w-[calc(100%_-_1rem)] cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-start transition-all duration-300 hover:bg-muted-100 dark:hover:bg-muted-800"
        name="logout"
        onClick={logout}
        type="button"
      >
        <Icon
          className="h-5 w-5 stroke-muted-400 text-muted-400 transition-colors duration-300 dark:group-hover:stroke-primary-500 dark:group-hover:text-primary-500"
          icon="ph:lock-duotone"
        />
        <span className="option-content flex flex-col">
          <span className="block font-medium font-sans text-muted-800 text-sm leading-tight dark:text-muted-100">
            {t("Logout")}
          </span>
          <span className="block font-sans text-muted-400 text-xs leading-tight">
            {t("Logout from account")}
          </span>
        </span>
      </button>
    </Dropdown>
  );
};

export const AccountDropdown = AccountDropdownBase;
