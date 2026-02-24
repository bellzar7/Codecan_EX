import { Icon } from "@iconify/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import { useLoginStore } from "@/stores/auth/login";
import { GoogleAuth } from "./GoogleAuth";

const googleAuthStatus = process.env.NEXT_PUBLIC_GOOGLE_AUTH_STATUS === "true";
export const googleClientId = process.env
  .NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;

const LoginFormsBase = () => {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    loading,
    errors,
  } = useLoginStore();
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility

  const router = useRouter();
  return (
    <>
      {googleClientId && googleAuthStatus && (
        <>
          <GoogleOAuthProvider clientId={googleClientId}>
            <GoogleAuth />
          </GoogleOAuthProvider>
          <div className="relative">
            <hr className="my-8 w-full border-muted-300 dark:border-muted-800" />
            <div className="absolute inset-x-0 -top-3 mx-auto text-center">
              <span className="bg-white px-4 py-1 font-sans text-muted-400 text-sm dark:bg-muted-900">
                {t("or sign in with email")}
              </span>
            </div>
          </div>
        </>
      )}
      <div>
        <div className="space-y-4">
          <Input
            color="muted"
            error={errors["email"]}
            icon="lucide:mail"
            label={t("Email address")}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("ex: johndoe@gmail.com")}
            value={email}
          />

          <div className="relative">
            <Input
              color="muted" // Conditionally change the input type
              error={errors["password"]}
              icon="lucide:lock"
              label={t("Password")}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              className="absolute top-[34px] right-4 font-sans"
              onClick={() => setShowPassword(!showPassword)} // Adjust the position as needed
              type="button" // Toggle password visibility
            >
              <Icon
                className="h-4 w-4 text-muted-400 hover:text-primary-500 dark:text-muted-500 dark:hover:text-primary-500"
                icon={showPassword ? "lucide:eye" : "lucide:eye-off"}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              color="primary"
              id="remember-me"
              label={t("Remember me")}
              shape="full"
            />
          </div>

          <div className="text-sm leading-5">
            <Link
              className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
              href="/forgot"
            >
              {t("Forgot your password")}
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Button
            className="w-full"
            color="primary"
            disabled={loading}
            loading={loading}
            onClick={() => handleSubmit(router)}
            size="md"
          >
            {t("Sign in")}
          </Button>
        </div>
      </div>

      <hr className="my-6 w-full border-muted-300 dark:border-muted-800" />

      <p className="mt-8 space-x-2 font-sans text-muted-600 text-sm leading-5 dark:text-muted-400">
        <span>{t("Need an account")}</span>
        <Link
          className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
          href="/register"
        >
          {t("Create an account")}
        </Link>
      </p>
    </>
  );
};
export const LoginForms = memo(LoginFormsBase);
