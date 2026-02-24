"use client";
import { capitalize } from "lodash";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Input from "@/components/elements/form/input/Input";
import InputFile from "@/components/elements/form/input-file/InputFile";
import ListBox from "@/components/elements/form/listbox/Listbox";
import Textarea from "@/components/elements/form/textarea/Textarea";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";
import { imageUploader } from "@/utils/upload";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false }) as any;

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
  const editorRef = useRef<any | null>(null);

  useEffect(() => {
    if (router.isReady) {
      fetchCategories();
      if (id) {
        fetchData();
      }
    }
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
    };
  }, [router.isReady, id]);

  const fetchData = async () => {
    const { data, error } = await $fetch({
      url: `/api/admin/content/post/${id}`,
      silent: true,
    });
    if (!error && data) {
      const apiData = data as any;
      setPostData({
        title: apiData.title,
        description: apiData.description || "",
        content: apiData.content || "",
        categoryId: apiData.categoryId || "",
        tags: apiData.tags || [],
        status: {
          value: apiData.status,
          label: capitalize(apiData.status),
        },
        image: apiData.image || "",
        slug: apiData.slug,
      });
      setTagsArray(apiData.tags.map((tag: { name: string }) => tag.name));
      setContent(apiData.content || "");
      setImageUrl(apiData.image || "");
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
    if (!postData) return;

    const status: string = postData.status.value;

    const body: BlogPostCreateInput = {
      title: postData.title,
      description: postData.description || "",
      content,
      categoryId: postData.categoryId,
      tags: tagsArray,
      status: { value: status, label: capitalize(status) },
      image: imageUrl || "",
      slug: postData.slug,
    };

    const method = id ? "PUT" : "POST";
    const url = id
      ? `/api/admin/content/post/${id}`
      : "/api/admin/content/post";

    const { error } = await $fetch({
      url,
      method,
      body: body as any,
    });

    if (error) {
      console.error("Error submitting content:", error);
    } else {
      router.push("/admin/content/post");
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
              onClick={() => router.push("/admin/content/post")}
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
                ...prev!,
                title: e.target.value,
              }))
            }
            placeholder={t("Post title")} // Always has a value since postData is initialized
            value={postData.title}
          />
          <Textarea
            label={t("Description")}
            onChange={(e) =>
              setPostData((prev) => ({
                ...prev!,
                description: e.target.value,
              }))
            }
            placeholder={t("Post description")} // Always has a value since postData is initialized
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
                  ...prev!,
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
              setSelected={(e) => {
                setPostData((prev) => ({
                  ...prev!,
                  status: e,
                }));
              }}
            />
          </div>
          <div className="mt-5">
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
              labelAlt={`${t("Size")}: 1280x720 px`}
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
        </div>
      </Card>
      <Card className="mb-5">
        <div className="p-5">
          <h2 className="text-lg text-muted-800 dark:text-muted-100">
            {t("Content")}
          </h2>
        </div>
        <hr className="border-muted-300 border-t dark:border-muted-700" />
        <div className="mt-10 p-5">
          <ReactQuill
            className="quillEditor"
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
        </div>
      </Card>
    </Layout>
  );
};

export default PostEditor;

export const permission = "Access Post Management";
