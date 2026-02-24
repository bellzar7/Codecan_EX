"use client";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import Radio from "@/components/elements/form/radio/Radio";
import Select from "@/components/elements/form/select/Select";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const ApiKeyEdit: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;

  const [name, setName] = useState<string>("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [ipInput, setIpInput] = useState<string>("");
  const [ipRestriction, setIpRestriction] = useState<string>("restricted");
  const [loading, setLoading] = useState<boolean>(true);
  const [type, setType] = useState<string>("user");

  const permissionOptions = [
    {
      label: t("Trade"),
      value: "trade",
      description: t("Allows placing orders and trading on the exchange."),
    },
    {
      label: t("Futures"),
      value: "futures",
      description: t("Allows trading in futures markets."),
    },
    {
      label: t("Deposit"),
      value: "deposit",
      description: t("Allows viewing deposit addresses and history."),
    },
    {
      label: t("Withdraw"),
      value: "withdraw",
      description: t("Allows withdrawals from the account."),
    },
    {
      label: t("Transfer"),
      value: "transfer",
      description: t("Allows transfers between your accounts."),
    },
    {
      label: t("Payment"),
      value: "payment",
      description: t("Allows creating and confirming payments."),
    },
  ];

  useEffect(() => {
    if (id) fetchApiKey();
  }, [id]);

  const fetchApiKey = async () => {
    setLoading(true);
    const { data, error } = await $fetch({
      url: `/api/admin/api/${id}`,
      silent: true,
    });

    if (!error && data) {
      setName((data as any).name || "");
      let parsedPermissions = [];
      try {
        parsedPermissions = JSON.parse((data as any).permissions);
      } catch {
        parsedPermissions = Array.isArray((data as any).permissions)
          ? (data as any).permissions
          : [];
      }
      setPermissions(parsedPermissions);
      setIpWhitelist((data as any).ipWhitelist || []);
      setIpRestriction(
        (data as any).ipRestriction ? "restricted" : "unrestricted"
      );
      setType((data as any).type || "user");
    } else {
      toast.error(t("Failed to fetch API key data"));
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    const sanitizedPermissions = permissions.filter(
      (perm) => !["[", "]"].includes(perm) // Remove brackets and any invalid strings
    );

    const body = {
      name,
      permissions: sanitizedPermissions, // Use the sanitized permissions
      ipWhitelist: ipRestriction === "restricted" ? ipWhitelist : [],
      ipRestriction: ipRestriction === "restricted",
      type,
    };

    const { error } = await $fetch({
      url: `/api/admin/api/${id}`,
      method: "PUT",
      body,
    });

    if (error) {
      toast.error(t("Failed to update API key"));
    } else {
      toast.success(t("API key updated successfully"));
      router.push("/admin/api/key");
    }
  };

  const addIpToWhitelist = () => {
    if (ipInput.trim() && !ipWhitelist.includes(ipInput)) {
      setIpWhitelist([...ipWhitelist, ipInput]);
      setIpInput("");
    } else {
      toast.error(t("IP address is already in the whitelist or invalid."));
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((item) => item !== ip));
  };

  const handlePermissionToggle = (permission: string) => {
    setPermissions((prevPermissions) => {
      if (!Array.isArray(prevPermissions)) prevPermissions = [];
      return prevPermissions.includes(permission)
        ? prevPermissions.filter((p) => p !== permission) // Remove permission
        : [...prevPermissions, permission]; // Add permission
    });
  };

  if (loading) return null;

  return (
    <Layout color="muted" title={t("Edit API Key")}>
      <Card className="mb-5 p-6 text-muted-800 dark:text-muted-100">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <h1 className="mb-4 text-lg md:mb-0">{t("Edit API Key")}</h1>
          <div className="flex gap-2">
            <Button
              color="danger"
              onClick={() => router.push("/admin/api/key")}
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
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label={t("API Key Name")}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("Enter API Key Name")}
            value={name}
          />
          <Select
            label={t("Type")}
            onChange={(e) => setType(e.target.value)}
            options={[
              { label: t("User"), value: "user" },
              { label: t("Plugin"), value: "plugin" },
            ]}
            value={type}
          />
        </div>
        <div className="mt-6">
          <h4 className="font-semibold text-lg">{t("Permissions")}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {permissionOptions.map((perm) => (
              <div className="flex items-center gap-2" key={perm.value}>
                <Checkbox
                  checked={permissions.includes(perm.value)}
                  id={perm.value}
                  onChange={() => handlePermissionToggle(perm.value)}
                />
                <div>
                  <label
                    className="cursor-pointer text-md dark:text-white"
                    htmlFor={perm.value}
                  >
                    {perm.label}
                  </label>
                  <small className="block text-muted-500 text-sm dark:text-muted-400">
                    {perm.description}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h4 className="mb-2 font-semibold text-md dark:text-muted-100">
            {t("IP Access Restrictions")}
          </h4>
          <div className="mb-4 flex items-center gap-2">
            <Radio
              checked={ipRestriction === "unrestricted"}
              id="unrestricted"
              label={t("Unrestricted (Less Secure)")}
              name="ipRestriction"
              onChange={() => setIpRestriction("unrestricted")}
              type="radio"
              value="unrestricted"
            />
            <p className="text-red-500 text-xs dark:text-red-400">
              {t(
                "This API Key allows access from any IP address. This is not recommended."
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Radio
              checked={ipRestriction === "restricted"}
              id="restricted"
              label={t("Restrict access to trusted IPs only (Recommended)")}
              name="ipRestriction"
              onChange={() => setIpRestriction("restricted")}
              type="radio"
              value="restricted"
            />
          </div>
          {ipRestriction === "restricted" && (
            <>
              <Input
                className="mt-2 dark:bg-muted-800 dark:text-white"
                onChange={(e) => setIpInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") addIpToWhitelist();
                }}
                placeholder={t("Enter IP to Whitelist")}
                value={ipInput}
              />
              <Button
                className="mt-2"
                disabled={!ipInput.trim()}
                onClick={addIpToWhitelist}
              >
                {t("Add IP")}
              </Button>
              <div className="mt-2">
                {Array.isArray(ipWhitelist) &&
                  ipWhitelist.map((ip, index) => (
                    <div className="mt-1 flex items-center gap-2" key={index}>
                      <span className="dark:text-white">{ip}</span>
                      <IconButton
                        onClick={() => removeIpFromWhitelist(ip)}
                        size="sm"
                      >
                        <Icon
                          className="h-4 w-4 dark:text-white"
                          icon="mdi:close"
                        />
                      </IconButton>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </Layout>
  );
};

export default ApiKeyEdit;
