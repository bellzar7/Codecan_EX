import { capitalize } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import InputFile from "@/components/elements/form/input-file/InputFile";
import ListBox from "@/components/elements/form/listbox/Listbox";
import Textarea from "@/components/elements/form/textarea/Textarea";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";
import { slugify } from "@/utils/strings";
import { imageUploader } from "@/utils/upload";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface BlogPostCreateInput {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags: string[];
  status: { value: string; label: string };
  image: string;
  slug?: string;
}

interface Category {
  value: string;
  label: string;
}

const PostEditor: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const [postData, setPostData] = useState<BlogPostCreateInput>({
    title: "",
    description: "",
    content: "",
    categoryId: "",
    tags: [],
    status: { value: "DRAFT", label: "Draft" },
    image: "",
    slug: "",
  });

  const [content, setContent] = useState("");
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const { category, id } = router.query;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (router.isReady) {
      fetchCategories();
      if (id) {
        fetchData();
      }
    }
  }, [router.isReady, id]);

  const fetchData = async () => {
    if (
      !(id && profile && profile.author) ||
      profile?.author?.status !== "APPROVED"
    )
      return;
    const { data, error } = await $fetch({
      url: `/api/content/author/${profile?.author?.id}/${id}`,
      silent: true,
    });
    if (!error && data) {
      const postDataResponse = data as any;
      setPostData({
        ...postDataResponse,
        status: {
          value: postDataResponse.status,
          label: capitalize(postDataResponse.status),
        },
        description: postDataResponse.description || "",
        content: postDataResponse.content || "",
        categoryId: postDataResponse.categoryId || "",
        tags: postDataResponse.tags || [],
        image: postDataResponse.image || "",
        slug: postDataResponse.slug,
      } as any);
      setTagsArray(
        postDataResponse.tags.map((tag: { name: string }) => tag.name)
      );
      setContent(postDataResponse.content);
      setImageUrl(postDataResponse.image);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await $fetch({
      url: "/api/content/category",
      silent: true,
    });
    if (!error && data) {
      setCategories(
        (data as any).map((category: { id: string; name: string }) => ({
          value: category.id,
          label: category.name,
        }))
      );
    }
  };

  const handleSubmit = async () => {
    if (!(postData && postData.title)) return;

    const status = postData.status?.value || "";

    const body: any = {
      title: postData.title,
      description: postData.description || "",
      content,
      categoryId: postData.categoryId,
      tags: tagsArray,
      status,
      image: imageUrl || "",
      slug: postData.slug,
    };

    if (!id && postData.title) {
      body.slug = slugify(postData.title);
    }

    const method = id ? "PUT" : "POST";
    const url = id
      ? `/api/content/author/${profile?.author?.id}/${id}`
      : `/api/content/author/${profile?.author?.id}`;

    const { error } = await $fetch({
      url,
      method,
      body,
    });

    if (error) {
      console.error("Error submitting post:", error);
    } else {
      router.push(`/user/blog/author/${profile?.author?.id}`);
    }
  };

  const handleTagsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTags = e.target.value.split(", ");
    setTagsArray(newTags);
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const result = await imageUploader({
        file,
        dir: `blog/${category || "uncategorized"}`,
        size: {
          maxWidth: 1280,
          maxHeight: 720,
        },
        oldPath: imageUrl || undefined,
      });

      if (result.success) {
        setImageUrl(result.url);
        setPostData((prev) => ({
          ...prev!,
          image: result.url,
        }));
      } else {
        console.error("Error uploading file");
      }
    }
  };

  return (
    <Layout color="muted" title={t("Blog Editor")}>
      <Card className="mb-5 p-5 text-muted-800 dark:text-muted-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg">
            {id
              ? `${t("Editing")} ${postData ? postData.title : "Post"}`
              : t("New Post")}
          </h1>
          <div className="flex gap-2">
            <Button
              color="danger"
              onClick={() =>
                router.push(`/user/blog/author/${profile?.author?.id}`)
              }
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
        <div>
          <Input
            label={t("Title")}
            onChange={(e) =>
              setPostData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder={t("Post title")} // Removed null check since postData is initialized
            value={postData.title}
          />

          <Textarea
            label={t("Description")}
            onChange={(e) =>
              setPostData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder={t("Post description")} // Removed null check since postData is initialized
            value={postData.description}
          />
          <div className="flex gap-2">
            <Input
              label={t("Tags")}
              onChange={handleTagsInputChange}
              placeholder={t("Post tags")}
              value={tagsArray.join(", ")}
            />
            <ListBox
              label={t("Category")}
              options={categories}
              selected={
                categories.find(
                  (category) => category.value === postData.categoryId
                ) || {
                  value: "",
                  label: t("Select a category"),
                }
              }
              setSelected={(selectedCategory) =>
                setPostData((prev) => ({
                  ...prev,
                  categoryId: selectedCategory.value,
                }))
              }
            />

            <ListBox
              label={t("Status")}
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "PUBLISHED", label: "Published" },
              ]}
              selected={postData.status}
              setSelected={(e) =>
                setPostData((prev) => ({
                  ...prev,
                  status: e,
                }))
              }
            />
          </div>
        </div>
      </Card>

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
          id="featured-image"
          label={`${t("Max File Size")}: 16 MB`}
          labelAlt={`${t("Size")}: 720x720 px`}
          maxFileSize={16}
          onChange={handleFileUpload}
          onRemoveFile={() => {
            setImageUrl(null);
            setPostData((prev) => ({
              ...prev!,
              image: "",
            }));
          }}
          preview={imageUrl}
          previewPlaceholder="/img/placeholder.svg"
        />
      </div>

      <ReactQuill
        className={"quillEditor"}
        formats={[
          "header",
          "font",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "link",
          "image",
          "video",
        ]}
        modules={{
          toolbar: [
            [{ header: "1" }, { header: "2" }, { font: [] }],
            [{ size: [] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image", "video"],
            ["clean"],
          ],
        }}
        onChange={setContent}
        placeholder="Compose your content here..."
        theme="snow"
        value={content} // Add your custom class for styling
      />
    </Layout>
  );
};

export default PostEditor;
