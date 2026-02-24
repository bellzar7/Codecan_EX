import { Icon } from "@iconify/react";
import type { NextRouter } from "next/router";
import type React from "react";
import Button from "@/components/elements/base/button/Button";

interface OrderActionButtonsProps {
  profile: any; // adjust type as needed
  loading: boolean;
  canPlaceOrder: () => boolean;
  handlePlaceOrder: (side: "RISE" | "FALL") => Promise<void>;
  t: (key: string) => string;
  router: NextRouter;
}

const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  profile,
  loading,
  canPlaceOrder,
  handlePlaceOrder,
  t,
  router,
}) => {
  const isLoggedIn = !!profile?.id;

  return (
    <div className="flex items-center justify-center gap-2 md:flex-col">
      <div className="w-full">
        <Button
          animated={false}
          className="h-20 w-full"
          color={isLoggedIn ? "success" : "muted"}
          disabled={!canPlaceOrder()}
          loading={loading}
          onClick={() =>
            isLoggedIn ? handlePlaceOrder("RISE") : router.push("/login")
          }
          shape={"rounded-sm"}
          type="button"
        >
          {isLoggedIn ? (
            <span className="flex items-center gap-2 text-md md:flex-col md:gap-0">
              {t("Rise")}
              <Icon className="h-8 w-8" icon="ant-design:rise-outlined" />
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-warning-500">{t("Log In")}</span>
              <span>{t("or")}</span>
              <span className="text-warning-500">{t("Register Now")}</span>
            </div>
          )}
        </Button>
      </div>

      <div className="w-full">
        <Button
          animated={false}
          className="h-20 w-full"
          color={isLoggedIn ? "danger" : "muted"}
          disabled={!canPlaceOrder()}
          loading={loading}
          onClick={() =>
            isLoggedIn ? handlePlaceOrder("FALL") : router.push("/login")
          }
          shape={"rounded-sm"}
          type="button"
        >
          {isLoggedIn ? (
            <span className="flex items-center gap-2 text-md md:flex-col">
              {t("Fall")}
              <Icon className="h-8 w-8" icon="ant-design:fall-outlined" />
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-warning-500">{t("Log In")}</span>
              <span>{t("or")}</span>
              <span className="text-warning-500">{t("Register Now")}</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default OrderActionButtons;
