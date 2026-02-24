import { Icon } from "@iconify/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import Alert from "@/components/elements/base/alert/Alert";
import Button from "@/components/elements/base/button/Button";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Heading from "@/components/elements/base/heading/Heading";
import Paragraph from "@/components/elements/base/paragraph/Paragraph";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import GoogleLoginButton from "@/components/pages/auth/GoogleLoginButton";
import LogoText from "@/components/vector/LogoText";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";
import Layout from "@/layouts/Minimal";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
const hasGoogleClientId = googleClientId && googleClientId !== "";
const defaultUserPath = process.env.NEXT_PUBLIC_DEFAULT_USER_PATH || "/user";

function validatePassword(password: string): { [key: string]: boolean } {
  return {
    "Has at least 8 characters": password.length >= 8,
    "Has uppercase letters": /[A-Z]/.test(password),
    "Has lowercase letters": /[a-z]/.test(password),
    "Has numbers": /\d/.test(password),
    "Has non-alphanumeric characters": /\W/.test(password),
  };
}

function PasswordValidation({ password }: { password: string }) {
  const conditions = validatePassword(password);
  const isValid = Object.values(conditions).every(Boolean);

  return (
    <Alert
      canClose={false}
      className="text-sm"
      color={isValid ? "success" : "danger"}
    >
      <div className="flex flex-col gap-1">
        {Object.entries(conditions).map(([condition, valid], index) => (
          <div
            className={`flex items-center gap-2 ${
              valid ? "text-green-500" : "text-red-500"
            }`}
            key={index}
          >
            <Icon icon={valid ? "mdi:check-bold" : "mdi:close-thick"} />
            {condition}
          </div>
        ))}
      </div>
    </Alert>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordTyped, setIsPasswordTyped] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { setIsFetched, fetchProfile } = useDashboardStore();
  const router = useRouter();
  const { ref, token } = router.query as { ref: string; token: string };

  useEffect(() => {
    if (router.query.ref) {
      setReferral(ref);
    }
    if (router.query.token) {
      setVerificationCode(token);
      handleVerificationSubmit(token);
    }
  }, [router.query]);

  useEffect(() => {
    setIsPasswordValid(
      Object.values(validatePassword(password)).every(Boolean)
    );
  }, [password]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (!isPasswordTyped) {
      setIsPasswordTyped(true);
    }
  };

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { data, error, validationErrors } = await $fetch({
      url: "/api/auth/register",
      method: "POST",
      body: { firstName, lastName, email, password, ref: referral },
    });

    setLoading(false);

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    if (data && !error) {
      if (process.env.NEXT_PUBLIC_VERIFY_EMAIL_STATUS === "true") {
        setIsVerificationStep(true);
      } else {
        setIsFetched(false);
        await fetchProfile();
        router.push(defaultUserPath);
      }
    }
  };

  const handleGoogleSuccess = async (tokenResponse: any) => {
    const { access_token } = tokenResponse;
    const { data, error } = await $fetch({
      url: "/api/auth/register/google",
      method: "POST",
      body: { token: access_token, ref: referral },
    });
    if (data && !error) {
      setIsFetched(false);
      await fetchProfile();
      router.push(defaultUserPath);
    }
  };

  const handleGoogleError = (errorResponse: any) => {
    console.error("Google login failed", errorResponse);
  };

  const handleVerificationSubmit = async (verificationToken?: string) => {
    setLoading(true);
    const tokenToVerify = verificationToken || verificationCode;
    const { data, error } = await $fetch({
      url: "/api/auth/verify/email",
      method: "POST",
      body: { token: tokenToVerify },
    });
    setLoading(false);
    if (data && !error) {
      setIsFetched(false);
      await fetchProfile();
      router.push(defaultUserPath);
    }
  };

  return (
    <Layout color="muted" title={t("Register")}>
      <main className="relative min-h-screen">
        <div className="flex h-screen flex-col items-center bg-white md:flex-row dark:bg-muted-900">
          <div className="i group relative hidden h-screen w-full items-center justify-around overflow-hidden bg-indigo-600 bg-linear-to-tr from-primary-900 to-primary-500 md:flex md:w-1/2 lg:flex xl:w-2/3">
            <div className="mx-auto max-w-xs text-center">
              <Heading as="h2" className="text-white" weight="medium">
                {t("Have an Account")}?
              </Heading>
              <Paragraph className="mb-3 text-muted-200" size="sm">
                {t(
                  "No need to waste time on this page, let's take you back to your account"
                )}
              </Paragraph>
              <ButtonLink className="w-full" href="/login" shape="curved">
                {t("Login to Account")}
              </ButtonLink>
            </div>
            {/* Additional decorative elements */}
          </div>

          <div className="relative flex h-screen w-full items-center justify-center bg-white px-6 md:mx-auto md:w-1/2 md:max-w-md lg:max-w-full lg:px-16 xl:w-1/3 xl:px-12 dark:bg-muted-900">
            <div className="absolute inset-x-0 top-6 mx-auto w-full max-w-sm px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link href="/">
                    <LogoText className="h-6 text-primary-500" />
                  </Link>
                </div>
                <div className="flex items-center justify-end">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-sm px-4">
              <h1 className="mt-12 mb-6 font-light font-sans text-2xl text-muted-800 leading-9 dark:text-muted-100">
                {isVerificationStep
                  ? t("Verify your email")
                  : t("Create a new account")}
              </h1>

              {isVerificationStep ? (
                <form
                  className="mt-6"
                  method="POST"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerificationSubmit();
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <Input
                      color="contrast"
                      icon="lucide:lock"
                      label={t("Verification Code")}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder={t("Enter verification code")}
                      value={verificationCode}
                    />
                  </div>

                  <div className="mt-6">
                    <Button
                      className="w-full"
                      color="primary"
                      disabled={loading}
                      loading={loading}
                      size="md"
                      type="submit"
                    >
                      {t("Verify Email")}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {hasGoogleClientId && (
                    <GoogleOAuthProvider clientId={googleClientId}>
                      <GoogleLoginButton
                        onError={handleGoogleError}
                        onSuccess={handleGoogleSuccess}
                      />
                    </GoogleOAuthProvider>
                  )}

                  <form className="mt-6" method="POST" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <Input
                          autoComplete="given-name"
                          color="contrast"
                          error={errors.firstName}
                          label={t("First Name")}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t("John")}
                          value={firstName}
                        />

                        <Input
                          autoComplete="family-name"
                          color="contrast"
                          error={errors.lastName}
                          label={t("Last Name")}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t("Doe")}
                          value={lastName}
                        />
                      </div>
                      <Input
                        color="contrast"
                        error={errors.email}
                        icon="lucide:mail"
                        label={t("Email address")}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("ex: johndoe@gmail.com")}
                        type="email"
                        value={email}
                      />

                      <div className="relative">
                        <Input
                          color="contrast"
                          error={errors.password}
                          icon="lucide:lock"
                          label={t("Password")}
                          onChange={handlePasswordChange}
                          placeholder=""
                          type={showPassword ? "text" : "password"}
                          value={password}
                        />
                        <button
                          className="absolute top-[34px] right-4 font-sans"
                          onClick={() => setShowPassword(!showPassword)}
                          type="button"
                        >
                          <Icon
                            className="h-4 w-4 text-muted-400 hover:text-primary-500 dark:text-muted-500 dark:hover:text-primary-500"
                            icon={
                              showPassword ? "lucide:eye" : "lucide:eye-off"
                            }
                          />
                        </button>
                      </div>
                      {isPasswordTyped && (
                        <PasswordValidation password={password} />
                      )}
                      {referral && (
                        <Input
                          color="contrast"
                          error={errors.ref}
                          label={t("Referral Code")}
                          onChange={(e) => setReferral(e.target.value)}
                          placeholder={t("Referral code")}
                          readOnly
                          value={referral}
                        />
                      )}
                    </div>

                    <div className="mt-4 flex items-center">
                      <Checkbox
                        checked={acceptedTerms}
                        color="primary"
                        id="terms"
                        label={
                          <>
                            {t("I accept the")}{" "}
                            <Link
                              className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
                              href="/terms-and-conditions"
                            >
                              {t("Terms and Conditions")}
                            </Link>
                          </>
                        }
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        type="checkbox"
                      />
                    </div>

                    <div className="mt-6">
                      <Button
                        className="w-full"
                        color="primary"
                        disabled={loading || !isPasswordValid || !acceptedTerms}
                        loading={loading}
                        size="md"
                        type="submit"
                      >
                        {t("Sign up")}
                      </Button>
                    </div>
                  </form>

                  <hr className="my-8 w-full border-muted-300 dark:border-muted-800" />

                  <p className="mt-8 space-x-2 font-sans text-muted-600 text-sm leading-5 dark:text-muted-400">
                    <span>{t("Already have an account?")}</span>
                    <Link
                      className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
                      href="/login"
                    >
                      {t("Log in")}
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
