import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import { ObjectTable } from "@/components/elements/base/object-table";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const apiListBackups = "/api/admin/system/database/backup";
const apiBackup = "/api/admin/system/database/backup";
const apiRestore = "/api/admin/system/database/restore";
interface Backup {
  filename: string;
  path: string;
  createdAt: string;
}
const DatabaseBackupDashboard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fetchBackups = async () => {
    const { data, error } = await $fetch({
      url: apiListBackups,
      silent: true,
    });
    if (!error) {
      setBackups(data as any);
    }
  };
  const initiateBackup = async () => {
    setIsLoading(true);
    const { error } = await $fetch({
      url: apiBackup,
      method: "POST",
    });
    if (!error) {
      fetchBackups();
      setIsModalOpen(false);
    }
    setIsLoading(false);
  };
  const restoreBackup = async (filename: string) => {
    setIsLoading(true);
    const { error } = await $fetch({
      url: apiRestore,
      method: "POST",
      body: { backupFile: filename },
    });
    if (!error) {
      fetchBackups();
      setRestoreFile(null);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (router.isReady) {
      fetchBackups();
    }
  }, [router.isReady]);
  const columnConfig: ColumnConfigType[] = [
    {
      field: "filename",
      label: "Filename",
      type: "string",
      sortable: true,
    },
    {
      field: "path",
      label: "Path",
      type: "string",
      sortable: true,
    },
    {
      field: "createdAt",
      label: "Created At",
      type: "date",
      sortable: true,
    },
    {
      field: "actions",
      label: "Actions",
      type: "actions",
      sortable: false,
      actions: [
        {
          icon: "mdi:restore",
          color: "primary",
          onClick: (row) => {
            setRestoreFile(row.filename);
          },
          size: "sm",
          tooltip: "Restore Backup",
        },
      ],
    },
  ];
  return (
    <Layout color="muted" title={t("Database Backups")}>
      <ObjectTable
        columnConfig={columnConfig}
        initialPerPage={20}
        items={backups}
        navSlot={
          <>
            <Button
              className="ml-2"
              color="primary"
              onClick={() => setIsModalOpen(true)}
              shape={"rounded-sm"}
              variant={"outlined"}
            >
              {t("Create Backup")}
            </Button>
          </>
        }
        setItems={setBackups}
        shape="rounded-sm"
        size="sm"
        title={t("Database Backups")}
      />
      <Modal open={isModalOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Confirm Backup")}
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
              {t("Are you sure you want to create a new backup?")}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="primary"
                disabled={isLoading}
                loading={isLoading}
                onClick={initiateBackup}
              >
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      {restoreFile && (
        <Modal open={Boolean(restoreFile)} size="sm">
          <Card shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
                {t("Confirm Restore")}
              </p>

              <IconButton
                onClick={() => setRestoreFile(null)}
                shape="full"
                size="sm"
              >
                <Icon className="h-4 w-4" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 md:p-6">
              <p className="mb-4 text-muted-400 text-sm dark:text-muted-600">
                {t(
                  `Are you sure you want to restore the backup "${restoreFile}"?`
                )}
              </p>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex justify-end gap-x-2">
                <Button
                  color="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={() => restoreBackup(restoreFile)}
                >
                  {t("Confirm")}
                </Button>
              </div>
            </div>
          </Card>
        </Modal>
      )}
    </Layout>
  );
};
export default DatabaseBackupDashboard;
export const permission = "Access Database Backup Management";
