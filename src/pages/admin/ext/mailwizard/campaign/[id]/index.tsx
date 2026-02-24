import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import InfoBlock from "@/components/elements/base/infoBlock";
import Modal from "@/components/elements/base/modal/Modal";
import { ObjectTable } from "@/components/elements/base/object-table/ObjectTable";
import Pagination from "@/components/elements/base/pagination/Pagination";
import Tag from "@/components/elements/base/tag/Tag";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import Input from "@/components/elements/form/input/Input";
import { DealCard } from "@/components/pages/p2p/DealCard";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const CampaignStatus = {
  PENDING: "warning",
  ACTIVE: "primary",
  PAUSED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
  STOPPED: "danger",
};
const statusText = (status) => {
  const texts = {
    PENDING: "Pending",
    ACTIVE: "Active",
    PAUSED: "Paused",
    COMPLETED: "Completed",
    CANCELLED: "Canceled",
    STOPPED: "Stopped",
  };
  return texts[status] || "Pending";
};
type Target = {
  id: string;
  avatar: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
};
const targetsColumnConfig: ColumnConfigType[] = [
  {
    field: "email",
    label: "Email",
    type: "text",
    sortable: true,
    getValue: (row) => (
      <div className="flex items-center gap-2">
        <Avatar size="xs" src={row.avatar || "/img/avatars/placeholder.webp"} />
        <div className="flex flex-col">
          <span className="text-md">{row.email}</span>
          <span className="text-muted-500 text-sm dark:text-muted-400">
            {row.firstName} {row.lastName}
          </span>
        </div>
      </div>
    ),
  },
  {
    field: "status",
    label: "Status",
    type: "text",
    sortable: true,
    getValue: (row) => (
      <Tag color={CampaignStatus[row.status]} variant={"pastel"}>
        {statusText(row.status)}
      </Tag>
    ),
  },
];
const CampaignDetails = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<any>(null);
  const [items, setItems] = useState<Target[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<Target[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Target[]>([]);
  const [userFilter, setUserSearch] = useState("");
  const [totalUsersInDatabase, setTotalUsersInDatabase] = useState(0);

  const [userPagination, setUserPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    perPage: 20,
    currentPage: 1,
  });
  const fetchCampaign = async () => {
    const { data, error } = await $fetch({
      url: `/api/admin/ext/mailwizard/campaign/${id}`,
      silent: true,
    });
    if (!error) {
      const campaignData = data as any;
      setCampaign(campaignData);
      let targets = [];
      try {
        targets = JSON.parse(campaignData.targets);
      } catch (error) {
        targets = [];
      }
      if (targets) {
        setItems(targets);
      }
    }
  };
  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);
  const updateCampaignStatus = async (status) => {
    const { error } = await $fetch({
      url: `/api/admin/ext/mailwizard/campaign/${id}/status`,
      method: "PUT",
      body: { status },
    });
    if (!error) {
      await fetchCampaign();
    }
  };
  const handleUpdateStatus = (status) => {
    updateCampaignStatus(status);
  };

  const fetchUsers = async (
    filter = "",
    page = 1,
    perPage = 10,
    fetchAll = false
  ) => {
    const filterObject = {
      firstName: { value: filter, operator: "startsWith" },
    };

    const { data, error } = await $fetch({
      url: "/api/admin/crm/user",
      params: fetchAll
        ? { all: "true" }
        : { filter: JSON.stringify(filterObject), page, perPage },
      silent: true,
    });

    if (!error) {
      const userData = data as any;
      if (fetchAll) {
        setUsers(userData.data); // Fetch all users directly when `all=true`
        setSelectedUsers(userData.data); // Set all as selected
        setTotalUsersInDatabase(userData.data.length); // Update total user count
      } else {
        setUsers(userData.items); // Handle paginated users
        setUserPagination(userData.pagination); // Update pagination state
        setTotalUsersInDatabase(userData.pagination.totalItems); // Update total user count
      }
    }
  };

  const handleAddAllUsers = async () => {
    setIsLoading(true);
    try {
      await fetchUsers("", 1, 10, true); // Fetch all users
      setSelectedUsers((prev) => [...prev, ...users]); // Add all fetched users to the selected list
    } catch (error) {
      console.error("Failed to fetch all users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers(
        userFilter,
        userPagination.currentPage,
        userPagination.perPage
      );
    }
  }, [userFilter, userPagination.currentPage, userPagination.perPage, open]);

  useEffect(() => {
    if (campaign && campaign.targets && open) {
      const existingTargetIds = items.map((item) => item.id);
      setSelectedUsers(
        users.filter((user) => existingTargetIds.includes(user.id))
      );
    }
  }, [campaign, items, users, open]);
  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };
  const handleAddUsers = async () => {
    if (selectedUsers.length === items.length) {
      setOpen(false);
      return;
    }
    setIsLoading(true);
    let targets: Target[] = [];
    try {
      targets = JSON.parse(campaign.targets) || [];
    } catch (error) {
      targets = [];
    }
    const targetMap: Map<string, Target> = new Map(
      targets.map((target) => [target.id, target])
    );
    selectedUsers.forEach((user) => {
      if (targetMap.has(user.id)) {
        // Preserve existing status
        const existingTarget = targetMap.get(user.id)!;
        targetMap.set(user.id, {
          ...existingTarget,
          avatar: user.avatar,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } else {
        // Add new user with status "PENDING"
        targetMap.set(user.id, {
          id: user.id,
          avatar: user.avatar,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          status: "PENDING",
        });
      }
    });
    const updatedTargets = Array.from(targetMap.values()).filter((target) =>
      selectedUsers.some((user) => user.id === target.id)
    );
    const { error } = await $fetch({
      url: `/api/admin/ext/mailwizard/campaign/${id}/target`,
      method: "PUT",
      body: {
        targets: JSON.stringify(updatedTargets),
      },
    });
    if (!error) {
      setOpen(false);
      setItems(updatedTargets);
    }
    setIsLoading(false);
  };
  if (!campaign) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icon
            className="h-12 w-12 animate-spin text-primary-500"
            icon="mdi:loading"
          />
          <p className="text-primary-500 text-xl">{t("Loading Campaign...")}</p>
        </div>
      </div>
    );
  }
  return (
    <Layout color="muted" title={t("View Mailwizard Campaign")}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-muted-700 text-xl dark:text-white">
          {campaign.name} {t("Campaign")}
        </h2>
        <BackButton href="/admin/ext/mailwizard/campaign" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-1">
          <Card className="mb-5 p-3">
            <div className="flex flex-col items-center justify-between gap-3">
              <div className="flex w-full items-center gap-3">
                <div className="w-full">
                  <Button
                    className="w-full"
                    color="success"
                    disabled={["ACTIVE", "COMPLETED", "CANCELLED"].includes(
                      campaign.status
                    )}
                    onClick={() => handleUpdateStatus("ACTIVE")}
                    type="button"
                  >
                    <Icon className="mr-2 h-4 w-4" icon="line-md:play" />
                    {t("Start")}
                  </Button>
                </div>
                <div className="w-full">
                  <Button
                    className="w-full"
                    color="warning"
                    disabled={[
                      "PENDING",
                      "STOPPED",
                      "PAUSED",
                      "COMPLETED",
                      "CANCELLED",
                    ].includes(campaign.status)}
                    onClick={() => handleUpdateStatus("PAUSED")}
                    type="button"
                  >
                    <Icon className="mr-2 h-4 w-4" icon="line-md:pause" />
                    {t("Pause")}
                  </Button>
                </div>
              </div>
              <div className="flex w-full items-center gap-3">
                <div className="w-full">
                  <Button
                    className="w-full"
                    color="danger"
                    disabled={[
                      "PENDING",
                      "COMPLETED",
                      "CANCELLED",
                      "STOPPED",
                    ].includes(campaign.status)}
                    onClick={() => handleUpdateStatus("STOPPED")}
                    type="button"
                  >
                    <Icon className="mr-2 h-4 w-4" icon="mdi:stop" />
                    {t("Stop")}
                  </Button>
                </div>
                <div className="w-full">
                  <Button
                    className="w-full"
                    color="danger"
                    disabled={[
                      "ACTIVE",
                      "PAUSED",
                      "COMPLETED",
                      "CANCELLED",
                    ].includes(campaign.status)}
                    onClick={() => handleUpdateStatus("CANCELLED")}
                    type="button"
                  >
                    <Icon className="mr-2 h-4 w-4" icon="line-md:close" />
                    {t("Cancel")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <DealCard isToggle title={t("Campaign Details")}>
            <InfoBlock
              icon="bx:bx-tag"
              label={t("Name")}
              value={campaign.name}
            />
            <InfoBlock
              icon="bx:bx-envelope"
              label={t("Subject")}
              value={campaign.subject}
            />
            <InfoBlock
              icon="bx:bx-tachometer"
              label={t("Speed")}
              value={campaign.speed}
            />
            <InfoBlock
              icon="bx:bx-template"
              label={t("Template")}
              value={campaign.template.name}
            />
            <InfoBlock
              icon="bx:bx-info-circle"
              label={t("Status")}
              value={
                <span className={`text-${CampaignStatus[campaign.status]}-500`}>
                  {statusText(campaign.status)}
                </span>
              }
            />
            <InfoBlock
              icon="bx:bx-calendar"
              label={t("Created At")}
              value={new Date(campaign.createdAt).toLocaleDateString()}
            />
          </DealCard>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <ObjectTable
            columnConfig={targetsColumnConfig}
            filterField="email"
            items={items}
            navSlot={
              <IconBox
                className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary-500 hover:text-muted-100 hover:shadow-muted-300/30 hover:shadow-sm dark:hover:shadow-muted-800/20"
                color="primary"
                icon="mdi:plus"
                onClick={() => setOpen(true)}
                shape={"rounded-sm"}
                size={"sm"}
                variant={"pastel"}
              />
            }
            setItems={setItems}
            shape="rounded-sm"
            size="sm"
            title={t("Targets")}
          />
        </div>
      </div>

      <Modal open={open} size="lg">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Target Selection")}
            </p>
            <IconButton onClick={() => setOpen(false)} shape="full" size="sm">
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:px-6 md:py-8">
            <div className="mx-auto w-full">
              <p className="text-muted-500 text-sm dark:text-muted-400">
                {t("Add new target to the campaign")}
              </p>

              <Input
                color="contrast"
                icon="lucide:search"
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={t("Search users...")}
                value={userFilter}
              />
              <div className="mt-4 mb-5 max-h-[200px] overflow-y-auto rounded-lg border border-muted-200 bg-white dark:border-muted-800 dark:bg-muted-950">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      className="flex items-center gap-2 px-4 py-2"
                      key={user.id}
                    >
                      <div className="me-2 flex items-center">
                        <Checkbox
                          checked={selectedUsers.some(
                            (selectedUser) => selectedUser.id === user.id
                          )}
                          color="primary"
                          onChange={() => handleSelectUser(user)}
                        />
                      </div>
                      <Avatar
                        size="xxs"
                        src={user.avatar || "/img/avatars/placeholder.webp"}
                      />
                      <div className="flex flex-col text-muted-700 dark:text-muted-200">
                        <span className="text-md">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-sm">{user.email}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center">
                    <Icon
                      className="mx-auto h-20 w-20 text-muted-400"
                      icon="arcticons:samsung-finder"
                    />
                    <h3 className="mb-2 font-sans text-muted-700 text-xl dark:text-muted-200">
                      {t("Nothing found")}
                    </h3>
                    <p className="mx-auto max-w-[280px] font-sans text-md text-muted-400">
                      {t(
                        "Sorry, looks like we couldn't find any matching records. Try different search terms."
                      )}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex w-full flex-col justify-between gap-4 rounded-lg border border-muted-200 bg-muted-50 p-2 md:flex-row md:items-center dark:border-muted-800 dark:bg-muted-900">
                <Pagination
                  buttonSize={"md"}
                  currentPage={userPagination.currentPage}
                  onPageChange={(page) =>
                    setUserPagination({ ...userPagination, currentPage: page })
                  }
                  pageSize={userPagination.perPage}
                  totalCount={userPagination.totalItems}
                />
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex w-full justify-between gap-2">
              <p className="mt-2 font-medium text-md text-muted-700 dark:text-muted-200">
                {t("Selected Targets")} {selectedUsers.length}
              </p>
              <div className="flex gap-2">
                <Button
                  color="primary"
                  disabled={isLoading || items.length === totalUsersInDatabase}
                  onClick={handleAddAllUsers}
                  shape="smooth"
                  variant="outlined"
                >
                  {t("Select All Targets")}
                </Button>
                <Button
                  color="primary"
                  disabled={isLoading}
                  loading={isLoading}
                  onClick={handleAddUsers}
                  shape="smooth"
                  variant="solid"
                >
                  {t("Add")}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </Modal>
    </Layout>
  );
};
export default CampaignDetails;
export const permission = "Access Mailwizard Campaign Management";
