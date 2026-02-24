"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { StrictMode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Layout from "@/layouts/Minimal";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const EmailEditor = dynamic(() => import("react-email-editor"), { ssr: false });
const CreateTemplate = () => {
  const { t } = useTranslation();
  const { isDark } = useDashboardStore();
  const router = useRouter();
  const { id } = router.query as {
    id: string;
  };
  const emailEditorRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<any>({});
  const [editorReady, setEditorReady] = useState(false);
  const onLoad = (unlayer: any) => {
    console.log("onLoad", unlayer);
    emailEditorRef.current = unlayer; // Ensure the reference is set here
    unlayer.addEventListener("design:loaded", (data: any) => {
      console.log("onDesignLoad", data);
    });
  };
  const onReady = (unlayer: any) => {
    console.log("onReady", unlayer);
    setEditorReady(true);
  };
  const fetchTemplate = async () => {
    const { data, error } = await $fetch({
      url: `/api/admin/ext/mailwizard/template/${id}`,
      silent: true,
    });
    if (!error) {
      setTemplate(data);
    }
  };
  useEffect(() => {
    if (router.isReady) {
      fetchTemplate();
    }
  }, [router.isReady]);
  useEffect(() => {
    if (editorReady && template.design) {
      const unlayer = emailEditorRef.current;
      if (unlayer && unlayer.loadDesign) {
        let design;
        try {
          design = JSON.parse(template.design);
        } catch (error) {
          design = {};
        }
        unlayer.loadDesign(design);
      }
    }
  }, [editorReady, template]);
  const save = async () => {
    setIsLoading(true);
    const unlayer = emailEditorRef.current;
    if (!unlayer) {
      toast.error("Editor not loaded");
      setIsLoading(false);
      return;
    }
    unlayer.exportHtml(async (data: any) => {
      const { design, html } = data;
      const { error } = await $fetch({
        url: `/api/admin/ext/mailwizard/template/${id}`,
        method: "PUT",
        body: {
          content: html,
          design: JSON.stringify(design),
        },
      });
      if (!error) {
        router.push("/admin/ext/mailwizard/template");
      }
      setIsLoading(false);
    });
  };
  return (
    <Layout color="muted" title={t("Create Mailwizard Template")}>
      <div className="mb-4 flex items-center justify-between p-4">
        <div>
          <h2 className="font-semibold text-muted-700 text-xl dark:text-white">
            {t("Edit")} {template.name} {t("Template")}
          </h2>
        </div>
        <div className="flex gap-2">
          <BackButton href="/admin/ext/mailwizard/template" />
          <Button
            color="primary"
            disabled={isLoading || !emailEditorRef.current}
            loading={isLoading || !emailEditorRef.current}
            onClick={save}
            type="button"
          >
            {t("Save")}
          </Button>
        </div>
      </div>
      <StrictMode>
        <div className="w-full">
          <EmailEditor
            onLoad={onLoad}
            onReady={onReady}
            options={{
              displayMode: "email",
              appearance: {
                theme: isDark ? "dark" : "modern_light",
                panels: {
                  tools: {
                    dock: "left",
                  },
                },
              },
            }}
            ref={emailEditorRef}
          />
        </div>
      </StrictMode>
    </Layout>
  );
};
export default CreateTemplate;
export const permission = "Access Mailwizard Template Management";
