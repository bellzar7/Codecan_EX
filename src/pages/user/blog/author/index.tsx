import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import Card from "@/components/elements/base/card/Card";
import Heading from "@/components/elements/base/heading/Heading";
import Paragraph from "@/components/elements/base/paragraph/Paragraph";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const Action = () => {
  const { t } = useTranslation();
  const { profile, fetchProfile } = useDashboardStore();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    if (router.isReady) {
      if (profile) {
        setStatus(profile.author?.status || null);
      } else {
        router.push("/blog");
      }
    }
  }, [profile, router.isReady]);
  const submit = async () => {
    const { error } = await $fetch({
      url: "/api/content/author",
      method: "POST",
    });
    if (!error) {
      await fetchProfile();
      setStatus("PENDING");
    }
  };
  const renderContent = () => {
    switch (status) {
      case "APPROVED":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <Icon
              className="h-16 w-16 text-success-500"
              icon="mdi:check-circle"
            />
            <Heading as="h2" size="lg" weight="medium">
              {t("You are already an author")}
            </Heading>
            <Paragraph className="text-muted-500 dark:text-muted-400">
              {t("Congratulations! You have been approved as an author.")}
            </Paragraph>
            <ButtonLink
              className="mt-6"
              href={`/user/blog/author/${profile?.author?.id}`}
            >
              {t("Go to Author Page")}
            </ButtonLink>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <Icon
              className="h-16 w-16 text-danger-500"
              icon="mdi:close-circle"
            />
            <Heading as="h2" size="lg" weight="medium">
              {t("Your application has been rejected")}
            </Heading>
            <Paragraph className="text-muted-500 dark:text-muted-400">
              {t("Unfortunately, your application has been rejected.")}
            </Paragraph>
            <ButtonLink className="mt-6" href="/blog">
              {t("Back to Blog")}
            </ButtonLink>
          </div>
        );
      case "PENDING":
        return (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <Icon className="h-16 w-16 text-warning-500" icon="mdi:clock" />
            <Heading as="h2" size="lg" weight="medium">
              {t("Your application is pending")}
            </Heading>
            <Paragraph className="text-muted-500 dark:text-muted-400">
              {t("Your application is currently under review.")}
            </Paragraph>
            <ButtonLink className="mt-6" href="/blog">
              {t("Back to Blog")}
            </ButtonLink>
          </div>
        );
      case null:
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <Avatar className="mx-auto" size="xl" src="/img/avatars/10.svg" />
            <div className="mx-auto max-w-xs text-center">
              <Heading as="h2" className="mt-4" size="md" weight="medium">
                {t("Application for")} {process.env.NEXT_PUBLIC_SITE_NAME}{" "}
                {t("Authorship Program")}
              </Heading>
            </div>
            <div className="mx-auto max-w-sm">
              <Card className="p-6">
                <Heading
                  as="h3"
                  className="mb-2 text-[0.65rem]! text-muted-400 uppercase"
                  size="xs"
                  weight="medium"
                >
                  {t("Note from Editorial Team")}
                </Heading>
                <Paragraph
                  className="text-muted-500 dark:text-muted-400"
                  size="xs"
                >
                  {t(
                    "Dear Applicant, We have noticed your interest in contributing to our platform. Due to the increasing volume of content, we are currently expanding our team of authors. We'd be delighted to consider you for this role."
                  )}
                </Paragraph>
              </Card>

              <div className="mt-6 flex items-center justify-between gap-2">
                <ButtonLink className="w-full" href="/blog">
                  {t("Decline")}
                </ButtonLink>
                <Button className="w-full" color="primary" onClick={submit}>
                  {t("Accept")}
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };
  return (
    <Layout color="muted" title={t("Action")}>
      <div className="flex items-center justify-center py-8 text-muted-800 dark:text-muted-200">
        <div className="mx-auto w-full max-w-4xl">
          <Card color={"contrast"}>
            <div className="grid divide-y divide-muted-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-muted-700">
              <div className="flex flex-col p-8">{renderContent()}</div>
              <div>
                <div className="flex flex-col p-8">
                  <Heading as="h2" className="mt-4" size="md" weight="medium">
                    {t("Onboarding Guidelines")}
                  </Heading>
                  <Paragraph
                    className="max-w-xs text-muted-500 dark:text-muted-400"
                    size="xs"
                  >
                    {t(
                      "Please review the following guidelines carefully before accepting this invitation."
                    )}
                  </Paragraph>
                  <div className="mt-6">
                    <ul className="space-y-6">
                      <li className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted-200 bg-white shadow-muted-300/30 shadow-xl dark:border-muted-600 dark:bg-muted-700 dark:shadow-muted-800/20">
                          <Icon
                            className="h-4 w-4 text-warning-500"
                            icon="fa-solid:gem"
                          />
                        </div>
                        <div>
                          <Heading as="h3" size="sm" weight="medium">
                            {t("Content Quality")}
                          </Heading>
                          <Paragraph
                            className="max-w-[210px] text-muted-500 dark:text-muted-400"
                            size="xs"
                          >
                            {t(
                              "Ensure your articles meet our editorial standards for accuracy, depth, and quality."
                            )}
                          </Paragraph>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted-200 bg-white shadow-muted-300/30 shadow-xl dark:border-muted-600 dark:bg-muted-700 dark:shadow-muted-800/20">
                          <Icon
                            className="h-4 w-4 text-success-500"
                            icon="lucide:check"
                          />
                        </div>
                        <div>
                          <Heading as="h3" size="sm" weight="medium">
                            {t("Plagiarism")}
                          </Heading>
                          <Paragraph
                            className="max-w-[210px] text-muted-500 dark:text-muted-400"
                            size="xs"
                          >
                            {t(
                              "Plagiarism is strictly prohibited. All content must be original and properly cited."
                            )}
                          </Paragraph>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted-200 bg-white shadow-muted-300/30 shadow-xl dark:border-muted-600 dark:bg-muted-700 dark:shadow-muted-800/20">
                          <Icon
                            className="h-4 w-4 text-danger-500"
                            icon="fluent:prohibited-20-regular"
                          />
                        </div>
                        <div>
                          <Heading as="h3" size="sm" weight="medium">
                            {t("Prohibited Content")}
                          </Heading>
                          <Paragraph
                            className="max-w-[210px] text-muted-500 dark:text-muted-400"
                            size="xs"
                          >
                            {t(
                              "Content that includes hate speech, harassment, violence, or explicit material is strictly prohibited."
                            )}
                          </Paragraph>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-muted-200 bg-white shadow-muted-300/30 shadow-xl dark:border-muted-600 dark:bg-muted-700 dark:shadow-muted-800/20">
                          <Icon
                            className="h-4 w-4 text-info-500"
                            icon="healthicons:communication-outline"
                          />
                        </div>
                        <div>
                          <Heading as="h3" size="sm" weight="medium">
                            {t("Communication")}
                          </Heading>
                          <Paragraph
                            className="max-w-[210px] text-muted-500 dark:text-muted-400"
                            size="xs"
                          >
                            {t(
                              "Maintain open and clear communication with the editorial team."
                            )}
                          </Paragraph>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
export default Action;
