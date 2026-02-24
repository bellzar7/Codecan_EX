import { Icon } from "@iconify/react";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Tag from "@/components/elements/base/tag/Tag";
import Textarea from "@/components/elements/form/textarea/Textarea";
import ImagePortal from "@/components/elements/imagePortal";
import { MashImage } from "@/components/elements/MashImage";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

type KYC = {
  data: {
    firstName: string;
    daw: string;
    documents: {
      documentPassport: {
        front: string;
        selfie: string;
      };
      documentDriversLicense: {
        front: string;
        selfie: string;
      };
      documentIdCard: {
        front: string;
        back: string;
        selfie: string;
      };
    };
    customFields: {
      title: string;
      value: string;
      type: string;
    }[];
  };
  id: string;
  userId: string;
  templateId: string;
  status: string;
  level: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  user: {
    profile: {
      location: {
        address: string;
        country: string;
        city: string;
        zip: string;
      };
    };
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
  };
  template: {
    options: string;
    customOptions: string;
    id: string;
    title: string;
    status: boolean;
  };
};

const DetailItem = ({ label, value }) => (
  <div className="text-sm">
    <span className="text-gray-500 dark:text-gray-400">{label}:</span>{" "}
    <span
      className={
        value
          ? "text-gray-800 dark:text-gray-200"
          : "text-warning-500 dark:text-warning-400"
      }
    >
      {value || "Missing"}
    </span>
  </div>
);
const ImageItem = ({ label, src, openLightbox }) => (
  <div>
    <div className="group relative">
      <div className="absolute top-2 left-2">
        <Tag color="info">{label}</Tag>
      </div>
      <a className="block cursor-pointer" onClick={() => openLightbox(src)}>
        <MashImage
          alt={label}
          className="rounded-lg"
          height={180}
          src={src || "/img/placeholder.svg"}
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Icon className="text-3xl text-white" icon="akar-icons:eye" />
        </div>
      </a>
    </div>
  </div>
);
const KycApplicationDetails = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [kyc, setKyc] = useState<KYC | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionMessage, setRejectionMessage] = useState(
    "We are sorry, your kyc has been rejected. Please contact support for more information. \n\nRejection reason goes here.  \n\nThank you."
  );
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const getKyc = async () => {
    setIsLoading(true);
    const { data, error } = await $fetch({
      url: `/api/admin/crm/kyc/applicant/${id}`,
      silent: true,
    });
    if (!error) {
      const parsedData = JSON.parse((data as any).data);
      setKyc({ ...(data as any), data: parsedData });
    }
    setIsLoading(false);
  };
  const debounceGetKyc = debounce(getKyc, 100);
  useEffect(() => {
    if (router.isReady) {
      debounceGetKyc();
    }
  }, [router.isReady]);

  const updateKyc = async (status) => {
    setIsLoading(true);

    const { error } = await $fetch({
      method: "PUT",
      url: `/api/admin/crm/kyc/applicant/${id}`,
      body: {
        status,
        ...(status === "REJECTED" && { notes: rejectionMessage }),
      },
    });

    if (!error) {
      setKyc(
        (prevKyc) =>
          ({
            ...prevKyc,
            status,
            ...(status === "REJECTED" && { notes: rejectionMessage }),
          }) as KYC
      );
      if (status === "REJECTED") {
        setIsRejectOpen(false);
      }
      if (status === "APPROVED") {
        setIsApproveOpen(false);
      }
    }
    setIsLoading(false);
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PENDING":
        return "warning";
      case "REJECTED":
        return "danger";
      default:
        return "info";
    }
  };
  const levelClass = (type: number) => {
    switch (type) {
      case 1:
        return "info";
      case 2:
        return "primary";
      case 3:
        return "success";
      default:
        return "info";
    }
  };

  const documentType = useMemo(() => {
    if (kyc?.data?.documents) {
      if (kyc.data.documents.documentPassport) {
        return "Passport";
      }
      if (kyc.data.documents.documentDriversLicense) {
        return "Driver's License";
      }
      if (kyc.data.documents.documentIdCard) {
        return "ID Card";
      }
    }
    return "Unknown";
  }, [kyc]);

  const openLightbox = (image: string) => {
    setCurrentImage(image);
    setIsLightboxOpen(true);
  };
  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };
  const fieldNames = {
    firstName: {
      title: t("First Name"),
      description: t("The user's given name"),
    },
    lastName: {
      title: t("Last Name"),
      description: t("The user's family name"),
    },
    email: { title: t("Email"), description: t("The user's email address") },
    phone: { title: t("Phone"), description: t("The user's phone number") },
    address: {
      title: t("Address"),
      description: t("The user's street address"),
    },
    city: { title: t("City"), description: t("The user's city") },
    state: { title: t("State"), description: t("The user's state or region") },
    country: { title: t("Country"), description: t("The user's country") },
    zip: { title: t("Zip"), description: t("The user's postal code") },
    dob: { title: t("Date of Birth"), description: t("The user's birth date") },
    ssn: {
      title: t("SSN"),
      description: t("The user's social security number"),
    },
  };
  const renderDetails = () => {
    const options = JSON.parse(kyc?.template?.options || "{}");
    const keys = Object.keys(options).filter(
      (key) =>
        kyc &&
        options[key].enabled &&
        (Number.parseInt(options[key].level) <= kyc.level ||
          Number.parseInt(options[key].level) === kyc.level + 1)
    );
    return (
      <div className="grid xs:grid-cols-1 gap-2 sm:grid-cols-2">
        {keys.map(
          (key) =>
            fieldNames[key] && (
              <DetailItem
                key={key}
                label={fieldNames[key]?.title}
                value={
                  kyc?.data[key] ||
                  (kyc &&
                    (Number.parseInt(options[key].level) === kyc.level + 1
                      ? "Missing"
                      : null))
                }
              />
            )
        )}
      </div>
    );
  };
  const renderDocumentSection = (document) => (
    <div className="grid grid-cols-3 gap-5">
      {document.front && (
        <ImageItem
          label={t("Front")}
          openLightbox={openLightbox}
          src={document.front}
        />
      )}
      {document.selfie && (
        <ImageItem
          label={t("Selfie")}
          openLightbox={openLightbox}
          src={document.selfie}
        />
      )}
      {document.back && (
        <ImageItem
          label={t("Back")}
          openLightbox={openLightbox}
          src={document.back}
        />
      )}
    </div>
  );
  const renderCustomFields = () => {
    const customOptions = JSON.parse(kyc?.template.customOptions || "{}");
    const customKeys = Object.keys(customOptions).filter(
      (key) =>
        (kyc && Number.parseInt(customOptions[key].level) <= kyc.level) ||
        (kyc && Number.parseInt(customOptions[key].level) === kyc.level + 1)
    );
    return (
      <Card className="rounded-md border p-5 dark:border-gray-600">
        <h3 className="mb-2 font-semibold text-gray-800 text-lg dark:text-gray-200">
          {t("Custom Fields")}:
        </h3>
        <div className="grid grid-cols-3 gap-5 text-md">
          {customKeys.map((key) => {
            const field = customOptions[key];
            const value =
              kyc?.data[key] ||
              (kyc &&
                (Number.parseInt(field.level) === kyc.level + 1
                  ? "Missing"
                  : null));
            if (field.type === "input" || field.type === "textarea") {
              return (
                <div key={key}>
                  {" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    {t(key)}:
                  </span>{" "}
                  <span
                    className={
                      value
                        ? "text-gray-800 dark:text-gray-200"
                        : "text-warning-500 dark:text-warning-400"
                    }
                  >
                    {value || "Missing"}
                  </span>
                </div>
              );
            }
            if (field.type === "image" || field.type === "file") {
              return (
                <ImageItem
                  key={key}
                  label={t(key)}
                  openLightbox={openLightbox}
                  src={value}
                />
              );
            }
            return null;
          })}
        </div>
      </Card>
    );
  };

  // Check if there are any documents at or below the current level
  const hasDocuments = useMemo(() => {
    if (!kyc?.data?.documents) return false;
    const { documents } = kyc.data;

    // Define the levels we want to check for
    const levelsToCheck = [kyc.level, kyc.level - 1];

    // Check if any of the documents exist at or below the current level
    return levelsToCheck.some((level) =>
      ["documentPassport", "documentDriversLicense", "documentIdCard"].some(
        (docType) => {
          const document = documents[docType];
          return (
            document && (document.front || document.back || document.selfie)
          );
        }
      )
    );
  }, [kyc]);

  // Check if there are any custom fields at or below the current level
  const hasCustomFields = useMemo(() => {
    if (!kyc) return false;
    const customOptions = JSON.parse(kyc?.template.customOptions || "{}");
    const levels = [kyc.level, kyc.level - 1];
    return levels.some((level) =>
      Object.keys(customOptions).some(
        (key) => Number.parseInt(customOptions[key].level) <= level
      )
    );
  }, [kyc]);

  // Inside the return of the component
  return (
    <Layout color="muted" title={t("KYC Application Details")}>
      <div className="mx-auto max-w-7xl text-gray-800 dark:text-gray-200">
        <div className="mb-5 flex w-full items-center justify-between">
          <h1 className="text-xl">{t("KYC Application Details")}</h1>
          <BackButton href="/admin/crm/kyc/applicant" />
        </div>

        <div className="flex flex-col gap-5">
          {/* Details Section */}
          {kyc && (
            <>
              <Card className="rounded-md border p-5 dark:border-gray-600">
                {/* Header Section */}
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="mb-2 font-semibold text-gray-800 text-lg dark:text-gray-200">
                    {t("General Details")}:
                  </h2>
                  <div className="flex xs:flex-col items-center gap-2 sm:flex-row">
                    <Tag color={statusClass(kyc?.status)}>{kyc?.status}</Tag>
                    <Tag color={levelClass(kyc?.level)}>
                      {t("Level")} {kyc?.level}
                    </Tag>
                  </div>
                </div>
                {renderDetails()}
              </Card>
            </>
          )}

          {/* Document Upload */}
          {kyc && hasDocuments && (
            <Card className="rounded-md border p-5 dark:border-gray-600">
              <h3 className="mb-2 text-gray-800 text-lg dark:text-gray-200">
                {t("Uploaded Document")}:{" "}
                <span className="font-semibold">{documentType}</span>
              </h3>
              {kyc?.data?.documents?.documentPassport &&
                renderDocumentSection(kyc?.data.documents.documentPassport)}
              {kyc?.data?.documents?.documentDriversLicense &&
                renderDocumentSection(
                  kyc?.data.documents.documentDriversLicense
                )}
              {kyc?.data?.documents?.documentIdCard &&
                renderDocumentSection(kyc?.data.documents.documentIdCard)}
            </Card>
          )}

          {/* Custom Fields */}
          {kyc && hasCustomFields && renderCustomFields()}

          {/* Rejection Notes Section */}
          {kyc?.notes && kyc?.status === "REJECTED" && (
            <Card className="rounded-md border p-5 dark:border-gray-600">
              <h2 className="mb-2 font-semibold text-gray-800 text-lg dark:text-gray-200">
                {t("Notes")}:
              </h2>
              <p
                className="text-md"
                dangerouslySetInnerHTML={{
                  __html: kyc.notes?.replace(/\n/g, "<br />"),
                }}
              />
            </Card>
          )}

          {/* Approve Kyc Button */}
          {kyc?.status === "PENDING" && (
            <Card className="mb-2 flex w-full xs:flex-col gap-2 p-5 sm:flex-row">
              <Button
                className="w-full"
                color="success"
                onClick={() => setIsApproveOpen(true)}
              >
                {t("Approve Kyc")}
              </Button>
              <Button
                className="w-full"
                color="danger"
                onClick={() => setIsRejectOpen(true)}
              >
                {t("Reject Kyc")}
              </Button>
            </Card>
          )}
        </div>

        {/* Approve Kyc Modal */}
        <Modal open={isApproveOpen} size="lg">
          <Card shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <h3 className="font-medium text-lg text-muted-900 dark:text-white">
                {t("Approve Kyc")}
              </h3>
              <IconButton
                onClick={() => setIsApproveOpen(false)}
                shape="full"
                size="sm"
              >
                <Icon className="h-4 w-4" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 text-md md:p-6">
              <p>
                {t(
                  "Are you sure you want to approve this kyc? This action cannot be undone."
                )}
              </p>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex justify-end gap-x-2">
                <Button
                  color="success"
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={() => updateKyc("APPROVED")}
                >
                  {t("Approve")}
                </Button>
              </div>
            </div>
          </Card>
        </Modal>

        {/* Reject Kyc Modal */}
        <Modal open={isRejectOpen} size="lg">
          <Card shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <h3 className="font-medium text-lg text-muted-900 dark:text-white">
                {t("Reject Kyc")}
              </h3>
              <IconButton
                onClick={() => setIsRejectOpen(false)}
                shape="full"
                size="sm"
              >
                <Icon className="h-4 w-4" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 text-md md:p-6">
              <Textarea
                className="w-full rounded-md border p-2"
                onChange={(e) => setRejectionMessage(e.target.value)}
                placeholder={t("Enter rejection reason")}
                rows={10}
                value={rejectionMessage}
              />
            </div>
            <div className="p-4 md:p-6">
              <div className="flex justify-end gap-x-2">
                <Button
                  color="danger"
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={() => updateKyc("REJECTED")}
                >
                  {t("Reject")}
                </Button>
              </div>
            </div>
          </Card>
        </Modal>

        {isLightboxOpen && (
          <ImagePortal onClose={closeLightbox} src={currentImage} />
        )}
      </div>
    </Layout>
  );
};
export default KycApplicationDetails;
export const permission = "Access KYC Application Management";
