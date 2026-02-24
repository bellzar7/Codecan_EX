"use client";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import InputFile from "@/components/elements/form/input-file/InputFile";
import ListBox from "@/components/elements/form/listbox/Listbox";
import Textarea from "@/components/elements/form/textarea/Textarea";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";
import { imageUploader } from "@/utils/upload";

interface Option {
  value: string;
  label: string;
}

const NftAssetEdit: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<string>("");
  const [creatorId, setCreatorId] = useState<string>("");
  const [ownerId, setOwnerId] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [network, setNetwork] = useState<string>("");
  const [royalty, setRoyalty] = useState<string>("");
  const [status, setStatus] = useState<Option | null>(null);
  const router = useRouter();
  const { id } = router.query;

  const statusOptions: Option[] = [
    { value: "true", label: t("Active") },
    { value: "false", label: t("Inactive") },
  ];

  useEffect(() => {
    if (router.isReady) {
      fetchAssetData();
    }
  }, [router.isReady]);

  const fetchAssetData = async () => {
    if (!id) return;
    const { data, error } = await $fetch({
      url: `/api/admin/ext/nft/asset/${id}`,
      silent: true,
    });
    if (!error && data) {
      const assetData = data as any;
      setName(assetData.name);
      setDescription(assetData.description);
      setImageUrl(assetData.image);
      setMetadata(assetData.metadata);
      setCreatorId(assetData.creatorId);
      setOwnerId(assetData.ownerId);
      setPrice(assetData.price?.toString() || "");
      setNetwork(assetData.network);
      setRoyalty(assetData.royalty?.toString() || "");
      setStatus(
        statusOptions.find(
          (option) => option.value === assetData.status.toString()
        ) || null
      );
    }
  };

  const handleSubmit = async () => {
    const body = {
      name,
      description,
      image: imageUrl || "",
      metadata,
      creatorId,
      ownerId,
      price: price ? Number.parseFloat(price) : null,
      network,
      royalty: royalty ? Number.parseFloat(royalty) : null,
      status: status?.value === "true",
    };

    const { error } = await $fetch({
      url: `/api/admin/ext/nft/asset/${id}`,
      method: "PUT",
      body,
    });

    if (error) {
      toast.error(t("Failed to update NFT Asset"));
    } else {
      toast.success(t("NFT Asset updated successfully"));
      router.push("/admin/ext/nft/asset");
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const result = await imageUploader({
        file,
        dir: "nft/assets", // Directory for storing NFT asset images
        size: {
          maxWidth: 1024,
          maxHeight: 1024,
        },
        oldPath: imageUrl || undefined, // Replace old image if exists
      });

      if (result.success) {
        setImageUrl(result.url);
      } else {
        console.error("Error uploading file");
      }
    }
  };

  return (
    <Layout color="muted" title={t("Edit NFT Asset")}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-xl dark:text-white">
          {t("Edit NFT Asset")}
        </h1>
        <BackButton href="/admin/ext/nft/asset" />
      </div>
      <Card className="mb-5 p-5 text-muted-800 dark:text-muted-100">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0" />
          <div className="flex gap-2">
            <Button
              color="danger"
              onClick={() => router.push("/admin/ext/nft/asset")}
              shape="rounded-sm"
              size="md"
              variant="outlined"
            >
              {t("Cancel")}
            </Button>
            <Button
              color="success"
              onClick={handleSubmit}
              shape="rounded-sm"
              size="md"
              variant="outlined"
            >
              {t("Save")}
            </Button>
          </div>
        </div>
        <div className="my-5">
          <InputFile
            acceptedFileTypes={[
              "image/png",
              "image/jpeg",
              "image/jpg",
              "image/gif",
              "image/svg+xml",
              "image/webp",
            ]}
            bordered
            color="default"
            id="nft-asset-image"
            label={`${t("Max File Size")}: 16 MB`}
            labelAlt={`${t("Recommended Size")}: 1024x1024 px`}
            maxFileSize={16}
            onChange={handleFileUpload}
            onRemoveFile={() => setImageUrl(null)}
            preview={imageUrl}
            previewPlaceholder="/img/placeholder.svg"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label={t("Name")}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Enter the NFT asset name")}
            value={name}
          />
          <Textarea
            label={t("Description")}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("Enter the NFT asset description")}
            value={description}
          />
          <Input
            label={t("Metadata")}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder={t("Enter metadata URL or JSON")}
            value={metadata}
          />
          <Input
            label={t("Creator ID")}
            onChange={(e) => setCreatorId(e.target.value)}
            placeholder={t("Enter the creator's user ID")}
            value={creatorId}
          />
          <Input
            label={t("Owner ID")}
            onChange={(e) => setOwnerId(e.target.value)}
            placeholder={t("Enter the owner's user ID")}
            value={ownerId}
          />
          <Input
            label={t("Price")}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t("Enter the price")}
            value={price}
          />
          <Input
            label={t("Network")}
            onChange={(e) => setNetwork(e.target.value)}
            placeholder={t("Enter the blockchain network")}
            value={network}
          />
          <Input
            label={t("Royalty")}
            onChange={(e) => setRoyalty(e.target.value)}
            placeholder={t("Enter the royalty percentage")}
            value={royalty}
          />
          <ListBox
            label={t("Status")}
            options={statusOptions}
            selected={status}
            setSelected={setStatus}
          />
        </div>
      </Card>
    </Layout>
  );
};

export default NftAssetEdit;
export const permission = "Access NFT Asset Management";
