import { capitalize } from "lodash";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import $fetch from "@/utils/api";

const OrderDownloadOptions = ({ order, orderItem, fetchOrder }) => {
  const { t } = useTranslation();
  const [downloadOption, setDownloadOption] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [licenseKey, setLicenseKey] = useState("");

  useEffect(() => {
    if (orderItem) {
      if (orderItem.key && orderItem.filePath) {
        setDownloadOption("both");
        setLicenseKey(orderItem.key);
        setDownloadLink(orderItem.filePath);
      } else if (orderItem.key) {
        setDownloadOption("license");
        setLicenseKey(orderItem.key);
      } else if (orderItem.filePath) {
        setDownloadOption("file");
        setDownloadLink(orderItem.filePath);
      }
    }
  }, [orderItem]);

  const handleDownloadOptionUpdate = async () => {
    if (!order) return;
    if (!downloadOption) {
      toast.error("Please select a download option");
      return;
    }
    if (
      downloadOption === "both" &&
      (licenseKey === "" || downloadLink === "")
    ) {
      toast.error("Please fill in both license key and download link");
      return;
    }
    if (downloadOption === "license" && licenseKey === "") {
      toast.error("Please fill in the license key");
      return;
    }
    if (downloadOption === "file" && downloadLink === "") {
      toast.error("Please fill in the download link");
      return;
    }

    const { data, error } = await $fetch({
      url: `/api/admin/ext/ecommerce/order/${order.id}/download`,
      method: "PUT",
      body: {
        orderItemId: orderItem.id,
        key: licenseKey !== "" ? licenseKey : undefined,
        filePath: downloadLink !== "" ? downloadLink : undefined,
      },
      silent: true,
    });

    if (!error) {
      fetchOrder();
    }
  };

  return (
    <div className="mb-4">
      <h2 className="mb-5 font-semibold text-lg dark:text-white">
        {t("Download Options")}
      </h2>
      <Select
        onChange={(option) => setDownloadOption(option.target.value)}
        options={[
          { value: "", label: capitalize(t("Select Option")) },
          { value: "license", label: t("License Key") },
          { value: "file", label: t("Downloadable File") },
          { value: "both", label: t("Both") },
        ]}
        value={downloadOption}
      />
      {downloadOption && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(downloadOption === "license" || downloadOption === "both") && (
            <Input
              label={t("License Key")}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder={t("License Key")}
              type="text"
              value={licenseKey}
            />
          )}
          {(downloadOption === "file" || downloadOption === "both") && (
            <Input
              label={t("Download Link")}
              onChange={(e) => setDownloadLink(e.target.value)}
              placeholder={t("Download Link")}
              type="text"
              value={downloadLink}
            />
          )}
        </div>
      )}
      <div className="flex justify-end">
        <Button
          className="mt-4"
          color="primary"
          onClick={handleDownloadOptionUpdate}
        >
          {t("Update Order")}
        </Button>
      </div>
    </div>
  );
};

export default OrderDownloadOptions;
