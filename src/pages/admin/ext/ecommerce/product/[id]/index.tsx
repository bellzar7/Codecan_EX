import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/elements/addons/RichTextEditor";
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

const EcommerceProductEdit: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<{
    categories: Option[];
    walletTypes: Option[];
    currencyConditions: Record<string, Option[]>;
  } | null>(null);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [type, setType] = useState<Option | null>(null);
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<Option | null>(null);
  const [inventoryQuantity, setInventoryQuantity] = useState<string>("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<Option | null>(null);
  const [currency, setCurrency] = useState<Option | null>(null);
  const [status, setStatus] = useState<Option | null>(null);

  useEffect(() => {
    if (router.isReady) {
      fetchFormData();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (formData && id) {
      fetchProductData();
    }
  }, [formData, id]);

  const fetchFormData = async () => {
    const { data, error } = await $fetch({
      url: "/api/admin/ext/ecommerce/product/data",
      silent: true,
    });
    if (!error && data) {
      setFormData(data as any);
    }
  };

  const fetchProductData = async () => {
    if (!id) return;
    const { data, error } = await $fetch({
      url: `/api/admin/ext/ecommerce/product/${id}`,
      silent: true,
    });
    if (!error && data) {
      const productData = data as any;
      setName(productData.name);
      setDescription(productData.description);
      setShortDescription(productData.shortDescription);
      setType(
        [
          { value: "DOWNLOADABLE", label: t("Downloadable") },
          { value: "PHYSICAL", label: t("Physical") },
        ].find((option) => option.value === productData.type) || null
      );
      setPrice(productData.price.toString());
      setCategory(
        formData?.categories.find(
          (cat) => cat.value === productData.categoryId
        ) || null
      );
      setInventoryQuantity(productData.inventoryQuantity.toString());
      setFilePath(productData.image);
      setWalletType(
        formData?.walletTypes.find(
          (wallet) => wallet.value === productData.walletType
        ) || null
      );
      setCurrency(
        formData?.currencyConditions[productData.walletType]?.find(
          (cur) => cur.value === productData.currency
        ) || null
      );
      setStatus(
        [
          { value: "true", label: t("Yes") },
          { value: "false", label: t("No") },
        ].find((option) => option.value === String(productData.status)) || null
      );
    }
  };

  const handleSubmit = async () => {
    const body = {
      name,
      description,
      shortDescription,
      type: type?.value,
      price: Number.parseFloat(price),
      categoryId: category?.value,
      inventoryQuantity: Number.parseInt(inventoryQuantity),
      image: filePath,
      walletType: walletType?.value,
      currency: currency?.value,
      status: status?.value,
    };

    const { error } = await $fetch({
      url: `/api/admin/ext/ecommerce/product/${id}`,
      method: "PUT",
      body,
    });

    if (!error) {
      router.push("/admin/ext/ecommerce/product");
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const result = await imageUploader({
        file,
        dir: "ecommerce/products",
        size: {
          maxWidth: 720,
          maxHeight: 720,
        },
        oldPath: filePath || undefined,
      });

      if (result.success) {
        setFilePath(result.url);
      } else {
        console.error("Error uploading file");
      }
    }
  };

  const getCurrencyOptions = () => {
    if (!(walletType && formData)) return [];
    return formData.currencyConditions[walletType.value] || [];
  };

  if (!formData) return null;

  return (
    <Layout color="muted" title={t("Edit E-commerce Product")}>
      <Card className="mb-5 p-5 text-muted-800 dark:text-muted-100">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-lg">{t("Edit Product")}</h1>
          <div className="flex gap-2">
            <Button
              color="danger"
              onClick={() => router.push("/admin/ext/ecommerce/product")}
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
        <InputFile
          acceptedFileTypes={["image/png", "image/jpeg", "image/webp"]}
          id="product-image"
          label={`${t("Max File Size")}: 16 MB`}
          maxFileSize={16}
          onChange={handleFileUpload}
          onRemoveFile={() => setFilePath(null)}
          preview={filePath}
          previewPlaceholder="/img/placeholder.svg"
        />
        <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <ListBox
            label={t("Type")}
            options={[
              { value: "DOWNLOADABLE", label: t("Downloadable") },
              { value: "PHYSICAL", label: t("Physical") },
            ]}
            selected={type}
            setSelected={setType}
          />
          <ListBox
            label={t("Category")}
            options={formData.categories}
            selected={category}
            setSelected={setCategory}
          />
          <Input
            label={t("Name")}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Enter the product name")}
            value={name}
          />
          <Input
            label={t("Price")}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t("Enter the product price")}
            value={price}
          />
          <ListBox
            label={t("Wallet Type")}
            options={formData.walletTypes}
            selected={walletType}
            setSelected={(option) => {
              setWalletType(option);
              setCurrency(null);
            }}
          />
          <ListBox
            label={t("Currency")}
            options={getCurrencyOptions()}
            selected={currency}
            setSelected={setCurrency}
          />
          <Input
            label={t("Inventory Quantity")}
            onChange={(e) => setInventoryQuantity(e.target.value)}
            placeholder={t("Enter inventory quantity")}
            value={inventoryQuantity}
          />
          <ListBox
            label={t("Status")}
            options={[
              { value: true, label: t("Yes") },
              { value: false, label: t("No") },
            ]}
            selected={status}
            setSelected={setStatus}
          />
        </div>
        <Textarea
          label={t("Short Description")}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder={t("Enter the product short description")}
          value={shortDescription}
        />
        <div className="my-6">
          <h2 className="mb-2 font-semibold text-md">{t("Description")}</h2>
          <RichTextEditor
            onChange={setDescription}
            placeholder={t("Compose product description here...")}
            value={description}
          />
        </div>
      </Card>
    </Layout>
  );
};

export default EcommerceProductEdit;
