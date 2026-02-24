import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import Radio from "@/components/elements/form/radio/Radio";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const ApiKeyManagement = () => {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [ipWhitelist, setIpWhitelist] = useState<string[]>([]);
  const [ipInput, setIpInput] = useState("");
  const [ipRestriction, setIpRestriction] = useState("restricted");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showFullKey, setShowFullKey] = useState<string | null>(null);

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
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    const { data, error } = await $fetch({ url: "/api/api-key", silent: true });
    if (error) {
      toast.error(t("Failed to fetch API keys"));
    } else {
      const parsedData = (data as any).map((key) => ({
        ...key,
        permissions: key.permissions
          ? typeof key.permissions === "string"
            ? JSON.parse(key.permissions)
            : key.permissions
          : [],
        ipWhitelist: key.ipWhitelist
          ? typeof key.ipWhitelist === "string"
            ? JSON.parse(key.ipWhitelist)
            : key.ipWhitelist
          : [],
      }));
      setApiKeys(parsedData);
    }
    setLoading(false);
  };

  const createApiKey = async () => {
    setCreating(true);
    const { data, error } = await $fetch({
      url: "/api/api-key",
      method: "POST",
      body: {
        name: newKeyName,
        permissions: Array.isArray(permissions) ? permissions : [],
        ipWhitelist: ipRestriction === "restricted" ? ipWhitelist : [],
        ipRestriction: ipRestriction === "restricted",
      },
    });
    if (error) {
      toast.error(t("Failed to create API key"));
    } else {
      setApiKeys([...apiKeys, data]);
      resetForm();
      toast.success(t("API key created successfully"));
    }
    setCreating(false);
  };

  const deleteApiKey = async (id: string) => {
    const { error } = await $fetch({
      url: `/api/api-key/${id}`,
      method: "DELETE",
    });
    if (error) {
      toast.error(t("Failed to delete API key"));
    } else {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
      toast.success(t("API key deleted successfully"));
    }
  };

  const handleEdit = (id: string) => {
    const keyToEdit = apiKeys.find((key) => key.id === id);
    if (keyToEdit) {
      setIsEditing(id);
      setPermissions(
        Array.isArray(keyToEdit.permissions) ? keyToEdit.permissions : []
      ); // Ensure clean array
      setIpWhitelist(
        Array.isArray(keyToEdit.ipWhitelist) ? keyToEdit.ipWhitelist : []
      );
      setIpRestriction(keyToEdit.ipRestriction ? "restricted" : "unrestricted");
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setPermissions((prevPermissions) => {
      if (!Array.isArray(prevPermissions)) prevPermissions = [];
      return prevPermissions.includes(permission)
        ? prevPermissions.filter((p) => p !== permission) // Remove permission
        : [...prevPermissions, permission]; // Add permission
    });
  };

  const updateApiKey = async () => {
    if (!isEditing) return;

    // Debug log
    console.log("Payload before sending:", {
      permissions,
      ipWhitelist: ipRestriction === "restricted" ? ipWhitelist : [],
      ipRestriction: ipRestriction === "restricted",
    });

    const { error } = await $fetch({
      url: `/api/api-key/${isEditing}`,
      method: "PUT",
      body: {
        permissions: Array.isArray(permissions) ? permissions : [],
        ipWhitelist: ipRestriction === "restricted" ? ipWhitelist : [],
        ipRestriction: ipRestriction === "restricted",
      },
    });

    if (error) {
      toast.error(t("Failed to update API key"));
    } else {
      toast.success(t("API key updated successfully"));
      setIsEditing(null);
      fetchApiKeys();
    }
  };

  const addIpToWhitelist = () => {
    if (ipInput && !ipWhitelist.includes(ipInput)) {
      setIpWhitelist([...ipWhitelist, ipInput]);
      setIpInput("");
    } else {
      toast.error(t("IP address is already in the whitelist or invalid."));
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setIpWhitelist(ipWhitelist.filter((item) => item !== ip));
  };

  const maskApiKey = (key: string) => {
    return `**** **** **** ${key.slice(-5)}`;
  };

  const resetForm = () => {
    setPermissions([]);
    setIpWhitelist([]);
    setIpInput("");
    setIpRestriction("restricted");
    setIsCreating(false);
  };

  return (
    <Layout title={t("API Key Management")}>
      <div className="flex flex-col gap-8 p-4 sm:p-6 lg:p-8">
        <Card className="p-6 dark:bg-muted-900">
          <h2 className="mb-4 font-semibold text-lg dark:text-muted-100">
            {t("API Key Management")}
          </h2>
          <p className="dark:text-muted-400">
            {t("1. Each account can create up to 10 API Keys.")}
          </p>
          <p className="dark:text-muted-400">
            {t("2. Do not disclose your API Key.")}
          </p>
          <p className="dark:text-muted-400">
            {t(
              "3. Restrict access to trusted IPs only for increased security."
            )}
          </p>
          <p className="dark:text-muted-400">
            {t("4. Complete KYC to create an API key.")}
          </p>
          <div className="mt-6">
            <Button color="primary" onClick={() => setIsCreating(true)}>
              {t("Create API Key")}
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center">
            <Icon
              className="h-8 w-8 animate-spin dark:text-white"
              icon="mdi:loading"
            />
          </div>
        ) : apiKeys.length > 0 ? (
          <div className="flex flex-col gap-5">
            {apiKeys.map((key) => (
              <Card className="p-6 dark:bg-muted-900" key={key.id}>
                <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <h4 className="font-semibold text-md dark:text-muted-100">
                      {key.name}
                    </h4>
                    <p className="text-muted-600 text-sm dark:text-muted-400">
                      {showFullKey === key.id ? key.key : maskApiKey(key.key)}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3 sm:mt-0">
                    <Button onClick={() => handleEdit(key.id)}>
                      {isEditing === key.id ? t("Close") : t("Edit")}
                    </Button>
                    <Button color="danger" onClick={() => deleteApiKey(key.id)}>
                      {t("Delete")}
                    </Button>
                  </div>
                </div>
                {isEditing === key.id && (
                  <div className="mt-4">
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {permissionOptions.map((perm) => (
                        <div
                          className="flex items-center gap-2"
                          key={perm.value}
                        >
                          <Checkbox
                            checked={
                              Array.isArray(permissions) &&
                              permissions.includes(perm.value)
                            }
                            id={perm.value} // Safeguard against malformed data
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
                          label={t(
                            "Restrict access to trusted IPs only (Recommended)"
                          )}
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
                                <div
                                  className="mt-1 flex items-center gap-2"
                                  key={index}
                                >
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

                    <div className="mt-4 flex justify-end gap-3">
                      <Button
                        onClick={() => setIsEditing(null)} // Close edit mode
                      >
                        {t("Cancel")}
                      </Button>
                      <Button color="primary" onClick={updateApiKey}>
                        {t("Save")}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-muted-600 dark:text-muted-400">
            {t("No API keys found. Create a new one to get started.")}
          </div>
        )}

        <Modal open={isCreating} size="xl">
          <Card className="dark:bg-muted-900" shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
                {t("Create New API Key")}
              </p>
              <IconButton
                onClick={() => setIsCreating(false)}
                shape="full"
                size="sm"
              >
                <Icon className="h-4 w-4 dark:text-white" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 md:px-6 md:py-8">
              <div className="w-full">
                <Input
                  className="dark:bg-muted-800 dark:text-white"
                  disabled={creating}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t("API Key Name")}
                  value={newKeyName}
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {permissionOptions.map((perm) => (
                    <div className="flex items-center gap-2" key={perm.value}>
                      <Checkbox
                        checked={permissions.includes(perm.value)}
                        id={perm.value}
                        onChange={() =>
                          setPermissions((prev) =>
                            Array.isArray(prev) && prev.includes(perm.value)
                              ? prev.filter((p) => p !== perm.value)
                              : [...prev, perm.value]
                          )
                        }
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
                <div className="mt-4">
                  <h4 className="mb-2 font-semibold text-md dark:text-muted-100">
                    {t("IP Access Restrictions")}
                  </h4>
                  <div className="mb-4 flex flex-col items-start gap-2">
                    <Radio
                      checked={ipRestriction === "unrestricted"}
                      id="unrestricted-create"
                      label={t("Unrestricted (Less Secure)")}
                      name="ipRestrictionCreate"
                      onChange={() => setIpRestriction("unrestricted")}
                      type="radio"
                      value="unrestricted"
                    />
                    <div>
                      <p className="text-red-500 text-xs dark:text-red-400">
                        {t(
                          "This API Key allows access from any IP address. This is not recommended."
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio
                      checked={ipRestriction === "restricted"}
                      id="restricted-create"
                      label={t(
                        "Restrict access to trusted IPs only (Recommended)"
                      )}
                      name="ipRestrictionCreate"
                      onChange={() => setIpRestriction("restricted")}
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
                            <div
                              className="mt-1 flex items-center gap-2"
                              key={index}
                            >
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
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 md:p-6">
              <Button onClick={() => setIsCreating(false)} shape="smooth">
                {t("Cancel")}
              </Button>
              <Button
                color="primary"
                loading={creating}
                onClick={createApiKey}
                shape="smooth"
                variant="solid"
              >
                {creating ? t("Creating...") : t("Create")}
              </Button>
            </div>
          </Card>
        </Modal>
      </div>
    </Layout>
  );
};

export default ApiKeyManagement;
