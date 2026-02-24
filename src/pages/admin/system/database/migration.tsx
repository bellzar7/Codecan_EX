import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";
import WebSocketManager from "@/utils/ws";

const apiMigrate = "/api/admin/system/database/migrate";
const DatabaseMigrationDashboard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (router.isReady) {
      const wsManager = new WebSocketManager(
        "/api/admin/system/database/migrate"
      );
      wsManager.connect();
      wsManager.on("open", () => {
        wsManager.send({ action: "SUBSCRIBE", payload: {} });
      });
      wsManager.on("message", (message: any) => {
        const newLog = {
          message: `[${new Date().toLocaleTimeString()}] ${message.message}`,
          status: message.status,
        };
        setLogs((prevLogs) => [...prevLogs, newLog]);
      });
      return () => {
        wsManager.disconnect();
      };
    }
  }, [router.isReady]);
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);
  const initiateMigration = async () => {
    setIsModalOpen(false);
    setIsLoading(true);
    await $fetch({
      url: apiMigrate,
      method: "POST",
    });
    setIsLoading(false);
  };
  const renderLogs = () => {
    return logs.map((log, index) => {
      const logClass =
        typeof log.status !== "undefined" && log.status === true
          ? "text-success-500"
          : typeof log.status !== "undefined" && log.status === false
            ? "text-danger-500"
            : "text-muted-800";
      return (
        <div className={`${logClass} whitespace-nowrap`} key={index}>
          {log.message}
        </div>
      );
    });
  };
  return (
    <Layout color="muted" title={t("Database Migration")}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-medium text-muted-900 text-xl dark:text-white">
          {t("Database Migration")}
        </h1>
        <Button
          animated={false}
          className="ml-2"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          shape={"rounded-sm"}
          variant={"outlined"}
        >
          {t("Start Migration")}
        </Button>
      </div>

      <Modal open={isModalOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Confirm Migration")}
            </p>

            <IconButton
              onClick={() => setIsModalOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="mb-4 text-muted-400 text-sm dark:text-muted-600">
              {t("Are you sure you want to start the migration?")}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="primary"
                disabled={isLoading}
                loading={isLoading}
                onClick={initiateMigration}
              >
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <div
        className="slimscroll mt-6 h-[calc(100vh-200px)] overflow-auto rounded-sm bg-gray-100 p-4 text-sm shadow-sm dark:bg-gray-800"
        ref={logRef}
      >
        {renderLogs()}
      </div>
    </Layout>
  );
};
export default DatabaseMigrationDashboard;
export const permission = "Access Database Migration Management";
