import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import MinimalHeader from "@/components/widgets/MinimalHeader";
import Layout from "@/layouts/Minimal";
import $fetch from "@/utils/api";
export default function PasswordReset() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (!token) {
      toast.error(t("Invalid token"));
      return;
    }
    if (!(newPassword && confirmPassword)) {
      toast.error(t("Please fill in all fields"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("Passwords do not match"));
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await $fetch({
      url: "/api/auth/verify/reset",
      method: "POST",
      body: { token, newPassword },
      silent: false,
    });
    setIsSubmitting(false);
    if (data && !error) {
      router.push("/user");
    }
  };
  return (
    <Layout color="muted" title={`${t("Reset Password")}`}>
      <main className="relative min-h-screen">
        <MinimalHeader />
        <div className="flex min-h-screen flex-col items-stretch justify-between">
          <div className="flex grow items-center px-6 py-12 md:px-12">
            <div className="container">
              <div className="columns flex items-center">
                <div className="shrink grow md:p-3">
                  <div className="mx-auto -mt-10 mb-6 max-w-[420px] text-center font-sans">
                    <h1 className="mb-2 text-center font-light font-sans text-3xl text-muted-800 leading-tight dark:text-muted-100">{`${t(
                      "Reset Password"
                    )}`}</h1>
                    <p className="text-center text-muted-500 text-sm">{`${t(
                      "Enter your new password"
                    )}`}</p>
                  </div>

                  <Card
                    className="mx-auto flex max-w-[420px] flex-col gap-4 p-6 md:p-8 lg:p-10"
                    color="contrast"
                    shape="smooth"
                  >
                    <Input
                      color="default"
                      icon="lucide:lock"
                      label={`${t("New Password")}`}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={`${t("New Password")}`}
                      size="md"
                      type="password"
                      value={newPassword}
                    />
                    <Input
                      color="default"
                      icon="lucide:lock"
                      label={`${t("Confirm Password")}`}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={`${t("Confirm Password")}`}
                      size="md"
                      type="password"
                      value={confirmPassword}
                    />
                    <div className="relative">
                      <div className="my-4">
                        <Button
                          className="w-full"
                          color="primary"
                          disabled={isSubmitting}
                          loading={isSubmitting}
                          onClick={handleSubmit}
                          shadow="primary"
                          size="md"
                          type="button"
                          variant="solid"
                        >{`${t("Reset Password")}`}</Button>
                      </div>
                      <div className="text-center">
                        <Link
                          className="text-muted-400 text-sm underline-offset-4 hover:text-primary-500 hover:underline"
                          href="/login"
                        >{`${t("Back to Login")}`}</Link>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
