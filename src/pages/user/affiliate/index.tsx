import copy from "copy-to-clipboard"; // Import copy-to-clipboard
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { toast } from "sonner";
import Alert from "@/components/elements/base/alert/Alert";
import Button from "@/components/elements/base/button/Button";
import { ReferralTree } from "@/components/pages/affiliate/ReferralTree";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";

const AffiliateDashboard = () => {
  const { t } = useTranslation();
  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();

  useEffect(() => {
    if (
      router.isReady &&
      getSetting("icoRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to access affiliate dashboard"));
    }
  }, [router.isReady, profile?.kyc?.status]);

  const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL}/register?ref=${profile?.id}`;

  const handleCopyLink = () => {
    copy(referralLink);
    toast.success(t("Referral link copied to clipboard!"));
  };

  return (
    <Layout color="muted" title={t("Affiliate")}>
      <div className="mb-5">
        <HeaderCardImage
          description="Invite your friends and earn a commission for every trade they make."
          link={"/user/affiliate/program"}
          linkLabel="Learn More"
          lottie={{
            category: "communications",
            path: "referral-marketing",
            max: 2,
            height: 220,
          }}
          size="lg"
          title={t("Earn More With Our Referral Program")}
        />
      </div>
      <Alert
        button={
          <Button
            animated={false}
            color="primary"
            onClick={handleCopyLink}
            size={"sm"}
          >
            {t("Copy Link")}
          </Button>
        }
        canClose={false}
        className="mb-5"
        color="info"
        icon="mdi-information-outline"
        label={t("Referral Link")}
        sublabel={
          <>
            {t(
              "Share this link with your friends and earn a commission. Your referral link"
            )}
            :{" "}
            <a
              className="underline"
              href={referralLink}
              rel="noreferrer"
              target="_blank"
            >
              {referralLink}
            </a>
          </>
        }
      />
      <ReferralTree id={profile?.id} />
    </Layout>
  );
};

export default AffiliateDashboard;
