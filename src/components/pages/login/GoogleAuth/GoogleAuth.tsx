import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useLoginStore } from "@/stores/auth/login";
import type { GoogleAuthProps } from "./GoogleAuth.types";

const GoogleAuthBase = ({}: GoogleAuthProps) => {
  const { t } = useTranslation();
  const { handleGoogleLogin } = useGoogleAuth();
  const { loading } = useLoginStore();
  return (
    <div>
      <Button
        className="w-full"
        disabled={loading}
        loading={loading}
        onClick={() => handleGoogleLogin()}
        size="md"
        type="button"
      >
        <Icon className="me-1 h-4 w-4" icon="logos:google-icon" />
        <span>{t("Sign in with Google")}</span>
      </Button>
    </div>
  );
};

export const GoogleAuth = memo(GoogleAuthBase);
